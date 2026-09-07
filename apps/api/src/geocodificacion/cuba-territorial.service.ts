import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

export interface TerritorioCubanoResuelto {
  provincia: string;
  municipio?: string;
  provinciaNormalizada: string;
  municipioNormalizado?: string;
  confianza: 'ALTA' | 'MEDIA';
}

interface TerritorioCatalogo {
  provincia: string;
  provinciaNormalizada: string;
  municipio?: string;
  municipioNormalizado?: string;
}

@Injectable()
export class CubaTerritorialService {
  private readonly logger = new Logger(CubaTerritorialService.name);
  private cache: TerritorioCatalogo[] | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async resolver(direccion: string): Promise<TerritorioCubanoResuelto | null> {
    const componentes = direccion
      .split(',')
      .map((componente) => this.normalizar(componente))
      .filter(Boolean)
      .slice(-4);

    if (!componentes.length) return null;

    const textoTerritorial = componentes.join(' ');
    const catalogo = await this.obtenerCatalogo();
    const coincidencias = catalogo
      .filter((item) =>
        this.contieneTerritorio(
          textoTerritorial,
          item.municipioNormalizado ?? item.provinciaNormalizada,
        ),
      )
      .sort(
        (a, b) =>
          (b.municipioNormalizado ?? b.provinciaNormalizada).length -
          (a.municipioNormalizado ?? a.provinciaNormalizada).length,
      );

    const mejor = coincidencias[0];
    if (!mejor) return null;

    return {
      provincia: mejor.provincia,
      municipio: mejor.municipio,
      provinciaNormalizada: mejor.provinciaNormalizada,
      municipioNormalizado: mejor.municipioNormalizado,
      confianza: mejor.municipio ? 'ALTA' : 'MEDIA',
    };
  }

  private async obtenerCatalogo(): Promise<TerritorioCatalogo[]> {
    if (this.cache) return this.cache;

    const provincias = await this.prisma.$queryRaw<
      Array<{
        id: number;
        nombre: string;
        nombreNormalizado: string;
      }>
    >`
      SELECT "id", "nombre", "nombreNormalizado"
      FROM "CatalogoProvinciaCubana"
      WHERE "activo" = true
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
      FROM "CatalogoMunicipioCubano"
      WHERE "activo" = true
    `;

    const aliases = await this.prisma.$queryRaw<
      Array<{
        valorNormalizado: string;
        provinciaId: number | null;
        municipioId: number | null;
        valorCanonico: string;
      }>
    >`
      SELECT "valorNormalizado", "provinciaId", "municipioId", "valorCanonico"
      FROM "CatalogoAliasTerritorialCubano"
      WHERE "activo" = true
    `;

    const provinciaPorId = new Map(provincias.map((item) => [item.id, item]));
    const municipioPorId = new Map(municipios.map((item) => [item.id, item]));
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

    for (const provincia of provincias) {
      catalogo.push({
        provincia: provincia.nombre,
        provinciaNormalizada: provincia.nombreNormalizado,
      });
    }

    for (const alias of aliases) {
      if (alias.municipioId) {
        const municipio = municipioPorId.get(alias.municipioId);
        if (!municipio) continue;

        const provincia = provinciaPorId.get(municipio.provinciaId);
        if (!provincia) continue;

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
          municipio: undefined,
          municipioNormalizado: alias.valorNormalizado,
        });
      }
    }

    this.cache = catalogo;
    this.logger.log(
      `Catálogo territorial cubano cargado: ${provincias.length} provincias, ${municipios.length} municipios.`,
    );
    return catalogo;
  }

  private contieneTerritorio(texto: string, territorio: string): boolean {
    if (!territorio) return false;
    const patron = new RegExp(`(?:^| )${this.escapeRegex(territorio)}(?: |$)`);
    return patron.test(texto);
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

  private escapeRegex(valor: string): string {
    return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
