import { CubaTerritorialService } from './cuba-territorial.service.js';

describe('CubaTerritorialService', () => {
  const prisma = {
    $queryRaw: async (query: TemplateStringsArray) => {
      const sql = query.join('');

      if (sql.includes('CatalogoProvinciaCubana')) {
        return [
          { id: 1, nombre: 'La Habana', nombreNormalizado: 'LA HABANA' },
          { id: 2, nombre: 'Camagüey', nombreNormalizado: 'CAMAGUEY' },
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
          {
            id: 4,
            provinciaId: 2,
            nombre: 'Camagüey',
            nombreNormalizado: 'CAMAGUEY',
          },
        ];
      }

      if (sql.includes('CatalogoLocalidadCubana')) {
        return [
          {
            id: 10,
            municipioId: 1,
            nombre: 'Pogolotti',
            nombreNormalizado: 'POGOLOTTI',
          },
          {
            id: 11,
            municipioId: 2,
            nombre: 'Vedado',
            nombreNormalizado: 'VEDADO',
          },
        ];
      }

      if (sql.includes('CatalogoConsejoPopularCubano')) {
        return [
          {
            id: 20,
            municipioId: 1,
            nombre: 'Pogolotti',
            nombreNormalizado: 'POGOLOTTI',
          },
        ];
      }

      return [];
    },
  };

  it(
    'resuelve municipio y provincia desde el tramo territorial de la dirección',
    async () => {
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
    },
  );

  it(
    'resuelve un municipio aunque la provincia no aparezca al final',
    async () => {
      const service = new CubaTerritorialService(prisma as never);

      await expect(
        service.resolver('CALLE 51 # 123, MARIANAO'),
      ).resolves.toMatchObject({
        provincia: 'La Habana',
        municipio: 'Marianao',
        confianza: 'ALTA',
      });
    },
  );

  it(
    'resuelve una localidad y hereda municipio y provincia',
    async () => {
      const service = new CubaTerritorialService(prisma as never);

      await expect(
        service.resolver('CALLE PRINCIPAL, POGOLOTTI'),
      ).resolves.toMatchObject({
        provincia: 'La Habana',
        municipio: 'Marianao',
        localidad: 'Pogolotti',
        confianza: 'ALTA',
      });
    },
  );

  it(
    'resuelve un consejo popular y hereda municipio y provincia',
    async () => {
      const service = new CubaTerritorialService(prisma as never);

      await expect(
        service.resolver('CENTRO, POGOLOTTI'),
      ).resolves.toMatchObject({
        provincia: 'La Habana',
        municipio: 'Marianao',
        consejoPopular: 'Pogolotti',
        confianza: 'ALTA',
      });
    },
  );

  it(
    'no confunde un municipio cubano que aparece en una dirección extranjera',
    async () => {
      const service = new CubaTerritorialService(prisma as never);

      await expect(
        service.resolver('CAMAGUEY STREET 10, MIAMI, FLORIDA'),
      ).resolves.toBeNull();
    },
  );
});
