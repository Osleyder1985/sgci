import { CubaTerritorialService } from './cuba-territorial.service.js';

describe('CubaTerritorialService', () => {
  const prisma = {
    $queryRaw: async (query: TemplateStringsArray) => {
      const sql = query.join('');

      if (sql.includes('CatalogoProvinciaCubana')) {
        return [
          {
            id: 1,
            nombre: 'La Habana',
            nombreNormalizado: 'LA HABANA',
          },
          {
            id: 2,
            nombre: 'Camagüey',
            nombreNormalizado: 'CAMAGUEY',
          },
        ];
      }

      if (sql.includes('CatalogoMunicipioCubano')) {
        return [
          {
            id: 1,
            provinciaId: 1,
            nombre: 'Marianao',
            nombreNormalizado: 'MARIANAO',
          },
          {
            id: 2,
            provinciaId: 1,
            nombre: 'Plaza de la Revolución',
            nombreNormalizado: 'PLAZA DE LA REVOLUCION',
          },
          {
            id: 3,
            provinciaId: 2,
            nombre: 'Guáimaro',
            nombreNormalizado: 'GUAIMARO',
          },
        ];
      }

      return [];
    },
  };

  it('resuelve municipio y provincia desde el tramo territorial de la dirección', async () => {
    const service = new CubaTerritorialService(prisma as never);

    await expect(
      service.resolver(
        'CALLE 35 REPARTO ZAMORA # 12207 E/ 120 Y 120 A, MARIANAO, LA HABANA',
      ),
    ).resolves.toMatchObject({
      provincia: 'La Habana',
      municipio: 'Marianao',
      confianza: 'ALTA',
    });
  });

  it('no confunde un municipio cubano que aparece en el nombre de una calle extranjera', async () => {
    const service = new CubaTerritorialService(prisma as never);

    await expect(
      service.resolver('CAMAGUEY STREET 10, MIAMI, FLORIDA'),
    ).resolves.toBeNull();
  });
});
