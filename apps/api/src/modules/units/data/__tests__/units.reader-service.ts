import { UnitsReaderService } from '../units.reader-service';
import { UnitsRepository } from '../units.repository';
import type { Unit } from '../../unit.entity';

describe('UnitsReaderService', () => {
  let readerService: UnitsReaderService;
  let unitsRepository: jest.Mocked<UnitsRepository>;

  beforeEach(() => {
    unitsRepository = {
      findPaginated: jest.fn(),
      findById: jest.fn(),
      findProfilesByUnitId: jest.fn(),
      findScientificProductionsByUnitId: jest.fn(),
      findProjectsByUnitId: jest.fn(),
    } as unknown as jest.Mocked<UnitsRepository>;

    readerService = new UnitsReaderService(unitsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return a mapped UnitDetailDto when the unit exists', async () => {
      const mockUnit: Unit = {
        id: 1,
        isPartOf: null,
        name: 'Escuela de Física',
        description: 'Investigación en física teórica y experimental.',
        email: 'physics@ucr.ac.cr',
        pageUrl: 'https://www.ucr.ac.cr',
        phoneNumber: '+506 2511-0000',
      };
      unitsRepository.findById.mockResolvedValue(mockUnit);

      const result = await readerService.getById(1);

      expect(result).toEqual({
        id: 1,
        name: 'Escuela de Física',
        description: 'Investigación en física teórica y experimental.',
        email: 'physics@ucr.ac.cr',
        pageUrl: 'https://www.ucr.ac.cr',
        phoneNumber: '+506 2511-0000',
      });
      expect(unitsRepository.findById).toHaveBeenCalledWith(1);
      expect(unitsRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return null when the unit does not exist', async () => {
      unitsRepository.findById.mockResolvedValue(null);

      const result = await readerService.getById(99999);

      expect(result).toBeNull();
      expect(unitsRepository.findById).toHaveBeenCalledWith(99999);
    });
  });

  describe('getProfilesByUnitId', () => {
    it('should return profiles from repository', async () => {
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
          photoUrl: null,
        },
      ];
      unitsRepository.findProfilesByUnitId.mockResolvedValue(mockProfiles);

      const result = await readerService.getProfilesByUnitId(1);

      expect(result).toEqual(mockProfiles);
      expect(unitsRepository.findProfilesByUnitId).toHaveBeenCalledWith(1);
      expect(unitsRepository.findProfilesByUnitId).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when unit has no profiles', async () => {
      unitsRepository.findProfilesByUnitId.mockResolvedValue([]);

      const result = await readerService.getProfilesByUnitId(99999);

      expect(result).toEqual([]);
    });
  });

  describe('getScientificProductionsByUnitId', () => {
    it('should return scientific productions from repository', async () => {
      const mockProductions = [
        {
          id: 'sp1',
          title: 'Nuevo Enfoque en Corrección de Errores Cuánticos',
          authors: JSON.stringify([{ id: 1, name: 'Dr. Carlos Ramírez' }]),
          type: 'Article',
          openAccess: 1,
          publicationYear: 2024,
          doi: null,
          journal: null,
          volume: null,
          issue: null,
          pages: null,
          source: 'Scopus',
          keywords: JSON.stringify([{ id: 1, value: 'Cuántica' }]),
        },
      ];
      unitsRepository.findScientificProductionsByUnitId.mockResolvedValue(
        mockProductions,
      );

      const result = await readerService.getScientificProductionsByUnitId(1);

      expect(result).toEqual([
        {
          ...mockProductions[0],
          authors: [{ id: 1, name: 'Dr. Carlos Ramírez' }],
          keywords: [{ id: 1, value: 'Cuántica' }],
        },
      ]);
      expect(unitsRepository.findScientificProductionsByUnitId).toHaveBeenCalledWith(1);
      expect(unitsRepository.findScientificProductionsByUnitId).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when unit has no scientific productions', async () => {
      unitsRepository.findScientificProductionsByUnitId.mockResolvedValue([]);

      const result = await readerService.getScientificProductionsByUnitId(99999);

      expect(result).toEqual([]);
    });

    it('should decode scientific production JSON returned as UTF-8 BLOBs', async () => {
      unitsRepository.findScientificProductionsByUnitId.mockResolvedValue([
        {
          id: 'sp1',
          title: 'Producción científica',
          authors: Buffer.from(JSON.stringify([{ id: 1, name: 'María López' }]), 'utf8'),
          type: 'Article',
          openAccess: 1,
          publicationYear: 2024,
          doi: null,
          journal: null,
          volume: null,
          issue: null,
          pages: null,
          source: 'Scopus',
          keywords: Buffer.from(JSON.stringify([{ id: 1, value: 'Educación' }]), 'utf8'),
        },
      ]);

      const result = await readerService.getScientificProductionsByUnitId(1);

      expect(result[0].authors).toEqual([{ id: 1, name: 'María López' }]);
      expect(result[0].keywords).toEqual([{ id: 1, value: 'Educación' }]);
    });
  });

  describe('getProjectsByUnitId', () => {
    it('should return projects from repository', async () => {
      // Arrange
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
      unitsRepository.findProjectsByUnitId.mockResolvedValue(mockProjects);

      const result = await readerService.getProjectsByUnitId(1);

      expect(result).toEqual(mockProjects);
      expect(unitsRepository.findProjectsByUnitId).toHaveBeenCalledWith(1);
      expect(unitsRepository.findProjectsByUnitId).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when unit has no projects', async () => {
      unitsRepository.findProjectsByUnitId.mockResolvedValue([]);

      const result = await readerService.getProjectsByUnitId(99999);

      expect(result).toEqual([]);
    });
  });
});
