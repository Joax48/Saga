import { UnitsRepository } from '../units.repository';

describe('UnitsRepository', () => {
  let repository: UnitsRepository;
  let mockDb: { query: jest.Mock };

  beforeEach(() => {
    mockDb = { query: jest.fn() };
    repository = new UnitsRepository(mockDb as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return the unit when the database returns a matching row', async () => {
      const mockRow = {
        id: 1,
        name: 'Escuela de Física',
        description: 'Investigación en física teórica y experimental.',
        email: 'physics@ucr.ac.cr',
        pageUrl: 'https://www.ucr.ac.cr',
        phoneNumber: '+506 2511-0000',
      };
      mockDb.query.mockResolvedValue([mockRow]);

      const result = await repository.findById(1);

      expect(result).toEqual(mockRow);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should return null when the database returns an empty array', async () => {
      mockDb.query.mockResolvedValue([]);

      const result = await repository.findById(99999);

      expect(result).toBeNull();
    });

    it('should use parameterized query with id', async () => {
      mockDb.query.mockResolvedValue([]);

      await repository.findById(1);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), { id: 1 });
    });
  });

  describe('findProfilesByUnitId', () => {
    it('should return profiles when the database returns rows', async () => {
      const mockRows = [
        {
          id: 1,
          name: 'Dr. Carlos Ramírez',
          baseUnit: 'Escuela de Física',
          ceaCategory: null,
          photoUrl: null,
        },
      ];
      mockDb.query.mockResolvedValue(mockRows);

      const result = await repository.findProfilesByUnitId(1);

      expect(result).toEqual(mockRows);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when unit has no profiles', async () => {
      mockDb.query.mockResolvedValue([]);

      const result = await repository.findProfilesByUnitId(99999);

      expect(result).toEqual([]);
    });

    it('should use parameterized query with unitId', async () => {
      mockDb.query.mockResolvedValue([]);

      await repository.findProfilesByUnitId(1);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), { unitId: 1 });
    });
  });

  describe('findScientificProductionsByUnitId', () => {
    it('should return scientific productions when the database returns rows', async () => {
      const mockRows = [
        {
          id: 'sp1',
          title: 'Nuevo Enfoque en Corrección de Errores Cuánticos',
          authors: 'Dr. Carlos Ramírez',
          type: 'Article',
          publicationYear: 2024,
          doi: null,
          journal: null,
          volume: null,
          issue: null,
          pages: null,
          keywords: 'cuántica,errores',
        },
      ];
      mockDb.query.mockResolvedValue(mockRows);

      const result = await repository.findScientificProductionsByUnitId(1);

      expect(result).toEqual(mockRows);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when unit has no scientific productions', async () => {
      mockDb.query.mockResolvedValue([]);

      const result = await repository.findScientificProductionsByUnitId(99999);

      expect(result).toEqual([]);
    });

    it('should use parameterized query with unitId', async () => {
      mockDb.query.mockResolvedValue([]);

      await repository.findScientificProductionsByUnitId(1);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), { unitId: 1 });
    });
  });

  describe('findProjectsByUnitId', () => {
    it('should return projects when the database returns rows', async () => {
      const mockRows = [
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
      mockDb.query.mockResolvedValue(mockRows);

      const result = await repository.findProjectsByUnitId(1);

      expect(result).toEqual(mockRows);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when unit has no projects', async () => {
      mockDb.query.mockResolvedValue([]);

      const result = await repository.findProjectsByUnitId(99999);

      expect(result).toEqual([]);
    });

    it('should use parameterized query with unitId', async () => {
      mockDb.query.mockResolvedValue([]);

      await repository.findProjectsByUnitId(1);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), { unitId: 1 });
    });
  });
});
