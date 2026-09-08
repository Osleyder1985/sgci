import { afterEach, describe, expect, it, vi } from 'vitest';
import { CubaAwareGeocodificacionService } from './cuba-aware-geocodificacion.service.js';

describe('CubaAwareGeocodificacionService', () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.LOCATIONIQ_API_KEY;

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.LOCATIONIQ_API_KEY;
    } else {
      process.env.LOCATIONIQ_API_KEY = originalApiKey;
    }
  });

  it('quita el país final CUBA antes de delegar para conservar municipio y provincia', async () => {
    process.env.LOCATIONIQ_API_KEY = 'test-key';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            lat: '23.08',
            lon: '-82.41',
            display_name: 'Calle 10, Marianao, La Habana, Cuba',
            address: {
              city: 'Marianao',
              state: 'La Habana',
              country: 'Cuba',
            },
          },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    global.fetch = fetchMock as typeof global.fetch;

    const territorial = {
      resolver: vi.fn().mockResolvedValue(null),
    };
    const service = new CubaAwareGeocodificacionService(territorial as never);

    await expect(
      service.geocodificar('CALLE 10, MARIANAO, LA HABANA, CUBA', 'MEXICO'),
    ).resolves.toMatchObject({
      lat: 23.08,
      lon: -82.41,
    });

    const url = fetchMock.mock.calls[0]?.[0] as URL;
    expect(url.searchParams.get('q')).toBe(
      'CALLE 10, MARIANAO, LA HABANA, CUBA',
    );
    expect(url.searchParams.get('countrycodes')).toBe('cu');
  });

  it('no intenta geocodificar una dirección cubana que solo contiene calle y país', async () => {
    process.env.LOCATIONIQ_API_KEY = 'test-key';

    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof global.fetch;

    const territorial = {
      resolver: vi.fn().mockResolvedValue(null),
    };
    const service = new CubaAwareGeocodificacionService(territorial as never);

    await expect(service.geocodificar('CALLE 56, CUBA')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('no agrega CUBA dos veces cuando el catálogo territorial ya resolvió la provincia', async () => {
    process.env.LOCATIONIQ_API_KEY = 'test-key';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            lat: '23.08',
            lon: '-82.41',
            display_name: 'Calle 10, Marianao, La Habana, Cuba',
            address: {
              city: 'Marianao',
              state: 'La Habana',
              country: 'Cuba',
            },
          },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    global.fetch = fetchMock as typeof global.fetch;

    const territorial = {
      resolver: vi.fn().mockResolvedValue({
        provincia: 'La Habana',
        municipio: 'Marianao',
        provinciaNormalizada: 'LA HABANA',
        municipioNormalizado: 'MARIANAO',
        confianza: 'ALTA',
      }),
    };
    const service = new CubaAwareGeocodificacionService(territorial as never);

    await service.geocodificar('CALLE 10', 'MEXICO');

    const url = fetchMock.mock.calls[0]?.[0] as URL;
    expect(url.searchParams.get('q')).toBe('CALLE 10, MARIANAO, LA HABANA, CUBA');
  });
});
