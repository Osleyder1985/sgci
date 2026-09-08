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

interface DirectionSnapshot {
  id: string;
  lat: number;
  lon: number;
  estadoGeocodificacion: string;
  geocodificadoAt: Date | null;
  esPrincipal: boolean;
  activa: boolean;
}

interface ImportRollbackContext {
  manifiestoId: string | null;
  masterAwbId: string | null;
  masterAwbCreated: boolean;
  createdPersonaIds: Set<string>;
  createdDocumentoIds: Set<string>;
  createdDireccionIds: Set<string>;
  modifiedDirections: Map<string, DirectionSnapshot>;
  modifiedDocumentPrincipal: Map<string, boolean>;
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
    let importCompleted = false;

    const rollback: ImportRollbackContext = {
      manifiestoId: null,
      masterAwbId: null,
      masterAwbCreated: false,
      createdPersonaIds: new Set(),
      createdDocumentoIds: new Set(),
      createdDireccionIds: new Set(),
      modifiedDirections: new Map(),
      modifiedDocumentPrincipal: new Map(),
    };

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

      if (!parsed.metadata.masterAwb) {
        throw new BadRequestException(
          'El manifiesto no contiene el Master AWB.',
        );
      }
      if (!parsed.metadata.fecha) {
        throw new BadRequestException(
          'El manifiesto no contiene una fecha válida.',
        );
      }

