import { GeocodificacionService } from './geocodificacion.service.js';

describe('GeocodificacionService - manifest address examples', () => {
  const service = new GeocodificacionService();
  const normalizar = (direccion: string) =>
    (
      service as unknown as {
        normalizarDireccionCubana: (value: string) => Record<string, string | undefined>;
      }
    ).normalizarDireccionCubana(direccion);

  it.each([
    [
      'CALLE VICENTE SOMONTE # 16 E/ AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY (Zona 4)',
      'CALLE VICENTE SOMONTE',
      '16',
      'AGRAMONTE Y MARTI',
      'GUAIMARO',
      'CAMAGUEY',
    ],
    [
      'CALLE SALVADOR CISNEROS # 54 E/ PEDRO VEGA Y NIETO, GUAIMARO, CAMAGUEY (Zona 4)',
      'CALLE SALVADOR CISNEROS',
      '54',
      'PEDRO VEGA Y NIETO',
      'GUAIMARO',
      'CAMAGUEY',
    ],
    [
      'CALLE ANTONIO MACEO # 063B E/ CAMILO CIENFUEGOS Y MARTI, GUAIMARO, CAMAGUEY (Zona 4)',
      'CALLE ANTONIO MACEO',
      '063B',
      'CAMILO CIENFUEGOS Y MARTI',
      'GUAIMARO',
      'CAMAGUEY',
    ],
  ])(
    'normaliza una dirección real del manifiesto sin inventar datos',
    (input, calle, numeroCasa, entreCalles, municipio, provincia) => {
      const result = normalizar(input);
      expect(result).toMatchObject({
        calle,
        numeroCasa,
        entreCalles,
        municipio,
        provincia,
      });
      expect(result.canonica).not.toMatch(/ZONA\s*\d+/i);
    },
  );
});
