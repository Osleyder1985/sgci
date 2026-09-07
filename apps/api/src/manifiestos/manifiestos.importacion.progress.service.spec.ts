import { describe, expect, it, vi } from 'vitest';
import { ManifiestosImportacionProgressService } from './manifiestos.importacion.progress.service.js';

function createPrismaMock() {
  return {
    $executeRaw: vi.fn().mockResolvedValue(1),
    $queryRaw: vi.fn(),
  } as never;
}

describe('ManifiestosImportacionProgressService durable jobs', () => {
  it('claims a queued job atomically', async () => {
    const prisma = createPrismaMock() as any;
    prisma.$queryRaw.mockResolvedValueOnce([{ id: 'job-1' }]);
    const service = new ManifiestosImportacionProgressService(prisma);

    await expect(service.claim('job-1')).resolves.toBe(true);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('reports false when another worker owns the job', async () => {
    const prisma = createPrismaMock() as any;
    prisma.$queryRaw.mockResolvedValueOnce([]);
    const service = new ManifiestosImportacionProgressService(prisma);

    await expect(service.claim('job-1')).resolves.toBe(false);
  });

  it('heartbeats only when the current worker still owns the lease', async () => {
    const prisma = createPrismaMock() as any;
    prisma.$queryRaw.mockResolvedValueOnce([{ id: 'job-1' }]);
    const service = new ManifiestosImportacionProgressService(prisma);

    await expect(service.heartbeat('job-1')).resolves.toBe(true);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('recovers expired jobs without touching queued jobs', async () => {
    const prisma = createPrismaMock() as any;
    prisma.$queryRaw.mockResolvedValueOnce([{ id: 'job-1' }]);
    const service = new ManifiestosImportacionProgressService(prisma);

    await expect(service.recoverExpiredJobs()).resolves.toBe(1);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
