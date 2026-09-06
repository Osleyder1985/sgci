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
import { ManifiestosService } from './manifiestos.service.js';
import { ManifiestoParser } from './parsers/manifiesto.parser.js';

import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],

  controllers: [ManifiestosController],

  providers: [ManifiestosService, ManifiestoParser],

  exports: [ManifiestosService, ManifiestoParser],
})
export class ManifiestosModule {}
