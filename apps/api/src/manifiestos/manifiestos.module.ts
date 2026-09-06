// ================================================================================
// SGCI - Sistema de Gestión Contextual Integrado
//
// Archivo:
//   apps/api/src/manifiestos/manifiestos.module.ts
//
// Responsabilidad:
//   Módulo principal de Importar Manifiesto.
// ================================================================================

import { Module } from '@nestjs/common';

import { ManifiestosController } from './manifiestos.controller.js';
import { ManifiestosDiagnosticoService } from './manifiestos.diagnostico.service.js';
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
    ManifiestoParser,
  ],

  exports: [ManifiestosService, ManifiestoParser],
})
export class ManifiestosModule {}
