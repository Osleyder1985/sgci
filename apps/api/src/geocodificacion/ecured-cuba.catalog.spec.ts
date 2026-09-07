import { describe, expect, it } from 'vitest';

import {
  ECURED_CUBA_PROVINCES,
  ecuredLocalidadesUrl,
  extraerTablaTerritorial,
  normalizarTerritorio,
  parsearPaginaEcured,
} from './ecured-cuba.catalog.js';

describe('EcuRed Cuba territorial catalog', () => {
  it('builds canonical locality URLs for all 16 territorial divisions', () => {
    expect(ECURED_CUBA_PROVINCES).toHaveLength(16);
    expect(ecuredLocalidadesUrl('Artemisa')).toBe('https://www.ecured.cu/Localidades_de_Artemisa');
    expect(ecuredLocalidadesUrl('Camagüey')).toBe('https://www.ecured.cu/Localidades_de_Camag%C3%BCey');
    expect(ecuredLocalidadesUrl('La Habana')).toBe('https://www.ecured.cu/Localidades_de_La_Habana');
    expect(ecuredLocalidadesUrl('Pinar del Río')).toBe('https://www.ecured.cu/Localidades_de_Pinar_del_R%C3%ADo');
  });

  it('normalizes accents, non-breaking spaces and separators', () => {
    expect(normalizarTerritorio('Sancti Spíritus')).toBe('SANCTI SPIRITUS');
    expect(normalizarTerritorio('Ciego de Ávila')).toBe('CIEGO DE AVILA');
    expect(normalizarTerritorio('\u00a0 La-Habana  ')).toBe('LA HABANA');
  });

  it('parses the locality and popular-council sections independently', () => {
    const html = `
      <h2><span class="mw-headline">Consejos Populares</span></h2>
      <table><tr><th>Municipio</th><th>Consejos Populares</th></tr>
        <tr><td><a href="/Artemisa">Artemisa</a></td><td><a href="/Centro">Centro</a></td></tr>
      </table>
      <h2><span class="mw-headline">Localidades</span></h2>
      <table><tr><th>Municipio</th><th>Localidades</th></tr>
        <tr><td><a href="/Artemisa">Artemisa</a></td>
          <td><a href="/Portugu%C3%A9s">Portugués</a>, <a href="/Majana">Majana</a></td></tr>
      </table>
    `;

    expect(parsearPaginaEcured('Artemisa', html)).toEqual({
      provincia: 'Artemisa',
      url: 'https://www.ecured.cu/Localidades_de_Artemisa',
      localidades: [{ municipio: 'Artemisa', valores: ['Portugués', 'Majana'] }],
      consejosPopulares: [{ municipio: 'Artemisa', valores: ['Centro'] }],
    });
  });

  it('does not fall back to an unrelated table', () => {
    const html = `
      <h2><span class="mw-headline">Localidades</span></h2>
      <table><tr><td>Otra tabla</td><td><a href="#">Dato</a></td></tr></table>
      <table><tr><th>Municipio</th><th>Localidades</th></tr>
        <tr><td>Camagüey</td><td><a href="#">Vertientes</a></td></tr>
      </table>
    `;

    expect(extraerTablaTerritorial(html, 'Localidades')).toEqual([
      { municipio: 'Camagüey', valores: ['Vertientes'] },
    ]);
  });

  it('keeps accented source names while normalizing only the lookup key', () => {
    const html = `
      <h2><span class="mw-headline">Localidades</span></h2>
      <table><tr><th>Municipio</th><th>Localidades</th></tr>
        <tr><td>Camagüey</td><td><a href="#">San José</a></td></tr>
      </table>
    `;

    const rows = extraerTablaTerritorial(html, 'Localidades');
    expect(rows[0]).toEqual({ municipio: 'Camagüey', valores: ['San José'] });
    expect(normalizarTerritorio(rows[0].municipio)).toBe('CAMAGUEY');
  });
});
