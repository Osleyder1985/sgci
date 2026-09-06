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

@Injectable()
export class GeocodificacionService {
  private readonly logger = new Logger(GeocodificacionService.name);

  private readonly baseUrl = process.env.GEOCODER_BASE_URL?.trim();

  private readonly userAgent =
    process.env.GEOCODER_USER_AGENT?.trim() ?? 'SGCI/1.0';

  async geocodificar(
    direccion: string,
    pais?: string | null,
  ): Promise<GeocodingResult | null> {
    if (!this.baseUrl) {
      throw new Error(
        'GEOCODER_BASE_URL no está configurado. No se puede geocodificar una dirección nueva.',
      );
    }

    const texto = direccion.trim();

    if (!texto) {
      return null;
    }

    const query = pais?.trim() ? `${texto}, ${pais.trim()}` : texto;
    const url = new URL(this.baseUrl);

    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');

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
          `Proveedor de geocodificación respondió HTTP ${response.status}.`,
        );
      }

      const result = (await response.json()) as {
        lat?: number | string;
        lon?: number | string;
        displayName?: string;
        display_name?: string;
        address?: GeocodingResult['address'];
      } | null;

      if (!result) {
        return null;
      }

      const lat = Number(result.lat);
      const lon = Number(result.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error('El proveedor devolvió coordenadas inválidas.');
      }

      return {
        lat,
        lon,
        displayName: result.displayName ?? result.display_name ?? texto,
        address: result.address,
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
}
