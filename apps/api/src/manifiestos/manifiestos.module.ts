import { Module } from '@nestjs/common';
import { GeocodificacionModule } from '../geocodificacion/geocodificacion.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ManifiestosController } from './manifiestos.controller.js';
import { ManifiestosDiagnosticoService } from './manifiestos.diagnostico.service.js';
import { ManifiestosImportacionProgressService } from './manifiestos.importacion.progress.service.js';
import { ManifiestosImportacionProgressDisplayService } from './manifiestos.importacion.progress.display.service.js';
import { ManifiestosImportacionEscalableService } from './manifiestos.importacion.escalable.service.js';
import { ManifiestosImportacionSourceService } from './manifiestos.importacion.source.service.js';
import { ManifiestosImportacionWorker } from './manifiestos.importacion.worker.js';
import { ManifiestosService } from './manifiestos.service.js';
import { ManifiestoParser } from './parsers/manifiesto.parser.js';

@Module({
  imports: [PrismaModule, GeocodificacionModule],
  controllers: [ManifiestosController],
  providers: [
    ManifiestosService,
    ManifiestosDiagnosticoService,
    {
      provide: ManifiestosImportacionProgressService,
      useClass: ManifiestosImportacionProgressDisplayService,
    },
    ManifiestosImportacionProgressDisplayService,
    ManifiestosImportacionEscalableService,
    ManifiestosImportacionSourceService,
    ManifiestosImportacionWorker,
    ManifiestoParser,
  ],
  exports: [
    ManifiestosService,
    ManifiestoParser,
    ManifiestosImportacionProgressService,
    ManifiestosImportacionEscalableService,
  ],
})
export class ManifiestosModule {}
