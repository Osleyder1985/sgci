import { Injectable, Logger } from '@nestjs/common';

export interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
  address?: {
    road?: string;
    houseNumber?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

interface LocationIqAddress {
  road?: string;
  house_number?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface LocationIqResult {
  lat?: number | string;
  lon?: number | string;
  display_name?: string;
  address?: LocationIqAddress;
}

interface DireccionCubanaNormalizada {
  calle?: string;
  numeroCasa?: string;
  entreCalles?: string;
  apartamento?: string;
  edificio?: string;
  reparto?: string;
  municipio?: string;
  provincia?: string;
  canonica: string;
}

@Injectable()
export class GeocodificacionService {
  private readonly logger = new Logger(GeocodificacionService.name);

  private readonly baseUrl =
    process.env.GEOCODER_BASE_URL?.trim() ||
    'https://us1.locationiq.com/v1/search';

  private readonly apiKey = process.env.LOCATIONIQ_API_KEY?.trim();

  private readonly userAgent =
    process.env.GEOCODER_USER_AGENT?.trim() ?? 'SGCI/1.0';

  private lastRequestAt = 0;

  async geocodificar(
    direccion: string,
    pais?: string | null,
  ): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      throw new Error(
        'LOCATIONIQ_API_KEY no está configurada. No se puede geocodificar una dirección nueva.',
      );
    }

    const texto = direccion.trim();

    if (!texto) {
      return null;
    }

    const normalizada = this.normalizarDireccionCubana(texto);
    const esCuba = this.esDireccionCubana(texto, normalizada);
    const paisBusqueda = esCuba ? 'CUBA' : pais?.trim();

    this.logger.log(
      `Geocodificando: "${texto}" -> "${normalizada.canonica}"${
        esCuba ? ' | país=CUBA' : paisBusqueda ? ` | país=${paisBusqueda}` : ''
      }`,
    );

    for (const query of this.construirConsultas(normalizada, paisBusqueda)) {
      const resultado = await this.buscarLocationIq(
        query,
        normalizada.canonica,
        normalizada,
      );
      if (resultado) return resultado;
    }

    return null;
  }

  private async buscarLocationIq(
    query: string,
    textoFallback: string,
    direccionEsperada: DireccionCubanaNormalizada,
  ): Promise<GeocodingResult | null> {
    await this.respetarLimiteSolicitudes();

    const url = new URL(this.baseUrl);

    if (!this.apiKey) {
      throw new Error(
        'LOCATIONIQ_API_KEY no está configurada. No se puede consultar LocationIQ.',
      );
    }

    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '1');
    url.searchParams.set('accept-language', 'es');

    if (/\bCUBA\b/i.test(query)) {
      url.searchParams.set('countrycodes', 'cu');
    }

    try {
      this.lastRequestAt = Date.now();

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (response.status === 404) {
        this.logger.debug(`LocationIQ no encontró resultados para "${query}".`);
        return null;
      }

      if (!response.ok) {
        throw new Error(`LocationIQ respondió HTTP ${response.status}.`);
      }

      const result = (await response.json()) as LocationIqResult[];
      const firstResult = result?.[0];

      if (!firstResult) {
        return null;
      }

      const lat = Number(firstResult.lat);
      const lon = Number(firstResult.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error('LocationIQ devolvió coordenadas inválidas.');
      }

      const resultado: GeocodingResult = {
        lat,
        lon,
        displayName: firstResult.display_name ?? textoFallback,
        address: {
          road: firstResult.address?.road,
          houseNumber: firstResult.address?.house_number,
          city: firstResult.address?.city,
          town: firstResult.address?.town,
          village: firstResult.address?.village,
          municipality: firstResult.address?.municipality,
          state: firstResult.address?.state,
          country: firstResult.address?.country,
          postcode: firstResult.address?.postcode,
        },
      };

      if (!this.esResultadoCompatible(resultado, direccionEsperada)) {
        this.logger.warn(
          `LocationIQ devolvió una ubicación incompatible con la dirección solicitada: "${query}" -> "${resultado.displayName}".`,
        );
        return null;
      }

      return resultado;
    } catch (error) {
      this.logger.warn(
        `No fue posible geocodificar "${query}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      throw error;
    }
  }

  private esResultadoCompatible(
    resultado: GeocodingResult,
    esperado: DireccionCubanaNormalizada,
  ): boolean {
    if (!esperado.provincia && !esperado.municipio) {
      return true;
    }

    const normalizar = (value?: string) =>
      (value ?? '')
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]+/g, ' ')
        .trim();

    const pais = normalizar(resultado.address?.country);
    const provincia = normalizar(resultado.address?.state);
    const municipio = normalizar(
      resultado.address?.municipality ??
        resultado.address?.city ??
        resultado.address?.town ??
        resultado.address?.village,
    );
    const provinciaEsperada = normalizar(esperado.provincia);
    const municipioEsperado = normalizar(esperado.municipio);

    if (provinciaEsperada && provincia && provincia !== provinciaEsperada) {
      return false;
    }

    if (municipioEsperado && municipio && municipio !== municipioEsperado) {
      return false;
    }

    const esCubaEsperado = this.esProvinciaCubana(provinciaEsperada);
    if (esCubaEsperado && pais && pais !== 'CUBA') {
      return false;
    }

    if (esCubaEsperado && !pais && !provincia) {
      return false;
    }

    return true;
  }

  private normalizarDireccionCubana(
    direccion: string,
  ): DireccionCubanaNormalizada {
    const limpia = direccion
      .toUpperCase()
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const sinZona = limpia
      .replace(/\s*\(\s*ZONA\s*\d+\s*\)\s*$/i, '')
      .replace(/\s+ZONA\s*\d+\s*$/i, '')
      .trim();
    const partes = sinZona
      .split(',')
      .map((parte) => parte.trim().replace(/\s+/g, ' '))
      .filter(Boolean);
    const resultado: DireccionCubanaNormalizada = { canonica: '' };

    if (partes.length >= 2) {
      resultado.provincia = this.limpiarComponente(partes[partes.length - 1]);
      resultado.municipio = this.limpiarComponente(partes[partes.length - 2]);
    }

    const principales = partes.length >= 2 ? partes.slice(0, -2) : partes;
    this.extraerMarcadores(principales[0] ?? '', resultado);
    for (const componente of principales.slice(1)) {
      this.extraerComponente(componente, resultado);
    }
    if (resultado.provincia) {
      resultado.provincia = this.limpiarProvincia(resultado.provincia);
    }

    resultado.canonica =
      [
        resultado.calle,
        resultado.numeroCasa,
        resultado.entreCalles,
        resultado.apartamento
          ? `APARTAMENTO ${resultado.apartamento}`
          : undefined,
        resultado.edificio ? `EDIFICIO ${resultado.edificio}` : undefined,
        resultado.reparto ? `REPARTO ${resultado.reparto}` : undefined,
        resultado.municipio,
        resultado.provincia,
      ]
        .filter(Boolean)
        .join(', ') || sinZona;

    return resultado;
  }

  private extraerMarcadores(
    texto: string,
    resultado: DireccionCubanaNormalizada,
  ): void {
    let restante = texto.trim();

    const entre = restante.match(/\bE\s*\/\s*(.+)$/i);
    if (entre) {
      resultado.entreCalles = this.normalizarEntrecalles(entre[1]);
      restante = restante.slice(0, entre.index).trim();
    }

    const reparto = restante.match(/\bRPTO\.?\s+(.+)$/i);
    if (reparto) {
      resultado.reparto = reparto[1].trim();
      restante = restante.slice(0, reparto.index).trim();
    }

    const edificio = restante.match(
      /\bEDIF(?:ICIO)?\.?\s*#?\s*([A-Z0-9-]+)/i,
    );
    if (edificio) {
      resultado.edificio = edificio[1];
      restante = `${restante.slice(0, edificio.index)} ${restante.slice(
        (edificio.index ?? 0) + edificio[0].length,
      )}`.trim();
    }

    const apartamento = restante.match(
      /\b(?:APARTAMENTO|APTO\.?)\s*#?\s*([A-Z0-9-]+)/i,
    );
    if (apartamento) {
      resultado.apartamento = apartamento[1];
      restante = `${restante.slice(0, apartamento.index)} ${restante.slice(
        (apartamento.index ?? 0) + apartamento[0].length,
      )}`.trim();
    }

    const numero = restante.match(/#\s*([A-Z0-9-]+)/i);
    if (numero) {
      resultado.numeroCasa = numero[1];
      restante = `${restante.slice(0, numero.index)} ${restante.slice(
        (numero.index ?? 0) + numero[0].length,
      )}`.trim();
    }

    const calle = this.limpiarComponente(restante);
    resultado.calle = calle && calle !== 'CALLE' ? calle : undefined;
  }

  private extraerComponente(
    componente: string,
    resultado: DireccionCubanaNormalizada,
  ): void {
    const texto = componente.trim();
    if (!texto) return;

    const apartamento = texto.match(
      /^\b(?:APARTAMENTO|APTO\.?)\s*#?\s*([A-Z0-9-]+)\s*$/i,
    );
    if (apartamento) {
      resultado.apartamento ??= apartamento[1];
      return;
    }

    const edificio = texto.match(
      /^\bEDIF(?:ICIO)?\.?\s*#?\s*([A-Z0-9-]+)\s*$/i,
    );
    if (edificio) {
      resultado.edificio ??= edificio[1];
      return;
    }

    const reparto = texto.match(/^\bRPTO\.?\s+(.+)$/i);
    if (reparto) {
      resultado.reparto ??= reparto[1].trim();
      return;
    }

    const entre = texto.match(/^\bE\s*\/\s*(.+)$/i);
    if (entre) {
      resultado.entreCalles ??= this.normalizarEntrecalles(entre[1]);
      return;
    }

    const numero = texto.match(/^#\s*([A-Z0-9-]+)$/i);
    if (numero) {
      resultado.numeroCasa ??= numero[1];
      return;
    }

    if (!resultado.entreCalles && /\b.+\s+Y\s+.+\b/i.test(texto)) {
      resultado.entreCalles = this.normalizarEntrecalles(texto);
    }
  }

  private normalizarEntrecalles(texto: string): string {
    return texto
      .replace(/^\s*(?:E\s*\/|ENTRE)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private limpiarComponente(texto: string): string | undefined {
    const limpio = texto.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
    return limpio || undefined;
  }

  private limpiarProvincia(provincia: string): string {
    return provincia
      .replace(/\s*\(\s*ZONA\s*\d+\s*\)\s*$/i, '')
      .replace(/\s+ZONA\s*\d+\s*$/i, '')
      .trim();
  }

  private construirConsultas(
    direccion: DireccionCubanaNormalizada,
    pais?: string,
  ): string[] {
    const sufijoPais = pais ? `, ${pais}` : '';
    const completa = [
      direccion.calle,
      direccion.numeroCasa,
      direccion.entreCalles,
      direccion.apartamento
        ? `APARTAMENTO ${direccion.apartamento}`
        : undefined,
      direccion.edificio ? `EDIFICIO ${direccion.edificio}` : undefined,
      direccion.reparto ? `REPARTO ${direccion.reparto}` : undefined,
      direccion.municipio,
      direccion.provincia,
    ]
      .filter(Boolean)
      .join(', ');
    const simplificada = [
      direccion.calle,
      direccion.numeroCasa,
      direccion.reparto ? `REPARTO ${direccion.reparto}` : undefined,
      direccion.municipio,
      direccion.provincia,
    ]
      .filter(Boolean)
      .join(', ');

    return [
      ...new Set(
        [
          `${completa}${sufijoPais}`.trim(),
          simplificada && simplificada !== completa
            ? `${simplificada}${sufijoPais}`.trim()
            : '',
        ].filter(Boolean),
      ),
    ];
  }

  private esDireccionCubana(
    original: string,
    normalizada: DireccionCubanaNormalizada,
  ): boolean {
    const normalizarTexto = (value: string) =>
      value
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]+/g, ' ')
        .trim();

    const provincia = normalizarTexto(normalizada.provincia ?? '');
    const ultimoComponente = normalizarTexto(original.split(',').at(-1) ?? '');
    const municipio = normalizarTexto(normalizada.municipio ?? '');
    const tieneMarcadorCubano = /\bE\s*\/|\bRPTO\.?|\bEDIF(?:ICIO)?\.?|\bAPTO\.?|\bAPARTAMENTO\b|#/.test(
      normalizarTexto(original),
    );

    return (
      ultimoComponente === 'CUBA' ||
      (this.esProvinciaCubana(provincia) &&
        Boolean(municipio) &&
        tieneMarcadorCubano)
    );
  }

  private esProvinciaCubana(provincia: string): boolean {
    const provinciasCubanas = new Set([
      'PINAR DEL RIO',
      'ARTEMISA',
      'LA HABANA',
      'MAYABEQUE',
      'MATANZAS',
      'CIENFUEGOS',
      'VILLA CLARA',
      'SANCTI SPIRITUS',
      'CIEGO DE AVILA',
      'CAMAGUEY',
      'LAS TUNAS',
      'HOLGUIN',
      'GRANMA',
      'SANTIAGO DE CUBA',
      'GUANTANAMO',
      'ISLA DE LA JUVENTUD',
    ]);

    return provinciasCubanas.has(provincia);
  }

  private async respetarLimiteSolicitudes(): Promise<void> {
    const espera = Math.max(0, 1000 - (Date.now() - this.lastRequestAt));

    if (espera > 0) {
      await new Promise((resolve) => setTimeout(resolve, espera));
    }
  }
}
