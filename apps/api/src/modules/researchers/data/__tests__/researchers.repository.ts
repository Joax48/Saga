import { ResearchersRepository } from '../researchers.repository';
import type { DatabaseService } from '../../../../common/database/database.service';

type DatabaseServiceMock = {
  query: jest.Mock;
};

describe('ResearchersRepository', () => {
  let repository: ResearchersRepository;
  let mockDb: DatabaseServiceMock;

  beforeEach(() => {
    mockDb = { query: jest.fn() };
    repository = new ResearchersRepository(mockDb as unknown as DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPaginated (without name filter)', () => {
    it('should return items and total count', async () => {
      const mockItems = [
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
      ];
      const mockCount = [{ totalCount: 30 }];

      mockDb.query.mockResolvedValueOnce(mockItems).mockResolvedValueOnce(mockCount);

      const result = await repository.findPaginated(1, 10);

      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(30);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should apply zero offset on the first page', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 5 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LIMIT 10');
      expect(itemsQuery).toContain('OFFSET 0');
    });

    it('should apply correct offset when navigating to page 2', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 20 }]);

      await repository.findPaginated(2, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LIMIT 10');
      expect(itemsQuery).toContain('OFFSET 10');
    });

    it('should calculate offset correctly for small page sizes', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 20 }]);

      await repository.findPaginated(3, 5);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LIMIT 5');
      expect(itemsQuery).toContain('OFFSET 10');
    });

    it('should order results by name, first_surname and second_surname when no filter', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('ORDER BY Researcher.name ASC');
      expect(itemsQuery).toContain('Researcher.first_surname ASC');
      expect(itemsQuery).toContain('Researcher.second_surname ASC');
    });

    it('should not include a WHERE clause when no name filter is provided', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).not.toContain('WHERE');
    });

    it('should handle an empty database gracefully', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      const result = await repository.findPaginated(1, 10);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should default total to 0 if count query returns no rows', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await repository.findPaginated(1, 10);

      expect(result.total).toBe(0);
    });

    it('should default total to 0 if totalCount is undefined', async () => {
      mockDb.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: undefined }]);

      const result = await repository.findPaginated(1, 10);

      expect(result.total).toBe(0);
    });
  });

  describe('findPaginated (with name filter)', () => {
    it('should return matching researchers and filtered total count', async () => {
      const mockItems = [
        {
          id: 'a1b2c3',
          idUcrProfile: 'B12345',
          baseUnit: 'CIMPA',
          name: 'Luis',
          firstSurname: 'Mora',
          secondSurname: 'Jimenez',
          ceaCategory: null,
          orcidId: null,
          linkedin: null,
          researchGate: null,
          scopus: null,
          photoUrl: null,
        },
      ];
      const mockCount = [{ totalCount: 1 }];

      mockDb.query.mockResolvedValueOnce(mockItems).mockResolvedValueOnce(mockCount);

      const result = await repository.findPaginated(1, 10, 'Luis');

      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(1);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should apply a WHERE clause filtering by name prefix', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'Luis');

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('WHERE');
      expect(itemsQuery).toContain('LOWER(Researcher.name) LIKE ?');
    });

    it('should pass the name as a lowercase prefix-match parameter', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'ANA');

      expect(mockDb.query.mock.calls[0][1]).toEqual(['ana%']);
    });

    it('should also apply the WHERE filter in the count query', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 3 }]);

      await repository.findPaginated(1, 10, 'Carlos');

      const countQuery = mockDb.query.mock.calls[1][0] as string;
      expect(countQuery).toContain('WHERE');
      expect(countQuery).toContain('LOWER(Researcher.name) LIKE ?');
      expect(mockDb.query.mock.calls[1][1]).toEqual(['carlos%']);
    });

    it('should order results by first_surname then name when filtering by name', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'Ana');

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('ORDER BY Researcher.first_surname ASC');
      expect(itemsQuery).toContain('Researcher.name ASC');
    });

    it('should apply correct offset when navigating to page 2 with name filter', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 15 }]);

      await repository.findPaginated(2, 10, 'Ana');

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LIMIT 10');
      expect(itemsQuery).toContain('OFFSET 10');
    });

    it('should return an empty list when no researchers match the name filter', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      const result = await repository.findPaginated(1, 10, 'Zyx');

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should default total to 0 if count query returns no rows when filtering by name', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await repository.findPaginated(1, 10, 'Inexistente');

      expect(result.total).toBe(0);
    });
  });
});
