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
        await this.progress?.update(jobId, {
          stage: 'parsing',
          message: 'Analizando y validando el manifiesto.',
        });

      const parsed = this.parser.parse(buffer, originalname);
      this.validateParsedManifest(parsed);

      if (jobId)
        await this.progress?.update(jobId, {
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
              await this.progress?.update(jobId, {
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
        await this.progress?.update(jobId, {
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

      if (jobId) await this.progress?.complete(jobId);
      return response;
    } catch (error) {
      if (jobId) await this.progress?.fail(jobId, error);
      this.handleError(error);
    }
  }

  private async resolvePersona(
    tx: Prisma.TransactionClient,
    nombre: string,
    carnet: string | null,
  ): Promise<string> {
    const numero = this.normalizeIdentity(carnet);
    if (numero) {
      const documento = await tx.documentoIdentidad.findUnique({
        where: { tipo_numero: { tipo: 'CARNET_IDENTIDAD', numero } },
        select: { personaId: true },
      });
      if (documento) return documento.personaId;
    }

    const personaExistente = nombre
      ? await tx.persona.findFirst({
          where: {
            nombreCompleto: { equals: nombre.trim(), mode: 'insensitive' },
          },
          select: { id: true },
        })
      : null;

    if (personaExistente) {
      if (numero)
        await tx.documentoIdentidad.createMany({
          data: [
            {
              personaId: personaExistente.id,
              tipo: 'CARNET_IDENTIDAD',
              numero,
              numeroOriginal: carnet,
              esPrincipal: true,
            },
          ],
          skipDuplicates: true,
        });
      return personaExistente.id;
    }

    const persona = await tx.persona.create({
      data: {
        nombres: nombre || 'SIN NOMBRE',
        apellidos: '',
        nombreCompleto: nombre || 'SIN NOMBRE',
      },
      select: { id: true },
    });

    if (numero)
      await tx.documentoIdentidad.create({
        data: {
          personaId: persona.id,
          tipo: 'CARNET_IDENTIDAD',
          numero,
          numeroOriginal: carnet,
          esPrincipal: true,
        },
      });

    return persona.id;
  }

  private async verificarDirecciones(
    destinatarios: DestinatarioImportado[],
    paisOrigen: string | null | undefined,
    jobId?: string,
  ): Promise<ResultadoDirecciones> {
    const uniquePeople = new Set(destinatarios.map((item) => item.personaId));
    const resultado: ResultadoDirecciones = {
      personasVerificadas: uniquePeople.size,
      direccionesEncontradas: 0,
      direccionesReutilizadas: 0,
      direccionesGeocodificadas: 0,
      direccionesPendientes: 0,
      warnings: [],
    };
    const procesadas = new Set<string>();
    const direcciones = destinatarios
      .filter((item) => item.direccion?.trim())
      .filter((item) => {
        const key = `${item.personaId}|${this.normalizeIdentity(item.direccion)}`;
        if (procesadas.has(key)) return false;
        procesadas.add(key);
        return true;
      });

    if (jobId)
      await this.progress?.update(jobId, {
        totalAddresses: direcciones.length,
        processedAddresses: 0,
        message: `Preparando ${direcciones.length} direcciones.`,
      });

    for (const [index, destinatario] of direcciones.entries()) {
      const direccion = destinatario.direccion!.trim();
      if (jobId)
        await this.progress?.update(jobId, {
          processedAddresses: index,
          currentAddress: direccion,
          message: `Procesando dirección ${index + 1} de ${direcciones.length}.`,
        });
      try {
        const existentes = await this.prisma.direccion.findMany({
          where: { personaId: destinatario.personaId, activa: true },
          select: {
            id: true,
            direccionOriginal: true,
            estadoGeocodificacion: true,
          },
        });
        const existente = existentes.find(
          (item) =>
            this.normalizeIdentity(item.direccionOriginal) ===
            this.normalizeIdentity(direccion),
        );

        if (existente?.estadoGeocodificacion === 'GEOCODIFICADA') {
          resultado.direccionesEncontradas++;
          resultado.direccionesReutilizadas++;
          if (jobId)
            await this.progress?.update(jobId, {
              processedAddresses: index + 1,
              addressesReused: resultado.direccionesReutilizadas,
              currentAddress: direccion,
            });
          continue;
        }

        const geocodificada = await this.geocodificacion.geocodificar(
          direccion,
          paisOrigen,
        );
        if (!geocodificada) {
          resultado.direccionesPendientes++;
          resultado.warnings.push(
            `No se encontró una ubicación para la dirección de ${destinatario.nombre}: ${direccion}`,
          );
          if (jobId)
            await this.progress?.update(jobId, {
              processedAddresses: index + 1,
              addressesNotFound: resultado.direccionesPendientes,
              addressesReview: resultado.direccionesPendientes,
              currentAddress: direccion,
            });
          continue;
        }

        if (existente)
          await this.actualizarDireccionGeocodificada(
            existente.id,
            geocodificada.lat,
            geocodificada.lon,
          );
        else
          await this.crearDireccionGeocodificada(
            destinatario.personaId,
            direccion,
            geocodificada.lat,
            geocodificada.lon,
          );

        resultado.direccionesEncontradas++;
        resultado.direccionesGeocodificadas++;
        if (jobId)
          await this.progress?.update(jobId, {
            processedAddresses: index + 1,
            addressesGeocoded: resultado.direccionesGeocodificadas,
            currentAddress: direccion,
          });
      } catch (error) {
        resultado.direccionesPendientes++;
        resultado.warnings.push(
          `No se pudo procesar la dirección de ${destinatario.nombre}: ${error instanceof Error ? error.message : String(error)}`,
        );
        if (jobId) {
          const current = await this.progress?.get(jobId);
          await this.progress?.update(jobId, {
            processedAddresses: index + 1,
            addressesNotFound: resultado.direccionesPendientes,
            addressesReview: resultado.direccionesPendientes,
            errors: (current?.errors ?? 0) + 1,
            currentAddress: direccion,
          });
        }
      }
    }
    return resultado;
  }

  private async actualizarDireccionGeocodificada(
    id: string,
    lat: number,
    lon: number,
  ) {
    await this.prisma
      .$executeRaw`UPDATE "Direccion" SET "ubicacion"=ST_SetSRID(ST_MakePoint(${lon},${lat}),4326)::geography,"estadoGeocodificacion"='GEOCODIFICADA'::"EstadoGeocodificacion","geocodificadoAt"=NOW(),"updatedAt"=NOW() WHERE "id"=${id}::uuid`;
  }

  private async crearDireccionGeocodificada(
    personaId: string,
    direccion: string,
    lat: number,
    lon: number,
  ) {
    const id = randomUUID();
    await this.prisma
      .$executeRaw`INSERT INTO "Direccion" ("id","personaId","direccionOriginal","ubicacion","estadoGeocodificacion","geocodificadoAt","esPrincipal","activa","createdAt","updatedAt") VALUES (${id}::uuid,${personaId}::uuid,${direccion},ST_SetSRID(ST_MakePoint(${lon},${lat}),4326)::geography,'GEOCODIFICADA'::"EstadoGeocodificacion",NOW(),false,true,NOW(),NOW())`;
  }

  private createGuia(manifiestoId: string, house: ManifiestoHouse) {
    return {
      manifiestoId,
      numeroHouse: this.resolveNumeroHouse(house),
      naturalezaCantidad: this.cleanText(house.naturalezaCantidad) ?? '',
      pesoKg: Number(house.pesoKg ?? 0),
      bultos: this.resolveCantidadPaquetes(house),
      remitenteNombre: this.cleanText(house.remitenteNombre) ?? '',
      remitentePasaporte: this.cleanText(house.remitentePasaporte),
      destinatarioNombre: this.cleanText(house.destinatarioNombre) ?? '',
      destinatarioCarnet: this.cleanText(house.destinatarioCarnet),
      telefonoDestinatario: this.cleanText(house.telefonoDestinatario),
      direccionDestinatario: this.cleanText(house.direccionDestinatario),
      estadoCobroOrigen:
        house.estadoCobroOrigen !== null &&
        house.estadoCobroOrigen !== undefined
          ? String(house.estadoCobroOrigen)
          : null,
      unidadDestino: this.cleanText(house.unidadDestino),
    };
  }

  private async createPaquetes(
    tx: Prisma.TransactionClient,
    guiaId: string,
    cantidad: number,
  ) {
    if (cantidad <= 0) return;
    await tx.paquete.createMany({
      data: Array.from({ length: cantidad }, (_, index) => ({
        guiaId,
        numero: index + 1,
      })),
    });
  }

  private resolveNumeroHouse(house: ManifiestoHouse): string {
    const numero = this.cleanText(house.numeroHouse);
    if (!numero)
      throw new BadRequestException(
        'Se encontró una fila de House sin número de House.',
      );
    return numero;
  }

  private resolveCantidadPaquetes(house: ManifiestoHouse): number {
    const bultos = Number(house.bultos ?? 1);
    if (!Number.isFinite(bultos) || bultos <= 0) return 1;
    return Math.floor(bultos);
  }

  private validateParsedManifest(parsed: ManifiestoParsed): void {
    if (!parsed)
      throw new BadRequestException('No fue posible leer el manifiesto.');
    if (!parsed.rows?.length)
      throw new BadRequestException(
        'El manifiesto no contiene registros de House.',
      );
    if (parsed.total.cantidadHouses !== parsed.rows.length)
      throw new BadRequestException(
        `La cantidad de Houses no coincide. Total declarado: ${parsed.total.cantidadHouses}. Registros encontrados: ${parsed.rows.length}.`,
      );
    if (
      parsed.total.pesoTotalKg === null ||
      parsed.total.pesoTotalKg === undefined ||
      !Number.isFinite(Number(parsed.total.pesoTotalKg))
    )
      throw new BadRequestException(
        'El peso total del manifiesto no es válido.',
      );
  }

  private calculateHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private cleanText(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text || null;
  }

  private normalizeIdentity(value: unknown): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  private identityKey(nombre: string, carnet: string | null): string {
    return `${this.normalizeIdentity(nombre)}|${this.normalizeIdentity(carnet)}`;
  }

  private handleError(error: unknown): never {
    if (error instanceof BadRequestException) throw error;
    if (error instanceof Error) throw new BadRequestException(error.message);
    throw new BadRequestException(String(error));
  }
}
