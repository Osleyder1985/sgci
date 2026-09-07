import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

import { GeocodificacionService } from '../geocodificacion/geocodificacion.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ManifiestosImportacionEscalableService } from './manifiestos.importacion.escalable.service.js';
import { ManifiestoParser } from './parsers/manifiesto.parser.js';

describe('ManifiestosImportacionEscalableService - rollback', () => {
  it('debe compensar una importación que falla después de varios Houses', async () => {
    const cleanupTx = {
      manifiesto: { delete: vi.fn().mockResolvedValue(undefined), count: vi.fn() },
      masterAwb: { delete: vi.fn().mockResolvedValue(undefined) },
      guia: { deleteMany: vi.fn() },
      paquete: { deleteMany: vi.fn() },
      direccion: { deleteMany: vi.fn() },
      documentoIdentidad: { deleteMany: vi.fn(), update: vi.fn() },
      persona: { delete: vi.fn() },
      $queryRaw: vi.fn().mockResolvedValue([{ total: 0n }]),
      $executeRaw: vi.fn(),
    };

    let transactionCalls = 0;
    const prismaMock: any = {
      manifiesto: { findFirst: vi.fn().mockResolvedValue(null) },
      masterAwb: { findUnique: vi.fn().mockResolvedValue(null) },
      $transaction: vi.fn(async (callback: any) => {
        transactionCalls++;
        if (transactionCalls === 1) {
          const tx = {
            masterAwb: {
              findUnique: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue({ id: 'master-1', numero: '649-31382945' }),
            },
            manifiesto: {
              create: vi.fn().mockResolvedValue({
                id: 'manifiesto-1',
                cantidadHouse: 2,
                totalSacas: 2,
                totalPersonas: 0,
                pesoTotalKg: { toString: () => '20' },
                archivoNombre: 'manifest.xlsx',
                importadoAt: new Date(),
              }),
            },
          };
          return callback(tx);
        }
        if (transactionCalls === 2) {
          return callback({
            guia: { create: vi.fn().mockResolvedValue({ id: 'guia-1' }) },
            paquete: { createMany: vi.fn().mockResolvedValue(undefined) },
          });
        }
        if (transactionCalls === 3) {
          throw new Error('Fallo simulado después del House 1');
        }
        return callback(cleanupTx);
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ManifiestosImportacionEscalableService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ManifiestoParser, useValue: {
          parse: vi.fn().mockReturnValue({
            metadata: {
              masterAwb: '649-31382945',
              fecha: new Date('2026-02-18'),
              agenteTransitario: 'CAC',
              paisOrigen: 'MEXICO',
              consignatario: 'DESTINO',
            },
            total: {
              cantidadHouses: 2,
              cantidadSacas: 2,
              cantidadPersonas: 0,
              pesoTotalKg: 20,
            },
            rows: [
              { numeroHouse: 'H-1', bultos: 1 },
              { numeroHouse: 'H-2', bultos: 1 },
            ],
            warnings: [],
          }),
        } },
        { provide: GeocodificacionService, useValue: {} },
      ],
    }).compile();

    const service: any = moduleRef.get(ManifiestosImportacionEscalableService);
    service.createGuia = vi.fn().mockReturnValue({});

    await expect(service.importar(Buffer.from('manifest'), 'manifest.xlsx', 'job-1'))
      .rejects.toThrow('Fallo simulado después del House 1');

    expect(cleanupTx.manifiesto.delete).toHaveBeenCalledWith({ where: { id: 'manifiesto-1' } });
    expect(cleanupTx.masterAwb.delete).toHaveBeenCalledWith({ where: { id: 'master-1' } });
  });

  it('debe eliminar direcciones nuevas antes de eliminar personas nuevas', async () => {
    const calls: string[] = [];
    const tx: any = {
      direccion: {
        deleteMany: vi.fn(async () => { calls.push('direcciones'); }),
      },
      documentoIdentidad: {
        deleteMany: vi.fn(async () => { calls.push('documentos'); }),
        update: vi.fn(),
      },
      persona: {
        delete: vi.fn(async () => { calls.push('personas'); }),
      },
      manifiesto: { delete: vi.fn(async () => { calls.push('manifiesto'); }), count: vi.fn() },
      masterAwb: { delete: vi.fn() },
      $queryRaw: vi.fn().mockResolvedValue([{ total: 0n }]),
      $executeRaw: vi.fn(),
    };

    const prismaMock: any = {
      $transaction: vi.fn(async (callback: any) => callback(tx)),
    };

    const service = Object.create(ManifiestosImportacionEscalableService.prototype) as any;
    service.prisma = prismaMock;

    await service.cleanupFailedImport({
      manifiestoId: 'manifiesto-1',
      masterAwbId: 'master-1',
      masterAwbCreated: false,
      createdPersonaIds: new Set(['persona-1']),
      createdDocumentoIds: new Set(['documento-1']),
      createdDireccionIds: new Set(['direccion-1']),
      modifiedDirections: new Map(),
      modifiedDocumentPrincipal: new Map(),
    });

    expect(calls.indexOf('direcciones')).toBeLessThan(calls.indexOf('documentos'));
    expect(calls.indexOf('documentos')).toBeLessThan(calls.indexOf('personas'));
    expect(calls.indexOf('personas')).toBeLessThan(calls.indexOf('manifiesto'));
  });

  it('debe restaurar el documento principal original al hacer rollback', async () => {
    const tx: any = {
      documentoIdentidad: { update: vi.fn().mockResolvedValue(undefined), deleteMany: vi.fn() },
      direccion: { deleteMany: vi.fn() },
      persona: { delete: vi.fn() },
      manifiesto: { delete: vi.fn(), count: vi.fn() },
      masterAwb: { delete: vi.fn() },
      $queryRaw: vi.fn().mockResolvedValue([{ total: 0n }]),
      $executeRaw: vi.fn(),
    };
    const service = Object.create(ManifiestosImportacionEscalableService.prototype) as any;
    service.prisma = { $transaction: vi.fn(async (callback: any) => callback(tx)) };

    await service.cleanupFailedImport({
      manifiestoId: null,
      masterAwbId: null,
      masterAwbCreated: false,
      createdPersonaIds: new Set(),
      createdDocumentoIds: new Set(),
      createdDireccionIds: new Set(),
      modifiedDirections: new Map(),
      modifiedDocumentPrincipal: new Map([['documento-original', true]]),
    });

    expect(tx.documentoIdentidad.update).toHaveBeenCalledWith({
      where: { id: 'documento-original' },
      data: { esPrincipal: true },
    });
  });
});
