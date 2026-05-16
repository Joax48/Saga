import { ScientificProductionRepository } from '../../../scientific-productions/data/scientific-productions.repository';
import type { DatabaseClient } from '../../../../common/database/database-client.contract';

type DatabaseClientMock = {
  query: jest.Mock;
};

describe('ScientificProductionRepository', () => {
  let repository: ScientificProductionRepository;
  let mockDb: DatabaseClientMock;

  beforeEach(() => {
    mockDb = { query: jest.fn() };
    repository = new ScientificProductionRepository(mockDb as unknown as DatabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPaginated', () => {
    it('should return the first page of scientific productions with total count', async () => {
      const mockRows = [
        {
          id: '1',
          title: 'Investigacion sobre biodiversidad en Costa Rica',
          authors: 'Ana Gomez; Luis Perez',
          principalAuthor: 'Ana Gomez',
          unit: 'Universidad de Costa Rica',
          affiliations: 'UCR',
          type: 'Articulo',
          openAccess: true,
          publicationYear: 2024,
          abstract: 'Resumen breve',
          doi: '10.1234/example.2024',
          journal: 'Revista de Ciencias',
          volume: 12,
          issue: 1,
          pages: '10-20',
          citationCount: 5,
          keywords: 'biodiversidad, conservacion',
        },
      ];
      const mockCount = [{ TOTALCOUNT: 1 }];

      mockDb.query.mockResolvedValueOnce(mockRows).mockResolvedValueOnce(mockCount);

      const result = await repository.findPaginated(1, 10);

      expect(result.items).toEqual(mockRows);
      expect(result.total).toBe(1);
      expect(mockDb.query).toHaveBeenCalledTimes(2);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain(
        'ORDER BY so.PUBLICATION_YEAR DESC, so.SCIENTIFIC_OUTPUT_ID',
      );
      expect(itemsQuery).toContain('OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY');

      const countQuery = mockDb.query.mock.calls[1][0] as string;
      expect(countQuery).toContain('SELECT COUNT(*) AS TOTALCOUNT');
      expect(countQuery).not.toContain('OFFSET');
    });

    it('should apply correct offset when navigating to page 2', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ TOTALCOUNT: 5 }]);

      await repository.findPaginated(2, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY');
    });

    it('should return an empty list when no scientific productions are available', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ TOTALCOUNT: 0 }]);

      const result = await repository.findPaginated(1, 10);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should default total to 0 if count query returns no rows', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await repository.findPaginated(1, 10);

      expect(result.total).toBe(0);
    });

    it('should search by title when the query term is provided', async () => {
      const mockRows = [
        {
          id: '2',
          title: 'Impacto del cambio climatico en los ecosistemas marinos',
          authors: 'Carlos Ruiz',
          principalAuthor: 'Carlos Ruiz',
          unit: 'UCR',
          affiliations: 'UCR',
          type: 'Libro',
          openAccess: false,
          publicationYear: 2023,
          abstract: 'Resumen breve',
          doi: '10.1234/example.2023',
          journal: 'Oceanografia',
          volume: 7,
          issue: 2,
          pages: '45-60',
          citationCount: 3,
          keywords: 'clima, oceanos',
        },
      ];
      const mockCount = [{ TOTALCOUNT: 1 }];

      mockDb.query.mockResolvedValueOnce(mockRows).mockResolvedValueOnce(mockCount);

      const result = await repository.findPaginated(1, 10, { q: 'clima' });

      expect(result.items).toEqual(mockRows);
      expect(result.total).toBe(1);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LOWER(so.TITLE) LIKE LOWER(:q)');
      expect(mockDb.query.mock.calls[0][1]).toMatchObject({
        q: '%clima%',
        offset: 0,
        limit: 10,
      });
      expect(mockDb.query.mock.calls[1][1]).toEqual({ q: '%clima%' });
    });

    it('should ignore blank search terms and avoid WHERE/params', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ TOTALCOUNT: 0 }]);

      await repository.findPaginated(1, 10, { q: '   ' });

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      const countQuery = mockDb.query.mock.calls[1][0] as string;
      expect(itemsQuery).not.toContain('LOWER(so.TITLE) LIKE LOWER(:q)');
      expect(countQuery).toContain('SELECT COUNT(*) AS TOTALCOUNT');
      expect(mockDb.query.mock.calls[0][1]).toEqual({ offset: 0, limit: 10 });
      expect(mockDb.query.mock.calls[1][1]).toEqual({});
    });

    it('should build an EXISTS clause for each keyword filter', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ TOTALCOUNT: 0 }]);

      await repository.findPaginated(1, 10, {
        keywords: [' Clima ', 'clima', 'Impacto'],
      });

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LOWER(k.KEYWORD) LIKE LOWER(:kw0)');
      expect(itemsQuery).toContain('LOWER(k.KEYWORD) LIKE LOWER(:kw1)');
      expect(itemsQuery).toContain('LOWER(k.KEYWORD) LIKE LOWER(:kw2)');
      expect(mockDb.query.mock.calls[0][1]).toMatchObject({
        kw0: '% Clima %',
        kw1: '%clima%',
        kw2: '%Impacto%',
        offset: 0,
        limit: 10,
      });
    });

    it('should preserve query and keyword parameter order when both are used', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ TOTALCOUNT: 0 }]);

      await repository.findPaginated(1, 10, { q: 'clima', keywords: ['impacto'] });

      expect(mockDb.query.mock.calls[0][1]).toEqual({
        q: '%clima%',
        kw0: '%impacto%',
        offset: 0,
        limit: 10,
      });
      expect(mockDb.query.mock.calls[1][1]).toEqual({ q: '%clima%', kw0: '%impacto%' });
    });

    it('should order results by publication year and scientific output id', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ TOTALCOUNT: 0 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain(
        'ORDER BY so.PUBLICATION_YEAR DESC, so.SCIENTIFIC_OUTPUT_ID',
      );
    });

    it('should filter by type, open access, year, and keywords', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ TOTALCOUNT: 0 }]);

      await repository.findPaginated(1, 10, {
        type: ['Articulo'],
        openAccess: true,
        year: ['2024'],
        keywords: ['biodiversidad', 'conservacion'],
      });

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('sot.SCIENTIFIC_OUTPUT_TYPE_NAME IN (:type0)');
      expect(itemsQuery).toContain('sc.OPEN_ACCESS = :openAccess');
      expect(itemsQuery).toContain('TO_CHAR(so.PUBLICATION_YEAR) IN (:year0)');
      expect(itemsQuery).toContain('LOWER(k.KEYWORD) LIKE LOWER(:kw0)');
      expect(itemsQuery).toContain('LOWER(k.KEYWORD) LIKE LOWER(:kw1)');
      expect(mockDb.query.mock.calls[0][1]).toMatchObject({
        type0: 'Articulo',
        openAccess: 1,
        year0: '2024',
        kw0: '%biodiversidad%',
        kw1: '%conservacion%',
        offset: 0,
        limit: 10,
      });
      expect(mockDb.query.mock.calls[1][1]).toEqual({
        type0: 'Articulo',
        openAccess: 1,
        year0: '2024',
        kw0: '%biodiversidad%',
        kw1: '%conservacion%',
      });
    });
  });

  describe('findById', () => {
    it('should return the scientific production when the id exists', async () => {
      const mockRow = [
        {
          id: '1',
          title: 'Investigacion sobre biodiversidad en Costa Rica',
          authors: 'Ana Gomez; Luis Perez',
          principalAuthor: 'Ana Gomez',
          unit: 'Universidad de Costa Rica',
          affiliations: 'UCR',
          type: 'Articulo',
          openAccess: true,
          publicationYear: 2024,
          abstract: 'Resumen breve',
          doi: '10.1234/example.2024',
          journal: 'Revista de Ciencias',
          volume: 12,
          issue: 1,
          pages: '10-20',
          citationCount: 5,
          keywords: 'biodiversidad, conservacion',
        },
      ];
      mockDb.query.mockResolvedValueOnce(mockRow);

      const result = await repository.findById('1');

      expect(result).toEqual(mockRow[0]);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE so.SCIENTIFIC_OUTPUT_ID = :id'),
        { id: '1' },
      );
    });

    it('should return null when the id does not exist', async () => {
      mockDb.query.mockResolvedValueOnce([]);

      const result = await repository.findById('999');

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });
});
