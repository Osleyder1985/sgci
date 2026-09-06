-- =============================================================================
-- SGCI - Sistema de Gestión Contextual Integrado
-- Migración inicial
--
-- Esta migración inicializa las estructuras fundamentales del SGCI:
--   - Identidades.
--   - Personas.
--   - Direcciones.
--   - Geocodificación.
--   - Conflictos de identidad.
--   - Capacidades espaciales mediante PostGIS.
-- =============================================================================


-- =============================================================================
-- POSTGIS
-- =============================================================================

-- Habilita la extensión PostGIS antes de utilizar tipos espaciales.
--
-- Es necesario para que PostgreSQL reconozca:
--   geography
--   geometry
--   Point
-- y las demás capacidades espaciales de PostGIS.
CREATE EXTENSION IF NOT EXISTS postgis;


-- =============================================================================
-- ENUMERACIONES
-- =============================================================================


-- Tipo de documento que puede identificar a una persona.
CREATE TYPE "TipoDocumentoIdentidad" AS ENUM (
    'CARNET_IDENTIDAD',
    'PASAPORTE'
);


-- Estado de verificación de una identidad.
CREATE TYPE "EstadoIdentidad" AS ENUM (
    'PENDIENTE_VERIFICACION',
    'VERIFICADA',
    'EN_CONFLICTO',
    'RECHAZADA'
);


-- Estado del proceso de resolución de un conflicto de identidad.
CREATE TYPE "EstadoConflictoIdentidad" AS ENUM (
    'ABIERTO',
    'EN_REVISION',
    'RESUELTO',
    'DESCARTADO'
);


-- Motivo principal por el cual se detectó un conflicto.
CREATE TYPE "TipoConflictoIdentidad" AS ENUM (
    'DOCUMENTO_DUPLICADO',
    'NOMBRES_DIFERENTES',
    'DATOS_PERSONALES_INCONSISTENTES',
    'DOCUMENTO_NO_VALIDO'
);


-- Estado del proceso de geocodificación de una dirección.
CREATE TYPE "EstadoGeocodificacion" AS ENUM (
    'PENDIENTE',
    'EN_PROCESO',
    'GEOCODIFICADA',
    'NO_ENCONTRADA',
    'AMBIGUA',
    'ERROR',
    'REQUIERE_REVISION'
);


-- =============================================================================
-- PERSONA
-- =============================================================================


CREATE TABLE "Persona" (

    -- Identificador interno único.
    "id" UUID NOT NULL,

    -- Nombre o nombres de la persona.
    "nombres" TEXT NOT NULL,

    -- Apellidos de la persona.
    "apellidos" TEXT NOT NULL,

    -- Nombre completo normalizado para búsquedas y comparación.
    "nombreCompleto" TEXT NOT NULL,

    -- Indica si la persona permanece activa dentro del sistema.
    "activo" BOOLEAN NOT NULL DEFAULT true,

    -- Fecha de creación del registro.
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Fecha de última actualización.
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persona_pkey"
        PRIMARY KEY ("id")
);


-- =============================================================================
-- DOCUMENTO DE IDENTIDAD
-- =============================================================================


CREATE TABLE "DocumentoIdentidad" (

    -- Identificador interno único.
    "id" UUID NOT NULL,

    -- Persona propietaria del documento.
    "personaId" UUID NOT NULL,

    -- Tipo de documento.
    "tipo" "TipoDocumentoIdentidad" NOT NULL,

    -- Número normalizado del documento.
    "numero" TEXT NOT NULL,

    -- Valor original recibido durante la captura o importación.
    "numeroOriginal" TEXT,

    -- Estado de validación y verificación.
    "estado" "EstadoIdentidad"
        NOT NULL
        DEFAULT 'PENDIENTE_VERIFICACION',

    -- Indica si puede utilizarse como documento principal.
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,

    -- Fecha de verificación.
    "verificadoAt" TIMESTAMP(3),

    -- Fecha de creación.
    "createdAt" TIMESTAMP(3)
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    -- Fecha de última actualización.
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoIdentidad_pkey"
        PRIMARY KEY ("id")
);


-- =============================================================================
-- DIRECCION
-- =============================================================================


CREATE TABLE "Direccion" (

    -- Identificador interno único.
    "id" UUID NOT NULL,

    -- Persona propietaria de la dirección.
    "personaId" UUID NOT NULL,

    -- Dirección original recibida.
    "direccionOriginal" TEXT NOT NULL,

    -- Componentes estructurados de la dirección.
    "calle" TEXT,
    "numero" TEXT,
    "entreCalles" TEXT,
    "localidad" TEXT,
    "municipio" TEXT,
    "provincia" TEXT,
    "pais" TEXT,
    "codigoPostal" TEXT,


    -- Ubicación geográfica.
    --
    -- geography(Point,4326) representa un punto sobre la superficie terrestre
    -- utilizando el sistema de referencia WGS 84.
    --
    -- El punto almacena:
    --
    --   POINT(longitud latitud)
    --
    -- Ejemplo:
    --
    --   POINT(-82.3666 23.1136)
    --
    -- No se almacenan columnas independientes de latitud y longitud porque
    -- ambas coordenadas forman parte del mismo objeto geográfico.
    "ubicacion" geography(Point,4326),


    -- Estado del proceso de geocodificación.
    "estadoGeocodificacion" "EstadoGeocodificacion"
        NOT NULL
        DEFAULT 'PENDIENTE',

    -- Fecha en que la dirección fue geocodificada.
    "geocodificadoAt" TIMESTAMP(3),

    -- Indica si es la dirección principal.
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,

    -- Indica si la dirección permanece activa.
    "activa" BOOLEAN NOT NULL DEFAULT true,

    -- Fecha de creación.
    "createdAt" TIMESTAMP(3)
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    -- Fecha de última actualización.
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Direccion_pkey"
        PRIMARY KEY ("id")
);


