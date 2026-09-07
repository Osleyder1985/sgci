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
  private readonly pollMs = 3000;
  private readonly heartbeatMs = 30000;
  private readonly maxConcurrentJobs = 2;
  private readonly activeJobs = new Set<string>();
  private polling = false;

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
    if (this.polling || this.activeJobs.size >= this.maxConcurrentJobs) return;
    this.polling = true;
    try {
      const capacity = this.maxConcurrentJobs - this.activeJobs.size;
      const jobs = await this.prisma.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "ManifiestoImportacionJob"
        WHERE "status" = 'running'
          AND "stage" = 'queued'
        ORDER BY "startedAt" ASC
        LIMIT ${capacity}
      `;

      for (const job of jobs) {
        if (this.activeJobs.size >= this.maxConcurrentJobs) break;
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

        this.activeJobs.add(job.id);
        void this.execute(job.id, source.buffer, source.originalname);
      }
    } catch (error) {
      this.logger.error(
        'Falló el ciclo del worker de importación.',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.polling = false;
    }
  }

  private async execute(
    jobId: string,
    buffer: Buffer,
    originalname: string,
  ): Promise<void> {
    const heartbeat = setInterval(() => {
      void this.refreshLease(jobId);
    }, this.heartbeatMs);

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
      try {
        await this.progress.fail(jobId, error);
      } catch (failError) {
        this.logger.error(
          `No se pudo persistir el fallo del job ${jobId}.`,
          failError instanceof Error ? failError.stack : String(failError),
        );
      }
    } finally {
      clearInterval(heartbeat);
      this.activeJobs.delete(jobId);
    }
  }

  private async refreshLease(jobId: string): Promise<void> {
    try {
      const owned = await this.progress.heartbeat(jobId);
      if (!owned) {
        this.logger.error(
          `El worker perdió el lease del job ${jobId}; la ejecución no debe considerarse propietaria del job.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Falló el heartbeat del job ${jobId}.`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
