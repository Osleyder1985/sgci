import { Injectable } from '@nestjs/common';

import {
  GeocodificacionService,
  GeocodingResult,
} from './geocodificacion.service.js';
import { CubaTerritorialService } from './cuba-territorial.service.js';

@Injectable()
export class CubaAwareGeocodificacionService extends GeocodificacionService {
  constructor(private readonly territorial: CubaTerritorialService) {
    super();
  }

  override async geocodificar(
    direccion: string,
    pais?: string | null,
  ): Promise<GeocodingResult | null> {
    const territorio = await this.territorial.resolver(direccion);

    if (!territorio) {
      return super.geocodificar(direccion, pais);
    }

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

    partes.push(territorio.provincia, 'CUBA');

    const direccionEnriquecida = partes.join(', ');

    return super.geocodificar(direccionEnriquecida, 'CUBA');
  }
}
