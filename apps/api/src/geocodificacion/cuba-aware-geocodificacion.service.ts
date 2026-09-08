import { Injectable, Logger } from '@nestjs/common';

import {
  GeocodificacionService,
  GeocodingResult,
} from './geocodificacion.service.js';
import { CubaTerritorialService } from './cuba-territorial.service.js';

@Injectable()
export class CubaAwareGeocodificacionService extends GeocodificacionService {
  private readonly logger = new Logger(CubaAwareGeocodificacionService.name);

  constructor(private readonly territorial: CubaTerritorialService) {
    super();
  }

  override async geocodificar(
    direccion: string,
    pais?: string | null,
  ): Promise<GeocodingResult | null> {
    this.logger.log(
      `[GEOCODIFICACION][ORIGINAL] ${JSON.stringify(direccion)}`,
    );

    const territorio = await this.territorial.resolver(direccion);

    if (territorio) {
      const partes = [direccion.trim()];

      if (territorio.localidad) {
        partes.push(territorio.localidad);
      }

      if (territorio.consejoPopular) {
        partes.push(territorio.consejoPopular);
      }

      if (territorio.municipio) {
        partes.push(territorio.municipio);
      }

      partes.push(territorio.provincia);

      const direccionEnriquecida = partes.join(', ');

      this.logger.log(
        `[GEOCODIFICACION][TERRITORIO] ${JSON.stringify({
          localidad: territorio.localidad,
          consejoPopular: territorio.consejoPopular,
          municipio: territorio.municipio,
          provincia: territorio.provincia,
          direccionEnriquecida,
        })}`,
      );

      return super.geocodificar(direccionEnriquecida, 'CUBA');
    }

    const partesOriginales = direccion
      .split(',')
      .map((parte) => parte.trim())
      .filter(Boolean);
    const ultimoComponente = partesOriginales.at(-1)?.toUpperCase();
    const esCubaExplicito =
      ultimoComponente?.normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
      'CUBA';

    if (esCubaExplicito) {
      if (partesOriginales.length < 3) {
        return null;
      }

      return super.geocodificar(
        partesOriginales.slice(0, -1).join(', '),
        'CUBA',
      );
    }

    return super.geocodificar(direccion, pais);
  }
}
