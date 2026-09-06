import { Injectable } from '@nestjs/common';

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

@Injectable()
export class ManifiestosImportacionProgressService {
  private readonly jobs = new Map<string, ImportJobProgress>();

  create(totalHouses: number, totalPeople = 0, totalAddresses = 0): ImportJobProgress {
    const now = new Date().toISOString();
    const job: ImportJobProgress = {
      jobId: crypto.randomUUID(),
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
      startedAt: now,
      updatedAt: now,
      completedAt: null,
      elapsedMs: 0,
      housesPerMinute: 0,
      etaSeconds: null,
      coverage: 0,
      error: null,
    };
    this.jobs.set(job.jobId, job);
    return { ...job };
  }

  get(jobId: string): ImportJobProgress | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;
    return this.snapshot(job);
  }

  update(jobId: string, patch: Partial<ImportJobProgress>): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    Object.assign(job, patch);
    this.recalculate(job);
  }

  complete(jobId: string, message = 'Manifiesto importado correctamente.'): void {
    this.update(jobId, {
      stage: 'completed',
      status: 'completed',
      message,
      completedAt: new Date().toISOString(),
      currentAddress: null,
      error: null,
    });
  }

  fail(jobId: string, error: unknown): void {
    this.update(jobId, {
      stage: 'failed',
      status: 'failed',
      message: 'La importación terminó con errores.',
      completedAt: new Date().toISOString(),
      errors: (this.jobs.get(jobId)?.errors ?? 0) + 1,
      error: error instanceof Error ? error.message : String(error),
      currentAddress: null,
    });
  }

  private recalculate(job: ImportJobProgress): void {
    const started = Date.parse(job.startedAt);
    const end = job.completedAt ? Date.parse(job.completedAt) : Date.now();
    job.elapsedMs = Math.max(0, end - started);
    const minutes = job.elapsedMs / 60_000;
    job.housesPerMinute = minutes > 0 ? Math.round((job.processedHouses / minutes) * 10) / 10 : 0;
    if (job.totalHouses > 0 && job.processedHouses > 0 && job.status === 'running') {
      const remaining = job.totalHouses - job.processedHouses;
      job.etaSeconds = Math.max(0, Math.round((remaining / job.processedHouses) * (job.elapsedMs / 1000)));
    } else {
      job.etaSeconds = job.status === 'completed' ? 0 : null;
    }
    const resolved = job.addressesGeocoded + job.addressesReused;
    job.coverage = job.totalAddresses > 0 ? Math.round((resolved / job.totalAddresses) * 1000) / 10 : 0;
    job.updatedAt = new Date().toISOString();
  }

  private snapshot(job: ImportJobProgress): ImportJobProgress {
    return { ...job };
  }
}