-- =============================================================================
-- CONFLICTO DE IDENTIDAD
-- =============================================================================


CREATE TABLE "ConflictoIdentidad" (

    -- Identificador interno único.
    "id" UUID NOT NULL,

    -- Persona existente que participa en el conflicto.
    "personaExistenteId" UUID NOT NULL,

    -- Persona nueva o temporal asociada al conflicto.
    "personaNuevaId" UUID NOT NULL,

    -- Tipo de documento que originó el conflicto.
    "tipoDocumento" "TipoDocumentoIdentidad" NOT NULL,

    -- Número normalizado del documento en conflicto.
    "numeroDocumento" TEXT NOT NULL,

    -- Número original recibido.
    "numeroDocumentoOriginal" TEXT,

    -- Información original recibida durante captura o importación.
    "datosOriginales" JSONB NOT NULL,

    -- Tipo de inconsistencia detectada.
    "tipoConflicto" "TipoConflictoIdentidad" NOT NULL,

    -- Estado del conflicto.
    "estado" "EstadoConflictoIdentidad"
        NOT NULL
        DEFAULT 'ABIERTO',

    -- Descripción de la resolución.
    "resolucion" TEXT,

    -- Fecha de resolución.
    "resueltoAt" TIMESTAMP(3),

    -- Fecha de creación.
    "createdAt" TIMESTAMP(3)
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    -- Fecha de última actualización.
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConflictoIdentidad_pkey"
        PRIMARY KEY ("id")
);


-- =============================================================================
-- ÍNDICES: PERSONA
-- =============================================================================


CREATE INDEX "Persona_nombres_idx"
ON "Persona"("nombres");


CREATE INDEX "Persona_apellidos_idx"
ON "Persona"("apellidos");


CREATE INDEX "Persona_nombreCompleto_idx"
ON "Persona"("nombreCompleto");


-- =============================================================================
-- ÍNDICES: DOCUMENTO DE IDENTIDAD
-- =============================================================================


CREATE INDEX "DocumentoIdentidad_numero_idx"
ON "DocumentoIdentidad"("numero");


CREATE INDEX "DocumentoIdentidad_estado_idx"
ON "DocumentoIdentidad"("estado");


CREATE UNIQUE INDEX "DocumentoIdentidad_tipo_numero_key"
ON "DocumentoIdentidad"("tipo", "numero");


-- =============================================================================
-- ÍNDICES: DIRECCION
-- =============================================================================


CREATE INDEX "Direccion_provincia_idx"
ON "Direccion"("provincia");


CREATE INDEX "Direccion_municipio_idx"
ON "Direccion"("municipio");


CREATE INDEX "Direccion_localidad_idx"
ON "Direccion"("localidad");


CREATE INDEX "Direccion_estadoGeocodificacion_idx"
ON "Direccion"("estadoGeocodificacion");


-- =============================================================================
-- ÍNDICE ESPACIAL POSTGIS
-- =============================================================================

-- Índice GiST para acelerar consultas espaciales.
--
-- Permitirá realizar eficientemente operaciones futuras como:
--
--   - Buscar direcciones cercanas.
--   - Calcular distancias.
--   - Encontrar personas dentro de un radio.
--   - Determinar proximidad entre ubicaciones.
--   - Realizar consultas espaciales sobre las direcciones.
--
CREATE INDEX "Direccion_ubicacion_gist_idx"
ON "Direccion"
USING GIST ("ubicacion");


-- =============================================================================
-- ÍNDICES: CONFLICTO DE IDENTIDAD
-- =============================================================================


CREATE INDEX "ConflictoIdentidad_estado_idx"
ON "ConflictoIdentidad"("estado");


CREATE INDEX "ConflictoIdentidad_tipoDocumento_numeroDocumento_idx"
ON "ConflictoIdentidad"(
    "tipoDocumento",
    "numeroDocumento"
);


CREATE INDEX "ConflictoIdentidad_personaExistenteId_idx"
ON "ConflictoIdentidad"("personaExistenteId");


CREATE INDEX "ConflictoIdentidad_personaNuevaId_idx"
ON "ConflictoIdentidad"("personaNuevaId");


-- =============================================================================
-- RELACIONES
-- =============================================================================


ALTER TABLE "DocumentoIdentidad"
ADD CONSTRAINT "DocumentoIdentidad_personaId_fkey"
FOREIGN KEY ("personaId")
REFERENCES "Persona"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE "Direccion"
ADD CONSTRAINT "Direccion_personaId_fkey"
FOREIGN KEY ("personaId")
REFERENCES "Persona"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE "ConflictoIdentidad"
ADD CONSTRAINT "ConflictoIdentidad_personaExistenteId_fkey"
FOREIGN KEY ("personaExistenteId")
REFERENCES "Persona"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE "ConflictoIdentidad"
ADD CONSTRAINT "ConflictoIdentidad_personaNuevaId_fkey"
FOREIGN KEY ("personaNuevaId")
REFERENCES "Persona"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;