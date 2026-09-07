ALTER TABLE "ManifiestoImportacionJob"
  ADD COLUMN "attempt" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "workerId" TEXT,
  ADD COLUMN "heartbeatAt" TIMESTAMP(3),
  ADD COLUMN "leaseUntil" TIMESTAMP(3);

CREATE INDEX "ManifiestoImportacionJob_leaseUntil_idx"
  ON "ManifiestoImportacionJob"("leaseUntil");

CREATE INDEX "ManifiestoImportacionJob_status_leaseUntil_idx"
  ON "ManifiestoImportacionJob"("status", "leaseUntil");
