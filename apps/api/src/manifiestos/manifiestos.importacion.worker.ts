import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ManifiestosImportacionProgressService } from './manifiestos.importacion.progress.service.js';
import { ManifiestosImportacionEscalableService } from './manifiestos.importacion.escalable.service.js';
import { ManifiestosImportacionSourceService } from './manifiestos.importacion.source.service.js';

@Injectable()
export class ManifiestosImportacionWorker
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ManifiestosImportacionWorker.name);
  private timer: NodeJS.Timeout | undefined;
  private running = false;
  private readonly pollMs = 3000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ManifiestosImportacionProgressService,
    private readonly source: ManifiestosImportacionSourceService,
    private readonly importer: ManifiestosImportacionEscalableService,
  ) {}

  onModuleInit(): void {
    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.pollMs);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const jobs = await this.prisma.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "ManifiestoImportacionJob"
        WHERE "status" = 'running'
          AND "stage" = 'queued'
        ORDER BY "startedAt" ASC
        LIMIT 10
      `;

      for (const job of jobs) {
        const claimed = await this.progress.claim(job.id);
        if (!claimed) continue;

        const source = await this.source.get(job.id);
        if (!source) {
          await this.progress.fail(
            job.id,
            new Error(
              'El job no tiene una fuente XLSX persistida para su ejecución.',
            ),
          );
          continue;
        }

        void this.execute(job.id, source.buffer, source.originalname);
      }
    } catch (error) {
      this.logger.error(
        'Falló el ciclo del worker de importación.',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.running = false;
    }
  }

  private async execute(
    jobId: string,
    buffer: Buffer,
    originalname: string,
  ): Promise<void> {
    try {
      await this.importer.importar(buffer, originalname, jobId);
      const final = await this.progress.get(jobId);
      if (final?.status === 'completed') {
        await this.source.delete(jobId);
      }
    } catch (error) {
      this.logger.error(
        `Falló la ejecución durable del job ${jobId}.`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
