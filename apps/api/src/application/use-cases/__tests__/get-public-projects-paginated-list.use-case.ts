import { GetProjectsPaginatedListUseCase } from '../get-public-projects-paginated-list.use-case';
import type { ProjectsReader } from '../../../modules/projects/projects.reader.contract';

describe('GetProjectsPaginatedListUseCase', () => {
  let useCase: GetProjectsPaginatedListUseCase;
  let projectsReader: jest.Mocked<ProjectsReader>;

  beforeEach(() => {
    projectsReader = {
      getPaginatedList: jest.fn(),
    } as unknown as jest.Mocked<ProjectsReader>;

    useCase = new GetProjectsPaginatedListUseCase(projectsReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return the paginated list with metadata from the reader', async () => {
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
        total: 12,
      };
      projectsReader.getPaginatedList.mockResolvedValue(mockReaderResult);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(12);
      expect(projectsReader.getPaginatedList).toHaveBeenCalledWith(1, 10);
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
      projectsReader.getPaginatedList.mockResolvedValue(mockReaderResult);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result.items[0]).toEqual({
        code: 'B0661',
        name: 'Gestion de iniciativas de produccion agroecoturisticas sostenibles',
        projectType: 'Interdisciplinario',
        researchType: 'Aplicada',
        startDate: '2010-01-01',
        endDate: '2011-12-15',
      });
    });

    it('should forward page and limit to the projects reader', async () => {
      projectsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 3,
        limit: 5,
        total: 12,
      });

      await useCase.execute({ page: 3, limit: 5 });

      expect(projectsReader.getPaginatedList).toHaveBeenCalledWith(3, 5);
      expect(projectsReader.getPaginatedList).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when no projects are available', async () => {
      projectsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should propagate database connection errors', async () => {
      projectsReader.getPaginatedList.mockRejectedValue(
        new Error('Connection to database lost'),
      );

      await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow(
        'Connection to database lost',
      );
    });
  });
});
