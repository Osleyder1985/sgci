import { Module } from '@nestjs/common';

import { ManifiestosController } from './manifiestos.controller.js';
import { ManifiestosDiagnosticoService } from './manifiestos.diagnostico.service.js';
import { ManifiestosImportacionProgressService } from './manifiestos.importacion.progress.service.js';
import { ManifiestosService } from './manifiestos.service.js';
import { ManifiestoParser } from './parsers/manifiesto.parser.js';

import { GeocodificacionModule } from '../geocodificacion/geocodificacion.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, GeocodificacionModule],
  controllers: [ManifiestosController],
  providers: [
    ManifiestosService,
    ManifiestosDiagnosticoService,
    ManifiestosImportacionProgressService,
    ManifiestoParser,
  ],
  exports: [ManifiestosService, ManifiestoParser, ManifiestosImportacionProgressService],
})
export class ManifiestosModule {}
