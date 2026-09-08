import { describe, expect, it, vi } from 'vitest';
import { ManifiestosImportacionSourceService } from './manifiestos.importacion.source.service.js';

function createService(content: Buffer | Uint8Array) {
  const prisma = {
    $queryRaw: vi.fn().mockResolvedValue([
      {
        jobId: 'job-1',
        originalname: 'manifest.xlsx',
        mimetype:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: content.byteLength,
        sha256: 'hash',
        content,
      },
    ]),
  } as never;

  return new ManifiestosImportacionSourceService(prisma);
}

describe('ManifiestosImportacionSourceService', () => {
  it('normaliza contenido Uint8Array a Buffer sin alterar los bytes', async () => {
    const content = new Uint8Array([80, 75, 3, 4, 10, 20, 30]);
    const service = createService(content);

    const source = await service.get('job-1');

    expect(source?.buffer).toBeInstanceOf(Buffer);
    expect(Array.from(source?.buffer ?? [])).toEqual(Array.from(content));
  });

  it('conserva un Buffer sin copiarlo innecesariamente', async () => {
    const content = Buffer.from([80, 75, 3, 4, 40, 50, 60]);
    const service = createService(content);

    const source = await service.get('job-1');

    expect(source?.buffer).toBe(content);
  });
});
