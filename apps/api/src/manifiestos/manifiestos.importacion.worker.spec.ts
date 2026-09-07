import { describe, expect, it, vi } from 'vitest';
import { ManifiestosImportacionWorker } from './manifiestos.importacion.worker.js';

function createWorker() {
  const prisma = { $queryRaw: vi.fn() };
  const progress = {
    claim: vi.fn(),
    fail: vi.fn(),
    get: vi.fn(),
    heartbeat: vi.fn(),
  };
  const source = { get: vi.fn(), delete: vi.fn() };
  const importer = { importar: vi.fn() };

  return {
    worker: new ManifiestosImportacionWorker(
      prisma as never,
      progress as never,
      source as never,
      importer as never,
    ),
    prisma,
    progress,
    source,
    importer,
  };
}

describe('ManifiestosImportacionWorker durable execution', () => {
  it('limits concurrent claimed jobs to two', async () => {
    const { worker, prisma, progress, source, importer } = createWorker();
    prisma.$queryRaw.mockResolvedValue([
      { id: 'job-1' },
      { id: 'job-2' },
      { id: 'job-3' },
    ]);
    progress.claim.mockResolvedValue(true);
    source.get.mockResolvedValue({
      buffer: Buffer.from('xlsx'),
      originalname: 'manifest.xlsx',
    });
    importer.importar.mockReturnValue(new Promise(() => undefined));

    await (worker as any).tick();

    expect(progress.claim).toHaveBeenCalledTimes(2);
    expect(importer.importar).toHaveBeenCalledTimes(2);
    expect((worker as any).activeJobs.size).toBe(2);
  });

  it('does not execute a job when its durable source is missing', async () => {
    const { worker, prisma, progress, source, importer } = createWorker();
    prisma.$queryRaw.mockResolvedValue([{ id: 'job-1' }]);
    progress.claim.mockResolvedValue(true);
    source.get.mockResolvedValue(null);

    await (worker as any).tick();

    expect(importer.importar).not.toHaveBeenCalled();
    expect(progress.fail).toHaveBeenCalledWith('job-1', expect.any(Error));
    expect((worker as any).activeJobs.size).toBe(0);
  });

  it('does not execute a job when another worker already owns it', async () => {
    const { worker, prisma, progress, source, importer } = createWorker();
    prisma.$queryRaw.mockResolvedValue([{ id: 'job-1' }]);
    progress.claim.mockResolvedValue(false);

    await (worker as any).tick();

    expect(source.get).not.toHaveBeenCalled();
    expect(importer.importar).not.toHaveBeenCalled();
    expect(progress.fail).not.toHaveBeenCalled();
  });

  it('deletes the durable source only after a completed import', async () => {
    const { worker, progress, source, importer } = createWorker();
    progress.get.mockResolvedValue({ status: 'completed' });
    importer.importar.mockResolvedValue(undefined);

    await (worker as any).execute('job-1', Buffer.from('xlsx'), 'manifest.xlsx');

    expect(source.delete).toHaveBeenCalledWith('job-1');
    expect((worker as any).activeJobs.size).toBe(0);
  });

  it('keeps a completed import completed when source cleanup fails', async () => {
    const { worker, progress, source, importer } = createWorker();
    progress.get.mockResolvedValue({ status: 'completed' });
    source.delete.mockRejectedValue(new Error('cleanup failed'));
    importer.importar.mockResolvedValue(undefined);

    await expect(
      (worker as any).execute('job-1', Buffer.from('xlsx'), 'manifest.xlsx'),
    ).resolves.toBeUndefined();

    expect(progress.fail).not.toHaveBeenCalled();
    expect((worker as any).activeJobs.size).toBe(0);
  });
});
