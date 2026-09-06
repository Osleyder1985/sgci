// ================================================================================
// SGCI - Sistema de Gestión Contextual Integrado
//
// Archivo:
//   apps/api/src/prisma/prisma.module.ts
//
// Responsabilidad:
//   Registrar PrismaService como servicio global de NestJS.
//
// Característica:
//   @Global()
//
// Esto permite utilizar PrismaService desde otros módulos sin importar
// PrismaModule manualmente en cada uno.
// ================================================================================

import {
  Global,
  Module,
} from '@nestjs/common';

import {
  PrismaService,
} from './prisma.service.js';

@Global()
@Module({
  providers: [
    PrismaService,
  ],

  exports: [
    PrismaService,
  ],
})
export class PrismaModule {}