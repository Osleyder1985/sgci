import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export type GeocodificacionDetalleEstado =
  'NO_ENCONTRADA' | 'REQUIERE_REVISION';

export interface GeocodificacionDetalle {
  estado: GeocodificacionDetalleEstado;
  nombre: string;
  direccion: string;
  motivo: string;
}

@Injectable()
export class ManifiestosImportacionGeocodificacionDetalleService {
  constructor(private readonly prisma: PrismaService) {}

  async guardarDesdeWarnings(jobId: string, warnings: string[]): Promise<void> {
    const detalles: GeocodificacionDetalle[] = warnings.flatMap(
      (warning): GeocodificacionDetalle[] => {
        const notFound = warning.match(
          /^No se encontró una ubicación para la dirección de (.+): (.+)$/,
        );
        if (notFound) {
          return [
            {
              estado: 'NO_ENCONTRADA',
              nombre: notFound[1],
              direccion: notFound[2],
              motivo:
                'El proveedor de geocodificación no devolvió una ubicación válida.',
            },
          ];
        }

        const review = warning.match(
          /^No se pudo procesar la dirección de (.+): (.+)$/,
        );
        if (review) {
          return [
            {
              estado: 'REQUIERE_REVISION',
              nombre: review[1],
              direccion: review[2],
              motivo:
                'La dirección produjo un error durante la geocodificación y requiere revisión.',
            },
          ];
        }

        return [];
      },
    );

    await this.prisma.$executeRaw`
      UPDATE "ManifiestoImportacionJob"
      SET "geocodingDetails" = ${JSON.stringify(detalles)}::jsonb,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${jobId}::uuid
    `;
  }

  async obtener(jobId: string): Promise<GeocodificacionDetalle[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{ geocodingDetails: unknown }>
    >`
      SELECT "geocodingDetails"
      FROM "ManifiestoImportacionJob"
      WHERE "id" = ${jobId}::uuid
      LIMIT 1
    `;

    const value = rows[0]?.geocodingDetails;
    return Array.isArray(value) ? (value as GeocodificacionDetalle[]) : [];
  }

  async limpiar(jobId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "ManifiestoImportacionJob"
      SET "geocodingDetails" = NULL,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${jobId}::uuid
    `;
  }
}
