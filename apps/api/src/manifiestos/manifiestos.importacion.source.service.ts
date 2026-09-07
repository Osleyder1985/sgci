import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';

export interface ImportJobSource {
  jobId: string;
  originalname: string;
  mimetype: string;
  size: number;
  sha256: string;
  buffer: Buffer;
}

@Injectable()
export class ManifiestosImportacionSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    jobId: string,
    buffer: Buffer,
    originalname: string,
    mimetype: string,
  ): Promise<void> {
    const sha256 = createHash('sha256').update(buffer).digest('hex');
    await this.prisma.$executeRaw`
      INSERT INTO "ManifiestoImportacionSource"
        ("id", "jobId", "originalname", "mimetype", "size", "sha256", "content", "createdAt", "updatedAt")
      VALUES
        (gen_random_uuid(), ${jobId}::uuid, ${originalname}, ${mimetype}, ${buffer.length}, ${sha256}, ${buffer}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("jobId") DO UPDATE
      SET "originalname" = EXCLUDED."originalname",
          "mimetype" = EXCLUDED."mimetype",
          "size" = EXCLUDED."size",
          "sha256" = EXCLUDED."sha256",
          "content" = EXCLUDED."content",
          "updatedAt" = CURRENT_TIMESTAMP
    `;
  }

  async get(jobId: string): Promise<ImportJobSource | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        jobId: string;
        originalname: string;
        mimetype: string;
        size: number;
        sha256: string;
        content: Buffer;
      }>
    >`
      SELECT "jobId", "originalname", "mimetype", "size", "sha256", "content"
      FROM "ManifiestoImportacionSource"
      WHERE "jobId" = ${jobId}::uuid
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return { ...row, buffer: row.content };
  }

  async delete(jobId: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM "ManifiestoImportacionSource"
      WHERE "jobId" = ${jobId}::uuid
    `;
  }
}
