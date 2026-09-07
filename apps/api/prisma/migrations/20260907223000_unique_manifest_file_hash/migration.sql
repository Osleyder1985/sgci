-- Prevent duplicate manifest imports under concurrent requests.
-- PostgreSQL unique constraints allow multiple NULL values, so manifests
-- without a hash remain valid while every calculated file hash is unique.
CREATE UNIQUE INDEX "Manifiesto_archivoHash_key"
ON "Manifiesto"("archivoHash");
