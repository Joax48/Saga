import { getProjectById, getProjectFilters, getProjects } from '../projects';

jest.mock('../api', () => ({
  request: jest.fn(),
}));

const { request } = jest.requireMock('../api') as {
  request: jest.Mock;
};

describe('services/projects', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('builds list queries and maps project summaries', async () => {
    request.mockResolvedValue({
      items: [
        {
          id: 1,
          code: 'PI-2026-01',
          name: 'Monitoreo Marino',
          projectManager: { id: 9, name: 'Laura Solis' },
          keywords: ['Mar'],
          projectType: 'Investigacion',
          researchType: 'Aplicada',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
      ],
      page: 2,
      limit: 5,
      total: 9,
    });

    const response = await getProjects(2, 5, '  oceano  ', {
      researchType: [' Aplicada '],
      status: [' Activo ', ''],
      keywords: [' Mar ', 'Costa'],
    });

    expect(request).toHaveBeenCalledWith(
      '/projects?page=2&limit=5&q=oceano&researchType=Aplicada&status=Activo&keywords=Mar%2CCosta',
    );
    expect(response).toEqual({
      data: [
        expect.objectContaining({
          id: '1',
          title: 'Monitoreo Marino',
          manager: 'Laura Solis',
        }),
      ],
      page: 2,
      limit: 5,
      total: 9,
    });
  });

  it.each([
    ['project code', 'PI-2026-01'],
    ['project name', 'Campus inteligente'],
    ['participant name', 'Ana Perez'],
  ])('passes through search queries for %s', async (_label, query) => {
    request.mockResolvedValue({
      items: [],
      page: 1,
      limit: 10,
      total: 0,
    });

    await getProjects(1, 10, query);

    expect(request).toHaveBeenCalledWith(
      `/projects?page=1&limit=10&q=${new URLSearchParams({ q: query }).get('q')?.replace(/ /g, '+') ?? query}`,
    );
  });

  it('encodes project detail ids before requesting them', async () => {
    request.mockResolvedValue({
      id: 'PI 1/2026',
      code: 'PI-1',
      title: 'Detalle',
      description: 'Proyecto',
      manager: { id: 1, name: 'Mario' },
      unit: { id: 2, name: 'CIMAR' },
      disciplines: [],
      researchType: 'Basica',
      projectType: 'Investigacion',
      fundingType: 'Interno',
      status: 'Activo',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      keywords: [],
      associatedProfiles: [],
    });

    await getProjectById('PI 1/2026');

    expect(request).toHaveBeenCalledWith('/projects/PI%201%2F2026');
  });

  it('maps detail fallbacks when manager and unit are missing', async () => {
    request.mockResolvedValue({
      id: 'p-2',
      code: 'PI-2',
      title: 'Sin responsable',
      description: 'Detalle',
      unit: undefined,
      disciplines: [],
      researchType: 'Aplicada',
      projectType: 'Investigacion',
      fundingType: 'Externo',
      status: 'Finalizado',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      keywords: [],
      associatedProfiles: [],
    });

    await expect(getProjectById('p-2')).resolves.toEqual(
      expect.objectContaining({
        manager: 'Sin responsable',
        managerId: undefined,
        institute: 'Sin unidad asociada',
        disciplines: [],
        associatedProfiles: [],
      }),
    );
  });

  it('builds the filters endpoint only with populated filters', async () => {
    request.mockResolvedValue({
      researchType: [],
      projectType: [],
      startYear: [],
      status: [],
      participants: [],
      keywords: [],
    });

    await getProjectFilters(
      {
        participants: [' Ana Perez '],
        projectType: [''],
      },
      '  salud  ',
    );

    expect(request).toHaveBeenCalledWith(
      '/projects/filters?q=salud&participants=Ana+Perez',
    );
  });
});
