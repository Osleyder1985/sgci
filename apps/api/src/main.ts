import 'dotenv/config';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

// ================================================================================
// SGCI - Sistema de Gestión Contextual Integrado
//
// Archivo:
//   C:\Proyecto\sgci\apps\api\src\main.ts
//
// WEB:
//   http://localhost:3000
//
// API:
//   http://localhost:3001
//
// ================================================================================

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],

    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = Number(process.env.PORT ?? 3001);

  await app.listen(port);

  console.log(`SGCI API ejecutándose en http://localhost:${port}`);
}

await bootstrap();
