import { SearchPublicProjectsUseCase } from '../search-public-projects.use-case';
import type { ProjectsReader } from '../../../modules/projects/projects.reader.contract';

describe('SearchPublicProjectsUseCase', () => {
  let useCase: SearchPublicProjectsUseCase;
  let projectsReader: jest.Mocked<ProjectsReader>;

  beforeEach(() => {
    projectsReader = {
      searchByNameOrCode: jest.fn(),
    } as unknown as jest.Mocked<ProjectsReader>;

    useCase = new SearchPublicProjectsUseCase(projectsReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return matching projects with pagination metadata', async () => {
      const mockReaderResult = {
        items: [
          {
            code: 'C3992',
            name: 'El costo de una vida digna en Costa Rica',
            projectType: 'Humanistico',
            researchType: 'Basica',
            startDate: '2023-06-01',
            endDate: '2025-12-31',
          },
          {
            code: 'C4196',
            name: 'Analisis espacio-temporal del impacto de factores climaticos',
            projectType: 'Interdisciplinario',
            researchType: 'Basica',
            startDate: '2024-01-01',
            endDate: '2026-12-15',
          },
        ],
        page: 1,
        limit: 10,
        total: 2,
      };
      projectsReader.searchByNameOrCode.mockResolvedValue(mockReaderResult);

      const result = await useCase.execute({ q: 'costo', page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(2);
      expect(projectsReader.searchByNameOrCode).toHaveBeenCalledWith('costo', 1, 10);
    });

    it('should map each item to the ProjectSummaryResponseDto format', async () => {
      const mockReaderResult = {
        items: [
          {
            code: 'B0661',
            name: 'Gestion de iniciativas de produccion agroecoturisticas sostenibles',
            projectType: 'Interdisciplinario',
            researchType: 'Aplicada',
            startDate: '2010-01-01',
            endDate: '2011-12-15',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      };
      projectsReader.searchByNameOrCode.mockResolvedValue(mockReaderResult);

      const result = await useCase.execute({
        q: 'agroecoturisticas',
        page: 1,
        limit: 10,
      });

      expect(result.items[0]).toEqual({
        code: 'B0661',
        name: 'Gestion de iniciativas de produccion agroecoturisticas sostenibles',
        projectType: 'Interdisciplinario',
        researchType: 'Aplicada',
        startDate: '2010-01-01',
        endDate: '2011-12-15',
      });
    });

    it('should forward query, page and limit to the projects reader', async () => {
      projectsReader.searchByNameOrCode.mockResolvedValue({
        items: [],
        page: 2,
        limit: 5,
        total: 8,
      });

      await useCase.execute({ q: 'clima', page: 2, limit: 5 });

      expect(projectsReader.searchByNameOrCode).toHaveBeenCalledWith('clima', 2, 5);
      expect(projectsReader.searchByNameOrCode).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when no projects match the search', async () => {
      projectsReader.searchByNameOrCode.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      const result = await useCase.execute({ q: 'xyznonexistent', page: 1, limit: 10 });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should propagate database connection errors', async () => {
      projectsReader.searchByNameOrCode.mockRejectedValue(
        new Error('Connection to database lost'),
      );

      await expect(useCase.execute({ q: 'costo', page: 1, limit: 10 })).rejects.toThrow(
        'Connection to database lost',
      );
    });

    it('should allow searching by project code', async () => {
      const mockReaderResult = {
        items: [
          {
            code: 'C3992',
            name: 'El costo de una vida digna en Costa Rica',
            projectType: 'Humanistico',
            researchType: 'Basica',
            startDate: '2023-06-01',
            endDate: '2025-12-31',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      };
      projectsReader.searchByNameOrCode.mockResolvedValue(mockReaderResult);

      const result = await useCase.execute({ q: 'C3992', page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].code).toBe('C3992');
      expect(projectsReader.searchByNameOrCode).toHaveBeenCalledWith('C3992', 1, 10);
    });
  });
});
