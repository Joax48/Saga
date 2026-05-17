import { GetPublicUnitProfilesUseCase } from '../get-public-unit-profiles.use-case';
import type { UnitsReader } from '../../../modules/units/units.reader.contract';

describe('GetPublicUnitProfilesUseCase', () => {
  let useCase: GetPublicUnitProfilesUseCase;
  let unitsReader: jest.Mocked<UnitsReader>;

  beforeEach(() => {
    unitsReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
      getProfilesByUnitId: jest.fn(),
      getScientificProductionsByUnitId: jest.fn(),
      getProjectsByUnitId: jest.fn(),
    } as unknown as jest.Mocked<UnitsReader>;

    useCase = new GetPublicUnitProfilesUseCase(unitsReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return mapped profiles when the unit has profiles', async () => {
      const mockProfiles = [
        {
          id: 1,
          name: 'Dr. Carlos Ramírez',
          baseUnit: 'Escuela de Física',
          ceaCategory: null,
          photoUrl: null,
        },
        {
          id: 2,
          name: 'Dra. María González',
          baseUnit: 'Escuela de Física',
          ceaCategory: 'A',
          photoUrl: 'https://photo.url',
        },
      ];
      unitsReader.getProfilesByUnitId.mockResolvedValue(mockProfiles);

      const result = await useCase.execute(1);

      expect(result).toEqual(mockProfiles);
      expect(unitsReader.getProfilesByUnitId).toHaveBeenCalledWith(1);
      expect(unitsReader.getProfilesByUnitId).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when the unit has no profiles', async () => {
      unitsReader.getProfilesByUnitId.mockResolvedValue([]);

      const result = await useCase.execute(99999);

      expect(result).toEqual([]);
      expect(unitsReader.getProfilesByUnitId).toHaveBeenCalledWith(99999);
    });
  });
});
