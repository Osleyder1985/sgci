/**
 * =============================================================================
 * SGCI - App Module
 * =============================================================================
 *
 * Archivo:
 * C:\Proyecto\sgci\apps\api\src\app.module.ts
 *
 * Módulo raíz de la aplicación.
 *
 * Aquí registramos:
 * - PrismaModule       -> acceso a PostgreSQL.
 * - ManifiestosModule  -> funcionalidad Importar Manifiesto.
 * - DashboardModule    -> métricas y datos del Dashboard.
 * - AppController      -> endpoints generales.
 * - AppService         -> servicios generales.
 * =============================================================================
 */

import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { PrismaModule } from './prisma/prisma.module.js';

import { ManifiestosModule } from './manifiestos/manifiestos.module.js';

import { DashboardModule } from './dashboard/dashboard.module.js';

/**
 * Módulo principal de SGCI.
 */
@Module({
  imports: [
    /**
     * Capa de persistencia PostgreSQL mediante Prisma.
     *
     * PrismaModule es global, por lo que PrismaService quedará
     * disponible para los demás módulos.
     */
    PrismaModule,

    /**
     * Módulo encargado de:
     * - Preview de manifiestos.
     * - Importación definitiva.
     * - Creación de Master AWB.
     * - Creación de Manifiesto.
     * - Creación de Guías.
     * - Creación de Paquetes.
     */
    ManifiestosModule,

    /**
     * Módulo encargado de:
     * - KPIs operativos.
     * - Métricas de manifiestos.
     * - Métricas de guías.
     * - Métricas de bultos.
     * - Métricas de personas.
     * - Peso total.
     * - Estado de cobro.
     * - Destinos.
     * - Actividad reciente.
     */
    DashboardModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}