import { GetPublicUnitScientificProductionsUseCase } from '../get-public-unit-scientific-productions.use-case';
import type { UnitsReader } from '../../../modules/units/units.reader.contract';

describe('GetPublicUnitScientificProductionsUseCase', () => {
  let useCase: GetPublicUnitScientificProductionsUseCase;
  let unitsReader: jest.Mocked<UnitsReader>;

  beforeEach(() => {
    unitsReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
      getProfilesByUnitId: jest.fn(),
      getScientificProductionsByUnitId: jest.fn(),
      getProjectsByUnitId: jest.fn(),
    } as unknown as jest.Mocked<UnitsReader>;

    useCase = new GetPublicUnitScientificProductionsUseCase(unitsReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return mapped scientific productions when the unit has productions', async () => {
      const mockProductions = [
        {
          id: 'sp1',
          title: 'Nuevo Enfoque en Corrección de Errores Cuánticos',
          authors: 'Dr. Carlos Ramírez',
          type: 'Article',
          publicationYear: 2024,
          doi: '10.1000/xyz123',
          journal: 'Nature Physics',
          volume: 10,
          issue: 2,
          pages: '100-110',
          keywords: 'cuántica,errores',
        },
      ];
      unitsReader.getScientificProductionsByUnitId.mockResolvedValue(mockProductions);

      const result = await useCase.execute(1);

      expect(result).toEqual(mockProductions);
      expect(unitsReader.getScientificProductionsByUnitId).toHaveBeenCalledWith(1);
      expect(unitsReader.getScientificProductionsByUnitId).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when the unit has no scientific productions', async () => {
      unitsReader.getScientificProductionsByUnitId.mockResolvedValue([]);

      const result = await useCase.execute(99999);

      expect(result).toEqual([]);
      expect(unitsReader.getScientificProductionsByUnitId).toHaveBeenCalledWith(99999);
    });

    it('should preserve null optional fields in mapped response', async () => {
      const mockProductions = [
        {
          id: 'sp2',
          title: 'Producción sin datos opcionales',
          authors: 'Dra. María González',
          type: 'Conference',
          publicationYear: 2023,
          doi: null,
          journal: null,
          volume: null,
          issue: null,
          pages: null,
          keywords: '',
        },
      ];
      unitsReader.getScientificProductionsByUnitId.mockResolvedValue(mockProductions);

      const result = await useCase.execute(1);

      expect(result[0].doi).toBeNull();
      expect(result[0].journal).toBeNull();
      expect(result[0].volume).toBeNull();
      expect(result[0].issue).toBeNull();
      expect(result[0].pages).toBeNull();
      expect(result[0].keywords).toBe('');
    });
  });
});
