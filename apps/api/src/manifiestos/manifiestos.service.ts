import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { Prisma } from '../generated/prisma/client.js';
import { GeocodificacionService } from '../geocodificacion/geocodificacion.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ManifiestoHouse,
  ManifiestoParsed,
  ManifiestoParser,
} from './parsers/manifiesto.parser.js';
import { ManifiestosImportacionProgressService } from './manifiestos.importacion.progress.service.js';
interface DestinatarioImportado {
  personaId: string;
  nombre: string;
  carnet: string | null;
  direccion: string | null;
}
interface ResultadoDirecciones {
  personasVerificadas: number;
  direccionesEncontradas: number;
  direccionesReutilizadas: number;
  direccionesGeocodificadas: number;
  direccionesPendientes: number;
  warnings: string[];
}
@Injectable()
export class ManifiestosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ManifiestoParser,
    private readonly geocodificacion: GeocodificacionService,
    @Optional()
    private readonly progress?: ManifiestosImportacionProgressService,
  ) {}
  async preview(buffer: Buffer, originalname: string) {
    try {
      const parsed = this.parser.parse(buffer, originalname);
      this.validateParsedManifest(parsed);
      const hash = this.calculateHash(buffer);
      const manifiestoExistente = await this.prisma.manifiesto.findFirst({
        where: { archivoHash: hash },
        select: {
          id: true,
          masterAwb: { select: { numero: true } },
          fecha: true,
          pesoTotalKg: true,
          cantidadHouse: true,
          totalSacas: true,
          totalPersonas: true,
        },
      });
      return {
        ok: true,
        archivo: {
          nombre: originalname,
          hash,
          duplicado: !!manifiestoExistente,
        },
        metadata: parsed.metadata,
        total: parsed.total,
        registros: parsed.rows.length,
        casas: parsed.rows,
        warnings: parsed.warnings,
        duplicado: manifiestoExistente
          ? {
              existe: true,
              id: manifiestoExistente.id,
              masterAwb: manifiestoExistente.masterAwb?.numero ?? null,
              fecha: manifiestoExistente.fecha ?? null,
              pesoTotalKg: manifiestoExistente.pesoTotalKg?.toString() ?? null,
              cantidadHouse: manifiestoExistente.cantidadHouse,
              totalSacas: manifiestoExistente.totalSacas,
              totalPersonas: manifiestoExistente.totalPersonas,
            }
          : { existe: false },
      };
    } catch (error) {
      this.handleError(error);
    }
  }
  async importar(buffer: Buffer, originalname: string, jobId?: string) {
    try {
      if (jobId)
        this.progress?.update(jobId, {
          stage: 'parsing',
          message: 'Analizando y validando el manifiesto.',
        });
      const parsed = this.parser.parse(buffer, originalname);
      this.validateParsedManifest(parsed);
      if (jobId)
        this.progress?.update(jobId, {
          stage: 'creating_guides',
          message: 'Creando guías, paquetes y resolviendo personas.',
          totalHouses: parsed.rows.length,
          totalPeople: parsed.total.cantidadPersonas,
        });
      const hash = this.calculateHash(buffer);
      const manifiestoExistente = await this.prisma.manifiesto.findFirst({
        where: { archivoHash: hash },
        select: { id: true, masterAwb: { select: { numero: true } } },
      });
      if (manifiestoExistente)
        throw new BadRequestException(
          `El manifiesto ya fue importado anteriormente. Master AWB: ${manifiestoExistente.masterAwb.numero}`,
        );
      if (!parsed.metadata.masterAwb)
        throw new BadRequestException(
          'El manifiesto no contiene el Master AWB.',
        );
      if (!parsed.metadata.fecha)
        throw new BadRequestException(
          'El manifiesto no contiene una fecha válida.',
        );
      const resultado = await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const masterAwb = await tx.masterAwb.upsert({
            where: { numero: parsed.metadata.masterAwb! },
            update: {},
            create: { numero: parsed.metadata.masterAwb! },
          });
          const manifiesto = await tx.manifiesto.create({
            data: {
              masterAwbId: masterAwb.id,
              agenteTransitario: parsed.metadata.agenteTransitario ?? '',
              fecha: parsed.metadata.fecha!,
              paisOrigen: parsed.metadata.paisOrigen ?? 'MEXICO',
              consignatario: parsed.metadata.consignatario ?? '',
              cantidadHouse: parsed.total.cantidadHouses,
              totalSacas: parsed.total.cantidadSacas,
              totalPersonas: parsed.total.cantidadPersonas,
              pesoTotalKg: parsed.total.pesoTotalKg!,
              archivoNombre: originalname,
              archivoHash: hash,
            },
          });
          let cantidadGuias = 0;
          let cantidadPaquetes = 0;
          const destinatarios: DestinatarioImportado[] = [];
          const personasCache = new Map<string, string>();
          for (const [index, house] of parsed.rows.entries()) {
            const guia = await tx.guia.create({
              data: this.createGuia(manifiesto.id, house),
            });
            cantidadGuias++;
            const cantidad = this.resolveCantidadPaquetes(house);
            if (cantidad > 0) {
              await this.createPaquetes(tx, guia.id, cantidad);
              cantidadPaquetes += cantidad;
            }
            const nombre = this.cleanText(house.destinatarioNombre) ?? '';
            const carnet = this.cleanText(house.destinatarioCarnet);
            const direccion = this.cleanText(house.direccionDestinatario);
            if (nombre || carnet) {
              const cacheKey = this.identityKey(nombre, carnet);
              let personaId = personasCache.get(cacheKey);
              if (!personaId) {
                personaId = await this.resolvePersona(tx, nombre, carnet);
                personasCache.set(cacheKey, personaId);
              }
              destinatarios.push({ personaId, nombre, carnet, direccion });
            }
            if (jobId)
              this.progress?.update(jobId, {
                processedHouses: index + 1,
                processedPeople: new Set(
                  destinatarios.map((item) => item.personaId),
                ).size,
                message: `Procesando House ${index + 1} de ${parsed.rows.length}.`,
              });
          }
          return {
            manifiesto,
            masterAwb,
            cantidadGuias,
            cantidadPaquetes,
            destinatarios,
          };
        },
      );
      if (jobId)
        this.progress?.update(jobId, {
          stage: 'processing_addresses',
          message: 'Procesando y geocodificando direcciones.',
          processedHouses: parsed.rows.length,
        });
      const direcciones = await this.verificarDirecciones(
        resultado.destinatarios,
        parsed.metadata.paisOrigen,
        jobId,
      );
      const response = {
        ok: true,
        mensaje: 'Manifiesto importado correctamente.',
        manifiesto: {
          id: resultado.manifiesto.id,
          masterAwb: resultado.masterAwb.numero,
          cantidadHouse: resultado.manifiesto.cantidadHouse,
          totalSacas: resultado.manifiesto.totalSacas,
          totalPersonas: resultado.manifiesto.totalPersonas,
          pesoTotalKg: resultado.manifiesto.pesoTotalKg.toString(),
          archivoNombre: resultado.manifiesto.archivoNombre,
          importadoAt: resultado.manifiesto.importadoAt,
        },
        estadisticas: {
          guias: resultado.cantidadGuias,
          paquetes: resultado.cantidadPaquetes,
          personasVerificadas: direcciones.personasVerificadas,
          direccionesEncontradas: direcciones.direccionesEncontradas,
          direccionesReutilizadas: direcciones.direccionesReutilizadas,
          direccionesGeocodificadas: direcciones.direccionesGeocodificadas,
          direccionesPendientes: direcciones.direccionesPendientes,
        },
        warnings: [...parsed.warnings, ...direcciones.warnings],
      };
      if (jobId) this.progress?.complete(jobId);
      return response;
    } catch (error) {
      if (jobId) this.progress?.fail(jobId, error);
      this.handleError(error);
    }
  }
