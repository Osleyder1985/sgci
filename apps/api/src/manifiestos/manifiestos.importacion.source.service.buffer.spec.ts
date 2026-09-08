import { describe, expect, it, vi } from 'vitest';
import { ManifiestosImportacionSourceService } from './manifiestos.importacion.source.service.js';

function createService(content: Buffer | Uint8Array) {
  const prisma = {
    $queryRaw: vi.fn().mockResolvedValue([
      {
        jobId: 'job-1',
        originalname: 'manifest.xlsx',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: content.byteLength,
        sha256: 'hash',
        content,
      },
    ]),
  } as never;

  return new ManifiestosImportacionSourceService(prisma);
}

describe('ManifiestosImportacionSourceService buffer normalization', () => {
  it('normaliza Uint8Array a Buffer preservando los bytes', async () => {
    const content = new Uint8Array([80, 75, 3, 4, 10, 20, 30]);
    const source = await createService(content).get('job-1');

    expect(source?.buffer).toBeInstanceOf(Buffer);
    expect(Array.from(source?.buffer ?? [])).toEqual(Array.from(content));
  });
});
