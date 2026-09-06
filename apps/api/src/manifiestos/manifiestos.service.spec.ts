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

    const geocodificacionMock = { geocodificar: vi.fn() };

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

  it('debe geocodificar una dirección existente que aún no está geocodificada', async () => {
    const prismaMock = {
      direccion: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'direccion-2',
            direccionOriginal: 'Calle 456 #78',
            estadoGeocodificacion: 'PENDIENTE',
          },
        ]),
      },
      $executeRaw: vi.fn().mockResolvedValue(1),
    };

    const geocodificacionMock = {
      geocodificar: vi.fn().mockResolvedValue({
        lat: 19.4326,
        lon: -99.1332,
        displayName: 'Calle 456 #78, Mexico',
      }),
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
          direccion: ' calle 456 #78 ',
        },
      ],
      'MEXICO',
    );

    expect(resultado.direccionesEncontradas).toBe(1);
    expect(resultado.direccionesReutilizadas).toBe(0);
    expect(resultado.direccionesGeocodificadas).toBe(1);
    expect(resultado.direccionesPendientes).toBe(0);
    expect(geocodificacionMock.geocodificar).toHaveBeenCalledWith(
      'calle 456 #78',
      'MEXICO',
    );
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('debe crear y geocodificar una dirección nueva cuando no existe para la persona', async () => {
    const prismaMock = {
      direccion: { findMany: vi.fn().mockResolvedValue([]) },
      $executeRaw: vi.fn().mockResolvedValue(1),
    };

    const geocodificacionMock = {
      geocodificar: vi.fn().mockResolvedValue({
        lat: 19.4326,
        lon: -99.1332,
        displayName: 'Calle Nueva 789, Mexico',
      }),
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
          direccion: ' calle nueva 789 ',
        },
      ],
      'MEXICO',
    );

    expect(resultado.direccionesEncontradas).toBe(1);
    expect(resultado.direccionesReutilizadas).toBe(0);
    expect(resultado.direccionesGeocodificadas).toBe(1);
    expect(resultado.direccionesPendientes).toBe(0);
    expect(geocodificacionMock.geocodificar).toHaveBeenCalledWith(
      'calle nueva 789',
      'MEXICO',
    );
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('debe dejar la dirección pendiente y registrar un warning cuando el geocodificador no encuentra resultado', async () => {
    const prismaMock = {
      direccion: { findMany: vi.fn().mockResolvedValue([]) },
      $executeRaw: vi.fn(),
    };

    const geocodificacionMock = {
      geocodificar: vi.fn().mockResolvedValue(null),
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
          direccion: ' Dirección imposible 999 ',
        },
      ],
      'MEXICO',
    );

    expect(geocodificacionMock.geocodificar).toHaveBeenCalledWith(
      'Dirección imposible 999',
      'MEXICO',
    );
    expect(resultado.direccionesEncontradas).toBe(0);
    expect(resultado.direccionesReutilizadas).toBe(0);
    expect(resultado.direccionesGeocodificadas).toBe(0);
    expect(resultado.direccionesPendientes).toBe(1);
    expect(resultado.warnings).toHaveLength(1);
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled();
  });

  it('debe dejar la dirección pendiente y registrar un warning cuando el geocodificador falla', async () => {
    const prismaMock = {
      direccion: { findMany: vi.fn().mockResolvedValue([]) },
      $executeRaw: vi.fn(),
    };

    const geocodificacionMock = {
      geocodificar: vi.fn().mockRejectedValue(new Error('Servicio no disponible')),
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
          direccion: ' Calle con error 123 ',
        },
      ],
      'MEXICO',
    );

    expect(resultado.direccionesEncontradas).toBe(0);
    expect(resultado.direccionesReutilizadas).toBe(0);
    expect(resultado.direccionesGeocodificadas).toBe(0);
    expect(resultado.direccionesPendientes).toBe(1);
    expect(resultado.warnings[0]).toContain('Servicio no disponible');
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled();
  });

  it('debe ejecutar la verificación de direcciones desde importar', async () => {
    const service = Object.create(ManifiestosService.prototype) as any;
    service.verificarDirecciones = vi.fn().mockResolvedValue({
      personasVerificadas: 1,
      direccionesEncontradas: 1,
      direccionesReutilizadas: 0,
      direccionesGeocodificadas: 1,
      direccionesPendientes: 0,
      warnings: [],
    });

    const parsed = {
      metadata: {
        masterAwb: '649-31382945',
        fecha: new Date('2026-02-18'),
        agenteTransitario: 'CAC',
        paisOrigen: 'MEXICO',
        consignatario: 'DESTINO',
      },
      total: {
        cantidadHouses: 1,
        cantidadSacas: 1,
        cantidadPersonas: 1,
        pesoTotalKg: 20,
      },
      rows: [
        {
          house: 'CACC-240146',
          destinatarioNombre: 'Juan Pérez',
          destinatarioCarnet: '123',
          direccionDestinatario: 'Calle 123',
        },
      ],
      warnings: [],
    };

    const parser = { parse: vi.fn().mockReturnValue(parsed) };
    const prisma = {
      manifiesto: { findFirst: vi.fn().mockResolvedValue(null) },
      masterAwb: { upsert: vi.fn().mockResolvedValue({ id: 'master-1', numero: '649-31382945' }) },
      $transaction: vi.fn(),
    };

    service.parser = parser as any;
    service.prisma = prisma as any;
    service.geocodificacion = {} as any;

    const transactionClient = {
      manifiesto: {
        create: vi.fn().mockResolvedValue({
          id: 'manifiesto-1',
          cantidadHouse: 1,
          totalSacas: 1,
          totalPersonas: 1,
          pesoTotalKg: { toString: () => '20' },
          archivoNombre: 'manifest.xlsx',
          importadoAt: new Date(),
        }),
      },
      guia: {
        create: vi.fn().mockResolvedValue({ id: 'guia-1' }),
      },
    };

    prisma.$transaction.mockImplementation(async (callback: any) =>
      callback(transactionClient),
    );

    service.createGuia = vi.fn().mockReturnValue({});
    service.resolveCantidadPaquetes = vi.fn().mockReturnValue(1);
    service.createPaquetes = vi.fn().mockResolvedValue(undefined);
    service.resolvePersona = vi.fn().mockResolvedValue('persona-1');

    const resultado = await service.importar(Buffer.from('xlsx'), 'manifest.xlsx');

    expect(service.verificarDirecciones).toHaveBeenCalledWith(
      [{
        personaId: 'persona-1',
        nombre: 'Juan Pérez',
        carnet: '123',
        direccion: 'Calle 123',
      }],
      'MEXICO',
      undefined,
    );
    expect(resultado.estadisticas.direccionesGeocodificadas).toBe(1);
  });
});
