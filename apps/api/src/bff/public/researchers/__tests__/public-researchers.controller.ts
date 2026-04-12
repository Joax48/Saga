import { PublicResearchersController } from '../public-researchers.controller';
import { GetResearchersPaginatedListUseCase } from '../../../../application/use-cases/get-public-researchers-paginated-list.use-case';
import { ResearchersListRequestDto } from '../dtos/researchers-list-request.dto';

describe('PublicResearchersController', () => {
  let controller: PublicResearchersController;
  let useCase: jest.Mocked<GetResearchersPaginatedListUseCase>;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetResearchersPaginatedListUseCase>;

    controller = new PublicResearchersController(useCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getResearchersPaginatedList', () => {
    it('should return the paginated researcher list from the use case', async () => {
      const mockQuery = new ResearchersListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      const mockResponse = {
        items: [
          {
            id: 'a1b2c3',
            idUcrProfile: 'B12345',
            baseUnit: 'CIMPA',
            name: 'Luis',
            firstSurname: 'Mora',
            secondSurname: 'Jimenez',
            ceaCategory: 'Investigador Asociado',
            orcidId: '0000-0001-2345-6789',
            linkedin: null,
            researchGate: null,
            scopus: null,
            photoUrl: null,
          },
          {
            id: 'd4e5f6',
            idUcrProfile: 'C67890',
            baseUnit: 'CIBCM',
            name: 'Ana',
            firstSurname: 'Vargas',
            secondSurname: 'Solano',
            ceaCategory: null,
            orcidId: null,
            linkedin: 'https://linkedin.com/in/ana-vargas',
            researchGate: null,
            scopus: null,
            photoUrl: 'https://example.com/photo.jpg',
          },
        ],
        page: 1,
        limit: 10,
        total: 2,
      };
      useCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.getResearchersPaginatedList(mockQuery);

      expect(result).toEqual(mockResponse);
      expect(useCase.execute).toHaveBeenCalledWith(mockQuery);
      expect(useCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should forward pagination parameters to the use case', async () => {
      const mockQuery = new ResearchersListRequestDto();
      mockQuery.page = 3;
      mockQuery.limit = 5;
      useCase.execute.mockResolvedValue({
        items: [],
        page: 3,
        limit: 5,
        total: 20,
      });

      await controller.getResearchersPaginatedList(mockQuery);

      expect(useCase.execute).toHaveBeenCalledWith(mockQuery);
    });

    it('should forward the name filter parameter to the use case', async () => {
      const mockQuery = new ResearchersListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      mockQuery.name = 'Luis';
      useCase.execute.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      await controller.getResearchersPaginatedList(mockQuery);

      expect(useCase.execute).toHaveBeenCalledWith(mockQuery);
    });

    it('should return an empty list when no researchers exist', async () => {
      const mockQuery = new ResearchersListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      useCase.execute.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      const result = await controller.getResearchersPaginatedList(mockQuery);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should propagate database errors to the exception layer', async () => {
      const mockQuery = new ResearchersListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      useCase.execute.mockRejectedValue(new Error('Connection to database lost'));

      await expect(controller.getResearchersPaginatedList(mockQuery)).rejects.toThrow(
        'Connection to database lost',
      );
    });
  });
});
