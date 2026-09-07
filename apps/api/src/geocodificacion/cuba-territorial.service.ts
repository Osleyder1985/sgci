import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

export interface TerritorioCubanoResuelto {
  provincia: string;
  municipio?: string;
  localidad?: string;
  consejoPopular?: string;
  provinciaNormalizada: string;
  municipioNormalizado?: string;
  localidadNormalizada?: string;
  consejoPopularNormalizado?: string;
  confianza: 'ALTA' | 'MEDIA';
}

interface TerritorioCatalogo {
  provincia: string;
  provinciaNormalizada: string;
  municipio?: string;
  municipioNormalizado?: string;
  localidad?: string;
  localidadNormalizada?: string;
  consejoPopular?: string;
  consejoPopularNormalizado?: string;
}

const CONTEXTOS_EXTRANJEROS = new Set([
  'MIAMI',
  'FLORIDA',
  'NEW YORK',
  'USA',
  'UNITED STATES',
  'MEXICO',
  'MEXICO CITY',
  'CANADA',
]);

@Injectable()
export class CubaTerritorialService {
  private readonly logger = new Logger(CubaTerritorialService.name);
  private cache: TerritorioCatalogo[] | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async resolver(direccion: string): Promise<TerritorioCubanoResuelto | null> {
    const texto = this.normalizar(direccion);
    if (!texto) return null;

    const catalogo = await this.obtenerCatalogo();
    const provincia = this.buscarUnico(
      catalogo,
      (item) =>
        !item.municipio &&
        !item.consejoPopular &&
        this.contieneTerritorio(texto, item.provinciaNormalizada),
    );

    const municipioCoincidencias = catalogo.filter(
      (item) =>
        item.municipio &&
        !item.localidad &&
        !item.consejoPopular &&
        this.contieneTerritorio(texto, item.municipioNormalizado!),
    );
    const municipio = this.elegirMunicipio(
      municipioCoincidencias,
      provincia,
      texto,
    );

    const consejoCoincidencias = catalogo.filter(
      (item) =>
        item.consejoPopular &&
        this.contieneTerritorio(texto, item.consejoPopularNormalizado!),
    );
    const consejoPopular = this.elegirConsejo(
      consejoCoincidencias,
      provincia,
      municipio,
      texto,
    );
    const municipioResuelto = municipio ?? consejoPopular;

    const provinciaNormalizada =
      provincia?.provinciaNormalizada ??
      municipioResuelto?.provinciaNormalizada;
    if (!provinciaNormalizada) {
      const localidadSinContexto = this.buscarLocalidadSinContexto(
        catalogo,
        texto,
      );
      if (!localidadSinContexto || this.tieneContextoExtranjero(texto)) {
        return null;
      }
      return this.resultado(localidadSinContexto);
    }

    const localidades = catalogo.filter(
      (item) =>
        item.localidad &&
        item.provinciaNormalizada === provinciaNormalizada &&
        (!municipioResuelto ||
          item.municipioNormalizado ===
            municipioResuelto.municipioNormalizado) &&
        this.contieneTerritorio(texto, item.localidadNormalizada!),
    );
    const localidad = this.elegirLocalidad(localidades);

    if (
      !municipioResuelto &&
      !consejoPopular &&
      !localidad &&
      !this.contieneTerritorio(texto, 'CUBA')
    ) {
      return null;
    }

    return {
      provincia: provincia?.provincia ?? municipioResuelto!.provincia,
      municipio: municipioResuelto?.municipio ?? localidad?.municipio,
      localidad: localidad?.localidad,
      consejoPopular: consejoPopular?.consejoPopular,
      provinciaNormalizada,
      municipioNormalizado:
        municipioResuelto?.municipioNormalizado ??
        localidad?.municipioNormalizado,
      localidadNormalizada: localidad?.localidadNormalizada,
      consejoPopularNormalizado: consejoPopular?.consejoPopularNormalizado,
      confianza:
        localidad || municipioResuelto || consejoPopular ? 'ALTA' : 'MEDIA',
    };
  }

  private buscarUnico(
    catalogo: TerritorioCatalogo[],
    predicate: (item: TerritorioCatalogo) => boolean,
  ): TerritorioCatalogo | undefined {
    const matches = catalogo.filter(predicate);
    if (!matches.length) return undefined;
    return matches.sort(
      (a, b) => this.longitudTerritorio(b) - this.longitudTerritorio(a),
    )[0];
  }

