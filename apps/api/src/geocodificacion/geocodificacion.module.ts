import { Module } from '@nestjs/common';

import { CubaTerritorialService } from './cuba-territorial.service.js';
import { GeocodificacionService } from './geocodificacion.service.js';

@Module({
  providers: [CubaTerritorialService, GeocodificacionService],
  exports: [GeocodificacionService, CubaTerritorialService],
})
export class GeocodificacionModule {}
