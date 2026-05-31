import { ResearchersRepository } from '../researchers.repository';
import type { DatabaseClient } from '../../../../common/database/database-client.contract';

type DatabaseServiceMock = {
  query: jest.Mock;
};

describe('ResearchersRepository', () => {
  let repository: ResearchersRepository;
  let mockDb: DatabaseServiceMock;

  beforeEach(() => {
    mockDb = { query: jest.fn() };
    repository = new ResearchersRepository(mockDb as unknown as DatabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPaginated (without filters)', () => {
    it('should return items and total count', async () => {
      const mockItems = [
        {
          id: 'a1b2c3',
          idUcrProfile: 'B12345',
          baseUnit: 'Centro de Investigaciones en Enfermedades Tropicales (CIBET)',
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
          baseUnit: 'Centro de Investigaciones en Enfermedades Tropicales (CIBET)',
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

    it('should apply zero offset on the first page (Oracle syntax)', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 5 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('FETCH NEXT 10 ROWS ONLY');
      expect(itemsQuery).toContain('OFFSET 0 ROWS');
    });

    it('should apply correct offset when navigating to page 2 (Oracle syntax)', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 20 }]);

      await repository.findPaginated(2, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('FETCH NEXT 10 ROWS ONLY');
      expect(itemsQuery).toContain('OFFSET 10 ROWS');
    });

    it('should calculate offset correctly for small page sizes', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 20 }]);

      await repository.findPaginated(3, 5);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('FETCH NEXT 5 ROWS ONLY');
      expect(itemsQuery).toContain('OFFSET 10 ROWS');
    });

    it('should order results alphabetically by first_surname, name, second_surname', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('ORDER BY');
      expect(itemsQuery).toContain('PROFILE_FIRST_SURNAME');
      expect(itemsQuery).toContain('PROFILE_NAME');
      expect(itemsQuery).toContain('PROFILE_LAST_SURNAME');
    });

    it('should not include a WHERE clause when no filters are provided', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).not.toContain('WHERE (LOWER(p.PROFILE_NAME)');
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

  describe('findPaginated (with q search term)', () => {
    it('should return matching researchers and filtered total count', async () => {
      const mockItems = [
        {
          id: 'a1b2c3',
          idUcrProfile: 'B12345',
          baseUnit: 'Centro de Investigaciones en Enfermedades Tropicales (CIBET)',
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

    it('should apply a WHERE clause searching the full name', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'Luis');

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('WHERE');
      expect(itemsQuery).toContain('LIKE');
      expect(itemsQuery).toContain('PROFILE_NAME');
    });

    it('should pass a single search word as three starts-with params (one per field)', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'Ana');

      expect(mockDb.query.mock.calls[0][1]).toEqual(['Ana%', 'Ana%', 'Ana%']);
    });

    it('should AND each word so non-adjacent name parts still match', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'Kenneth Osorio');

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('AND');
      // 3 binds per token × 2 tokens
      expect(mockDb.query.mock.calls[0][1]).toEqual([
        'Kenneth%',
        'Kenneth%',
        'Kenneth%',
        'Osorio%',
        'Osorio%',
        'Osorio%',
      ]);
    });

    it('should also apply the WHERE filter in the count query', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 3 }]);

      await repository.findPaginated(1, 10, 'Carlos');

      const countQuery = mockDb.query.mock.calls[1][0] as string;
      expect(countQuery).toContain('WHERE');
      expect(countQuery).toContain('PROFILE_NAME');
      expect(countQuery).toContain('PROFILE_FIRST_SURNAME');
      expect(countQuery).toContain('PROFILE_LAST_SURNAME');
      expect(mockDb.query.mock.calls[1][1]).toEqual(['Carlos%', 'Carlos%', 'Carlos%']);
    });

    it('should return an empty list when no researchers match the search term', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      const result = await repository.findPaginated(1, 10, 'Zyx');

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should not apply a WHERE clause when the search term is only whitespace', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, '   ');

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).not.toContain('WHERE');
      expect(mockDb.query.mock.calls[0][1]).toEqual([]);
    });

    it('should trim leading and trailing spaces from the search term', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, '  Ana  ');

      expect(mockDb.query.mock.calls[0][1]).toEqual(['Ana%', 'Ana%', 'Ana%']);
    });
  });

  describe('findPaginated (with unit filter)', () => {
    it('should apply a WHERE clause filtering by unit using EXISTS subquery', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, undefined, {
        unit: [
          'Centro De Investigaciones Sobre Diversidad Cultural Y Estudios Regionales (CIDICER)',
        ],
      });

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('WHERE');
      expect(itemsQuery).toContain('EXISTS');
      expect(itemsQuery).toContain('UCR_PROFILE_PROJECT_UNIT');
      expect(itemsQuery).toContain('LOWER(u2.UNIT_NAME)');
      // params should be normalized and lowercased
      expect(mockDb.query.mock.calls[0][1]).toEqual([
        'centro de investigaciones sobre diversidad cultural y estudios regionales (cidicer)',
      ]);
      expect(mockDb.query.mock.calls[1][1]).toEqual([
        'centro de investigaciones sobre diversidad cultural y estudios regionales (cidicer)',
      ]);
    });

    it('should pass normalized unit values as parameters', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, undefined, {
        unit: [' ESCUELA DE INGENIERÍA ELÉCTRICA ', 'escuela de ingeniería eléctrica'],
      });

      expect(mockDb.query.mock.calls[0][1]).toEqual(['escuela de ingeniería eléctrica']);
      expect(mockDb.query.mock.calls[1][1]).toEqual(['escuela de ingeniería eléctrica']);
    });

    it('should combine q search and unit filter with AND', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'ana', {
        unit: ['Instituto De Investigaciones Farmacéuticas (INIFAR)'],
      });

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('WHERE');
      expect(itemsQuery).toContain('AND');
      expect(itemsQuery).toContain('PROFILE_NAME');
      expect(itemsQuery).toContain('EXISTS');
    });
  });

  describe('findById', () => {
    it('should return the researcher when found', async () => {
      const mockResearcher = {
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
      };
      mockDb.query.mockResolvedValue([mockResearcher]);

      const result = await repository.findById('a1b2c3');

      expect(result).toEqual(mockResearcher);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should return null when the database returns an empty array', async () => {
      mockDb.query.mockResolvedValue([]);

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should pass the id as the :1 bind variable', async () => {
      mockDb.query.mockResolvedValue([]);

      await repository.findById('target-id');

      expect(mockDb.query.mock.calls[0][1]).toEqual(['target-id']);
    });

    it('should include PROFILE_ID = :1 in the WHERE clause', async () => {
      mockDb.query.mockResolvedValue([]);

      await repository.findById('target-id');

      const query = mockDb.query.mock.calls[0][0] as string;
      expect(query).toContain('PROFILE_ID = :1');
    });

    it('should propagate database errors', async () => {
      mockDb.query.mockRejectedValue(new Error('Connection lost'));

      await expect(repository.findById('1')).rejects.toThrow('Connection lost');
    });
  });

  describe('getBaseUnitCounts', () => {
    it('should return baseUnit and count rows from the database', async () => {
      const mockRows = [
        { baseUnit: 'CIMPA', count: 10 },
        { baseUnit: 'CIGEFI', count: 5 },
      ];
      mockDb.query.mockResolvedValue(mockRows);

      const result = await repository.getBaseUnitCounts();

      expect(result).toEqual(mockRows);
    });

    it('should pass no extra params when called without arguments', async () => {
      mockDb.query.mockResolvedValue([]);

      await repository.getBaseUnitCounts();

      expect(mockDb.query.mock.calls[0][1]).toEqual([]);
    });

    it('should apply the search term in the extra conditions', async () => {
      mockDb.query.mockResolvedValue([]);

      await repository.getBaseUnitCounts('Ana');

      expect(mockDb.query.mock.calls[0][1]).toEqual(['Ana%', 'Ana%', 'Ana%']);
      const query = mockDb.query.mock.calls[0][0] as string;
      expect(query).toContain('PROFILE_NAME');
    });

    it('should exclude the unit filter from the WHERE clause', async () => {
      mockDb.query.mockResolvedValue([]);

      await repository.getBaseUnitCounts(undefined, { unit: ['CIMPA'] });

      const query = mockDb.query.mock.calls[0][0] as string;
      expect(query).not.toContain('EXISTS');
      expect(mockDb.query.mock.calls[0][1]).toEqual([]);
    });

    it('should apply search but exclude unit filter when both are provided', async () => {
      mockDb.query.mockResolvedValue([]);

      await repository.getBaseUnitCounts('Carlos', { unit: ['CIMPA'] });

      expect(mockDb.query.mock.calls[0][1]).toEqual(['Carlos%', 'Carlos%', 'Carlos%']);
      const query = mockDb.query.mock.calls[0][0] as string;
      expect(query).toContain('PROFILE_NAME');
      expect(query).not.toContain('EXISTS');
    });

    it('should include GROUP BY UNIT_NAME in the query', async () => {
      mockDb.query.mockResolvedValue([]);

      await repository.getBaseUnitCounts();

      const query = mockDb.query.mock.calls[0][0] as string;
      expect(query).toContain('GROUP BY');
      expect(query).toContain('UNIT_NAME');
    });

    it('should propagate database errors', async () => {
      mockDb.query.mockRejectedValue(new Error('DB timeout'));

      await expect(repository.getBaseUnitCounts()).rejects.toThrow('DB timeout');
    });
  });
});