  private elegirMunicipio(
    matches: TerritorioCatalogo[],
    provincia: TerritorioCatalogo | undefined,
    texto: string,
  ): TerritorioCatalogo | undefined {
    const scoped = provincia
      ? matches.filter(
          (item) =>
            item.provinciaNormalizada === provincia.provinciaNormalizada,
        )
      : matches;
    if (!scoped.length) return undefined;

    const distinct = new Map(
      scoped.map((item) => [
        `${item.provinciaNormalizada}:${item.municipioNormalizado}`,
        item,
      ]),
    );
    if (!provincia && distinct.size > 1) return undefined;
    if (!provincia && this.tieneContextoExtranjero(texto)) return undefined;

    return [...distinct.values()].sort(
      (a, b) => this.longitudTerritorio(b) - this.longitudTerritorio(a),
    )[0];
  }

  private elegirConsejo(
    matches: TerritorioCatalogo[],
    provincia: TerritorioCatalogo | undefined,
    municipio: TerritorioCatalogo | undefined,
    texto: string,
  ): TerritorioCatalogo | undefined {
    let scoped = matches;
    if (provincia) {
      scoped = scoped.filter(
        (item) =>
          item.provinciaNormalizada === provincia.provinciaNormalizada,
      );
    }
    if (municipio) {
      scoped = scoped.filter(
        (item) =>
          item.municipioNormalizado === municipio.municipioNormalizado,
      );
    }
    const distinct = new Map(
      scoped.map((item) => [
        `${item.provinciaNormalizada}:${item.municipioNormalizado}:${item.consejoPopularNormalizado}`,
        item,
      ]),
    );
    if (distinct.size !== 1) return undefined;
    if (!provincia && this.tieneContextoExtranjero(texto)) return undefined;
    return [...distinct.values()][0];
  }

  private elegirLocalidad(
    matches: TerritorioCatalogo[],
  ): TerritorioCatalogo | undefined {
    if (!matches.length) return undefined;
    const distinct = new Map(
      matches.map((item) => [
        `${item.provinciaNormalizada}:${item.municipioNormalizado}:${item.localidadNormalizada}`,
        item,
      ]),
    );
    const municipios = new Set(
      [...distinct.values()].map(
        (item) =>
          `${item.provinciaNormalizada}:${item.municipioNormalizado}`,
      ),
    );
    if (municipios.size > 1) return undefined;
    return [...distinct.values()].sort(
      (a, b) => this.longitudTerritorio(b) - this.longitudTerritorio(a),
    )[0];
  }

  private buscarLocalidadSinContexto(
    catalogo: TerritorioCatalogo[],
    texto: string,
  ): TerritorioCatalogo | undefined {
    const matches = catalogo.filter(
      (item) =>
        item.localidad &&
        this.contieneTerritorio(texto, item.localidadNormalizada!),
    );
    const distinct = new Map(
      matches.map((item) => [
        `${item.provinciaNormalizada}:${item.municipioNormalizado}:${item.localidadNormalizada}`,
        item,
      ]),
    );
    if (distinct.size !== 1) return undefined;
    return [...distinct.values()][0];
  }

  private resultado(item: TerritorioCatalogo): TerritorioCubanoResuelto {
    return {
      provincia: item.provincia,
      municipio: item.municipio,
      localidad: item.localidad,
      consejoPopular: item.consejoPopular,
      provinciaNormalizada: item.provinciaNormalizada,
      municipioNormalizado: item.municipioNormalizado,
      localidadNormalizada: item.localidadNormalizada,
      consejoPopularNormalizado: item.consejoPopularNormalizado,
      confianza:
        item.localidad || item.municipio || item.consejoPopular
          ? 'ALTA'
          : 'MEDIA',
    };
  }

  private longitudTerritorio(item: TerritorioCatalogo): number {
    return (
      item.localidadNormalizada?.length ??
      item.consejoPopularNormalizado?.length ??
      item.municipioNormalizado?.length ??
      item.provinciaNormalizada.length
    );
  }

  private tieneContextoExtranjero(texto: string): boolean {
    return [...CONTEXTOS_EXTRANJEROS].some((contexto) =>
      this.contieneTerritorio(texto, contexto),
    );
  }

