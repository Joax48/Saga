import { ProjectsReaderService } from '../projects.reader-service';
import { ProjectsRepository } from '../projects.repository';

describe('ProjectsReaderService', () => {
  let service: ProjectsReaderService;
  let repository: jest.Mocked<ProjectsRepository>;

  beforeEach(() => {
    repository = {
      findPaginated: jest.fn(),
      findById: jest.fn(),
      findFilterOptions: jest.fn(),
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
            projectManager: {
              id: 11,
              name: 'Alice Manager',
            },
            code: 'C3992',
            name: 'El costo de una vida digna en Costa Rica',
            keywords: ['costo de vida', 'economia'],
            projectType: 'Humanistico',
            fundingType: 'Fondos internos',
            researchType: 'Basica',
            status: 'Activo',
            startDate: '2023-06-01',
            endDate: '2025-12-31',
          },
          {
            id: 2,
            projectManager: {
              id: 12,
              name: 'Bob Manager',
            },
            code: 'C4196',
            name: 'Analisis espacio-temporal del impacto de factores climaticos',
            keywords: ['clima', 'impacto'],
            projectType: 'Interdisciplinario',
            fundingType: 'Fondos externos',
            researchType: 'Basica',
            status: 'Activo',
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
      expect(repository.findPaginated).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should expose the summary fields expected by the public list view', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: 3,
            projectManager: {
              id: 13,
              name: 'Carla Manager',
            },
            code: 'C3223',
            name: 'Metodologias para la estimacion de pobreza en areas pequenas',
            keywords: ['pobreza', 'metodologias'],
            projectType: 'Interdisciplinario',
            fundingType: 'Fondos internos',
            researchType: 'Basica',
            status: 'Activo',
            startDate: '2023-04-07',
            endDate: '2024-12-31',
          },
        ],
        total: 1,
      };
      repository.findPaginated.mockResolvedValue(mockRepositoryResult);

      const result = await service.getPaginatedList(1, 10);

      expect(result.items[0]).toEqual({
        id: 3,
        projectManager: {
          id: 13,
          name: 'Carla Manager',
        },
        code: 'C3223',
        name: 'Metodologias para la estimacion de pobreza en areas pequenas',
        keywords: ['pobreza', 'metodologias'],
        projectType: 'Interdisciplinario',
        researchType: 'Basica',
        startDate: '2023-04-07',
        endDate: '2024-12-31',
      });
      expect(result.items[0]).not.toHaveProperty('fundingType');
      expect(result.items[0]).not.toHaveProperty('status');
    });

    it('should return an empty list when no projects match', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });

      const result = await service.getPaginatedList(1, 10);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should forward query, page and limit to repository', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: 1,
            projectManager: {
              id: 11,
              name: 'Alice Manager',
            },
            code: 'C3992',
            name: 'El costo de una vida digna en Costa Rica',
            keywords: ['costo de vida', 'economia'],
            projectType: 'Humanistico',
            fundingType: 'Fondos internos',
            researchType: 'Basica',
            status: 'in-progress',
            startDate: '2023-06-01',
            endDate: '2025-12-31',
          },
        ],
        total: 1,
      };
      repository.findPaginated.mockResolvedValue(mockRepositoryResult);

      const result = await service.getPaginatedList(1, 10, 'costo');

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(repository.findPaginated).toHaveBeenCalledWith(
        1,
        10,
        'costo',
        undefined,
        undefined,
      );
    });

    it('should delegate filter options query and filters to repository unchanged', async () => {
      const mockFilters = {
        researchType: [{ label: 'Basica', value: 'basica', count: 2 }],
        projectType: [{ label: 'Proyecto', value: 'proyecto', count: 1 }],
        startYear: [{ label: '2024', value: '2024', count: 3 }],
        status: [{ label: 'Activo', value: 'activo', count: 4 }],
        participants: [{ label: 'Koen Voorend', value: 'koen voorend', count: 1 }],
        keywords: [{ label: 'Economia', value: 'economia', count: 2 }],
      };

      repository.findFilterOptions.mockResolvedValue(mockFilters);

      const result = await service.getFilterOptions('clima', {
        researchType: ['Basica'],
        keywords: ['Economia'],
      });

      expect(result).toEqual(mockFilters);
      expect(repository.findFilterOptions).toHaveBeenCalledWith('clima', {
        researchType: ['Basica'],
        keywords: ['Economia'],
      });
      expect(repository.findFilterOptions).toHaveBeenCalledTimes(1);
    });

    it('should clamp to last valid page when requested page exceeds total pages', async () => {
      const lastPageItems = [
        {
          id: 5,
          projectManager: {
            id: 15,
            name: 'Diego Manager',
          },
          code: 'A1001',
          name: 'Estudio de biodiversidad en humedales tropicales',
          keywords: ['biodiversidad', 'humedales'],
          projectType: 'Interdisciplinario',
          fundingType: 'Fondos internos',
          researchType: 'Basica',
          status: 'Activo',
          startDate: '2024-03-01',
          endDate: '2026-06-30',
        },
      ];
      repository.findPaginated
        .mockResolvedValueOnce({ items: [], total: 3 })
        .mockResolvedValueOnce({ items: lastPageItems, total: 3 });

      const result = await service.getPaginatedList(5, 2, 'biodiversidad');

      expect(result.page).toBe(2);
      expect(result.items).toHaveLength(1);
      expect(repository.findPaginated).toHaveBeenCalledTimes(2);
      expect(repository.findPaginated).toHaveBeenNthCalledWith(
        1,
        5,
        2,
        'biodiversidad',
        undefined,
        undefined,
      );
      expect(repository.findPaginated).toHaveBeenNthCalledWith(
        2,
        2,
        2,
        'biodiversidad',
        undefined,
        undefined,
      );
    });

    it('should not clamp when requested page is within range', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: 1,
            projectManager: {
              id: 11,
              name: 'Alice Manager',
            },
            code: 'C3992',
            name: 'El costo de una vida digna en Costa Rica',
            keywords: ['costo de vida', 'economia'],
            projectType: 'Humanistico',
            fundingType: 'Fondos internos',
            researchType: 'Basica',
            status: 'in-progress',
            startDate: '2023-06-01',
            endDate: '2025-12-31',
          },
        ],
        total: 5,
      };
      repository.findPaginated.mockResolvedValue(mockRepositoryResult);

      const result = await service.getPaginatedList(1, 5, 'costo');

      expect(result.page).toBe(1);
      expect(repository.findPaginated).toHaveBeenCalledTimes(1);
    });

    it('should map the project detail to the frontend-friendly shape', async () => {
      repository.findById.mockResolvedValue({
        id: '1',
        projectManager: {
          id: 2,
          name: 'Koen Voorend',
          participationStartDate: '2023-01-01',
          participationEndDate: '2024-12-31',
        },
        code: 'C3992',
        name: 'El costo de una vida digna en Costa Rica',
        description: 'Descripcion del proyecto',
        unit: { id: 15, name: 'Instituto de Investigaciones Sociales' },
        disciplines: ['Ciencias Sociales', 'Estadistica'],
        keywords: ['pobreza', 'economia social'],
        projectType: 'Proyecto',
        fundingType: 'Financiamiento UCREA',
        researchType: 'Basica',
        status: 'Vencido',
        startDate: '2023-06-01',
        endDate: '2025-12-31',
        associatedProfiles: [
          { id: 2, name: 'Koen Voorend', role: 'Investigador principal' },
          { id: 12, name: 'Maria Perez', role: 'Co-investigadora' },
        ],
      });

      const result = await service.getById('1');

      expect(result).toEqual({
        id: '1',
        code: 'C3992',
        title: 'El costo de una vida digna en Costa Rica',
        description: 'Descripcion del proyecto',
        manager: {
          id: 2,
          name: 'Koen Voorend',
          participationStartDate: '2023-01-01',
          participationEndDate: '2024-12-31',
        },
        unit: { id: 15, name: 'Instituto de Investigaciones Sociales' },
        disciplines: ['Ciencias Sociales', 'Estadistica'],
        researchType: 'Basica',
        projectType: 'Proyecto',
        fundingType: 'Financiamiento UCREA',
        status: 'Vencido',
        startDate: '2023-06-01',
        endDate: '2025-12-31',
        keywords: ['pobreza', 'economia social'],
        associatedProfiles: [
          { id: '2', name: 'Koen Voorend', role: 'Investigador principal' },
          { id: '12', name: 'Maria Perez', role: 'Co-investigadora' },
        ],
      });
    });

    it('should return null when the repository does not find the project detail', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getById('999')).resolves.toBeNull();
    });
  });
});
