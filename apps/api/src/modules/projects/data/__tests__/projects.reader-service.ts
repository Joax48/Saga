import { ProjectsReaderService } from '../projects.reader-service';
import { ProjectsRepository } from '../projects.repository';

describe('ProjectsReaderService', () => {
  let service: ProjectsReaderService;
  let repository: jest.Mocked<ProjectsRepository>;

  beforeEach(() => {
    repository = {
      findPaginated: jest.fn(),
      findById: jest.fn(),
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
            projectManager: { id: 2, name: 'Koen Voorend' },
            code: 'C3992',
            name: 'El costo de una vida digna en Costa Rica',
            keywords: ['pobreza'],
            projectType: 'Proyecto',
            fundingType: 'Fondos internos',
            researchType: 'Basica',
            status: 'Activo',
            startDate: '2023-06-01',
            endDate: '2025-12-31',
          },
          {
            id: 2,
            projectManager: { id: 3, name: 'Shu Wei Chou Chen' },
            code: 'C4196',
            name: 'Analisis espacio-temporal del impacto de factores climaticos',
            keywords: ['clima'],
            projectType: 'Proyecto',
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
      expect(repository.findPaginated).toHaveBeenCalledWith(1, 10, undefined, undefined);
    });

    it('should expose the summary fields expected by the public list view', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: 3,
            projectManager: { id: 1, name: 'Alejandra Arias Salazar' },
            code: 'C3223',
            name: 'Metodologias para la estimacion de pobreza en areas pequenas',
            keywords: ['pobreza', 'estadistica'],
            projectType: 'Proyecto',
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
        projectManager: { id: 1, name: 'Alejandra Arias Salazar' },
        code: 'C3223',
        name: 'Metodologias para la estimacion de pobreza en areas pequenas',
        keywords: ['pobreza', 'estadistica'],
        projectType: 'Proyecto',
        researchType: 'Basica',
        startDate: '2023-04-07',
        endDate: '2024-12-31',
      });
      expect(result.items[0]).not.toHaveProperty('fundingType');
      expect(result.items[0]).not.toHaveProperty('status');
    });

    it('should delegate pagination parameters to the repository unchanged', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });

      await service.getPaginatedList(3, 25);

      expect(repository.findPaginated).toHaveBeenCalledWith(3, 25, undefined, undefined);
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
    it('should clamp to last valid page when requested page exceeds total pages', async () => {
      const lastPageItems = [
        {
          id: 5,
          projectManager: { id: 8, name: 'Carlos Andres Gomez Vargas' },
          code: 'A1001',
          name: 'Estudio de biodiversidad en humedales tropicales',
          keywords: ['biodiversidad'],
          projectType: 'Proyecto',
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
      );
      expect(repository.findPaginated).toHaveBeenNthCalledWith(
        2,
        2,
        2,
        'biodiversidad',
        undefined,
      );
    });

    it('should map the project detail to the frontend-friendly shape', async () => {
      repository.findById.mockResolvedValue({
        id: 1,
        projectManager: { id: 2, name: 'Koen Voorend' },
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
        manager: { id: 2, name: 'Koen Voorend' },
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
