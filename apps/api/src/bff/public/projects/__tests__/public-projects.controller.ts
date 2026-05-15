import { PublicProjectsController } from '../public-projects.controller';
import { GetProjectDetailUseCase } from '../../../../application/use-cases/get-public-project-detail.use-case';
import { GetProjectsFiltersUseCase } from '../../../../application/use-cases/get-public-projects-filters.use-case';
import { GetProjectsPaginatedListUseCase } from '../../../../application/use-cases/get-public-projects-paginated-list.use-case';
import { ProjectsListRequestDto } from '../dtos/projects-list-request.dto';
import { ProjectsFiltersRequestDto } from '../dtos/projects-filters-request.dto';

describe('PublicProjectsController', () => {
  let controller: PublicProjectsController;
  let listUseCase: jest.Mocked<GetProjectsPaginatedListUseCase>;
  let filtersUseCase: jest.Mocked<GetProjectsFiltersUseCase>;
  let detailUseCase: jest.Mocked<GetProjectDetailUseCase>;

  beforeEach(() => {
    listUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetProjectsPaginatedListUseCase>;

    filtersUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetProjectsFiltersUseCase>;

    detailUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetProjectDetailUseCase>;

    controller = new PublicProjectsController(listUseCase, filtersUseCase, detailUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectsPaginatedList', () => {
    it('should return the paginated project list from the use case', async () => {
      const mockQuery = new ProjectsListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      const mockResponse = {
        items: [
          {
            id: 1,
            projectManager: { id: 2, name: 'Koen Voorend' },
            code: 'C3992',
            name: 'El costo de una vida digna en Costa Rica',
            keywords: ['pobreza'],
            projectType: 'Proyecto',
            researchType: 'Basica',
            startDate: '2023-06-01',
            endDate: '2025-12-31',
          },
          {
            id: 8,
            projectManager: { id: 4, name: 'Daniel Jose Alvarado Abarca' },
            code: 'B0661',
            name: 'Gestion de iniciativas de produccion agroecoturisticas sostenibles',
            keywords: ['sostenibilidad'],
            projectType: 'Accion',
            researchType: 'Aplicada',
            startDate: '2010-01-01',
            endDate: '2011-12-15',
          },
        ],
        page: 1,
        limit: 10,
        total: 12,
      };
      listUseCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.getProjectsPaginatedList(mockQuery);

      expect(result).toEqual(mockResponse);
      expect(listUseCase.execute).toHaveBeenCalledWith(mockQuery);
      expect(listUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when no projects exist', async () => {
      const mockQuery = new ProjectsListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      listUseCase.execute.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      const result = await controller.getProjectsPaginatedList(mockQuery);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should propagate database errors to the exception layer', async () => {
      const mockQuery = new ProjectsListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      listUseCase.execute.mockRejectedValue(new Error('Connection to database lost'));

      await expect(controller.getProjectsPaginatedList(mockQuery)).rejects.toThrow(
        'Connection to database lost',
      );
    });
  });

  describe('getProjectsFilters', () => {
    it('should return the filter options from the use case', async () => {
      const mockQuery = new ProjectsFiltersRequestDto();
      mockQuery.researchType = ['Basica'];

      const mockResponse = {
        researchType: [{ label: 'Basica', value: 'basica', count: 2 }],
        projectType: [{ label: 'Proyecto', value: 'proyecto', count: 3 }],
        startYear: [{ label: '2024', value: '2024', count: 1 }],
        status: [{ label: 'Activo', value: 'activo', count: 4 }],
        participants: [{ label: 'Koen Voorend', value: 'koen voorend', count: 1 }],
        keywords: [{ label: 'Economia', value: 'economia', count: 5 }],
      };

      filtersUseCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.getProjectsFilters(mockQuery);

      expect(result).toEqual(mockResponse);
      expect(filtersUseCase.execute).toHaveBeenCalledWith(mockQuery);
      expect(filtersUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProjectDetail', () => {
    it('should return the project detail from the use case', async () => {
      const mockResponse = {
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
        keywords: ['pobreza'],
        associatedProfiles: [
          { id: '2', name: 'Koen Voorend', role: 'Investigador principal' },
        ],
      };
      detailUseCase.execute.mockResolvedValue(mockResponse);

      await expect(controller.getProjectDetail('1')).resolves.toEqual(mockResponse);
      expect(detailUseCase.execute).toHaveBeenCalledWith('1');
    });
  });
});