  private async obtenerCatalogo(): Promise<TerritorioCatalogo[]> {
    if (this.cache) return this.cache;

    const provincias = await this.prisma.$queryRaw<
      Array<{ id: number; nombre: string; nombreNormalizado: string }>
    >`
      SELECT "id", "nombre", "nombreNormalizado"
      FROM "CatalogoProvinciaCubana" WHERE "activo" = true
    `;
    const municipios = await this.prisma.$queryRaw<
      Array<{
        id: number;
        nombre: string;
        nombreNormalizado: string;
        provinciaId: number;
      }>
    >`
      SELECT "id", "nombre", "nombreNormalizado", "provinciaId"
      FROM "CatalogoMunicipioCubano" WHERE "activo" = true
    `;
    const localidades = await this.prisma.$queryRaw<
      Array<{
        id: number;
        nombre: string;
        nombreNormalizado: string;
        municipioId: number;
      }>
    >`
      SELECT "id", "nombre", "nombreNormalizado", "municipioId"
      FROM "CatalogoLocalidadCubana" WHERE "activo" = true
    `;
    const consejosPopulares = await this.prisma.$queryRaw<
      Array<{
        id: number;
        nombre: string;
        nombreNormalizado: string;
        municipioId: number;
      }>
    >`
      SELECT "id", "nombre", "nombreNormalizado", "municipioId"
      FROM "CatalogoConsejoPopularCubano" WHERE "activo" = true
    `;
    const aliases = await this.prisma.$queryRaw<
      Array<{
        valorNormalizado: string;
        provinciaId: number | null;
        municipioId: number | null;
        localidadId: number | null;
        valorCanonico: string;
      }>
    >`
      SELECT "valorNormalizado", "provinciaId", "municipioId", "localidadId", "valorCanonico"
      FROM "CatalogoAliasTerritorialCubano" WHERE "activo" = true
    `;

    const provinciaPorId = new Map(provincias.map((item) => [item.id, item]));
    const municipioPorId = new Map(municipios.map((item) => [item.id, item]));
    const localidadPorId = new Map(localidades.map((item) => [item.id, item]));
    const catalogo: TerritorioCatalogo[] = [];

    for (const municipio of municipios) {
      const provincia = provinciaPorId.get(municipio.provinciaId);
      if (!provincia) continue;
      catalogo.push({
        provincia: provincia.nombre,
        provinciaNormalizada: provincia.nombreNormalizado,
        municipio: municipio.nombre,
        municipioNormalizado: municipio.nombreNormalizado,
      });
    }

    for (const localidad of localidades) {
      const municipio = municipioPorId.get(localidad.municipioId);
      const provincia = municipio && provinciaPorId.get(municipio.provinciaId);
      if (!municipio || !provincia) continue;
      catalogo.push({
        provincia: provincia.nombre,
        provinciaNormalizada: provincia.nombreNormalizado,
        municipio: municipio.nombre,
        municipioNormalizado: municipio.nombreNormalizado,
        localidad: localidad.nombre,
        localidadNormalizada: localidad.nombreNormalizado,
      });
    }

    for (const consejo of consejosPopulares) {
      const municipio = municipioPorId.get(consejo.municipioId);
      const provincia = municipio && provinciaPorId.get(municipio.provinciaId);
      if (!municipio || !provincia) continue;
      catalogo.push({
        provincia: provincia.nombre,
        provinciaNormalizada: provincia.nombreNormalizado,
        municipio: municipio.nombre,
        municipioNormalizado: municipio.nombreNormalizado,
        consejoPopular: consejo.nombre,
        consejoPopularNormalizado: consejo.nombreNormalizado,
      });
    }

    for (const provincia of provincias) {
      catalogo.push({
        provincia: provincia.nombre,
        provinciaNormalizada: provincia.nombreNormalizado,
      });
    }

    for (const alias of aliases) {
      if (alias.localidadId) {
        const localidad = localidadPorId.get(alias.localidadId);
        const municipio =
          localidad && municipioPorId.get(localidad.municipioId);
        const provincia =
          municipio && provinciaPorId.get(municipio.provinciaId);
        if (!localidad || !municipio || !provincia) continue;
        catalogo.push({
          provincia: provincia.nombre,
          provinciaNormalizada: provincia.nombreNormalizado,
          municipio: municipio.nombre,
          municipioNormalizado: municipio.nombreNormalizado,
          localidad: alias.valorCanonico,
          localidadNormalizada: alias.valorNormalizado,
        });
      } else if (alias.municipioId) {
        const municipio = municipioPorId.get(alias.municipioId);
        const provincia =
          municipio && provinciaPorId.get(municipio.provinciaId);
        if (!municipio || !provincia) continue;
        catalogo.push({
          provincia: provincia.nombre,
          provinciaNormalizada: provincia.nombreNormalizado,
          municipio: alias.valorCanonico,
          municipioNormalizado: alias.valorNormalizado,
        });
      } else if (alias.provinciaId) {
        const provincia = provinciaPorId.get(alias.provinciaId);
        if (!provincia) continue;
        catalogo.push({
          provincia: provincia.nombre,
          provinciaNormalizada: provincia.nombreNormalizado,
        });
      }
    }

    this.cache = catalogo;
    this.logger.log(
      `Catálogo territorial cubano cargado: ${provincias.length} provincias, ${municipios.length} municipios, ${localidades.length} localidades, ${consejosPopulares.length} consejos populares.`,
    );
    return catalogo;
  }

  private contieneTerritorio(texto: string, territorio: string): boolean {
    if (!territorio) return false;

    const tokensTexto = texto.split(' ');
    const tokensTerritorio = territorio.split(' ');

    return tokensTexto.some((_, index) =>
      tokensTerritorio.every(
        (token, offset) => tokensTexto[index + offset] === token,
      ),
    );
  }

  private normalizar(valor: string): string {
    return valor
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
