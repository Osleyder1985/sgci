import { randomUUID } from 'node:crypto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export type ImportJobStage =
  | 'queued'
  | 'parsing'
  | 'creating_guides'
  | 'processing_addresses'
  | 'completed'
  | 'failed';

export interface ImportJobResult {
  manifiestoId: string;
  masterAwb: string;
  guias: number;
  paquetes: number;
  personas: number;
  pesoTotalKg: string;
  warnings: number;
}

export interface ImportJobProgress {
  jobId: string;
  stage: ImportJobStage;
  status: 'running' | 'completed' | 'failed';
  message: string;
  totalHouses: number;
  processedHouses: number;
  totalPeople: number;
  processedPeople: number;
  totalAddresses: number;
  processedAddresses: number;
  addressesGeocoded: number;
  addressesReused: number;
  addressesNotFound: number;
  addressesReview: number;
  errors: number;
  currentAddress: string | null;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  elapsedMs: number;
  housesPerMinute: number;
  etaSeconds: number | null;
  coverage: number;
  error: string | null;
  result: ImportJobResult | null;
}

type JobRow = {
  id: string;
  stage: ImportJobStage;
  status: 'running' | 'completed' | 'failed';
  message: string;
  totalHouses: number;
  processedHouses: number;
  totalPeople: number;
  processedPeople: number;
  totalAddresses: number;
  processedAddresses: number;
  addressesGeocoded: number;
  addressesReused: number;
  addressesNotFound: number;
  addressesReview: number;
  errors: number;
  currentAddress: string | null;
  startedAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  elapsedMs: number;
  housesPerMinute: number;
  etaSeconds: number | null;
  coverage: number;
  error: string | null;
  resultManifiestoId: string | null;
  resultMasterAwb: string | null;
  resultGuias: number | null;
  resultPaquetes: number | null;
  resultPersonas: number | null;
  resultPesoTotalKg: string | null;
  resultWarnings: number | null;
  attempt: number;
  workerId: string | null;
  heartbeatAt: Date | null;
  leaseUntil: Date | null;
};

const DEFAULT_LEASE_SECONDS = 90;

export class ImportJobLeaseLostError extends Error {
  constructor(jobId: string) {
    super(
      `El worker perdió el lease del job ${jobId}. La ejecución debe detenerse y ejecutar rollback.`,
    );
    this.name = 'ImportJobLeaseLostError';
  }
}

