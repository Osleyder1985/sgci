-- Persistencia de trabajos de importación asíncrona de manifiestos.
CREATE TABLE "ManifiestoImportacionJob" (
    "id" UUID NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "totalHouses" INTEGER NOT NULL,
    "processedHouses" INTEGER NOT NULL,
    "totalPeople" INTEGER NOT NULL,
    "processedPeople" INTEGER NOT NULL,
    "totalAddresses" INTEGER NOT NULL,
    "processedAddresses" INTEGER NOT NULL,
    "addressesGeocoded" INTEGER NOT NULL,
    "addressesReused" INTEGER NOT NULL,
    "addressesNotFound" INTEGER NOT NULL,
    "addressesReview" INTEGER NOT NULL,
    "errors" INTEGER NOT NULL,
    "currentAddress" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "elapsedMs" INTEGER NOT NULL,
    "housesPerMinute" DOUBLE PRECISION NOT NULL,
    "etaSeconds" INTEGER,
    "coverage" DOUBLE PRECISION NOT NULL,
    "error" TEXT,
    CONSTRAINT "ManifiestoImportacionJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ManifiestoImportacionJob_status_idx"
    ON "ManifiestoImportacionJob"("status");
CREATE INDEX "ManifiestoImportacionJob_updatedAt_idx"
    ON "ManifiestoImportacionJob"("updatedAt");
CREATE INDEX "ManifiestoImportacionJob_startedAt_idx"
    ON "ManifiestoImportacionJob"("startedAt");
