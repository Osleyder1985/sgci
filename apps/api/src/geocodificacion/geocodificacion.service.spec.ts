import { GeocodificacionService } from './geocodificacion.service.js';

describe('GeocodificacionService', () => {
  const service = new GeocodificacionService();

  const normalizar = (direccion: string) =>
    (
      service as unknown as {
        normalizarDireccionCubana: (value: string) => {
          calle?: string;
          numeroCasa?: string;
          entreCalles?: string;
          apartamento?: string;
          edificio?: string;
          reparto?: string;
          municipio?: string;
          provincia?: string;
          canonica: string;
        };
      }
    ).normalizarDireccionCubana(direccion);

  const construirConsultas = (
    direccion: ReturnType<typeof normalizar>,
    pais?: string,
  ) =>
    (
      service as unknown as {
        construirConsultas: (
          value: ReturnType<typeof normalizar>,
          country?: string,
        ) => string[];
      }
    ).construirConsultas(direccion, pais);

  const detectarCuba = (direccion: string) => {
    const result = normalizar(direccion);
    return (
      service as unknown as {
        esDireccionCubana: (
          original: string,
          value: ReturnType<typeof normalizar>,
        ) => boolean;
      }
    ).esDireccionCubana(direccion, result);
  };

  it('normaliza calle, número, entrecalles, municipio y provincia y elimina Zona', () => {
    const result = normalizar(
      'CALLE VICENTE SOMONTE # 16 E/ AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY (Zona 4)',
    );

    expect(result).toMatchObject({
      calle: 'CALLE VICENTE SOMONTE',
      numeroCasa: '16',
      entreCalles: 'AGRAMONTE Y MARTI',
      municipio: 'GUAIMARO',
      provincia: 'CAMAGUEY',
    });
    expect(result.canonica).toBe(
      'CALLE VICENTE SOMONTE, 16, AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY',
    );
  });

  it('interpreta apartamento, edificio y reparto y elimina Zona de la provincia', () => {
    const result = normalizar(
      'CALLE APARTAMENTO 59, EDIF 15, RPTO JUNCO SUR, CIENFUEGOS, CIENFUEGOS (Zona 7)',
    );

    expect(result).toMatchObject({
      apartamento: '59',
      edificio: '15',
      reparto: 'JUNCO SUR',
      municipio: 'CIENFUEGOS',
      provincia: 'CIENFUEGOS',
    });
    expect(result.calle).toBeUndefined();
    expect(result.canonica).toBe(
      'APARTAMENTO 59, EDIFICIO 15, REPARTO JUNCO SUR, CIENFUEGOS, CIENFUEGOS',
    );
  });

  it('acepta APTO. como marcador de apartamento', () => {
    const result = normalizar(
      'APTO. 12, RPTO. VERSALLES, SANTIAGO DE CUBA, CUBA',
    );

    expect(result.apartamento).toBe('12');
    expect(result.reparto).toBe('VERSALLES');
    expect(result.municipio).toBe('SANTIAGO DE CUBA');
    expect(result.provincia).toBe('CUBA');
  });

  it('preserva E/ como entrecalles y # como número de casa', () => {
    const result = normalizar(
      'CALLE 12 # 8 E/ 3RA Y 5TA, PLAZA, LA HABANA (Zona 1)',
    );

    expect(result.numeroCasa).toBe('8');
    expect(result.entreCalles).toBe('3RA Y 5TA');
    expect(result.municipio).toBe('PLAZA');
    expect(result.provincia).toBe('LA HABANA');
  });

  it('no inventa componentes ausentes al construir consultas', () => {
    const result = normalizar('APTO 7, RPTO JUNCO SUR, CIENFUEGOS, CIENFUEGOS');
    const queries = construirConsultas(result, 'CUBA');

    expect(queries).toContain(
      'APARTAMENTO 7, REPARTO JUNCO SUR, CIENFUEGOS, CIENFUEGOS, CUBA',
    );
    expect(queries.every((query) => !query.includes('CALLE'))).toBe(true);
  });

  it('detecta una dirección cubana aunque el país del manifiesto sea México', () => {
    const direccion =
      'CALLE VICENTE SOMONTE # 16 E/ AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY';

    expect(detectarCuba(direccion)).toBe(true);
  });

  it('no clasifica como cubana una dirección extranjera que menciona Camaguey en la calle', () => {
    const direccion = 'CAMAGUEY STREET 10, MIAMI, FLORIDA';

    expect(detectarCuba(direccion)).toBe(false);
  });
});