@Injectable()
export class ManifiestosImportacionProgressService implements OnModuleInit {
  private readonly logger = new Logger(
    ManifiestosImportacionProgressService.name,
  );
  private readonly queues = new Map<string, Promise<void>>();
  private readonly workerId = randomUUID();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    const recovered = await this.recoverExpiredJobs();
    if (recovered > 0) {
      this.logger.warn(
        `Se marcaron ${recovered} job(s) como fallidos porque su worker perdió el lease.`,
      );
    }
  }

  async create(
    totalHouses: number,
    totalPeople = 0,
    totalAddresses = 0,
  ): Promise<ImportJobProgress> {
    const now = new Date();
    const jobId = randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO "ManifiestoImportacionJob" (
        "id", "stage", "status", "message",
        "totalHouses", "processedHouses", "totalPeople", "processedPeople",
        "totalAddresses", "processedAddresses", "addressesGeocoded", "addressesReused",
        "addressesNotFound", "addressesReview", "errors", "currentAddress",
        "startedAt", "updatedAt", "completedAt", "elapsedMs", "housesPerMinute",
        "etaSeconds", "coverage", "error", "attempt", "workerId", "heartbeatAt", "leaseUntil"
      ) VALUES (
        ${jobId}::uuid, 'queued', 'running', 'Importación en cola.',
        ${totalHouses}, 0, ${totalPeople}, 0,
        ${totalAddresses}, 0, 0, 0,
        0, 0, 0, NULL,
        ${now}, ${now}, NULL, 0, 0,
        NULL, 0, NULL, 0, NULL, NULL, NULL
      )
    `;
    return {
      jobId,
      stage: 'queued',
      status: 'running',
      message: 'Importación en cola.',
      totalHouses,
      processedHouses: 0,
      totalPeople,
      processedPeople: 0,
      totalAddresses,
      processedAddresses: 0,
      addressesGeocoded: 0,
      addressesReused: 0,
      addressesNotFound: 0,
      addressesReview: 0,
      errors: 0,
      currentAddress: null,
      startedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      completedAt: null,
      elapsedMs: 0,
      housesPerMinute: 0,
      etaSeconds: null,
      coverage: 0,
      error: null,
      result: null,
    };
  }

  async claim(
    jobId: string,
    leaseSeconds = DEFAULT_LEASE_SECONDS,
  ): Promise<boolean> {
    const leaseUntil = new Date(Date.now() + leaseSeconds * 1000);
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      UPDATE "ManifiestoImportacionJob"
      SET "stage" = 'parsing',
          "workerId" = ${this.workerId},
          "heartbeatAt" = CURRENT_TIMESTAMP,
          "leaseUntil" = ${leaseUntil},
          "attempt" = "attempt" + 1,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${jobId}::uuid
        AND "status" = 'running'
        AND "stage" = 'queued'
        AND ("leaseUntil" IS NULL OR "leaseUntil" < CURRENT_TIMESTAMP)
      RETURNING "id"
    `;
    return rows.length === 1;
  }

  async heartbeat(
    jobId: string,
    leaseSeconds = DEFAULT_LEASE_SECONDS,
  ): Promise<boolean> {
    const leaseUntil = new Date(Date.now() + leaseSeconds * 1000);
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      UPDATE "ManifiestoImportacionJob"
      SET "heartbeatAt" = CURRENT_TIMESTAMP,
          "leaseUntil" = ${leaseUntil},
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${jobId}::uuid
        AND "status" = 'running'
        AND "workerId" = ${this.workerId}
        AND "leaseUntil" >= CURRENT_TIMESTAMP
      RETURNING "id"
    `;
    return rows.length === 1;
  }

  async recoverExpiredJobs(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      UPDATE "ManifiestoImportacionJob"
      SET "status" = 'failed',
          "stage" = 'failed',
          "message" = 'El worker perdió el lease de ejecución.',
          "error" = 'La ejecución fue interrumpida antes de completar el job. Se requiere reintento desde la fuente original.',
          "completedAt" = CURRENT_TIMESTAMP,
          "updatedAt" = CURRENT_TIMESTAMP,
          "heartbeatAt" = NULL,
          "leaseUntil" = NULL,
          "workerId" = NULL,
          "errors" = "errors" + 1
      WHERE "status" = 'running'
        AND "stage" <> 'queued'
        AND "leaseUntil" IS NOT NULL
        AND "leaseUntil" < CURRENT_TIMESTAMP
      RETURNING "id"
    `;
    return rows.length;
  }

  async get(jobId: string): Promise<ImportJobProgress | null> {
    const rows = await this.prisma.$queryRaw<JobRow[]>`
      SELECT * FROM "ManifiestoImportacionJob" WHERE "id" = ${jobId}::uuid LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return this.toProgress(row);
  }

  update(jobId: string, patch: Partial<ImportJobProgress>): Promise<void> {
    return this.enqueue(jobId, async () => {
      const current = await this.get(jobId);
      if (!current || current.status !== 'running') {
        throw new ImportJobLeaseLostError(jobId);
      }
      const owned = await this.heartbeat(jobId);
      if (!owned) throw new ImportJobLeaseLostError(jobId);
      await this.persist({ ...current, ...patch });
    });
  }

  complete(
    jobId: string,
    message = 'Manifiesto importado correctamente.',
    result?: ImportJobResult,
  ): Promise<void> {
    return this.enqueue(jobId, async () => {
      const current = await this.get(jobId);
      if (!current || current.status !== 'running') {
        throw new ImportJobLeaseLostError(jobId);
      }
      if (!result) {
        throw new Error(
          'No se puede completar el job de importación sin el resultado durable de la importación.',
        );
      }
      const owned = await this.heartbeat(jobId);
      if (!owned) throw new ImportJobLeaseLostError(jobId);

      const affected = await this.persist(
        {
          ...current,
          stage: 'completed',
          status: 'completed',
          message,
          completedAt: new Date().toISOString(),
          currentAddress: null,
          error: null,
          result,
        },
        true,
      );
      if (affected !== 1) throw new ImportJobLeaseLostError(jobId);
    });
  }

  fail(jobId: string, error: unknown): Promise<void> {
    return this.enqueue(jobId, async () => {
      const current = await this.get(jobId);
      if (!current || current.status !== 'running') return;
      await this.persist(
        {
          ...current,
          stage: 'failed',
          status: 'failed',
          message: 'La importación terminó con errores.',
          completedAt: new Date().toISOString(),
          errors: current.errors + 1,
          error: error instanceof Error ? error.message : String(error),
          currentAddress: null,
        },
        true,
      );
    });
  }

  private async persist(
    input: ImportJobProgress,
    terminal = false,
  ): Promise<number> {
    const job = { ...input };
    const started = Date.parse(job.startedAt);
    const end = job.completedAt ? Date.parse(job.completedAt) : Date.now();
    job.elapsedMs = Math.max(0, end - started);

    const minutes = job.elapsedMs / 60000;
    job.housesPerMinute =
      minutes > 0 ? Math.round((job.processedHouses / minutes) * 10) / 10 : 0;

    if (
      job.status === 'running' &&
      job.totalHouses > 0 &&
      job.processedHouses > 0
    ) {
      job.etaSeconds = Math.max(
        0,
        Math.round(
          ((job.totalHouses - job.processedHouses) / job.processedHouses) *
            (job.elapsedMs / 1000),
        ),
      );
    } else {
      job.etaSeconds = job.status === 'completed' ? 0 : null;
    }

    const resolved = job.addressesGeocoded + job.addressesReused;
    job.coverage =
      job.totalAddresses > 0
        ? Math.round((resolved / job.totalAddresses) * 1000) / 10
        : 0;

    return this.prisma.$executeRaw`
      UPDATE "ManifiestoImportacionJob"
      SET "stage" = ${job.stage}, "status" = ${job.status}, "message" = ${job.message},
          "totalHouses" = ${job.totalHouses}, "processedHouses" = ${job.processedHouses},
          "totalPeople" = ${job.totalPeople}, "processedPeople" = ${job.processedPeople},
          "totalAddresses" = ${job.totalAddresses}, "processedAddresses" = ${job.processedAddresses},
          "addressesGeocoded" = ${job.addressesGeocoded}, "addressesReused" = ${job.addressesReused},
          "addressesNotFound" = ${job.addressesNotFound}, "addressesReview" = ${job.addressesReview},
          "errors" = ${job.errors}, "currentAddress" = ${job.currentAddress},
          "updatedAt" = CURRENT_TIMESTAMP,
          "completedAt" = ${job.completedAt ? new Date(job.completedAt) : null},
          "elapsedMs" = ${job.elapsedMs}, "housesPerMinute" = ${job.housesPerMinute},
          "etaSeconds" = ${job.etaSeconds}, "coverage" = ${job.coverage}, "error" = ${job.error},
          "resultManifiestoId" = ${job.result?.manifiestoId ?? null},
          "resultMasterAwb" = ${job.result?.masterAwb ?? null},
          "resultGuias" = ${job.result?.guias ?? null},
          "resultPaquetes" = ${job.result?.paquetes ?? null},
          "resultPersonas" = ${job.result?.personas ?? null},
          "resultPesoTotalKg" = ${job.result?.pesoTotalKg ?? null},
          "resultWarnings" = ${job.result?.warnings ?? null},
          "heartbeatAt" = ${terminal ? null : new Date()},
          "leaseUntil" = ${terminal ? null : new Date(Date.now() + DEFAULT_LEASE_SECONDS * 1000)},
          "workerId" = ${terminal ? null : this.workerId}
      WHERE "id" = ${job.jobId}::uuid
        AND "status" = 'running'
        AND "workerId" = ${this.workerId}
    `;
  }

  private enqueue(
    jobId: string,
    operation: () => Promise<void>,
  ): Promise<void> {
    const previous = this.queues.get(jobId) ?? Promise.resolve();
    const next = previous
      .catch((error) => {
        this.logger.error(
          `La cola de progreso del job ${jobId} falló antes de continuar.`,
          error instanceof Error ? error.stack : String(error),
        );
        throw error;
      })
      .then(operation)
      .catch((error) => {
        this.logger.error(
          `No se pudo persistir el progreso del job ${jobId}.`,
          error instanceof Error ? error.stack : String(error),
        );
        throw error;
      })
      .finally(() => {
        if (this.queues.get(jobId) === next) this.queues.delete(jobId);
      });
    this.queues.set(jobId, next);
    return next;
  }

  private toProgress(row: JobRow): ImportJobProgress {
    return {
      jobId: row.id,
      stage: row.stage,
      status: row.status,
      message: row.message,
      totalHouses: row.totalHouses,
      processedHouses: row.processedHouses,
      totalPeople: row.totalPeople,
      processedPeople: row.processedPeople,
      totalAddresses: row.totalAddresses,
      processedAddresses: row.processedAddresses,
      addressesGeocoded: row.addressesGeocoded,
      addressesReused: row.addressesReused,
      addressesNotFound: row.addressesNotFound,
      addressesReview: row.addressesReview,
      errors: row.errors,
      currentAddress: row.currentAddress,
      startedAt: row.startedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
      elapsedMs: row.elapsedMs,
      housesPerMinute: row.housesPerMinute,
      etaSeconds: row.etaSeconds,
      coverage: row.coverage,
      error: row.error,
      result:
        row.resultManifiestoId && row.resultMasterAwb
          ? {
              manifiestoId: row.resultManifiestoId,
              masterAwb: row.resultMasterAwb,
              guias: row.resultGuias ?? 0,
              paquetes: row.resultPaquetes ?? 0,
              personas: row.resultPersonas ?? 0,
              pesoTotalKg: row.resultPesoTotalKg ?? '0',
              warnings: row.resultWarnings ?? 0,
            }
          : null,
    };
  }
}
