import { ProjectsRepository } from '../projects.repository';
import type { DatabaseService } from '../../../../common/database/database.service';

type DatabaseServiceMock = {
  query: jest.Mock;
};

describe('ProjectsRepository', () => {
  let repository: ProjectsRepository;
  let mockDb: DatabaseServiceMock;

  beforeEach(() => {
    mockDb = { query: jest.fn() };
    repository = new ProjectsRepository(mockDb as unknown as DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPaginated', () => {
    it('should return the first page of projects with total count', async () => {
      const mockItems = [
        {
          id: 1,
          code: 'C3992',
          name: 'El costo de una vida digna en Costa Rica',
          projectType: 'Humanistico',
          fundingType: 'Fondos internos',
          researchType: 'Basica',
          status: 'in-progress',
          startDate: '2023-06-01',
          endDate: '2025-12-31',
        },
        {
          id: 2,
          code: 'C4196',
          name: 'Analisis espacio-temporal del impacto de factores climaticos',
          projectType: 'Interdisciplinario',
          fundingType: 'Fondos externos',
          researchType: 'Basica',
          status: 'in-progress',
          startDate: '2024-01-01',
          endDate: '2026-12-15',
        },
      ];
      const mockCount = [{ totalCount: 12 }];

      mockDb.query.mockResolvedValueOnce(mockItems).mockResolvedValueOnce(mockCount);

      const result = await repository.findPaginated(1, 10);

      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(12);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should apply correct offset when navigating to page 2', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 12 }]);

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

    it('should join lookup tables for project type, funding, research type and status', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('INNER JOIN Project_Type');
      expect(itemsQuery).toContain('INNER JOIN Funding_Type');
      expect(itemsQuery).toContain('INNER JOIN Research_Type');
      expect(itemsQuery).toContain('INNER JOIN Project_Status');
    });

    it('should order results alphabetically by project name', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('ORDER BY Project.name ASC');
    });
  });

  describe('searchByNameOrCode', () => {
    it('should return matching projects with total count', async () => {
      const mockItems = [
        {
          id: 1,
          code: 'C3992',
          name: 'El costo de una vida digna en Costa Rica',
          projectType: 'Humanistico',
          fundingType: 'Fondos internos',
          researchType: 'Basica',
          status: 'in-progress',
          startDate: '2023-06-01',
          endDate: '2025-12-31',
        },
      ];
      const mockCount = [{ totalCount: 1 }];

      mockDb.query.mockResolvedValueOnce(mockItems).mockResolvedValueOnce(mockCount);

      const result = await repository.searchByNameOrCode('costo', 1, 10);

      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(1);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should pass the search term as a parameterized LIKE argument', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.searchByNameOrCode('clima', 1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LIKE LOWER(?)');
      expect(mockDb.query.mock.calls[0][1]).toEqual(['%clima%', '%clima%']);
    });

    it('should apply correct offset when navigating to page 2', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 5 }]);

      await repository.searchByNameOrCode('proyecto', 2, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LIMIT 10');
      expect(itemsQuery).toContain('OFFSET 10');
    });

    it('should filter using WHERE clause on code and name columns', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.searchByNameOrCode('produccion', 1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LOWER(Project.code)');
      expect(itemsQuery).toContain('LOWER(Project.name)');
    });

    it('should return an empty list when no projects match', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      const result = await repository.searchByNameOrCode('xyznonexistent', 1, 10);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should default total to 0 if count query returns no rows', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await repository.searchByNameOrCode('missing', 1, 10);

      expect(result.total).toBe(0);
    });

    it('should default total to 0 if totalCount is undefined', async () => {
      mockDb.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: undefined }]);

      const result = await repository.searchByNameOrCode('missing', 1, 10);

      expect(result.total).toBe(0);
    });

    it('should also apply the WHERE filter in the count query', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 3 }]);

      await repository.searchByNameOrCode('clima', 1, 10);

      const countQuery = mockDb.query.mock.calls[1][0] as string;
      expect(countQuery).toContain('LIKE LOWER(?)');
      expect(mockDb.query.mock.calls[1][1]).toEqual(['%clima%', '%clima%']);
    });

    it('should order search results alphabetically by project name', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.searchByNameOrCode('proyecto', 1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('ORDER BY Project.name ASC');
    });
  });
});
