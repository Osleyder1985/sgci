import { describe, expect, it } from 'vitest';

import {
  ECURED_CUBA_PROVINCES,
  ecuredLocalidadesUrl,
  extraerTablaTerritorial,
  normalizarTerritorio,
} from './ecured-cuba.catalog.js';

describe('EcuRed Cuba territorial catalog', () => {
  it('builds the canonical locality URLs for all 16 territorial divisions', () => {
    expect(ECURED_CUBA_PROVINCES).toHaveLength(16);
    expect(ecuredLocalidadesUrl('Artemisa')).toBe(
      'https://www.ecured.cu/Localidades_de_Artemisa',
    );
    expect(ecuredLocalidadesUrl('Camagüey')).toBe(
      'https://www.ecured.cu/Localidades_de_Camag%C3%BCey',
    );
    expect(ecuredLocalidadesUrl('La Habana')).toBe(
      'https://www.ecured.cu/Localidades_de_La_Habana',
    );
    expect(ecuredLocalidadesUrl('Pinar del Río')).toBe(
      'https://www.ecured.cu/Localidades_de_Pinar_del_R%C3%ADo',
    );
  });

  it('normalizes accents and separators consistently with the territorial catalog', () => {
    expect(normalizarTerritorio('Sancti Spíritus')).toBe('SANCTI SPIRITUS');
    expect(normalizarTerritorio('Ciego de Ávila')).toBe('CIEGO DE AVILA');
    expect(normalizarTerritorio('  La Habana  ')).toBe('LA HABANA');
  });

  it('extracts municipality rows and linked territorial values from EcuRed tables', () => {
    const html = `
      <h2><span class="mw-headline">Localidades</span></h2>
      <table>
        <tr><th>Municipios</th><th>Localidades</th></tr>
        <tr>
          <td><a href="/wiki/Artemisa">Artemisa</a></td>
          <td><a href="/wiki/Portugu%C3%A9s">Portugués</a>, <a href="/wiki/Majana">Majana</a></td>
        </tr>
      </table>
    `;

    expect(extraerTablaTerritorial(html, 'Localidades')).toEqual([
      { municipio: 'Artemisa', valores: ['Portugués', 'Majana'] },
    ]);
  });

  it('does not accidentally parse a table from a different section', () => {
    const html = `
      <h2><span class="mw-headline">Consejos Populares</span></h2>
      <table><tr><td>Artemisa</td><td><a href="#">Centro</a></td></tr></table>
      <h2><span class="mw-headline">Localidades</span></h2>
      <table><tr><td><a href="#">Artemisa</a></td><td><a href="#">Majana</a></td></tr></table>
    `;

    expect(extraerTablaTerritorial(html, 'Localidades')).toEqual([
      { municipio: 'Artemisa', valores: ['Majana'] },
    ]);
  });
});
