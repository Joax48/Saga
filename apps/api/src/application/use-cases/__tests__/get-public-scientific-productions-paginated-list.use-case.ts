import { GetScientificProductionPaginatedListUseCase } from '../get-public-scientific-productions-paginated-list.use-case';
import type { ScientificProductionsReader } from '../../../modules/scientific-productions/scientific-productions.reader.contract';

describe('GetScientificProductionPaginatedListUseCase', () => {
  let useCase: GetScientificProductionPaginatedListUseCase;
  let scientificProductionsReader: jest.Mocked<ScientificProductionsReader>;

  beforeEach(() => {
    scientificProductionsReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
    } as unknown as jest.Mocked<ScientificProductionsReader>;

    useCase = new GetScientificProductionPaginatedListUseCase(
      scientificProductionsReader,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return the paginated list with metadata from the reader', async () => {
      const mockReaderResult = {
        items: [
          {
            id: '1',
            title: 'Investigacion sobre biodiversidad en Costa Rica',
            authors: [
              { id: 1, name: 'Ana Gomez' },
              { id: 2, name: 'Luis Perez' },
            ],
            type: 'Articulo',
            openAccess: true,
            publicationYear: 2024,
            doi: '10.1234/example.2024',
            journal: 'Revista de Ciencias',
            volume: '12',
            issue: '1',
            pages: '10-20',
            keywords: [
              { id: 1, value: 'biodiversidad' },
              { id: 2, value: 'conservacion' },
            ],
          },
          {
            id: '2',
            title: 'Impacto del cambio climatico en los ecosistemas marinos',
            authors: [{ id: 3, name: 'Carlos Ruiz' }],
            type: 'Libro',
            openAccess: false,
            publicationYear: 2023,
            doi: '10.1234/example.2023',
            journal: 'Oceanografia',
            volume: '7',
            issue: '2',
            pages: '45-60',
            keywords: [
              { id: 3, value: 'clima' },
              { id: 4, value: 'oceanos' },
            ],
          },
        ],
        page: 1,
        limit: 10,
        total: 2,
      };
      scientificProductionsReader.getPaginatedList.mockResolvedValue(mockReaderResult);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(2);
      expect(scientificProductionsReader.getPaginatedList).toHaveBeenCalledWith(
        1,
        10,
        {
          q: undefined,
          type: undefined,
          openAccess: undefined,
          year: undefined,
          keywords: undefined,
        },
        undefined,
        undefined,
      );
    });

    it('should map each item to the ScientificProductioSummaryResponseDto format', async () => {
      const mockReaderResult = {
        items: [
          {
            id: '3',
            title: 'Estudio sobre policultivos sostenibles',
            authors: [
              { id: 4, name: 'María Vargas' },
              { id: 5, name: 'Juan Soto' },
            ],
            type: 'Articulo',
            openAccess: true,
            publicationYear: 2022,
            doi: '10.1234/example.2022',
            journal: 'Agricultura Sustentable',
            volume: '18',
            issue: '4',
            pages: '80-95',
            keywords: [
              { id: 5, value: 'agroecologia' },
              { id: 6, value: 'sostenibilidad' },
            ],
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      };
      scientificProductionsReader.getPaginatedList.mockResolvedValue(mockReaderResult);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result.items[0]).toEqual({
        id: '3',
        title: 'Estudio sobre policultivos sostenibles',
        authors: [
          { id: 4, name: 'María Vargas' },
          { id: 5, name: 'Juan Soto' },
        ],
        type: 'Articulo',
        openAccess: true,
        publicationYear: 2022,
        doi: '10.1234/example.2022',
        journal: 'Agricultura Sustentable',
        volume: '18',
        issue: '4',
        pages: '80-95',
        keywords: [
          { id: 5, value: 'agroecologia' },
          { id: 6, value: 'sostenibilidad' },
        ],
      });
    });

    it('should forward pagination, search, and filters to the scientific productions reader', async () => {
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 2,
        limit: 5,
        total: 8,
      });

      await useCase.execute({
        page: 2,
        limit: 5,
        q: 'clima',
        type: ['Articulo'],
        openAccess: true,
        year: ['2024'],
        keywords: ['clima', 'agua'],
      });

      expect(scientificProductionsReader.getPaginatedList).toHaveBeenCalledWith(
        2,
        5,
        {
          q: 'clima',
          type: ['Articulo'],
          openAccess: true,
          year: ['2024'],
          keywords: ['clima', 'agua'],
        },
        undefined,
        undefined,
      );
      expect(scientificProductionsReader.getPaginatedList).toHaveBeenCalledTimes(1);
    });

    it('should forward query, page and limit to the scientific productions reader', async () => {
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      await useCase.execute({ page: 1, limit: 10, q: 'clima' });

      expect(scientificProductionsReader.getPaginatedList).toHaveBeenCalledWith(
        1,
        10,
        {
          q: 'clima',
          type: undefined,
          openAccess: undefined,
          year: undefined,
          keywords: undefined,
        },
        undefined,
        undefined,
      );
      expect(scientificProductionsReader.getPaginatedList).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when no scientific productions are available', async () => {
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should propagate database connection errors', async () => {
      scientificProductionsReader.getPaginatedList.mockRejectedValue(
        new Error('Connection to database lost'),
      );

      await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow(
        'Connection to database lost',
      );
    });

    it('should return empty list for nonexistent scientific production search', async () => {
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      const result = await useCase.execute({
        page: 1,
        limit: 10,
        q: 'vcrno$·"!12',
      });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);

      expect(scientificProductionsReader.getPaginatedList).toHaveBeenCalledWith(
        1,
        10,
        {
          q: 'vcrno$·"!12',
          type: undefined,
          openAccess: undefined,
          year: undefined,
          keywords: undefined,
        },
        undefined,
        undefined,
      );
    });

    it('should return empty list for invalid keywords', async () => {
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      const result = await useCase.execute({
        page: 1,
        limit: 10,
        keywords: ['dJUKBKve%$'],
      });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should return no matches for future year filter', async () => {
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      const result = await useCase.execute({
        page: 1,
        limit: 10,
        year: ['3982'],
      });

      expect(result.total).toBe(0);
    });

    it('should return only scientific productions matching selected filters', async () => {
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [
          {
            id: '1',
            title: 'Cambio climático',
            type: 'Articulo',
            openAccess: true,
            publicationYear: 2024,
            doi: '10.1234/x',
            journal: 'Science',
            volume: '1',
            issue: '1',
            pages: '1-10',
            authors: [],
            keywords: [{ id: 1, value: 'clima' }],
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      });

      const result = await useCase.execute({
        page: 1,
        limit: 10,
        type: ['Articulo'],
        openAccess: true,
        year: ['2024'],
        keywords: ['clima'],
      });

      expect(result.items.every((x) => x.openAccess)).toBe(true);
      expect(result.items.every((x) => x.type === 'Articulo')).toBe(true);
    });

    it('should allow blank search safely', async () => {
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      await useCase.execute({
        page: 1,
        limit: 10,
        q: ' ',
      });

      expect(scientificProductionsReader.getPaginatedList).toHaveBeenCalled();
    });

    it('should safely process special characters search', async () => {
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      await expect(
        useCase.execute({
          page: 1,
          limit: 10,
          q: '%$#@!',
        }),
      ).resolves.toBeDefined();
    });

    it('should support accented searches', async () => {
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [
          {
            id: '1',
            title: 'Investigación avanzada',
            type: 'Articulo',
            openAccess: true,
            publicationYear: 2024,
            doi: '',
            journal: '',
            volume: '',
            issue: '',
            pages: '',
            authors: [],
            keywords: [],
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      });

      const result = await useCase.execute({
        page: 1,
        limit: 10,
        q: 'investigación',
      });

      expect(result.total).toBe(1);
    });

    it('should return empty result when filters produce no matches', async () => {
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      const result = await useCase.execute({
        page: 1,
        limit: 10,
        type: ['Libro'],
        year: ['1900'],
        keywords: ['inexistente'],
      });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
