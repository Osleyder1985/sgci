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
        suburb?: string;
        city?: string;
        town?: string;
        village?: string;
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
        ) => {
          total: number;
          maximo: 5;
          estrellas: number;
          coincidencias: Record<string, boolean>;
        };
      }
    ).calcularPuntuacion(resultado, esperado);

  it('normaliza calle, número, entrecalles, municipio y provincia y elimina Zona', () => {
    const result = normalizar(
      'CALLE VICENTE SOMONTE # 16 E/ AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY (Zona 4)',
    );

    expect(result).toMatchObject({
      calle: 'VICENTE SOMONTE',
      numeroCasa: '16',
      entreCalles: 'AGRAMONTE Y MARTI',
      municipio: 'GUAIMARO',
      provincia: 'CAMAGUEY',
    });
    expect(result.canonica).toBe(
      'VICENTE SOMONTE, 16, AGRAMONTE Y MARTI, GUAIMARO, CAMAGUEY',
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

    expect(result.calle).toBe('12');
    expect(result.numeroCasa).toBe('8');
    expect(result.entreCalles).toBe('3RA Y 5TA');
    expect(result.municipio).toBe('PLAZA');
    expect(result.provincia).toBe('LA HABANA');
  });

  it('interpreta CALLE como marcador y no la incluye en el nombre de la calle', () => {
    expect(
      normalizar('CALLE MASO. REPARTO EL CRISTO # 320 ALTO E/').calle,
    ).toBe('MASO.');
  });

  it('interpreta el nombre de la calle antes de RPTO aunque no exista número', () => {
    expect(normalizar('CALLE SEGUNDA REPARTO PEDRO DIAZ COELLO').calle).toBe(
      'SEGUNDA',
    );
  });

  it('separa RPTO. posterior a E/ y lo interpreta como apartamento cuando existe MODULO', () => {
    const result = normalizar(
      'CALLE 17, MODULO 5, RPTO NUEVO MANZANILLO E/ AVE CAMILO CIENFUEGOS Y 8VA RPTO. B, MANZANILLO, GRANMA',
    );

    expect(result).toMatchObject({
      calle: '17',
      edificio: '5',
      reparto: 'NUEVO MANZANILLO',
      entreCalles: 'AVE CAMILO CIENFUEGOS Y 8VA',
      apartamento: 'B',
      municipio: 'MANZANILLO',
      provincia: 'GRANMA',
    });
    expect(result.entreCalles).not.toContain('RPTO');
    expect(result.canonica).toBe(
      '17, AVE CAMILO CIENFUEGOS Y 8VA, APARTAMENTO B, EDIFICIO 5, REPARTO NUEVO MANZANILLO, MANZANILLO, GRANMA',
    );
  });

  it('reconoce BIPLANTA como marcador de edificio', () => {
    const result = normalizar(
      'CALLE 4, BIPLANTA 12, RPTO VERSALLES, SANTIAGO DE CUBA, SANTIAGO DE CUBA',
    );

    expect(result.edificio).toBe('12');
    expect(result.reparto).toBe('VERSALLES');
  });

  it('no convierte RPTO. en apartamento si no existe edificio', () => {
    const result = normalizar(
      'CALLE 4, RPTO. B, SANTIAGO DE CUBA, SANTIAGO DE CUBA',
    );

    expect(result.reparto).toBe('B');
    expect(result.apartamento).toBeUndefined();
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

  it('calcula 5/5 cuando LocationIQ coincide en país, provincia, municipio, CP y dirección', () => {
    const esperado = normalizar(
      'CALLE VICENTE SOMONTE # 16, GUAIMARO, CAMAGUEY',
    );
    esperado.codigosPostales = ['72510'];
    const puntuacion = calcularPuntuacion(
      {
        lat: 21.05,
        lon: -77.35,
        displayName: 'Calle Vicente Somonte 16, Guáimaro, Camagüey, Cuba',
        address: {
          road: 'Vicente Somonte',
          houseNumber: '16',
          municipality: 'Guáimaro',
          state: 'Camagüey',
          country: 'Cuba',
          postcode: '72510',
        },
      },
      esperado,
    );
    expect(puntuacion).toMatchObject({ total: 5, maximo: 5, estrellas: 5 });
  });

  it('usa suburb para validar el municipio', () => {
    const esperado = normalizar('CALLE 10, MARIANAO, LA HABANA');
    const puntuacion = calcularPuntuacion(
      {
        lat: 23.07,
        lon: -82.43,
        displayName: 'Calle 10, Marianao, La Habana, Cuba',
        address: { suburb: 'Marianao', state: 'La Habana', country: 'Cuba' },
      },
      esperado,
    );
    expect(puntuacion.coincidencias.municipio).toBe(true);
  });
});
