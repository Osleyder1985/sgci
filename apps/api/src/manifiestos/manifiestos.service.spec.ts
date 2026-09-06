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

    expect(resultado.direccionesEncontradas).toBe(0);
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
    expect(resultado.direccionesPendientes).toBe(1);
    expect(resultado.direccionesGeocodificadas).toBe(0);
    expect(resultado.direccionesEncontradas).toBe(0);
    expect(resultado.warnings).toHaveLength(1);
    expect(resultado.warnings[0]).toContain('No se encontró una ubicación');
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled();
  });

  it('debe dejar la dirección pendiente y registrar un warning cuando el geocodificador falla', async () => {
    const prismaMock = {
      direccion: { findMany: vi.fn().mockResolvedValue([]) },
      $executeRaw: vi.fn(),
    };
    const geocodificacionMock = {
      geocodificar: vi
        .fn()
        .mockRejectedValue(new Error('Servicio no disponible')),
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
          direccion: ' Calle con error 500 ',
        },
      ],
      'MEXICO',
    );

    expect(resultado.direccionesPendientes).toBe(1);
    expect(resultado.direccionesGeocodificadas).toBe(0);
    expect(resultado.warnings).toHaveLength(1);
    expect(resultado.warnings[0]).toContain('Servicio no disponible');
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled();
  });

  it('debe ejecutar la verificación de direcciones desde importar y devolver sus estadísticas', async () => {
    const parsed = {
      metadata: {
        masterAwb: '649-31382945',
        fecha: new Date('2026-02-18T00:00:00.000Z'),
        paisOrigen: 'MEXICO',
        agenteTransitario: 'CENTRAL AMERICA CARGO',
        consignatario: 'DESTINATARIO',
      },
      total: {
        cantidadHouses: 1,
        cantidadSacas: 1,
        cantidadPersonas: 1,
        pesoTotalKg: 20,
      },
      rows: [
        {
          numeroHouse: 'HOUSE-001',
          naturalezaCantidad: 'DOCUMENTOS',
          pesoKg: 20,
          bultos: 1,
          remitenteNombre: 'REMITENTE',
          remitentePasaporte: null,
          destinatarioNombre: 'Juan Pérez',
          destinatarioCarnet: '123',
          telefonoDestinatario: null,
          direccionDestinatario: 'Calle Nueva 789',
          estadoCobroOrigen: null,
          unidadDestino: null,
        },
      ],
      warnings: [],
    };

    const tx = {
      masterAwb: {
        upsert: vi
          .fn()
          .mockResolvedValue({
            id: 'master-1',
            numero: '649-31382945',
          }),
      },
      manifiesto: {
        create: vi.fn().mockResolvedValue({
          id: 'manifiesto-1',
          cantidadHouse: 1,
          totalSacas: 1,
          totalPersonas: 1,
          pesoTotalKg: 20,
          archivoNombre: 'manifiesto.xlsx',
          importadoAt: new Date('2026-02-18T00:00:00.000Z'),
        }),
      },
      guia: {
        create: vi.fn().mockResolvedValue({ id: 'guia-1' }),
      },
      paquete: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      documentoIdentidad: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        createMany: vi.fn(),
      },
      persona: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'persona-1' }),
      },
    };

    const prismaMock = {
      manifiesto: { findFirst: vi.fn().mockResolvedValue(null) },
      $transaction: vi.fn(async (callback) => callback(tx)),
      direccion: { findMany: vi.fn().mockResolvedValue([]) },
      $executeRaw: vi.fn().mockResolvedValue(1),
    };
    const parserMock = {
      parse: vi.fn().mockReturnValue(parsed),
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
        { provide: ManifiestoParser, useValue: parserMock },
        { provide: GeocodificacionService, useValue: geocodificacionMock },
      ],
    }).compile();

    const service = moduleRef.get<ManifiestosService>(ManifiestosService);
    const resultado = await service.importar(
      Buffer.from('manifiesto de prueba'),
      'manifiesto.xlsx',
    );

    expect(parserMock.parse).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.direccion.findMany).toHaveBeenCalledWith({
      where: { personaId: 'persona-1', activa: true },
      select: {
        id: true,
        direccionOriginal: true,
        estadoGeocodificacion: true,
      },
    });
    expect(geocodificacionMock.geocodificar).toHaveBeenCalledWith(
      'Calle Nueva 789',
      'MEXICO',
    );
    expect(resultado.ok).toBe(true);
    expect(resultado.estadisticas).toMatchObject({
      guias: 1,
      paquetes: 1,
      personasVerificadas: 1,
      direccionesEncontradas: 0,
      direccionesReutilizadas: 0,
      direccionesGeocodificadas: 1,
      direccionesPendientes: 0,
    });
    expect(resultado.warnings).toEqual([]);
  });
});
