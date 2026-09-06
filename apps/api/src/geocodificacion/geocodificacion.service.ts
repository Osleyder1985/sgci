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

    await this.respetarLimiteSolicitudes();

    const query = pais?.trim() ? `${texto}, ${pais.trim()}` : texto;
    const url = new URL(this.baseUrl);

    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '1');
    url.searchParams.set('accept-language', 'es');

    try {
      this.lastRequestAt = Date.now();

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
        signal: AbortSignal.timeout(15_000),
      });

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
        displayName: firstResult.display_name ?? texto,
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
        `No fue posible geocodificar la dirección "${texto}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      throw error;
    }
  }

  private async respetarLimiteSolicitudes(): Promise<void> {
    const milisegundosDesdeUltima = Date.now() - this.lastRequestAt;
    const espera = Math.max(0, 1000 - milisegundosDesdeUltima);

    if (espera > 0) {
      await new Promise((resolve) => setTimeout(resolve, espera));
    }
  }
}
