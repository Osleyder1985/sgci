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

interface GoogleAddressComponent {
  long_name?: string;
  types?: string[];
}

interface GoogleGeocodingResponse {
  status?: string;
  error_message?: string;
  results?: Array<{
    formatted_address?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
    address_components?: GoogleAddressComponent[];
  }>;
}

@Injectable()
export class GeocodificacionService {
  private readonly logger = new Logger(GeocodificacionService.name);

  private readonly baseUrl =
    process.env.GEOCODER_BASE_URL?.trim() ||
    'https://maps.googleapis.com/maps/api/geocode/json';

  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

  private readonly userAgent =
    process.env.GEOCODER_USER_AGENT?.trim() ?? 'SGCI/1.0';

  async geocodificar(
    direccion: string,
    pais?: string | null,
  ): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      throw new Error(
        'GOOGLE_MAPS_API_KEY no está configurada. No se puede geocodificar una dirección nueva.',
      );
    }

    const texto = direccion.trim();

    if (!texto) {
      return null;
    }

    const query = pais?.trim() ? `${texto}, ${pais.trim()}` : texto;
    const url = new URL(this.baseUrl);

    url.searchParams.set('address', query);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('language', 'es');

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        throw new Error(
          `Google Geocoding API respondió HTTP ${response.status}.`,
        );
      }

      const result = (await response.json()) as GoogleGeocodingResponse;

      if (result.status === 'ZERO_RESULTS') {
        return null;
      }

      if (result.status !== 'OK') {
        throw new Error(
          `Google Geocoding API respondió ${result.status ?? 'sin estado'}${
            result.error_message ? `: ${result.error_message}` : ''
          }.`,
        );
      }

      const firstResult = result.results?.[0];
      const location = firstResult?.geometry?.location;

      if (!firstResult || !location) {
        return null;
      }

      const lat = Number(location.lat);
      const lon = Number(location.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error('Google Geocoding API devolvió coordenadas inválidas.');
      }

      const address = this.mapAddressComponents(
        firstResult.address_components ?? [],
      );

      return {
        lat,
        lon,
        displayName: firstResult.formatted_address ?? texto,
        address,
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

  private mapAddressComponents(
    components: GoogleAddressComponent[],
  ): GeocodingResult['address'] {
    const find = (type: string) =>
      components.find((component) => component.types?.includes(type))?.long_name;

    return {
      road: find('route'),
      houseNumber: find('street_number'),
      city: find('locality'),
      town: find('postal_town'),
      village: find('administrative_area_level_3'),
      municipality: find('administrative_area_level_2'),
      state: find('administrative_area_level_1'),
      country: find('country'),
      postcode: find('postal_code'),
    };
  }
}