      const { masterAwb, manifiesto } = await this.prisma.$transaction(
        async (tx) => {
          const existingMaster = await tx.masterAwb.findUnique({
            where: { numero: parsed.metadata.masterAwb! },
            select: { id: true },
          });
          const masterAwb = existingMaster
            ? await tx.masterAwb.findUniqueOrThrow({
                where: { id: existingMaster.id },
              })
            : await tx.masterAwb.create({
                data: { numero: parsed.metadata.masterAwb! },
              });

          rollback.masterAwbId = masterAwb.id;
          rollback.masterAwbCreated = !existingMaster;

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
        },
      );
      rollback.manifiestoId = manifiesto.id;

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
              destinatario: {
                personaId: cachedPersonaId,
                nombre,
                carnet,
                direccion,
              },
              createdPersonaId: null,
              createdDocumentoId: null,
            } satisfies HouseResult;
          }

          const persona = await this.resolvePersona(
            tx,
            nombre,
            carnet,
            rollback,
          );
          return {
            guiaId: guia.id,
            personaId: persona.personaId,
            destinatario: {
              personaId: persona.personaId,
              nombre,
              carnet,
              direccion,
            },
            createdPersonaId: persona.createdPersonaId,
            createdDocumentoId: persona.createdDocumentoId,
          } satisfies HouseResult;
        });

        if (result.createdPersonaId) {
          rollback.createdPersonaIds.add(result.createdPersonaId);
        }
        if (result.createdDocumentoId) {
          rollback.createdDocumentoIds.add(result.createdDocumentoId);
        }
        if (result.personaId && result.destinatario) {
          personasCache.set(
            this.identityKey(
              result.destinatario.nombre,
              result.destinatario.carnet,
            ),
            result.personaId,
          );
          destinatarios.push(result.destinatario);
        }
        cantidadPaquetes += this.resolveCantidadPaquetes(house);

        await this.progress?.update(jobId, {
          processedHouses: index + 1,
          processedPeople: new Set(destinatarios.map((item) => item.personaId))
            .size,
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
        rollback,
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

      await this.persistImportWarnings(jobId, response.warnings);

      importCompleted = true;

      await this.progress?.complete(jobId, response.mensaje, {
        manifiestoId: response.manifiesto.id,
        masterAwb: response.manifiesto.masterAwb,
        guias: response.estadisticas.guias,
        paquetes: response.estadisticas.paquetes,
        personas: response.estadisticas.personasVerificadas,
        pesoTotalKg: response.manifiesto.pesoTotalKg,
        warnings: response.warnings.length,
      });

      return response;
    } catch (error) {
      if (importCompleted) {
        if (error instanceof BadRequestException) throw error;
        if (error instanceof Error)
          throw new BadRequestException(error.message);
        throw new BadRequestException(String(error));
      }

      try {
        await this.cleanupFailedImport(rollback);
      } catch (rollbackError) {
        const originalMessage =
          error instanceof Error ? error.message : String(error);
        const rollbackMessage =
          rollbackError instanceof Error
            ? rollbackError.message
            : String(rollbackError);

        const combinedError = new Error(
          `La importación falló y el rollback también falló. ` +
            `Error original: ${originalMessage}. ` +
            `Error de rollback: ${rollbackMessage}.`,
        );

        try {
          await this.progress?.fail(jobId, combinedError);
        } catch {
          // El servicio de progreso puede fallar independientemente.
          // El error combinado debe seguir propagándose.
        }

        throw new BadRequestException(combinedError.message);
      }

      try {
        await this.progress?.fail(jobId, error);
      } catch {
        // El servicio de progreso puede fallar independientemente.
        // El error original debe seguir propagándose.
      }

      if (error instanceof BadRequestException) throw error;
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw new BadRequestException(String(error));
    }
  }

  protected async persistImportWarnings(
    _jobId: string,
    _warnings: string[],
  ): Promise<void> {}

  private async cleanupFailedImport(ctx: ImportRollbackContext) {
    if (
      !ctx.manifiestoId &&
      !ctx.masterAwbId &&
      !ctx.createdPersonaIds.size &&
      !ctx.createdDocumentoIds.size &&
      !ctx.createdDireccionIds.size &&
      !ctx.modifiedDirections.size &&
      !ctx.modifiedDocumentPrincipal.size
    ) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      for (const snapshot of ctx.modifiedDirections.values()) {
        await tx.$executeRaw`
            UPDATE "Direccion"
            SET "ubicacion" = ST_SetSRID(ST_MakePoint(${snapshot.lon}, ${snapshot.lat}), 4326)::geography,
                "estadoGeocodificacion" = ${snapshot.estadoGeocodificacion}::"EstadoGeocodificacion",
                "geocodificadoAt" = ${snapshot.geocodificadoAt},
                "esPrincipal" = ${snapshot.esPrincipal},
                "activa" = ${snapshot.activa},
                "updatedAt" = NOW()
            WHERE "id" = ${snapshot.id}::uuid
          `;
      }

      for (const [id, esPrincipal] of ctx.modifiedDocumentPrincipal) {
        await tx.documentoIdentidad.update({
          where: { id },
          data: { esPrincipal },
        });
      }

      if (ctx.createdDireccionIds.size) {
        await tx.direccion.deleteMany({
          where: { id: { in: [...ctx.createdDireccionIds] } },
        });
      }
      if (ctx.createdDocumentoIds.size) {
        await tx.documentoIdentidad.deleteMany({
          where: { id: { in: [...ctx.createdDocumentoIds] } },
        });
      }

      for (const personaId of ctx.createdPersonaIds) {
        const dependencias = await tx.$queryRaw<Array<{ total: bigint }>>`
            SELECT (
              (SELECT COUNT(*) FROM "DocumentoIdentidad" WHERE "personaId" = ${personaId}::uuid) +
              (SELECT COUNT(*) FROM "Direccion" WHERE "personaId" = ${personaId}::uuid) +
              (SELECT COUNT(*) FROM "ConflictoIdentidad" WHERE "personaExistenteId" = ${personaId}::uuid OR "personaNuevaId" = ${personaId}::uuid)
            )::bigint AS total
          `;
        if (Number(dependencias[0]?.total ?? 0n) === 0) {
          await tx.persona.delete({ where: { id: personaId } });
        }
      }

      if (ctx.manifiestoId) {
        await tx.manifiesto.delete({ where: { id: ctx.manifiestoId } });
      }

      if (ctx.masterAwbCreated && ctx.masterAwbId) {
        const manifiestos = await tx.manifiesto.count({
          where: { masterAwbId: ctx.masterAwbId },
        });
        if (manifiestos === 0) {
          await tx.masterAwb.delete({ where: { id: ctx.masterAwbId } });
        }
      }
    });
  }

  private async resolvePersona(
    tx: Prisma.TransactionClient,
    nombre: string,
    carnet: string | null,
    rollback: ImportRollbackContext,
  ) {
    const numero = this.normalizeIdentity(carnet);

    if (numero) {
      const documento = await tx.documentoIdentidad.findUnique({
        where: { tipo_numero: { tipo: 'CARNET_IDENTIDAD', numero } },
        select: { personaId: true },
      });
      if (documento) {
        return {
          personaId: documento.personaId,
          createdPersonaId: null,
          createdDocumentoId: null,
        };
      }
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
      if (numero) {
        const principales = await tx.documentoIdentidad.findMany({
          where: { personaId: personaExistente.id, esPrincipal: true },
          select: { id: true, esPrincipal: true },
        });
        for (const principal of principales) {
          rollback.modifiedDocumentPrincipal.set(
            principal.id,
            principal.esPrincipal,
          );
        }
        if (principales.length) {
          await tx.documentoIdentidad.updateMany({
            where: { personaId: personaExistente.id, esPrincipal: true },
            data: { esPrincipal: false },
          });
        }

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
        rollback.createdDocumentoIds.add(documento.id);
        return {
          personaId: personaExistente.id,
          createdPersonaId: null,
          createdDocumentoId: documento.id,
        };
      }
      return {
        personaId: personaExistente.id,
        createdPersonaId: null,
        createdDocumentoId: null,
      };
    }

    const persona = await tx.persona.create({
      data: {
        nombres: nombre || 'SIN NOMBRE',
        apellidos: '',
        nombreCompleto: nombre || 'SIN NOMBRE',
      },
      select: { id: true },
    });
    rollback.createdPersonaIds.add(persona.id);

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
      rollback.createdDocumentoIds.add(documento.id);
    }

    return {
      personaId: persona.id,
      createdPersonaId: persona.id,
      createdDocumentoId: documentoId,
    };
  }

  private async verificarDirecciones(
    destinatarios: DestinatarioImportado[],
    paisOrigen: string | null | undefined,
    jobId: string,
    rollback: ImportRollbackContext,
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
    const direcciones = destinatarios
      .filter((item) => item.direccion?.trim())
      .filter((item) => {
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
          select: {
            id: true,
            direccionOriginal: true,
            estadoGeocodificacion: true,
            geocodificadoAt: true,
            esPrincipal: true,
            activa: true,
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
          const current = await this.progress?.get(jobId);
          await this.progress?.update(jobId, {
            processedAddresses: index + 1,
            addressesNotFound: (current?.addressesNotFound ?? 0) + 1,
            currentAddress: direccion,
          });
          continue;
        }

        if (existente) {
          if (!rollback.modifiedDirections.has(existente.id)) {
            const location = await this.prisma.$queryRaw<
              Array<{ lat: number | null; lon: number | null }>
            >`
              SELECT ST_Y("ubicacion"::geometry) AS lat, ST_X("ubicacion"::geometry) AS lon
              FROM "Direccion" WHERE "id" = ${existente.id}::uuid
            `;
            const lat = location[0]?.lat;
            const lon = location[0]?.lon;
            if (
              lat === null ||
              lat === undefined ||
              lon === null ||
              lon === undefined
            ) {
              throw new Error(
                `La dirección ${existente.id} no contiene una geometría válida para rollback.`,
              );
            }
            rollback.modifiedDirections.set(existente.id, {
              id: existente.id,
              lat,
              lon,
              estadoGeocodificacion: existente.estadoGeocodificacion,
              geocodificadoAt: existente.geocodificadoAt,
              esPrincipal: existente.esPrincipal,
              activa: existente.activa,
            });
          }
          await this.prisma.$executeRaw`
            UPDATE "Direccion"
            SET "ubicacion" = ST_SetSRID(ST_MakePoint(${geocodificada.lon}, ${geocodificada.lat}), 4326)::geography,
                "estadoGeocodificacion" = 'GEOCODIFICADA'::"EstadoGeocodificacion",
                "geocodificadoAt" = NOW(),
                "updatedAt" = NOW()
            WHERE "id" = ${existente.id}::uuid
          `;
        } else {
          const id = randomUUID();
          await this.prisma.$executeRaw`
            INSERT INTO "Direccion" (
              "id", "personaId", "direccionOriginal", "ubicacion", "estadoGeocodificacion",
              "geocodificadoAt", "esPrincipal", "activa", "createdAt", "updatedAt"
            ) VALUES (
              ${id}::uuid, ${destinatario.personaId}::uuid, ${direccion},
              ST_SetSRID(ST_MakePoint(${geocodificada.lon}, ${geocodificada.lat}), 4326)::geography,
              'GEOCODIFICADA'::"EstadoGeocodificacion", NOW(), false, true, NOW(), NOW()
            )
          `;
          rollback.createdDireccionIds.add(id);
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
        resultado.warnings.push(
          `No se pudo procesar la dirección de ${destinatario.nombre}: ${error instanceof Error ? error.message : String(error)}`,
        );
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
      estadoCobroOrigen:
        house.estadoCobroOrigen !== null &&
        house.estadoCobroOrigen !== undefined
          ? String(house.estadoCobroOrigen)
          : null,
      unidadDestino: this.cleanText(house.unidadDestino),
    };
  }

  private resolveNumeroHouse(house: ManifiestoHouse): string {
    const numero = this.cleanText(house.numeroHouse);
    if (!numero) {
      throw new BadRequestException(
        'Se encontró una fila de House sin número de House.',
      );
    }
    return numero;
  }

  private resolveCantidadPaquetes(house: ManifiestoHouse): number {
    const bultos = Number(house.bultos ?? 1);
    if (!Number.isFinite(bultos) || bultos <= 0) return 1;
    return Math.floor(bultos);
  }

  private validateParsedManifest(parsed: ManifiestoParsed): void {
    if (!parsed) {
      throw new BadRequestException('No fue posible leer el manifiesto.');
    }
    if (!parsed.rows?.length) {
      throw new BadRequestException(
        'El manifiesto no contiene registros de House.',
      );
    }
    if (parsed.total.cantidadHouses !== parsed.rows.length) {
      throw new BadRequestException(
        `La cantidad de Houses no coincide. Total declarado: ${parsed.total.cantidadHouses}. Registros encontrados: ${parsed.rows.length}.`,
      );
    }
    if (
      parsed.total.pesoTotalKg === null ||
      parsed.total.pesoTotalKg === undefined ||
      !Number.isFinite(Number(parsed.total.pesoTotalKg))
    ) {
      throw new BadRequestException(
        'El peso total del manifiesto no es válido.',
      );
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
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  private identityKey(nombre: string, carnet: string | null): string {
    return `${this.normalizeIdentity(nombre)}|${this.normalizeIdentity(carnet)}`;
  }
}
