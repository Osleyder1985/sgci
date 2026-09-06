import { Module } from '@nestjs/common';

import { GeocodificacionService } from './geocodificacion.service.js';

@Module({
  providers: [GeocodificacionService],
  exports: [GeocodificacionService],
})
export class GeocodificacionModule {}
