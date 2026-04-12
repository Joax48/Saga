import { ResearchersReaderService } from '../researchers.reader-service';
import { ResearchersRepository } from '../researchers.repository';

describe('ResearchersReaderService', () => {
  let service: ResearchersReaderService;
  let repository: jest.Mocked<ResearchersRepository>;

  beforeEach(() => {
    repository = {
      findPaginated: jest.fn(),
    } as unknown as jest.Mocked<ResearchersRepository>;

    service = new ResearchersReaderService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaginatedList', () => {
    it('should return a paginated list with page, limit and total metadata', async () => {
      const mockRepositoryResult = {
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
        total: 25,
      };
      repository.findPaginated.mockResolvedValue(mockRepositoryResult);

      const result = await service.getPaginatedList(1, 10);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(25);
      expect(result.items).toHaveLength(2);
      expect(repository.findPaginated).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('should map all researcher fields from the repository to the response', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: 'g7h8i9',
            idUcrProfile: 'D11111',
            baseUnit: 'CIPRONA',
            name: 'Carlos',
            firstSurname: 'Solano',
            secondSurname: 'Quesada',
            ceaCategory: 'Investigador Principal',
            orcidId: '0000-0002-9876-5432',
            linkedin: 'https://linkedin.com/in/carlos-solano',
            researchGate: 'https://researchgate.net/profile/carlos-solano',
            scopus: '123456789',
            photoUrl: 'https://example.com/carlos.jpg',
          },
        ],
        total: 1,
      };
      repository.findPaginated.mockResolvedValue(mockRepositoryResult);

      const result = await service.getPaginatedList(1, 10);

      expect(result.items[0]).toEqual({
        id: 'g7h8i9',
        idUcrProfile: 'D11111',
        baseUnit: 'CIPRONA',
        name: 'Carlos',
        firstSurname: 'Solano',
        secondSurname: 'Quesada',
        ceaCategory: 'Investigador Principal',
        orcidId: '0000-0002-9876-5432',
        linkedin: 'https://linkedin.com/in/carlos-solano',
        researchGate: 'https://researchgate.net/profile/carlos-solano',
        scopus: '123456789',
        photoUrl: 'https://example.com/carlos.jpg',
      });
    });

    it('should delegate pagination parameters to the repository unchanged', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });

      await service.getPaginatedList(4, 20);

      expect(repository.findPaginated).toHaveBeenCalledWith(4, 20, undefined);
      expect(repository.findPaginated).toHaveBeenCalledTimes(1);
    });

    it('should forward the optional name filter to the repository', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });

      await service.getPaginatedList(1, 10, 'Luis');

      expect(repository.findPaginated).toHaveBeenCalledWith(1, 10, 'Luis');
      expect(repository.findPaginated).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when no researchers exist', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });

      const result = await service.getPaginatedList(1, 10);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should use page and limit from input parameters, not from the repository result', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });

      const result = await service.getPaginatedList(3, 15);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(15);
    });
  });
});
