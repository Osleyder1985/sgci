/*
  Warnings:

  - Made the column `ubicacion` on table `Direccion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Direccion_ubicacion_gist_idx";

-- AlterTable
ALTER TABLE "Direccion" ALTER COLUMN "ubicacion" SET NOT NULL;

-- CreateTable
CREATE TABLE "MasterAwb" (
    "id" UUID NOT NULL,
    "numero" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterAwb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manifiesto" (
    "id" UUID NOT NULL,
    "masterAwbId" UUID NOT NULL,
    "agenteTransitario" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "paisOrigen" TEXT NOT NULL,
    "consignatario" TEXT NOT NULL,
    "cantidadHouse" INTEGER NOT NULL,
    "totalSacas" INTEGER NOT NULL,
    "totalPersonas" INTEGER NOT NULL,
    "pesoTotalKg" DECIMAL(12,2) NOT NULL,
    "archivoNombre" TEXT,
    "archivoHash" TEXT,
    "importadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manifiesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guia" (
    "id" UUID NOT NULL,
    "manifiestoId" UUID NOT NULL,
    "numeroHouse" TEXT NOT NULL,
    "naturalezaCantidad" TEXT NOT NULL,
    "pesoKg" DECIMAL(12,2) NOT NULL,
    "bultos" INTEGER NOT NULL,
    "remitenteNombre" TEXT NOT NULL,
    "remitentePasaporte" TEXT,
    "destinatarioNombre" TEXT NOT NULL,
    "destinatarioCarnet" TEXT,
    "telefonoDestinatario" TEXT,
    "direccionDestinatario" TEXT,
    "estadoCobroOrigen" TEXT,
    "unidadDestino" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paquete" (
    "id" UUID NOT NULL,
    "guiaId" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paquete_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterAwb_numero_key" ON "MasterAwb"("numero");

-- CreateIndex
CREATE INDEX "MasterAwb_numero_idx" ON "MasterAwb"("numero");

-- CreateIndex
CREATE INDEX "Manifiesto_masterAwbId_idx" ON "Manifiesto"("masterAwbId");

-- CreateIndex
CREATE INDEX "Manifiesto_fecha_idx" ON "Manifiesto"("fecha");

-- CreateIndex
CREATE INDEX "Manifiesto_agenteTransitario_idx" ON "Manifiesto"("agenteTransitario");

-- CreateIndex
CREATE INDEX "Guia_numeroHouse_idx" ON "Guia"("numeroHouse");

-- CreateIndex
CREATE INDEX "Guia_manifiestoId_idx" ON "Guia"("manifiestoId");

-- CreateIndex
CREATE INDEX "Guia_destinatarioCarnet_idx" ON "Guia"("destinatarioCarnet");

-- CreateIndex
CREATE INDEX "Guia_remitentePasaporte_idx" ON "Guia"("remitentePasaporte");

-- CreateIndex
CREATE INDEX "Guia_unidadDestino_idx" ON "Guia"("unidadDestino");

-- CreateIndex
CREATE UNIQUE INDEX "Guia_manifiestoId_numeroHouse_key" ON "Guia"("manifiestoId", "numeroHouse");

-- CreateIndex
CREATE INDEX "Paquete_guiaId_idx" ON "Paquete"("guiaId");

-- CreateIndex
CREATE UNIQUE INDEX "Paquete_guiaId_numero_key" ON "Paquete"("guiaId", "numero");

-- AddForeignKey
ALTER TABLE "Manifiesto" ADD CONSTRAINT "Manifiesto_masterAwbId_fkey" FOREIGN KEY ("masterAwbId") REFERENCES "MasterAwb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guia" ADD CONSTRAINT "Guia_manifiestoId_fkey" FOREIGN KEY ("manifiestoId") REFERENCES "Manifiesto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paquete" ADD CONSTRAINT "Paquete_guiaId_fkey" FOREIGN KEY ("guiaId") REFERENCES "Guia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
