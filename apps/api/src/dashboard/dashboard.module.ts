// ================================================================================
// SGCI - Sistema de Gestión Contextual Integrado
//
// Archivo:
//   apps/api/src/dashboard/dashboard.module.ts
// ================================================================================

import { Module } from '@nestjs/common';

import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  controllers: [DashboardController],

  providers: [DashboardService],
})
export class DashboardModule {}
