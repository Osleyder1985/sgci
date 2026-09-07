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

interface HouseResult {
  guiaId: string;
  personaId: string | null;
  destinatario: DestinatarioImportado | null;
  createdPersonaId: string | null;
  createdDocumentoId: string | null;
}

@Injectable()
export class ManifiestosImportacionEscalableService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ManifiestoParser,
    private readonly geocodificacion: GeocodificacionService,
    @Optional()
    private readonly progress?: ManifiestosImportacionProgressService,
  ) {}

  async importar(buffer: Buffer, originalname: string, jobId: string) {
    let manifiestoId: string | null = null;
    const createdPersonaIds: string[] = [];
    const createdDocumentoIds: string[] = [];

    try {
      await this.progress?.update(jobId, {
        stage: 'parsing',
        message: 'Analizando y validando el manifiesto.',
      });

      const parsed = this.parser.parse(buffer, originalname);
      this.validateParsedManifest(parsed);

      await this.progress?.update(jobId, {
        stage: 'creating_guides',
        message: 'Preparando la importación por House.',
        totalHouses: parsed.rows.length,
        totalPeople: parsed.total.cantidadPersonas,
      });

      const hash = this.calculateHash(buffer);
      const existente = await this.prisma.manifiesto.findFirst({
        where: { archivoHash: hash },
        select: { id: true, masterAwb: { select: { numero: true } } },
      });
      if (existente) {
        throw new BadRequestException(
          `El manifiesto ya fue importado anteriormente. Master AWB: ${existente.masterAwb.numero}`,
        );
      }
      if (!parsed.metadata.masterAwb)
        throw new BadRequestException('El manifiesto no contiene el Master AWB.');
      if (!parsed.metadata.fecha)
        throw new BadRequestException('El manifiesto no contiene una fecha válida.');

      const { masterAwb, manifiesto } = await this.prisma.$transaction(async (tx) => {
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
        return { masterAwb, manifiesto };
      });
      manifiestoId = manifiesto.id;

      const destinatarios: DestinatarioImportado[] = [];
      let cantidadPaquetes = 0;
      const personasCache = new Map<string, string>();

      for (const [index, house] of parsed.rows.entries()) {
        const result = await this.prisma.$transaction(async (tx) => {
          const guia = await tx.guia.create({
            data: this.createGuia(manifiesto.id, house),
          });
          const cantidad = this.resolveCantidadPaquetes(house);
          if (cantidad > 0) {
            await tx.paquete.createMany({
              data: Array.from({ length: cantidad }, (_, packageIndex) => ({
                guiaId: guia.id,
                numero: packageIndex + 1,
              })),
            });
          }

          const nombre = this.cleanText(house.destinatarioNombre) ?? '';
          const carnet = this.cleanText(house.destinatarioCarnet);
          const direccion = this.cleanText(house.direccionDestinatario);
          if (!nombre && !carnet) {
            return {
              guiaId: guia.id,
              personaId: null,
              destinatario: null,
              createdPersonaId: null,
              createdDocumentoId: null,
            } satisfies HouseResult;
          }

          const cacheKey = this.identityKey(nombre, carnet);
          const cachedPersonaId = personasCache.get(cacheKey);
          if (cachedPersonaId) {
            return {
              guiaId: guia.id,
              personaId: cachedPersonaId,
              destinatario: { personaId: cachedPersonaId, nombre, carnet, direccion },
              createdPersonaId: null,
              createdDocumentoId: null,
            } satisfies HouseResult;
          }

          const persona = await this.resolvePersona(tx, nombre, carnet);
          return {
            guiaId: guia.id,
            personaId: persona.personaId,
            destinatario: { personaId: persona.personaId, nombre, carnet, direccion },
            createdPersonaId: persona.createdPersonaId,
            createdDocumentoId: persona.createdDocumentoId,
          } satisfies HouseResult;
        });

        if (result.createdPersonaId) createdPersonaIds.push(result.createdPersonaId);
        if (result.createdDocumentoId) createdDocumentoIds.push(result.createdDocumentoId);
        if (result.personaId) personasCache.set(this.identityKey(result.destinatario!.nombre, result.destinatario!.carnet), result.personaId);
        if (result.destinatario) destinatarios.push(result.destinatario);
        cantidadPaquetes += this.resolveCantidadPaquetes(house);

        await this.progress?.update(jobId, {
          processedHouses: index + 1,
          processedPeople: new Set(destinatarios.map((item) => item.personaId)).size,
          message: `House ${index + 1} de ${parsed.rows.length} completado.`,
        });
      }

      await this.progress?.update(jobId, {
        stage: 'processing_addresses',
        message: 'Procesando y geocodificando direcciones.',
        processedHouses: parsed.rows.length,
      });
      const direcciones = await this.verificarDirecciones(
        destinatarios,
        parsed.metadata.paisOrigen,
        jobId,
      );

      const response = {
        ok: true,
        mensaje: 'Manifiesto importado correctamente.',
        manifiesto: {
          id: manifiesto.id,
          masterAwb: masterAwb.numero,
          cantidadHouse: manifiesto.cantidadHouse,
          totalSacas: manifiesto.totalSacas,
          totalPersonas: manifiesto.totalPersonas,
          pesoTotalKg: manifiesto.pesoTotalKg.toString(),
          archivoNombre: manifiesto.archivoNombre,
          importadoAt: manifiesto.importadoAt,
        },
        estadisticas: {
          guias: parsed.rows.length,
          paquetes: cantidadPaquetes,
          personasVerificadas: direcciones.personasVerificadas,
          direccionesEncontradas: direcciones.direccionesEncontradas,
          direccionesReutilizadas: direcciones.direccionesReutilizadas,
          direccionesGeocodificadas: direcciones.direccionesGeocodificadas,
          direccionesPendientes: direcciones.direccionesPendientes,
        },
        warnings: [...parsed.warnings, ...direcciones.warnings],
      };

      await this.progress?.complete(jobId);
      return response;
    } catch (error) {
      if (manifiestoId) {
        await this.cleanupFailedImport(
          manifiestoId,
          createdDocumentoIds,
          createdPersonaIds,
        );
      }
      await this.progress?.fail(jobId, error);
      if (error instanceof BadRequestException) throw error;
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw new BadRequestException(String(error));
    }
  }

  private async cleanupFailedImport(
    manifiestoId: string,
    documentoIds: string[],
    personaIds: string[],
  ) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.manifiesto.delete({ where: { id: manifiestoId } });
        if (documentoIds.length) {
          await tx.documentoIdentidad.deleteMany({ where: { id: { in: documentoIds } } });
        }
        if (personaIds.length) {
          await tx.persona.deleteMany({ where: { id: { in: personaIds } } });
        }
      });
    } catch {
      // The original error is more useful to the caller. A failed cleanup is
      // intentionally not allowed to mask it.
    }
  }

  private async resolvePersona(
    tx: Prisma.TransactionClient,
    nombre: string,
    carnet: string | null,
  ) {
    const numero = this.normalizeIdentity(carnet);
    if (numero) {
      const documento = await tx.documentoIdentidad.findUnique({
        where: { tipo_numero: { tipo: 'CARNET_IDENTIDAD', numero } },
        select: { personaId: true },
      });
      if (documento) {
        return { personaId: documento.personaId, createdPersonaId: null, createdDocumentoId: null };
      }
    }

    const personaExistente = nombre
      ? await tx.persona.findFirst({
          where: { nombreCompleto: { equals: nombre.trim(), mode: 'insensitive' } },
          select: { id: true },
        })
      : null;

    if (personaExistente) {
      if (numero) {
        const documento = await tx.documentoIdentidad.create({
          data: {
            personaId: personaExistente.id,
            tipo: 'CARNET_IDENTIDAD',
            numero,
            numeroOriginal: carnet,
            esPrincipal: true,
          },
          select: { id: true },
        });
        return { personaId: personaExistente.id, createdPersonaId: null, createdDocumentoId: documento.id };
      }
      return { personaId: personaExistente.id, createdPersonaId: null, createdDocumentoId: null };
    }

    const persona = await tx.persona.create({
      data: {
        nombres: nombre || 'SIN NOMBRE',
        apellidos: '',
        nombreCompleto: nombre || 'SIN NOMBRE',
      },
      select: { id: true },
    });

    let documentoId: string | null = null;
    if (numero) {
      const documento = await tx.documentoIdentidad.create({
        data: {
          personaId: persona.id,
          tipo: 'CARNET_IDENTIDAD',
          numero,
          numeroOriginal: carnet,
          esPrincipal: true,
        },
        select: { id: true },
      });
      documentoId = documento.id;
    }
    return { personaId: persona.id, createdPersonaId: persona.id, createdDocumentoId: documentoId };
  }

  private async verificarDirecciones(
    destinatarios: DestinatarioImportado[],
    paisOrigen: string | null | undefined,
    jobId: string,
  ) {
    const uniquePeople = new Set(destinatarios.map((item) => item.personaId));
    const resultado = {
      personasVerificadas: uniquePeople.size,
      direccionesEncontradas: 0,
      direccionesReutilizadas: 0,
      direccionesGeocodificadas: 0,
      direccionesPendientes: 0,
      warnings: [] as string[],
    };
    const procesadas = new Set<string>();
    const direcciones = destinatarios.filter((item) => item.direccion?.trim()).filter((item) => {
      const key = `${item.personaId}|${this.normalizeIdentity(item.direccion)}`;
      if (procesadas.has(key)) return false;
      procesadas.add(key);
      return true;
    });

    await this.progress?.update(jobId, {
      totalAddresses: direcciones.length,
      processedAddresses: 0,
      message: `Preparando ${direcciones.length} direcciones.`,
    });

    for (const [index, destinatario] of direcciones.entries()) {
      const direccion = destinatario.direccion!.trim();
      await this.progress?.update(jobId, {
        processedAddresses: index,
        currentAddress: direccion,
        message: `Procesando dirección ${index + 1} de ${direcciones.length}.`,
      });
      try {
        const existentes = await this.prisma.direccion.findMany({
          where: { personaId: destinatario.personaId, activa: true },
          select: { id: true, direccionOriginal: true, estadoGeocodificacion: true },
        });
        const existente = existentes.find(
          (item) => this.normalizeIdentity(item.direccionOriginal) === this.normalizeIdentity(direccion),
        );
        if (existente?.estadoGeocodificacion === 'GEOCODIFICADA') {
          resultado.direccionesEncontradas++;
          resultado.direccionesReutilizadas++;
          await this.progress?.update(jobId, {
            processedAddresses: index + 1,
            addressesReused: resultado.direccionesReutilizadas,
            currentAddress: direccion,
          });
          continue;
        }
        const geocodificada = await this.geocodificacion.geocodificar(direccion, paisOrigen);
        if (!geocodificada) {
          resultado.direccionesPendientes++;
          resultado.warnings.push(`No se encontró una ubicación para la dirección de ${destinatario.nombre}: ${direccion}`);
          const current = await this.progress?.get(jobId);
          await this.progress?.update(jobId, {
            processedAddresses: index + 1,
            addressesNotFound: (current?.addressesNotFound ?? 0) + 1,
            currentAddress: direccion,
          });
          continue;
        }
        if (existente) {
          await this.prisma.$executeRaw`UPDATE "Direccion" SET "ubicacion"=ST_SetSRID(ST_MakePoint(${geocodificada.lon},${geocodificada.lat}),4326)::geography,"estadoGeocodificacion"='GEOCODIFICADA'::"EstadoGeocodificacion","geocodificadoAt"=NOW(),"updatedAt"=NOW() WHERE "id"=${existente.id}::uuid`;
        } else {
          const id = randomUUID();
          await this.prisma.$executeRaw`INSERT INTO "Direccion" ("id","personaId","direccionOriginal","ubicacion","estadoGeocodificacion","geocodificadoAt","esPrincipal","activa","createdAt","updatedAt") VALUES (${id}::uuid,${destinatario.personaId}::uuid,${direccion},ST_SetSRID(ST_MakePoint(${geocodificada.lon},${geocodificada.lat}),4326)::geography,'GEOCODIFICADA'::"EstadoGeocodificacion",NOW(),false,true,NOW(),NOW())`;
        }
        resultado.direccionesEncontradas++;
        resultado.direccionesGeocodificadas++;
        await this.progress?.update(jobId, {
          processedAddresses: index + 1,
          addressesGeocoded: resultado.direccionesGeocodificadas,
          currentAddress: direccion,
        });
      } catch (error) {
        resultado.direccionesPendientes++;
        resultado.warnings.push(`No se pudo procesar la dirección de ${destinatario.nombre}: ${error instanceof Error ? error.message : String(error)}`);
        const current = await this.progress?.get(jobId);
        await this.progress?.update(jobId, {
          processedAddresses: index + 1,
          addressesReview: (current?.addressesReview ?? 0) + 1,
          errors: (current?.errors ?? 0) + 1,
          currentAddress: direccion,
        });
      }
    }
    return resultado;
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
      estadoCobroOrigen: house.estadoCobroOrigen !== null && house.estadoCobroOrigen !== undefined ? String(house.estadoCobroOrigen) : null,
      unidadDestino: this.cleanText(house.unidadDestino),
    };
  }

  private resolveNumeroHouse(house: ManifiestoHouse): string {
    const numero = this.cleanText(house.numeroHouse);
    if (!numero) throw new BadRequestException('Se encontró una fila de House sin número de House.');
    return numero;
  }

  private resolveCantidadPaquetes(house: ManifiestoHouse): number {
    const bultos = Number(house.bultos ?? 1);
    if (!Number.isFinite(bultos) || bultos <= 0) return 1;
    return Math.floor(bultos);
  }

  private validateParsedManifest(parsed: ManifiestoParsed): void {
    if (!parsed) throw new BadRequestException('No fue posible leer el manifiesto.');
    if (!parsed.rows?.length) throw new BadRequestException('El manifiesto no contiene registros de House.');
    if (parsed.total.cantidadHouses !== parsed.rows.length) {
      throw new BadRequestException(`La cantidad de Houses no coincide. Total declarado: ${parsed.total.cantidadHouses}. Registros encontrados: ${parsed.rows.length}.`);
    }
    if (parsed.total.pesoTotalKg === null || parsed.total.pesoTotalKg === undefined || !Number.isFinite(Number(parsed.total.pesoTotalKg))) {
      throw new BadRequestException('El peso total del manifiesto no es válido.');
    }
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
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  private identityKey(nombre: string, carnet: string | null): string {
    return `${this.normalizeIdentity(nombre)}|${this.normalizeIdentity(carnet)}`;
  }
}
