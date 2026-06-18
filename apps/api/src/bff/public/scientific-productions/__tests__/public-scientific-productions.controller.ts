import { PublicScientificProductionsController } from '../public-scientific-productions.controller';
import { GetScientificProductionDetailUseCase } from '../../../../application/use-cases/get-public-scientific-production-detail.use-case';
import { GetScientificProductionPaginatedListUseCase } from '../../../../application/use-cases/get-public-scientific-productions-paginated-list.use-case';
import { GetScientificProductionsFiltersUseCase } from '../../../../application/use-cases/get-public-scientific-production-filters.use-case';

describe('PublicScientificProductionsController', () => {
  let controller: PublicScientificProductionsController;
  let listUseCase: jest.Mocked<GetScientificProductionPaginatedListUseCase>;
  let detailUseCase: jest.Mocked<GetScientificProductionDetailUseCase>;
  let filtersUseCase: jest.Mocked<GetScientificProductionsFiltersUseCase>;

  beforeEach(() => {
    listUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetScientificProductionPaginatedListUseCase>;

    detailUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetScientificProductionDetailUseCase>;

    filtersUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetScientificProductionsFiltersUseCase>;

    controller = new PublicScientificProductionsController(
      listUseCase,
      detailUseCase,
      filtersUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getScientificProductionsPaginatedList', () => {
    it('should return paginated list', async () => {
      const mockResponse = {
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      };

      listUseCase.execute.mockResolvedValue(mockResponse);

      await expect(
        controller.getScientificProductionsPaginatedList({
          page: 1,
          limit: 10,
        } as any),
      ).resolves.toEqual(mockResponse);
    });

    it('should forward params correctly', async () => {
      listUseCase.execute.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      const query = {
        page: 1,
        limit: 10,
        q: 'investigación',
      };

      await controller.getScientificProductionsPaginatedList(query as any);

      expect(listUseCase.execute).toHaveBeenCalledWith(query);
    });

    it('should propagate database errors', async () => {
      listUseCase.execute.mockRejectedValue(new Error('Database error'));

      await expect(
        controller.getScientificProductionsPaginatedList({
          page: 1,
          limit: 10,
        } as any),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getScientificProductionsDetail', () => {
    it('should return detail', async () => {
      const mockDetail = {
        id: '1',
        title: 'Test Publication',
        ucrAuthors: [],
        externalAuthors: [],
        unit: [],
        affiliations: [],
        type: 'Article',
        openAccess: true,
        publicationYear: 2025,
        abstract: null,
        doi: null,
        journal: null,
        volume: null,
        issue: null,
        pages: null,
        citationCount: null,
        source: 'Scopus',
        keywords: [],
      };

      detailUseCase.execute.mockResolvedValue(mockDetail);

      await expect(controller.getScientificProductionDetail('1')).resolves.toEqual(
        mockDetail,
      );

      expect(detailUseCase.execute).toHaveBeenCalledWith('1');
    });

    it('should propagate detail errors', async () => {
      detailUseCase.execute.mockRejectedValue(new Error('Database error'));

      await expect(controller.getScientificProductionDetail('1')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getScientificProductionsFilters', () => {
    it('should return filters', async () => {
      const filtersResponse = {
        years: [
          {
            value: '2025',
            label: '2025',
            count: 1,
          },
        ],
      };

      filtersUseCase.execute.mockResolvedValue(filtersResponse);

      await expect(
        controller.getScientificProductionsFilters({} as any),
      ).resolves.toEqual(filtersResponse);
      expect(filtersUseCase.execute).toHaveBeenCalledWith({});
    });
  });

  it('should propagate filters errors', async () => {
    filtersUseCase.execute.mockRejectedValue(new Error('Database error'));

    await expect(controller.getScientificProductionsFilters({} as any)).rejects.toThrow(
      'Database error',
    );
  });
});
