import { GetPublicUnitProjectsUseCase } from '../get-public-unit-projects.use-case';
import type { UnitsReader } from '../../../modules/units/units.reader.contract';

describe('GetPublicUnitProjectsUseCase', () => {
  let useCase: GetPublicUnitProjectsUseCase;
  let unitsReader: jest.Mocked<UnitsReader>;

  beforeEach(() => {
    unitsReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
      getProfilesByUnitId: jest.fn(),
      getScientificProductionsByUnitId: jest.fn(),
      getProjectsByUnitId: jest.fn(),
    } as unknown as jest.Mocked<UnitsReader>;

    useCase = new GetPublicUnitProjectsUseCase(unitsReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return mapped projects when the unit has projects', async () => {
      const mockProjects = [
        {
          id: 'p1',
          code: 'p1',
          name: 'Aplicaciones de Computación Cuántica',
          managerName: 'Dr. Carlos Ramírez',
          managerId: 1,
          startDate: '01/01/2022',
          endDate: '31/12/2024',
          researchType: 'Básica',
          projectType: 'Investigación',
          keywords: 'cuántica,computación',
        },
      ];
      unitsReader.getProjectsByUnitId.mockResolvedValue(mockProjects);

      const result = await useCase.execute(1);

      expect(result).toEqual(mockProjects);
      expect(unitsReader.getProjectsByUnitId).toHaveBeenCalledWith(1);
      expect(unitsReader.getProjectsByUnitId).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when the unit has no projects', async () => {
      unitsReader.getProjectsByUnitId.mockResolvedValue([]);

      const result = await useCase.execute(99999);

      expect(result).toEqual([]);
      expect(unitsReader.getProjectsByUnitId).toHaveBeenCalledWith(99999);
    });

    it('should preserve null keywords in mapped response', async () => {
      const mockProjects = [
        {
          id: 'p2',
          code: 'p2',
          name: 'Proyecto sin keywords',
          managerName: 'Dr. Juan López',
          managerId: 2,
          startDate: '01/06/2023',
          endDate: '30/06/2025',
          researchType: 'Aplicada',
          projectType: 'Extensión',
          keywords: null,
        },
      ];
      unitsReader.getProjectsByUnitId.mockResolvedValue(mockProjects);

      const result = await useCase.execute(1);

      expect(result[0].keywords).toBeNull();
    });
  });
});
