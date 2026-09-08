import { Injectable, Optional } from '@nestjs/common';
import { GeocodificacionService } from '../geocodificacion/geocodificacion.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ManifiestosImportacionEscalableService } from './manifiestos.importacion.escalable.service.js';
import { ManifiestosImportacionGeocodificacionDetalleService } from './manifiestos.importacion.geocodificacion.detalle.service.js';
import { ManifiestosImportacionProgressService } from './manifiestos.importacion.progress.service.js';
import { ManifiestoParser } from './parsers/manifiesto.parser.js';

@Injectable()
export class ManifiestosImportacionObservableService extends ManifiestosImportacionEscalableService {
  constructor(
    prisma: PrismaService,
    parser: ManifiestoParser,
    geocodificacion: GeocodificacionService,
    @Optional() progress: ManifiestosImportacionProgressService,
    private readonly detalles: ManifiestosImportacionGeocodificacionDetalleService,
  ) {
    super(prisma, parser, geocodificacion, progress);
  }

  protected override async persistImportWarnings(
    jobId: string,
    warnings: string[],
  ): Promise<void> {
    await this.detalles.guardarDesdeWarnings(jobId, warnings);
  }
}
