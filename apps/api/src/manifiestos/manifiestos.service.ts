import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';

import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { GeocodificacionService } from '../geocodificacion/geocodificacion.service.js';
import {
  ManifiestoHouse,
  ManifiestoParsed,
  ManifiestoParser,
} from './parsers/manifiesto.parser.js';

interface DestinatarioImportado {
  personaId: string;
  nombre: string;
  carnet: string | null;
  direccion: string | null;
}

interface ResultadoDirecciones {
  personasVerificadas: number;
  direccionesEncontradas: number;
  direccionesReutilizadas: number;
  direccionesGeocodificadas: number;
  direccionesPendientes: number;
  warnings: string[];
}

@Injectable()
export class ManifiestosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ManifiestoParser,
    private readonly geocodificacion: GeocodificacionService,
  ) {}
