-- Correct the canonical municipality name and its normalized form.
-- The initial catalog seed contained a typo in the normalized value for Campechuela.
UPDATE "CatalogoMunicipioCubano"
SET "nombre" = 'Campechuela',
    "nombreNormalizado" = 'CAMPECHUELA'
WHERE "id" = 139;
