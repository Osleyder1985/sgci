-- Persist the durable business result associated with each import job.
ALTER TABLE "ManifiestoImportacionJob"
  ADD COLUMN "resultManifiestoId" UUID,
  ADD COLUMN "resultMasterAwb" TEXT,
  ADD COLUMN "resultGuias" INTEGER,
  ADD COLUMN "resultPaquetes" INTEGER,
  ADD COLUMN "resultPersonas" INTEGER,
  ADD COLUMN "resultPesoTotalKg" TEXT,
  ADD COLUMN "resultWarnings" INTEGER;

CREATE INDEX "ManifiestoImportacionJob_resultManifiestoId_idx"
  ON "ManifiestoImportacionJob"("resultManifiestoId");
