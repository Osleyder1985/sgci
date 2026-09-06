import { Test, TestingModule } from '@nestjs/testing';

import { GeocodificacionModule } from './geocodificacion.module.js';
import { GeocodificacionService } from './geocodificacion.service.js';

describe('GeocodificacionModule', () => {
  it('debe permitir que Nest resuelva GeocodificacionService', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [GeocodificacionModule],
    }).compile();

    const service = moduleRef.get<GeocodificacionService>(
      GeocodificacionService,
    );

    expect(service).toBeInstanceOf(GeocodificacionService);
  });
});
