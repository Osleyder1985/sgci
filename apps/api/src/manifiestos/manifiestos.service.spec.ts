import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

import { GeocodificacionService } from '../geocodificacion/geocodificacion.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ManifiestosService } from './manifiestos.service.js';
import { ManifiestoParser } from './parsers/manifiesto.parser.js';

describe('ManifiestosService - direcciones', () => {
  it('debe reutilizar una dirección ya geocodificada sin volver a geocodificarla', async () => {
    const prismaMock = {
      direccion: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'direccion-1',
            direccionOriginal: 'Calle 123 #45',
            estadoGeocodificacion: 'GEOCODIFICADA',
          },
        ]),
      },
    };

    const geocodificacionMock = {
      geocodificar: vi.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ManifiestosService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ManifiestoParser, useValue: {} },
        { provide: GeocodificacionService, useValue: geocodificacionMock },
      ],
    }).compile();

    const service = moduleRef.get<ManifiestosService>(ManifiestosService);

    const resultado = await (service as any).verificarDirecciones(
      [
        {
          personaId: 'persona-1',
          nombre: 'Juan Pérez',
          carnet: '123',
          direccion: ' calle 123 #45 ',
        },
      ],
      'MEXICO',
    );

    expect(resultado.direccionesEncontradas).toBe(1);
    expect(resultado.direccionesReutilizadas).toBe(1);
    expect(resultado.direccionesGeocodificadas).toBe(0);
    expect(geocodificacionMock.geocodificar).not.toHaveBeenCalled();
  });
});
