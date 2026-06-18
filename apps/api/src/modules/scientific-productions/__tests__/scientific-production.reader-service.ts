import { ScientificProductionsReaderService } from '../data/scientific-productions.reader-service';
import { ScientificProductionRepository } from '../data/scientific-productions.repository';

describe('ScientificProductionsService', () => {
  let service: ScientificProductionsReaderService;
  let repository: jest.Mocked<ScientificProductionRepository>;

  beforeEach(() => {
    repository = {
      findPaginated: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<ScientificProductionRepository>;

    service = new ScientificProductionsReaderService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaginatedList', () => {
    it('should return a paginated list with page, limit and total metadata', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: '1',
            title: 'Investigacion sobre biodiversidad en Costa Rica',
            authors: JSON.stringify([
              { id: 'a1', name: 'Ana Gomez' },
              { id: 'a2', name: 'Luis Perez' },
            ]),
            principalAuthor: 'Ana Gomez',
            unit: 'Universidad de Costa Rica',
            affiliations: 'UCR',
            type: 'Articulo',
            openAccess: 1,
            publicationYear: 2024,
            abstract: 'Resumen breve',
            doi: '10.1234/example.2024',
            journal: 'Revista de Ciencias',
            volume: '12',
            issue: '1',
            pages: '10-20',
            source: 'Journal Source',
            citationCount: 5,
            keywords: JSON.stringify([
              { id: 'k1', value: 'biodiversidad' },
              { id: 'k2', value: 'conservacion' },
            ]),
          },
        ],
        total: 1,
      };

      repository.findPaginated.mockResolvedValue(mockRepositoryResult);

      const result = await service.getPaginatedList(1, 10);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(repository.findPaginated).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should expose the summary fields expected by the public list view', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: '2',
            title: 'Impacto del cambio climatico en los ecosistemas marinos',
            authors: JSON.stringify([{ id: 'a2', name: 'Carlos Ruiz' }]),
            principalAuthor: 'Carlos Ruiz',
            unit: 'UCR',
            affiliations: 'UCR',
            type: 'Libro',
            openAccess: 0,
            publicationYear: 2023,
            abstract: 'Resumen breve',
            doi: '10.1234/example.2023',
            journal: 'Oceanografia',
            volume: '7',
            issue: '2',
            pages: '45-60',
            source: 'Journal Source',
            citationCount: 3,
            keywords: JSON.stringify([
              { id: 'k2', value: 'clima' },
              { id: 'k3', value: 'oceanos' },
            ]),
          },
        ],
        total: 1,
      };

      repository.findPaginated.mockResolvedValue(mockRepositoryResult);

      const result = await service.getPaginatedList(1, 10);

      expect(result.items[0]).toEqual({
        id: '2',
        title: 'Impacto del cambio climatico en los ecosistemas marinos',
        authors: [{ id: 'a2', name: 'Carlos Ruiz' }],
        type: 'Libro',
        openAccess: false,
        publicationYear: 2023,
        doi: '10.1234/example.2023',
        journal: 'Oceanografia',
        volume: '7',
        issue: '2',
        pages: '45-60',
        source: 'Journal Source',
        keywords: [
          { id: 'k2', value: 'clima' },
          { id: 'k3', value: 'oceanos' },
        ],
      });
      expect(result.items[0]).not.toHaveProperty('principalAuthor');
      expect(result.items[0]).not.toHaveProperty('unit');
      expect(result.items[0]).not.toHaveProperty('affiliations');
      expect(result.items[0]).not.toHaveProperty('abstract');
      expect(result.items[0]).not.toHaveProperty('citationCount');
    });

    it('should return an empty list when no scientific productions match', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });

      const result = await service.getPaginatedList(1, 10);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should forward query, page and limit to repository', async () => {
      const mockRepositoryResult = { items: [], total: 0 };
      repository.findPaginated.mockResolvedValue(mockRepositoryResult);

      await service.getPaginatedList(2, 5, 'clima');

      expect(repository.findPaginated).toHaveBeenCalledWith(
        2,
        5,
        'clima',
        undefined,
        undefined,
      );
      expect(repository.findPaginated).toHaveBeenCalledTimes(1);
    });

    it('should clamp to the last valid page when requested page exceeds total pages', async () => {
      const lastPageItems = [
        {
          id: '3',
          title: 'Ensayo sobre nuevas tecnologias',
          authors: JSON.stringify([{ id: 'a3', name: 'Laura Perez' }]),
          principalAuthor: 'Laura Perez',
          unit: 'UCR',
          affiliations: 'UCR',
          type: 'Articulo',
          openAccess: 1,
          publicationYear: 2024,
          abstract: 'Resumen breve',
          doi: '10.1234/example.2024',
          journal: 'Revista de Ciencias',
          volume: '10',
          issue: '3',
          pages: '101-110',
          source: 'Journal Source',
          citationCount: 1,
          keywords: JSON.stringify([{ id: 'k3', value: 'tecnologia' }]),
        },
      ];

      repository.findPaginated
        .mockResolvedValueOnce({ items: [], total: 3 })
        .mockResolvedValueOnce({ items: lastPageItems, total: 3 });

      const result = await service.getPaginatedList(5, 2, 'tecnologia');

      expect(result.page).toBe(2);
      expect(result.items).toHaveLength(1);
      expect(repository.findPaginated).toHaveBeenCalledTimes(2);
      expect(repository.findPaginated).toHaveBeenNthCalledWith(
        1,
        5,
        2,
        'tecnologia',
        undefined,
        undefined,
      );
      expect(repository.findPaginated).toHaveBeenNthCalledWith(
        2,
        2,
        2,
        'tecnologia',
        undefined,
        undefined,
      );
    });

    it('should maintain the requested page when it is within range', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: '4',
            title: 'Analisis de sistemas de informacion',
            authors: JSON.stringify([{ id: 'a4', name: 'Pedro Mora' }]),
            principalAuthor: 'Pedro Mora',
            unit: 'UCR',
            affiliations: 'UCR',
            type: 'Libro',
            openAccess: 0,
            publicationYear: 2023,
            abstract: 'Resumen breve',
            doi: '10.1234/example.2023',
            journal: 'Ingenieria',
            volume: '5',
            issue: '2',
            pages: '50-60',
            source: 'Journal Source',
            citationCount: 2,
            keywords: JSON.stringify([{ id: 'k4', value: 'sistemas' }]),
          },
        ],
        total: 5,
      };

      repository.findPaginated.mockResolvedValue(mockRepositoryResult);

      const result = await service.getPaginatedList(2, 2, 'sistemas');

      expect(result.page).toBe(2);
      expect(repository.findPaginated).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return the detail item when the id exists', async () => {
      const mockRow = {
        id: '1',
        title: 'Investigacion sobre biodiversidad en Costa Rica',
        ucrAuthors: JSON.stringify([{ id: 'u1', name: 'Universidad de Costa Rica' }]),
        externalAuthors: JSON.stringify([]),
        unit: JSON.stringify([{ id: 'u1', name: 'Universidad de Costa Rica' }]),
        affiliations: JSON.stringify([{ id: 'f1', name: 'UCR' }]),
        type: 'Articulo',
        openAccess: 1,
        publicationYear: 2024,
        abstract: 'Resumen breve',
        doi: '10.1234/example.2024',
        journal: 'Revista de Ciencias',
        volume: '12',
        issue: '1',
        pages: '10-20',
        source: 'Journal Source',
        citationCount: 5,
        keywords: JSON.stringify([
          { id: 'k1', value: 'biodiversidad' },
          { id: 'k2', value: 'conservacion' },
        ]),
      };
      repository.findById.mockResolvedValue(mockRow);

      const result = await service.getById('1');

      expect(result).toEqual({
        id: '1',
        title: 'Investigacion sobre biodiversidad en Costa Rica',
        ucrAuthors: [{ id: 'u1', name: 'Universidad de Costa Rica' }],
        externalAuthors: [],
        unit: [{ id: 'u1', name: 'Universidad de Costa Rica' }],
        affiliations: [{ id: 'f1', name: 'UCR' }],
        type: 'Articulo',
        openAccess: true,
        publicationYear: 2024,
        abstract: 'Resumen breve',
        doi: '10.1234/example.2024',
        journal: 'Revista de Ciencias',
        volume: '12',
        issue: '1',
        pages: '10-20',
        source: 'Journal Source',
        citationCount: 5,
        keywords: [
          { id: 'k1', value: 'biodiversidad' },
          { id: 'k2', value: 'conservacion' },
        ],
      });
      expect(repository.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when the id does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getById('999')).resolves.toBeNull();
      expect(repository.findById).toHaveBeenCalledWith('999');
    });
  });
});
