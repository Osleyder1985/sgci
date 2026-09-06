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
    const consultas = this.construirConsultas(normalizada, paisBusqueda);

    this.logger.log(
      `Geocodificando: "${texto}" -> "${normalizada.canonica}"${
        esCuba ? ' | país=CUBA' : paisBusqueda ? ` | país=${paisBusqueda}` : ''
      }`,
    );

    for (const query of consultas) {
      const resultado = await this.buscarLocationIq(query, normalizada.canonica);

      if (resultado) {
        return resultado;
      }
    }

    return null;
  }

  private async buscarLocationIq(
    query: string,
    textoFallback: string,
  ): Promise<GeocodingResult | null> {
    await this.respetarLimiteSolicitudes();

    const url = new URL(this.baseUrl);
    url.searchParams.set('key', this.apiKey!);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '1');
    url.searchParams.set('accept-language', 'es');

    if (this.esBusquedaCubana(query)) {
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
        this.logger.debug(`LocationIQ sin coincidencias para: "${query}"`);
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

      return {
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
    } catch (error) {
      this.logger.warn(
        `No fue posible geocodificar "${query}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      throw error;
    }
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

    const componentesPrincipales =
      partes.length >= 2 ? partes.slice(0, -2) : partes;

    const primerComponente = componentesPrincipales[0] ?? '';
    const resto = componentesPrincipales.slice(1);

    this.extraerMarcadores(primerComponente, resultado);

    for (const componente of resto) {
      this.extraerComponente(componente, resultado);
    }

    if (resultado.provincia) {
      resultado.provincia = this.limpiarProvincia(resultado.provincia);
    }

    const partesCanonicas: string[] = [];

    if (resultado.calle) {
      partesCanonicas.push(resultado.calle);
    }

    if (resultado.numeroCasa) {
      partesCanonicas.push(resultado.numeroCasa);
    }

    if (resultado.entreCalles) {
      partesCanonicas.push(resultado.entreCalles);
    }

    if (resultado.apartamento) {
      partesCanonicas.push(`APARTAMENTO ${resultado.apartamento}`);
    }

    if (resultado.edificio) {
      partesCanonicas.push(`EDIFICIO ${resultado.edificio}`);
    }

    if (resultado.reparto) {
      partesCanonicas.push(`REPARTO ${resultado.reparto}`);
    }

    if (resultado.municipio) {
      partesCanonicas.push(resultado.municipio);
    }

    if (resultado.provincia) {
      partesCanonicas.push(resultado.provincia);
    }

    resultado.canonica = partesCanonicas.join(', ');

    if (!resultado.canonica) {
      resultado.canonica = sinZona;
    }

    return resultado;
  }

  private extraerMarcadores(
    texto: string,
    resultado: DireccionCubanaNormalizada,
  ): void {
    let restante = texto.trim();

    const apartamento = restante.match(/\b(?:APARTAMENTO|APTO\.?)\s*#?\s*([A-Z0-9-]+)/i);
    if (apartamento) {
      resultado.apartamento = apartamento[1];
      restante = restante.replace(apartamento[0], ' ');
    }

    const edificio = restante.match(/\bEDIF(?:ICIO)?\.?\s*#?\s*([A-Z0-9-]+)/i);
    if (edificio) {
      resultado.edificio = edificio[1];
      restante = restante.replace(edificio[0], ' ');
    }

    const reparto = restante.match(/\bRPTO\.?\s+(.+)$/i);
    if (reparto) {
      resultado.reparto = reparto[1].trim();
      restante = restante.replace(reparto[0], ' ');
    }

    const entre = restante.match(/\bE\s*\/\s*(.+)$/i);
    if (entre) {
      resultado.entreCalles = this.normalizarEntrecalles(entre[1]);
      restante = restante.replace(entre[0], ' ');
    }

    const numero = restante.match(/#\s*([A-Z0-9-]+)/i);
    if (numero) {
      resultado.numeroCasa = numero[1];
      restante = restante.replace(numero[0], ' ');
    }

    resultado.calle = this.limpiarComponente(restante);
  }

  private extraerComponente(
    componente: string,
    resultado: DireccionCubanaNormalizada,
  ): void {
    const texto = componente.trim();

    if (!texto) return;

    const apartamento = texto.match(/^\b(?:APARTAMENTO|APTO\.?)\s*#?\s*([A-Z0-9-]+)\s*$/i);
    if (apartamento) {
      resultado.apartamento ??= apartamento[1];
      return;
    }

    const edificio = texto.match(/^\bEDIF(?:ICIO)?\.?\s*#?\s*([A-Z0-9-]+)\s*$/i);
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

    if (!resultado.reparto && /^(?:RPTO|REPARTO)\.?\s+/i.test(texto)) {
      resultado.reparto = texto.replace(/^(?:RPTO|REPARTO)\.?\s+/i, '').trim();
      return;
    }

    if (!resultado.entreCalles && /\b.+\s+Y\s+.+\b/i.test(texto)) {
      resultado.entreCalles ??= this.normalizarEntrecalles(texto);
    }
  }

  private normalizarEntrecalles(texto: string): string {
    return texto
      .replace(/^\s*(?:E\s*\/|ENTRE)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private limpiarComponente(texto: string): string | undefined {
    const limpio = texto
      .replace(/[()]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^\s*,\s*|\s*,\s*$/g, '')
      .trim();

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
    const consultas: string[] = [];
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

    consultas.push(`${completa}${sufijoPais}`.trim());

    const simplificada = [
      direccion.calle,
      direccion.numeroCasa,
      direccion.reparto ? `REPARTO ${direccion.reparto}` : undefined,
      direccion.municipio,
      direccion.provincia,
    ]
      .filter(Boolean)
      .join(', ');

    if (simplificada && simplificada !== completa) {
      consultas.push(`${simplificada}${sufijoPais}`.trim());
    }

    return [...new Set(consultas)];
  }

  private esDireccionCubana(
    original: string,
    normalizada: DireccionCubanaNormalizada,
  ): boolean {
    const texto = `${original} ${normalizada.municipio ?? ''} ${normalizada.provincia ?? ''}`
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const provinciasCubanas = [
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
    ];

    return (
      texto.includes(' CUBA') ||
      provinciasCubanas.some((provincia) => texto.includes(provincia))
    );
  }

  private esBusquedaCubana(query: string): boolean {
    return /(?:,\s*)CUBA\b/i.test(query) || /countrycodes=cu/i.test(query);
  }

  private async respetarLimiteSolicitudes(): Promise<void> {
    const milisegundosDesdeUltima = Date.now() - this.lastRequestAt;
    const espera = Math.max(0, 1000 - milisegundosDesdeUltima);

    if (espera > 0) {
      await new Promise((resolve) => setTimeout(resolve, espera));
    }
  }
}
