import { PublicProjectsController } from '../public-projects.controller';
import { GetProjectsPaginatedListUseCase } from '../../../../application/use-cases/get-public-projects-paginated-list.use-case';
import { PaginatedListRequestDto } from '../../common/dtos/paginated-list-request.dto';

describe('PublicProjectsController', () => {
  let controller: PublicProjectsController;
  let useCase: jest.Mocked<GetProjectsPaginatedListUseCase>;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetProjectsPaginatedListUseCase>;

    controller = new PublicProjectsController(useCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectsPaginatedList', () => {
    it('should return the paginated project list from the use case', async () => {
      const mockQuery = new PaginatedListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      const mockResponse = {
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
        total: 12,
      };
      useCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.getProjectsPaginatedList(mockQuery);

      expect(result).toEqual(mockResponse);
      expect(useCase.execute).toHaveBeenCalledWith(mockQuery);
      expect(useCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should forward pagination parameters to the use case', async () => {
      const mockQuery = new PaginatedListRequestDto();
      mockQuery.page = 2;
      mockQuery.limit = 10;
      useCase.execute.mockResolvedValue({
        items: [],
        page: 2,
        limit: 10,
        total: 12,
      });

      await controller.getProjectsPaginatedList(mockQuery);

      expect(useCase.execute).toHaveBeenCalledWith(mockQuery);
    });

    it('should return an empty list when no projects exist', async () => {
      const mockQuery = new PaginatedListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      useCase.execute.mockResolvedValue({
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
      const mockQuery = new PaginatedListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      useCase.execute.mockRejectedValue(new Error('Connection to database lost'));

      await expect(controller.getProjectsPaginatedList(mockQuery)).rejects.toThrow(
        'Connection to database lost',
      );
    });
  });
});
