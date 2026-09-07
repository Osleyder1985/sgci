CREATE TABLE "ManifiestoImportacionSource" (
  "id" UUID NOT NULL,
  "jobId" UUID NOT NULL,
  "originalname" TEXT NOT NULL,
  "mimetype" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "sha256" TEXT NOT NULL,
  "content" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ManifiestoImportacionSource_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ManifiestoImportacionSource_jobId_key" UNIQUE ("jobId"),
  CONSTRAINT "ManifiestoImportacionSource_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "ManifiestoImportacionJob"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ManifiestoImportacionSource_sha256_idx"
  ON "ManifiestoImportacionSource"("sha256");
