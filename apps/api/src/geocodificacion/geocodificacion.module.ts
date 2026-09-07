import { Module } from '@nestjs/common';

import { CubaAwareGeocodificacionService } from './cuba-aware-geocodificacion.service.js';
import { CubaTerritorialService } from './cuba-territorial.service.js';
import { GeocodificacionService } from './geocodificacion.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [
    CubaTerritorialService,
    CubaAwareGeocodificacionService,
    {
      provide: GeocodificacionService,
      useExisting: CubaAwareGeocodificacionService,
    },
  ],
  exports: [GeocodificacionService, CubaTerritorialService],
})
export class GeocodificacionModule {}
