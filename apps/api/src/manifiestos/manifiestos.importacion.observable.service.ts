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

  override async importar(
    buffer: Buffer,
    originalname: string,
    jobId: string,
  ) {
    const response = await super.importar(buffer, originalname, jobId);
    await this.detalles.guardarDesdeWarnings(jobId, response.warnings);
    return response;
  }
}
