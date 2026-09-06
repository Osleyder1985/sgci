// ================================================================================
// SGCI - Sistema de Gestión Contextual Integrado
//
// Archivo:
//   apps/api/src/manifiestos/manifiestos.service.ts
//
// ================================================================================

import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { createHash } from 'node:crypto';

import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

import {
  ManifiestoParser,
  ManifiestoParsed,
  ManifiestoHouse,
} from './parsers/manifiesto.parser.js';

@Injectable()
export class ManifiestosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ManifiestoParser,
  ) {}

  // ============================================================================
  // PREVIEW
  // ============================================================================

  async preview(
    buffer: Buffer,
    originalname: string,
  ) {
    try {
      const parsed =
        this.parser.parse(
          buffer,
          originalname,
        );

      this.validateParsedManifest(
        parsed,
      );

      const hash =
        this.calculateHash(buffer);

      let manifiestoExistente: any =
        null;

      try {
        manifiestoExistente =
          await this.prisma.manifiesto.findFirst({
            where: {
              archivoHash: hash,
            },

            select: {
              id: true,

              masterAwb: {
                select: {
                  numero: true,
                },
              },

              fecha: true,
              pesoTotalKg: true,
              cantidadHouse: true,
              totalSacas: true,
              totalPersonas: true,
            },
          });
      } catch (error) {
        console.error('');
        console.error(
          '============================================================',
        );
        console.error(
          'ERROR PRISMA EN PREVIEW DE MANIFIESTO',
        );
        console.error(
          '============================================================',
        );

        console.error(
          'Tipo de error:',
          error?.constructor?.name,
        );

        console.error('');
        console.error(
          'Error completo:',
        );

        console.error(error);

        console.error('');
        console.error(
          'Mensaje:',
        );

        if (error instanceof Error) {
          console.error(
            error.message,
          );
        } else {
          console.error(
            String(error),
          );
        }

        console.error('');
        console.error(
          '============================================================',
        );
        console.error('');

        throw error;
      }

      return {
        ok: true,

        archivo: {
          nombre: originalname,
          hash,
          duplicado:
            !!manifiestoExistente,
        },

        metadata:
          parsed.metadata,

        total: {
          cantidadHouses:
            parsed.total
              .cantidadHouses,

          cantidadSacas:
            parsed.total
              .cantidadSacas,

          cantidadPersonas:
            parsed.total
              .cantidadPersonas,

          pesoTotalKg:
            parsed.total
              .pesoTotalKg,
        },

        registros:
          parsed.rows.length,

        casas:
          parsed.rows,

        warnings:
          parsed.warnings,

        duplicado:
          manifiestoExistente
            ? {
                existe: true,

                id:
                  manifiestoExistente
                    .id,

                masterAwb:
                  manifiestoExistente
                    .masterAwb?.numero ??
                  null,

                fecha:
                  manifiestoExistente
                    .fecha ??
                  null,

                pesoTotalKg:
                  manifiestoExistente
                    .pesoTotalKg
                    ?.toString() ??
                  null,

                cantidadHouse:
                  manifiestoExistente
                    .cantidadHouse,

                totalSacas:
                  manifiestoExistente
                    .totalSacas,

                totalPersonas:
                  manifiestoExistente
                    .totalPersonas,
              }
            : {
                existe: false,
              },
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============================================================================
  // IMPORTAR
  // ============================================================================

  async importar(
    buffer: Buffer,
    originalname: string,
  ) {
    try {
      const parsed =
        this.parser.parse(
          buffer,
          originalname,
        );

      this.validateParsedManifest(
        parsed,
      );

      const hash =
        this.calculateHash(buffer);

      const manifiestoExistente =
        await this.prisma.manifiesto.findFirst({
          where: {
            archivoHash: hash,
          },

          select: {
            id: true,

            masterAwb: {
              select: {
                numero: true,
              },
            },
          },
        });

      if (manifiestoExistente) {
        throw new BadRequestException(
          `El manifiesto ya fue importado anteriormente. ` +
          `Master AWB: ${manifiestoExistente.masterAwb.numero}`,
        );
      }

      // ------------------------------------------------------------------------
      // VALIDAR MASTER AWB
      // ------------------------------------------------------------------------

      if (
        !parsed.metadata.masterAwb
      ) {
        throw new BadRequestException(
          'El manifiesto no contiene el Master AWB.',
        );
      }

      // ------------------------------------------------------------------------
      // VALIDAR FECHA
      // ------------------------------------------------------------------------

      if (
        !parsed.metadata.fecha
      ) {
        throw new BadRequestException(
          'El manifiesto no contiene una fecha válida.',
        );
      }

      // ------------------------------------------------------------------------
      // VALIDAR PESO TOTAL
      // ------------------------------------------------------------------------

      if (
        parsed.total.pesoTotalKg ===
          null ||
        parsed.total.pesoTotalKg ===
          undefined
      ) {
        throw new BadRequestException(
          'El manifiesto no contiene un peso total válido.',
        );
      }

      // ------------------------------------------------------------------------
      // TRANSACTION
      // ------------------------------------------------------------------------

      const resultado =
        await this.prisma.$transaction(
          async (
            tx: Prisma.TransactionClient,
          ) => {
            // --------------------------------------------------------------
            // MASTER AWB
            // --------------------------------------------------------------

            const masterAwb =
              await tx.masterAwb.upsert({
                where: {
                  numero:
                    parsed.metadata
                      .masterAwb!,
                },

                update: {},

                create: {
                  numero:
                    parsed.metadata
                      .masterAwb!,
                },
              });

            // --------------------------------------------------------------
            // MANIFIESTO
            // --------------------------------------------------------------

            const manifiesto =
              await tx.manifiesto.create({
                data: {
                  masterAwbId:
                    masterAwb.id,

                  agenteTransitario:
                    parsed.metadata
                      .agenteTransitario ??
                    '',

                  fecha:
                    parsed.metadata
                      .fecha!,

                  paisOrigen:
                    parsed.metadata
                      .paisOrigen ??
                    'MEXICO',

                  consignatario:
                    parsed.metadata
                      .consignatario ??
                    '',

                  cantidadHouse:
                    parsed.total
                      .cantidadHouses,

                  totalSacas:
                    parsed.total
                      .cantidadSacas,

                  totalPersonas:
                    parsed.total
                      .cantidadPersonas,

                  // IMPORTANTE:
                  // El peso ya viene calculado por el parser.
                  //
                  // Para el manifiesto actual:
                  // 2123.23 kg
                  //
                  // No se vuelve a sumar la fila TOTAL.
                  pesoTotalKg:
                    parsed.total
                      .pesoTotalKg!,

                  archivoNombre:
                    originalname,

                  archivoHash:
                    hash,
                },
              });

            // --------------------------------------------------------------
            // GUIAS / HOUSES
            // --------------------------------------------------------------

            let cantidadGuias = 0;
            let cantidadPaquetes = 0;

            for (
              const house of parsed.rows
            ) {
              const guia =
                await tx.guia.create({
                  data:
                    this.createGuia(
                      manifiesto.id,
                      house,
                    ),
                });

              cantidadGuias++;

              const cantidad =
                this.resolveCantidadPaquetes(
                  house,
                );

              if (cantidad > 0) {
                await this.createPaquetes(
                  tx,
                  guia.id,
                  cantidad,
                );

                cantidadPaquetes +=
                  cantidad;
              }
            }

            return {
              manifiesto,
              masterAwb,
              cantidadGuias,
              cantidadPaquetes,
            };
          },
        );

      // ------------------------------------------------------------------------
      // RESPUESTA
      // ------------------------------------------------------------------------

      return {
        ok: true,

        mensaje:
          'Manifiesto importado correctamente.',

        manifiesto: {
          id:
            resultado.manifiesto
              .id,

          masterAwb:
            resultado.masterAwb
              .numero,

          cantidadHouse:
            resultado.manifiesto
              .cantidadHouse,

          totalSacas:
            resultado.manifiesto
              .totalSacas,

          totalPersonas:
            resultado.manifiesto
              .totalPersonas,

          pesoTotalKg:
            resultado.manifiesto
              .pesoTotalKg
              .toString(),

          archivoNombre:
            resultado.manifiesto
              .archivoNombre,

          importadoAt:
            resultado.manifiesto
              .importadoAt,
        },

        estadisticas: {
          guias:
            resultado.cantidadGuias,

          paquetes:
            resultado.cantidadPaquetes,
        },

        warnings:
          parsed.warnings,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============================================================================
  // CREAR GUIA
  // ============================================================================

  private createGuia(
    manifiestoId: string,
    house: ManifiestoHouse,
  ) {
    const numeroHouse =
      this.resolveNumeroHouse(
        house,
      );

    const naturalezaCantidad =
      this.cleanText(
        house.naturalezaCantidad,
      ) ?? '';

    const pesoKg =
      Number(
        house.pesoKg ?? 0,
      );

    const bultos =
      this.resolveCantidadPaquetes(
        house,
      );

    const remitenteNombre =
      this.cleanText(
        house.remitenteNombre,
      ) ?? '';

    return {
      manifiestoId,

      numeroHouse,

      naturalezaCantidad,

      pesoKg,

      bultos,

      remitenteNombre,

      remitentePasaporte:
        this.cleanText(
          house.remitentePasaporte,
        ),

      destinatarioNombre:
        this.cleanText(
          house.destinatarioNombre,
        ) ?? '',

      destinatarioCarnet:
        this.cleanText(
          house.destinatarioCarnet,
        ),

      telefonoDestinatario:
        this.cleanText(
          house.telefonoDestinatario,
        ),

      direccionDestinatario:
        this.cleanText(
          house.direccionDestinatario,
        ),

      // Prisma define este campo como STRING.
      //
      // El parser lo entrega como NUMBER | NULL.
      //
      // Por eso hacemos la conversión aquí,
      // sin eliminar los valores válidos.
      estadoCobroOrigen:
        house.estadoCobroOrigen !==
          null &&
        house.estadoCobroOrigen !==
          undefined
          ? String(
              house.estadoCobroOrigen,
            )
          : null,

      unidadDestino:
        this.cleanText(
          house.unidadDestino,
        ),
    };
  }

  // ============================================================================
  // CREAR PAQUETES
  // ============================================================================

  private async createPaquetes(
    tx: Prisma.TransactionClient,
    guiaId: string,
    cantidad: number,
  ) {
    if (cantidad <= 0) {
      return;
    }

    const paquetes = [];

    for (
      let numero = 1;
      numero <= cantidad;
      numero++
    ) {
      paquetes.push({
        guiaId,
        numero,
      });
    }

    await tx.paquete.createMany({
      data: paquetes,
    });
  }

  // ============================================================================
  // RESOLVER NUMERO HOUSE
  // ============================================================================

  private resolveNumeroHouse(
    house: ManifiestoHouse,
  ): string {
    const numero =
      this.cleanText(
        house.numeroHouse,
      );

    if (!numero) {
      throw new BadRequestException(
        'Se encontró una fila de House sin número de House.',
      );
    }

    return numero;
  }

  // ============================================================================
  // RESOLVER BULTOS / PAQUETES
  // ============================================================================

  private resolveCantidadPaquetes(
    house: ManifiestoHouse,
  ): number {
    const bultos =
      Number(
        house.bultos ?? 1,
      );

    if (
      !Number.isFinite(bultos) ||
      bultos <= 0
    ) {
      return 1;
    }

    return Math.floor(
      bultos,
    );
  }

  // ============================================================================
  // VALIDAR MANIFIESTO
  // ============================================================================

  private validateParsedManifest(
    parsed: ManifiestoParsed,
  ): void {
    if (!parsed) {
      throw new BadRequestException(
        'No fue posible leer el manifiesto.',
      );
    }

    if (
      !parsed.rows ||
      parsed.rows.length === 0
    ) {
      throw new BadRequestException(
        'El manifiesto no contiene registros de House.',
      );
    }

    // ------------------------------------------------------------------------
    // HOUSES
    // ------------------------------------------------------------------------

    if (
      parsed.total.cantidadHouses !==
      parsed.rows.length
    ) {
      throw new BadRequestException(
        `La cantidad de Houses no coincide. ` +
        `Total declarado: ${parsed.total.cantidadHouses}. ` +
        `Registros encontrados: ${parsed.rows.length}.`,
      );
    }

    // ------------------------------------------------------------------------
    // PESO
    // ------------------------------------------------------------------------

    if (
      parsed.total.pesoTotalKg ===
        null ||
      parsed.total.pesoTotalKg ===
        undefined
    ) {
      throw new BadRequestException(
        'No fue posible determinar el peso total del manifiesto.',
      );
    }

    if (
      !Number.isFinite(
        Number(
          parsed.total
            .pesoTotalKg,
        ),
      )
    ) {
      throw new BadRequestException(
        'El peso total del manifiesto no es válido.',
      );
    }

    // ------------------------------------------------------------------------
    // PERSONAS
    //
    // La diferencia entre las personas
    // declaradas y las personas calculadas
    // NO bloquea la importación.
    //
    // Ejemplo:
    //
    // Declaradas: 83
    // Encontradas/calculadas: 82
    //
    // Esta diferencia debe aparecer como
    // warning generado por el parser.
    // ------------------------------------------------------------------------
  }

  // ============================================================================
  // HASH SHA-256
  // ============================================================================

  private calculateHash(
    buffer: Buffer,
  ): string {
    return createHash('sha256')
      .update(buffer)
      .digest('hex');
  }

  // ============================================================================
  // LIMPIAR TEXTO
  // ============================================================================

  private cleanText(
    value: unknown,
  ): string | null {
    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    const text =
      String(value).trim();

    return text.length > 0
      ? text
      : null;
  }

  // ============================================================================
  // MANEJO DE ERRORES
  // ============================================================================

  private handleError(
    error: unknown,
  ): never {
    console.error('');

    console.error(
      '============================================================',
    );

    console.error(
      'ERROR EN MANIFIESTOS SERVICE',
    );

    console.error(
      '============================================================',
    );

    console.error(
      'Tipo:',
      error?.constructor?.name,
    );

    console.error(
      'Error:',
      error,
    );

    if (
      error instanceof Error
    ) {
      console.error(
        'Mensaje:',
        error.message,
      );

      console.error(
        'Stack:',
        error.stack,
      );
    }

    console.error(
      '============================================================',
    );

    console.error('');

    if (
      error instanceof BadRequestException
    ) {
      throw error;
    }

    throw new BadRequestException(
      error instanceof Error
        ? error.message
        : 'Error procesando el manifiesto.',
    );
  }
}