import { GeocodificacionService } from './geocodificacion.service.js';

describe('GeocodificacionService', () => {
  const service = new GeocodificacionService();

  const normalizar = (direccion: string) =>
    (
      service as unknown as {
        normalizarDireccionCubana: (value: string) => {
          tipoVia?: string;
          calle?: string;
          numeroCasa?: string;
          entreCalles?: string;
          apartamento?: string;
          edificio?: string;
          reparto?: string;
          municipio?: string;
          provincia?: string;
          codigosPostales?: readonly string[];
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

  const resultadoCompatible = (
    resultado: {
      lat: number;
      lon: number;
      displayName: string;
      address?: {
        municipality?: string;
        city?: string;
        town?: string;
        village?: string;
        suburb?: string;
        state?: string;
        country?: string;
      };
    },
    esperado: ReturnType<typeof normalizar>,
  ) =>
    (
      service as unknown as {
        obtenerMotivoIncompatibilidad: (
          result: typeof resultado,
          expected: typeof esperado,
        ) => string | null;
      }
    ).obtenerMotivoIncompatibilidad(resultado, esperado);

  const calcularPuntuacion = (
    resultado: {
      lat: number;
      lon: number;
      displayName: string;
      address?: {
        road?: string;
        houseNumber?: string;
        municipality?: string;
        city?: string;
        town?: string;
        village?: string;
        suburb?: string;
        state?: string;
        country?: string;
        postcode?: string;
      };
    },
    esperado: ReturnType<typeof normalizar>,
  ) =>
    (
      service as unknown as {
        calcularPuntuacion: (
          result: typeof resultado,
          expected: typeof esperado,
        ) => { total: number; maximo: 5; estrellas: number };
      }
    ).calcularPuntuacion(resultado, esperado);

  it('normaliza calle, número, entrecalles, municipio y provincia y elimina Zona', () => {
    const result = normalizar(
      'CALLE VICENTE SOMONTE # 16 E/ AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY (Zona 4)',
    );

    expect(result).toMatchObject({
      tipoVia: 'CALLE',
      calle: 'VICENTE SOMONTE',
      numeroCasa: '16',
      entreCalles: 'AGRAMONTE Y MARTI',
      municipio: 'GUAIMARO',
      provincia: 'CAMAGUEY',
    });
    expect(result.canonica).toBe(
      'CALLE VICENTE SOMONTE, 16, E/ AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY',
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

  it('detecta Cuba explícitamente aunque el formato no tenga marcadores cubanos', () => {
    const direccion = 'CALLE 10, CENTRO HABANA, LA HABANA, CUBA';

    expect(detectarCuba(direccion)).toBe(true);
  });

  it('no clasifica como cubana una dirección extranjera que menciona Camaguey en la calle', () => {
    const direccion = 'CAMAGUEY STREET 10, MIAMI, FLORIDA';

    expect(detectarCuba(direccion)).toBe(false);
  });

  it('rechaza un resultado de LocationIQ en otra provincia', () => {
    const esperado = normalizar(
      'CALLE VICENTE SOMONTE # 16 E/ AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY',
    );

    expect(
      resultadoCompatible(
        {
          lat: 21.4,
          lon: -77.9,
          displayName: 'Otra dirección, Holguín, Cuba',
          address: {
            municipality: 'Holguín',
            state: 'Holguín',
            country: 'Cuba',
          },
        },
        esperado,
      ),
    ).not.toBeNull();
  });

  it('rechaza un resultado de LocationIQ fuera de Cuba para una dirección cubana', () => {
    const esperado = normalizar(
      'CALLE VICENTE SOMONTE # 16 E/ AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY',
    );

    expect(
      resultadoCompatible(
        {
          lat: 25.7,
          lon: -80.2,
          displayName: 'Camaguey Street, Miami, Florida',
          address: {
            city: 'Miami',
            state: 'Florida',
            country: 'United States',
          },
        },
        esperado,
      ),
    ).not.toBeNull();
  });

  it('acepta un resultado de LocationIQ compatible por municipio, provincia y país', () => {
    const esperado = normalizar(
      'CALLE VICENTE SOMONTE # 16 E/ AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY',
    );

    expect(
      resultadoCompatible(
        {
          lat: 21.05,
          lon: -77.35,
          displayName: 'Calle Vicente Somonte, Guáimaro, Camagüey, Cuba',
          address: {
            municipality: 'Guáimaro',
            state: 'Camagüey',
            country: 'Cuba',
          },
        },
        esperado,
      ),
    ).toBeNull();
  });
});


  it('separa los delimitadores semánticos y elimina las palabras clave de los valores', () => {
    const result = normalizar(
      'AVENIDA 37 RPTO COCOSOLO # 14011 EDIF 18A APARTAMENTO B6 E/ 140 Y 142, MARIANAO, LA HABANA',
    );

    expect(result).toMatchObject({
      tipoVia: 'AVENIDA',
      calle: '37',
      reparto: 'COCOSOLO',
      numeroCasa: '14011',
      edificio: '18A',
      apartamento: 'B6',
      entreCalles: '140 Y 142',
      municipio: 'MARIANAO',
      provincia: 'LA HABANA',
    });
  });

  it('acepta municipio cuando LocationIQ lo devuelve en suburb', () => {
    const esperado = normalizar('AVENIDA 37, MARIANAO, LA HABANA');
    esperado.codigosPostales = ['11500'];

    expect(
      resultadoCompatible(
        {
          lat: 23.07,
          lon: -82.43,
          displayName: 'Avenida 37, Marianao, La Habana, Cuba',
          address: {
            municipality: 'Diez de Octubre',
            suburb: 'Marianao',
            state: 'La Habana',
            country: 'Cuba',
          },
        },
        esperado,
      ),
    ).toBeNull();
  });
