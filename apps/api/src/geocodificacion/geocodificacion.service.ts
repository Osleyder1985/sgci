import { Injectable, Logger } from '@nestjs/common';

import { CODIGOS_POSTALES_CUBA, clavePostal } from './codigos-postales-cuba.js';

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
  codigosPostales?: readonly string[];
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

    if (esCuba) {
      normalizada.codigosPostales = this.resolverCodigosPostales(normalizada);
    }

    this.logger.log(
      `[GEOCODIFICACION][NORMALIZADOR] \"${texto}\" -> \"${normalizada.canonica}\"${
        esCuba ? ' | país=CUBA' : paisBusqueda ? ` | país=${paisBusqueda}` : ''
      }${
        normalizada.codigosPostales?.length
          ? ` | CP=${normalizada.codigosPostales.join('/')}`
          : ''
      }`,
    );

    if (esCuba && normalizada.codigosPostales?.length) {
      for (const codigoPostal of normalizada.codigosPostales) {
        const resultado = await this.buscarLocationIqEstructurado(
          normalizada,
          codigoPostal,
        );
        if (resultado) return resultado;
      }
    }

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

  private async buscarLocationIqEstructurado(
    direccion: DireccionCubanaNormalizada,
    codigoPostal: string,
  ): Promise<GeocodingResult | null> {
    await this.respetarLimiteSolicitudes();

    const url = new URL(this.obtenerUrlBusquedaEstructurada());

    if (!this.apiKey) {
      throw new Error(
        'LOCATIONIQ_API_KEY no está configurada. No se puede consultar LocationIQ.',
      );
    }

    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '1');
    url.searchParams.set('accept-language', 'es');
    url.searchParams.set('countrycodes', 'cu');
    url.searchParams.set('country', 'CUBA');
    url.searchParams.set('postalcode', codigoPostal);

    const street = [
      direccion.calle,
      direccion.numeroCasa ? `# ${direccion.numeroCasa}` : undefined,
      direccion.entreCalles ? `E/ ${direccion.entreCalles}` : undefined,
      direccion.apartamento
        ? `APARTAMENTO ${direccion.apartamento}`
        : undefined,
      direccion.edificio ? `EDIFICIO ${direccion.edificio}` : undefined,
      direccion.reparto ? `REPARTO ${direccion.reparto}` : undefined,
    ]
      .filter(Boolean)
      .join(', ');

    if (street) {
      url.searchParams.set('street', street);
    }
    if (direccion.municipio) {
      url.searchParams.set('city', direccion.municipio);
    }
    if (direccion.provincia) {
      url.searchParams.set('state', direccion.provincia);
    }

    const etiqueta = [
      street,
      direccion.municipio,
      direccion.provincia,
      codigoPostal,
      'CUBA',
    ]
      .filter(Boolean)
      .join(', ');

    const urlDiagnostico = new URL(url);
    urlDiagnostico.searchParams.delete('key');
    this.logger.log(
      `[GEOCODIFICACION][CONSULTA_ESTRUCTURADA] ${urlDiagnostico.toString()}`,
    );

    return this.ejecutarBusquedaLocationIq(
      url,
      etiqueta,
      direccion.canonica,
      direccion,
    );
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

    const urlDiagnostico = new URL(url);
    urlDiagnostico.searchParams.delete('key');
    this.logger.log(
      `[GEOCODIFICACION][CONSULTA_FALLBACK] ${urlDiagnostico.toString()}`,
    );

    return this.ejecutarBusquedaLocationIq(
      url,
      query,
      textoFallback,
      direccionEsperada,
    );
  }

  private async ejecutarBusquedaLocationIq(
    url: URL,
    etiqueta: string,
    textoFallback: string,
    direccionEsperada: DireccionCubanaNormalizada,
  ): Promise<GeocodingResult | null> {
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
        this.logger.debug(
          `LocationIQ no encontró resultados para \"${etiqueta}\".`,
        );
        return null;
      }

      if (!response.ok) {
        throw new Error(`LocationIQ respondió HTTP ${response.status}.`);
      }

      const result = (await response.json()) as LocationIqResult[];
      this.logger.log(
        `[GEOCODIFICACION][LOCATIONIQ][RESPUESTA] ${JSON.stringify({
          etiqueta,
          respuesta: result,
        })}`,
      );
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

      const motivoRechazo = this.obtenerMotivoIncompatibilidad(
        resultado,
        direccionEsperada,
      );

      if (motivoRechazo) {
        this.logger.warn(
          `[GEOCODIFICACION][VALIDACION][RECHAZADA] ${JSON.stringify({
            etiqueta,
            displayName: resultado.displayName,
            motivo: motivoRechazo,
          })}`,
        );
        return null;
      }

      this.logger.log(
        `[GEOCODIFICACION][VALIDACION][ACEPTADA] ${JSON.stringify({
          etiqueta,
          displayName: resultado.displayName,
        })}`,
      );

      return resultado;
    } catch (error) {
      this.logger.warn(
        `No fue posible geocodificar \"${etiqueta}\": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      throw error;
    }
  }

  private obtenerUrlBusquedaEstructurada(): string {
    const base = this.baseUrl.replace(/\/$/, '');

    if (/\/search$/i.test(base)) {
      return `${base}/structured`;
    }

    return base;
  }

  private resolverCodigosPostales(
    direccion: DireccionCubanaNormalizada,
  ): readonly string[] {
    if (!direccion.provincia || !direccion.municipio) {
      return [];
    }

    return (
      CODIGOS_POSTALES_CUBA[
        clavePostal(direccion.provincia, direccion.municipio)
      ] ?? []
    );
  }

  private obtenerMotivoIncompatibilidad(
    resultado: GeocodingResult,
    esperado: DireccionCubanaNormalizada,
  ): string | null {
    if (!esperado.provincia && !esperado.municipio) {
      return null;
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
      return `provincia incompatible: esperada=\"${esperado.provincia}\", recibida=\"${resultado.address?.state ?? ''}\"`;
    }

    if (municipioEsperado && municipio && municipio !== municipioEsperado) {
      return `municipio incompatible: esperado=\"${esperado.municipio}\", recibido=\"${resultado.address?.municipality ?? resultado.address?.city ?? resultado.address?.town ?? resultado.address?.village ?? ''}\"`;
    }

    const esCubaEsperado = this.esProvinciaCubana(provinciaEsperada);
    if (esCubaEsperado && pais && pais !== 'CUBA') {
      return `país incompatible: esperado=\"CUBA\", recibido=\"${resultado.address?.country ?? ''}\"`;
    }

    if (esCubaEsperado && !pais && !provincia) {
      return 'respuesta sin país ni provincia para una dirección cubana';
    }

    return null;
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
    for (const componente of principales) {
      this.extraerMarcadores(componente, resultado);
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
    const marcadores =
      /\bE\s*\/|\bRPTO\.?|\bREPARTO\b|#|\bEDIF(?:ICIO)?\.?|\bBIPLANTA\b|\bMODULO\b|\bAPARTAMENTO\b|\bAPTO\.?/gi;
    const coincidencias = [...texto.matchAll(marcadores)];

    if (!coincidencias.length) {
      const calle = this.limpiarCalle(texto);
      if (calle && !resultado.calle) resultado.calle = calle;
      return;
    }

    const prefijo = this.limpiarCalle(texto.slice(0, coincidencias[0].index));
    if (prefijo && !resultado.calle) {
      resultado.calle = prefijo;
    }

    for (let i = 0; i < coincidencias.length; i += 1) {
      const coincidencia = coincidencias[i];
      const marcador = coincidencia[0].toUpperCase().replace(/\s+/g, ' ');
      const inicioValor = (coincidencia.index ?? 0) + coincidencia[0].length;
      const finValor = coincidencias[i + 1]?.index ?? texto.length;
      const valor = this.limpiarValorMarcador(
        texto.slice(inicioValor, finValor),
      );

      if (!valor) continue;

      if (/^E\s*\/$/i.test(marcador)) {
        resultado.entreCalles ??= this.normalizarEntrecalles(valor);
        continue;
      }

      if (marcador === '#') {
        resultado.numeroCasa ??= this.primerToken(valor);
        continue;
      }

      if (/^EDIF|^BIPLANTA|^MODULO/i.test(marcador)) {
        resultado.edificio ??= this.primerToken(valor);
        continue;
      }

      if (/^APARTAMENTO|^APTO/i.test(marcador)) {
        resultado.apartamento ??= this.primerToken(valor);
        continue;
      }

      if (/^RPTO|^REPARTO/i.test(marcador)) {
        const despuesDeEntrecalles =
          Boolean(resultado.entreCalles) &&
          (resultado.edificio !== undefined ||
            resultado.apartamento !== undefined);

        if (despuesDeEntrecalles && !resultado.apartamento) {
          resultado.apartamento = this.primerToken(valor);
        } else if (!resultado.reparto) {
          resultado.reparto = valor;
        } else if (!resultado.apartamento && resultado.edificio) {
          resultado.apartamento = this.primerToken(valor);
        }
      }
    }
  }

  private limpiarCalle(texto?: string): string | undefined {
    if (!texto) return undefined;

    return this.limpiarValorMarcador(texto)
      ?.replace(/^(?:CALLE)\s+/i, '')
      .trim();
  }

  private limpiarValorMarcador(texto: string): string | undefined {
    const limpio = texto
      .replace(/[()]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^[,.;:]+|[,.;:]+$/g, '')
      .trim();
    return limpio || undefined;
  }

  private primerToken(texto: string): string | undefined {
    return texto.split(/\s+/).find(Boolean);
  }

  private normalizarEntrecalles(texto: string): string {
    return texto
      .replace(/^\s*(?:E\s*\/|ENTRE)\s+/i, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+(?:RPTO\.?|REPARTO)\b.*$/i, '')
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
    const tieneMarcadorCubano =
      /\bE\s*\/|\bRPTO\.?|\bREPARTO\b|\bEDIF(?:ICIO)?\.?|\bBIPLANTA\b|\bMODULO\b|\bAPTO\.?|\bAPARTAMENTO\b|#/.test(
        normalizarTexto(original),
      );

    return (
      ultimoComponente === 'CUBA' ||
      this.esProvinciaCubana(provincia) ||
      this.esProvinciaCubana(municipio) ||
      tieneMarcadorCubano
    );
  }

  private esProvinciaCubana(valor?: string): boolean {
    if (!valor) return false;

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

    return provinciasCubanas.has(valor);
  }

  private async respetarLimiteSolicitudes(): Promise<void> {
    const delay = Math.max(0, 1000 - (Date.now() - this.lastRequestAt));
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
