import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export type ImportJobStage =
  | 'queued'
  | 'parsing'
  | 'creating_guides'
  | 'processing_addresses'
  | 'completed'
  | 'failed';

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
};

@Injectable()
export class ManifiestosImportacionProgressService {
  private readonly queues = new Map<string, Promise<void>>();
  private readonly staleAfterMs = 10 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

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
        "etaSeconds", "coverage", "error"
      ) VALUES (
        ${jobId}::uuid, 'queued', 'running', 'Importación en cola.',
        ${totalHouses}, 0, ${totalPeople}, 0,
        ${totalAddresses}, 0, 0, 0,
        0, 0, 0, NULL,
        ${now}, ${now}, NULL, 0, 0,
        NULL, 0, NULL
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
    };
  }

  async get(jobId: string): Promise<ImportJobProgress | null> {
    const rows = await this.prisma.$queryRaw<JobRow[]>`
      SELECT * FROM "ManifiestoImportacionJob" WHERE "id" = ${jobId}::uuid LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;

    if (
      row.status === 'running' &&
      Date.now() - row.updatedAt.getTime() > this.staleAfterMs
    ) {
      const now = new Date();
      const error =
        'El trabajo no ha reportado actividad durante más de 10 minutos y fue marcado como abandonado.';
      await this.prisma.$executeRaw`
        UPDATE "ManifiestoImportacionJob"
        SET
          "stage" = 'failed',
          "status" = 'failed',
          "message" = 'La importación fue marcada como abandonada.',
          "completedAt" = ${now},
          "updatedAt" = CURRENT_TIMESTAMP,
          "error" = ${error},
          "errors" = "errors" + 1
        WHERE "id" = ${jobId}::uuid AND "status" = 'running'
      `;
      row.stage = 'failed';
      row.status = 'failed';
      row.message = 'La importación fue marcada como abandonada.';
      row.completedAt = now;
      row.error = error;
      row.errors += 1;
    }

    return this.toProgress(row);
  }

  update(jobId: string, patch: Partial<ImportJobProgress>): Promise<void> {
    return this.enqueue(jobId, async () => {
      const current = await this.get(jobId);
      if (!current || current.status !== 'running') return;
      await this.persist({ ...current, ...patch });
    });
  }

  complete(
    jobId: string,
    message = 'Manifiesto importado correctamente.',
  ): Promise<void> {
    return this.enqueue(jobId, async () => {
      const current = await this.get(jobId);
      if (!current || current.status !== 'running') return;
      await this.persist({
        ...current,
        stage: 'completed',
        status: 'completed',
        message,
        completedAt: new Date().toISOString(),
        currentAddress: null,
        error: null,
      });
    });
  }

  fail(jobId: string, error: unknown): Promise<void> {
    return this.enqueue(jobId, async () => {
      const current = await this.get(jobId);
      if (!current || current.status !== 'running') return;
      await this.persist({
        ...current,
        stage: 'failed',
        status: 'failed',
        message: 'La importación terminó con errores.',
        completedAt: new Date().toISOString(),
        errors: current.errors + 1,
        error: error instanceof Error ? error.message : String(error),
        currentAddress: null,
      });
    });
  }

  private async persist(input: ImportJobProgress): Promise<void> {
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

    await this.prisma.$executeRaw`
      UPDATE "ManifiestoImportacionJob"
      SET
        "stage" = ${job.stage},
        "status" = ${job.status},
        "message" = ${job.message},
        "totalHouses" = ${job.totalHouses},
        "processedHouses" = ${job.processedHouses},
        "totalPeople" = ${job.totalPeople},
        "processedPeople" = ${job.processedPeople},
        "totalAddresses" = ${job.totalAddresses},
        "processedAddresses" = ${job.processedAddresses},
        "addressesGeocoded" = ${job.addressesGeocoded},
        "addressesReused" = ${job.addressesReused},
        "addressesNotFound" = ${job.addressesNotFound},
        "addressesReview" = ${job.addressesReview},
        "errors" = ${job.errors},
        "currentAddress" = ${job.currentAddress},
        "updatedAt" = CURRENT_TIMESTAMP,
        "completedAt" = ${job.completedAt ? new Date(job.completedAt) : null},
        "elapsedMs" = ${job.elapsedMs},
        "housesPerMinute" = ${job.housesPerMinute},
        "etaSeconds" = ${job.etaSeconds},
        "coverage" = ${job.coverage},
        "error" = ${job.error}
      WHERE "id" = ${job.jobId}::uuid
    `;
  }

  private enqueue(
    jobId: string,
    operation: () => Promise<void>,
  ): Promise<void> {
    const previous = this.queues.get(jobId) ?? Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(operation)
      .catch(() => undefined)
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
    };
  }
}
