import { GetProjectsPaginatedListUseCase } from '../get-public-projects-paginated-list.use-case';
import type { ProjectsReader } from '../../../modules/projects/projects.reader.contract';

describe('GetProjectsPaginatedListUseCase', () => {
  let useCase: GetProjectsPaginatedListUseCase;
  let projectsReader: jest.Mocked<ProjectsReader>;

  beforeEach(() => {
    projectsReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
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
            id: 1,
            projectManager: {
              id: 101,
              name: 'Alice Manager',
            },
            code: 'C3992',
            name: 'El costo de una vida digna en Costa Rica',
            keywords: ['costo de vida', 'economia'],
            projectType: 'Humanistico',
            researchType: 'Basica',
            startDate: '2023-06-01',
            endDate: '2025-12-31',
          },
          {
            id: 2,
            projectManager: {
              id: 102,
              name: 'Bob Manager',
            },
            code: 'C4196',
            name: 'Analisis espacio-temporal del impacto de factores climaticos',
            keywords: ['clima', 'impacto'],
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
      expect(projectsReader.getPaginatedList).toHaveBeenCalledWith(1, 10, undefined, {
        researchType: undefined,
        projectType: undefined,
        startYear: undefined,
        status: undefined,
        participants: undefined,
        keywords: undefined,
      });
    });

    it('should map each item to the ProjectSummaryResponseDto format', async () => {
      const mockReaderResult = {
        items: [
          {
            id: 7,
            projectManager: {
              id: 201,
              name: 'Carla Manager',
            },
            code: 'B0661',
            name: 'Gestion de iniciativas de produccion agroecoturisticas sostenibles',
            keywords: ['agroecoturisticas', 'sostenibles'],
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
        id: 7,
        projectManager: {
          id: 201,
          name: 'Carla Manager',
        },
        code: 'B0661',
        name: 'Gestion de iniciativas de produccion agroecoturisticas sostenibles',
        keywords: ['agroecoturisticas', 'sostenibles'],
        projectType: 'Interdisciplinario',
        researchType: 'Aplicada',
        startDate: '2010-01-01',
        endDate: '2011-12-15',
      });
    });

    it('should forward pagination, search, and filters to the projects reader', async () => {
      projectsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 3,
        limit: 5,
        total: 12,
      });

      await useCase.execute({
        page: 3,
        limit: 5,
        q: 'clima',
        researchType: ['basica'],
        projectType: ['proyecto'],
        startYear: ['2024'],
        status: ['activo'],
        participants: ['shu wei chou chen'],
        keywords: ['clima'],
      });

      expect(projectsReader.getPaginatedList).toHaveBeenCalledWith(3, 5, 'clima', {
        researchType: ['basica'],
        projectType: ['proyecto'],
        startYear: ['2024'],
        status: ['activo'],
        participants: ['shu wei chou chen'],
        keywords: ['clima'],
      });
      expect(projectsReader.getPaginatedList).toHaveBeenCalledTimes(1);
    });

    it('should forward query, page and limit to the projects reader', async () => {
      projectsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      await useCase.execute({ page: 1, limit: 10, q: 'clima' });

      expect(projectsReader.getPaginatedList).toHaveBeenCalledWith(1, 10, 'clima', {
        researchType: undefined,
        projectType: undefined,
        startYear: undefined,
        status: undefined,
        participants: undefined,
        keywords: undefined,
      });
      expect(projectsReader.getPaginatedList).toHaveBeenCalledTimes(1);
    });

    it('should forward all filters to the projects reader', async () => {
      projectsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      await useCase.execute({
        page: 1,
        limit: 10,
        q: 'clima',
        researchType: ['Basica'],
        projectType: ['Interdisciplinario'],
        startYear: ['2024'],
        status: ['in-progress'],
        participants: ['Alice Manager'],
        keywords: ['impacto'],
      });

      expect(projectsReader.getPaginatedList).toHaveBeenCalledWith(1, 10, 'clima', {
        researchType: ['Basica'],
        projectType: ['Interdisciplinario'],
        startYear: ['2024'],
        status: ['in-progress'],
        participants: ['Alice Manager'],
        keywords: ['impacto'],
      });
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
