import { Injectable, Logger } from '@nestjs/common';

interface GeocodingResult {
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

  private readonly baseUrl =
    process.env.GEOCODER_BASE_URL ??
    'https://nominatim.openstreetmap.org/search';

  private readonly userAgent =
    process.env.GEOCODER_USER_AGENT ?? 'SGCI/1.0 (manifest-import)';

  async geocodificar(
    direccion: string,
    pais?: string | null,
  ): Promise<GeocodingResult | null> {
    const texto = direccion.trim();

    if (!texto) {
      return null;
    }

    const query = pais?.trim() ? `${texto}, ${pais.trim()}` : texto;
    const url = new URL(this.baseUrl);

    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '2');
    url.searchParams.set('addressdetails', '1');

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

      const results = (await response.json()) as Array<{
        lat?: string;
        lon?: string;
        display_name?: string;
        address?: GeocodingResult['address'];
      }>;

      if (!results.length) {
        return null;
      }

      const first = results[0];
      const lat = Number(first.lat);
      const lon = Number(first.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error('El proveedor devolvió coordenadas inválidas.');
      }

      return {
        lat,
        lon,
        displayName: first.display_name ?? texto,
        address: first.address,
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

  async esperarEntreConsultas(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1_100));
  }
}
