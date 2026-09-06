// ================================================================================
// SGCI - Sistema de Gestión Contextual Integrado
//
// Archivo:
//   apps/api/src/dashboard/dashboard.controller.ts
//
// Endpoint:
//   GET /api/dashboard
// ================================================================================

import { Controller, Get } from '@nestjs/common';

import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard() {
    return this.dashboardService.getDashboard();
  }
}
