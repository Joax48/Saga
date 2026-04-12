import { ProjectsReaderService } from '../projects.reader-service';
import { ProjectsRepository } from '../projects.repository';

describe('ProjectsReaderService', () => {
  let service: ProjectsReaderService;
  let repository: jest.Mocked<ProjectsRepository>;

  beforeEach(() => {
    repository = {
      findPaginated: jest.fn(),
    } as unknown as jest.Mocked<ProjectsRepository>;

    service = new ProjectsReaderService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaginatedList', () => {
    it('should return a paginated list with page, limit and total metadata', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: 1,
            code: 'C3992',
            name: 'El costo de una vida digna en Costa Rica',
            projectType: 'Humanistico',
            fundingType: 'Fondos internos',
            researchType: 'Basica',
            status: 'in-progress',
            startDate: '2023-06-01',
            endDate: '2025-12-31',
          },
          {
            id: 2,
            code: 'C4196',
            name: 'Analisis espacio-temporal del impacto de factores climaticos',
            projectType: 'Interdisciplinario',
            fundingType: 'Fondos externos',
            researchType: 'Basica',
            status: 'in-progress',
            startDate: '2024-01-01',
            endDate: '2026-12-15',
          },
        ],
        total: 12,
      };
      repository.findPaginated.mockResolvedValue(mockRepositoryResult);

      const result = await service.getPaginatedList(1, 10);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(12);
      expect(result.items).toHaveLength(2);
      expect(repository.findPaginated).toHaveBeenCalledWith(1, 10);
    });

    it('should strip internal fields and only expose public summary fields', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: 3,
            code: 'C3223',
            name: 'Metodologias para la estimacion de pobreza en areas pequenas',
            projectType: 'Interdisciplinario',
            fundingType: 'Fondos internos',
            researchType: 'Basica',
            status: 'in-progress',
            startDate: '2023-04-07',
            endDate: '2024-12-31',
          },
        ],
        total: 1,
      };
      repository.findPaginated.mockResolvedValue(mockRepositoryResult);

      const result = await service.getPaginatedList(1, 10);

      expect(result.items[0]).toEqual({
        code: 'C3223',
        name: 'Metodologias para la estimacion de pobreza en areas pequenas',
        projectType: 'Interdisciplinario',
        researchType: 'Basica',
        startDate: '2023-04-07',
        endDate: '2024-12-31',
      });
      expect(result.items[0]).not.toHaveProperty('id');
      expect(result.items[0]).not.toHaveProperty('fundingType');
      expect(result.items[0]).not.toHaveProperty('status');
    });

    it('should delegate pagination parameters to the repository unchanged', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });

      await service.getPaginatedList(3, 25);

      expect(repository.findPaginated).toHaveBeenCalledWith(3, 25);
      expect(repository.findPaginated).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when no projects match', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });

      const result = await service.getPaginatedList(1, 10);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
