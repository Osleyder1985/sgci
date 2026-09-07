import 'dotenv/config';

import { Pool } from 'pg';

import {
  ECURED_CUBA_PROVINCES,
  normalizarTerritorio,
  parsearPaginaEcured,
} from '../src/geocodificacion/ecured-cuba.catalog.ts';

const MUNICIPIO_ALIASES: Record<string, string> = {
  'HABANA DEL ESTE': 'LA HABANA DEL ESTE',
  'HABANA VIEJA': 'LA HABANA VIEJA',
};

const USER_AGENT = 'SGCI/1.0 (territorial catalog synchronization)';

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL no está definida.');
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  let totalLocalidades = 0;
  let totalConsejos = 0;

  try {
    await client.query('BEGIN');

    const provincias = await client.query<{
      id: number;
      nombre: string;
      nombre_normalizado: string;
    }>(
      'SELECT "id", "nombre", "nombreNormalizado" AS nombre_normalizado FROM "CatalogoProvinciaCubana" WHERE "activo" = true',
    );

    const municipios = await client.query<{
      id: number;
      nombre: string;
      nombre_normalizado: string;
      provincia_id: number;
    }>(
      'SELECT "id", "nombre", "nombreNormalizado" AS nombre_normalizado, "provinciaId" AS provincia_id FROM "CatalogoMunicipioCubano" WHERE "activo" = true',
    );

    const provinciaPorNormalizado = new Map(
      provincias.rows.map((item) => [item.nombre_normalizado, item]),
    );

    const municipioPorClave = new Map(
      municipios.rows.map((item) => [
        `${item.provincia_id}:${item.nombre_normalizado}`,
        item,
      ]),
    );

    for (const provincia of ECURED_CUBA_PROVINCES) {
      const provinciaDb = provinciaPorNormalizado.get(
        normalizarTerritorio(provincia),
      );

      if (!provinciaDb) {
        throw new Error(`Provincia no encontrada en catálogo: ${provincia}`);
      }

      const url = `https://www.ecured.cu/Localidades_de_${encodeURIComponent(provincia).replace(/%20/g, '_')}`;
      console.log(`→ ${provincia}: ${url}`);

      const response = await fetch(url, {
        headers: { 'user-agent': USER_AGENT },
      });

      if (!response.ok) {
        throw new Error(
          `EcuRed respondió ${response.status} para ${provincia}: ${url}`,
        );
      }

      const html = await response.text();
      const catalogo = parsearPaginaEcured(provincia, html);

      if (!catalogo.localidades.length) {
        throw new Error(`No se encontraron localidades para ${provincia}`);
      }

      for (const fila of catalogo.localidades) {
        const municipio = resolverMunicipio(
          provinciaDb.id,
          fila.municipio,
          municipioPorClave,
        );
        if (!municipio) {
          console.warn(
            `  ! Municipio EcuRed no resuelto: ${provincia} / ${fila.municipio}`,
          );
          continue;
        }

        for (const localidad of fila.valores) {
          await upsertLocalidad(client, municipio.id, localidad);
          totalLocalidades += 1;
        }
      }

      for (const fila of catalogo.consejosPopulares) {
        const municipio = resolverMunicipio(
          provinciaDb.id,
          fila.municipio,
          municipioPorClave,
        );
        if (!municipio) {
          console.warn(
            `  ! Municipio EcuRed no resuelto en consejos: ${provincia} / ${fila.municipio}`,
          );
          continue;
        }

        for (const consejo of fila.valores) {
          await upsertConsejoPopular(client, municipio.id, consejo);
          totalConsejos += 1;
        }
      }

      console.log(
        `  ✓ ${catalogo.localidades.length} filas de localidades, ${catalogo.consejosPopulares.length} filas de consejos`,
      );
    }

    await client.query('COMMIT');
    console.log(
      `✓ Catálogo EcuRed sincronizado: ${totalLocalidades} localidades y ${totalConsejos} consejos populares procesados.`,
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

function resolverMunicipio(
  provinciaId: number,
  nombre: string,
  municipioPorClave: Map<
    string,
    { id: number; nombre: string; nombre_normalizado: string; provincia_id: number }
  >,
) {
  const normalizado = normalizarTerritorio(nombre);
  const candidato = MUNICIPIO_ALIASES[normalizado] ?? normalizado;
  return municipioPorClave.get(`${provinciaId}:${candidato}`);
}

async function upsertLocalidad(
  client: import('pg').PoolClient,
  municipioId: number,
  nombre: string,
): Promise<void> {
  const normalizado = normalizarTerritorio(nombre);
  if (!normalizado) return;

  await client.query(
    `INSERT INTO "CatalogoLocalidadCubana" ("municipioId", "nombre", "nombreNormalizado")
     VALUES ($1, $2, $3)
     ON CONFLICT ("municipioId", "nombreNormalizado")
     DO UPDATE SET "nombre" = EXCLUDED."nombre", "activo" = true, "updatedAt" = CURRENT_TIMESTAMP`,
    [municipioId, nombre, normalizado],
  );
}

async function upsertConsejoPopular(
  client: import('pg').PoolClient,
  municipioId: number,
  nombre: string,
): Promise<void> {
  const normalizado = normalizarTerritorio(nombre);
  if (!normalizado) return;

  await client.query(
    `INSERT INTO "CatalogoConsejoPopularCubano" ("municipioId", "nombre", "nombreNormalizado")
     VALUES ($1, $2, $3)
     ON CONFLICT ("municipioId", "nombreNormalizado")
     DO UPDATE SET "nombre" = EXCLUDED."nombre", "activo" = true, "updatedAt" = CURRENT_TIMESTAMP`,
    [municipioId, nombre, normalizado],
  );
}

main().catch((error) => {
  console.error('✗ Error sincronizando EcuRed:', error);
  process.exitCode = 1;
});
