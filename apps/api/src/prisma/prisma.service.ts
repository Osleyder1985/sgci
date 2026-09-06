// ================================================================================
// SGCI - Sistema de Gestión Contextual Integrado
//
// Archivo:
//   C:\Proyecto\sgci\apps\api\src\prisma\prisma.service.ts
//
// Responsabilidad:
//   Administrar la conexión de Prisma con PostgreSQL.
//
// Funciones:
//   - Crear PrismaClient usando PrismaPg.
//   - Abrir conexión al iniciar NestJS.
//   - Cerrar conexión al detener NestJS.
// ================================================================================

import 'dotenv/config';

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL no está definida. Verifique el archivo .env.',
      );
    }

    const adapter = new PrismaPg({
      connectionString,
    });

    super({
      adapter,
    });
  }

  /**
   * Abre la conexión con PostgreSQL.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Cierra la conexión con PostgreSQL.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
