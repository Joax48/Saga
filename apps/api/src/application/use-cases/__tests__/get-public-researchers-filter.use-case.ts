import { GetResearchersFiltersUseCase } from '../get-public-researchers-filters.use-case';
import type { ResearchersReader } from '../../../modules/researchers/researchers.reader.contract';

describe('GetResearchersFiltersUseCase', () => {
  let useCase: GetResearchersFiltersUseCase;
  let researchersReader: jest.Mocked<ResearchersReader>;

  beforeEach(() => {
    researchersReader = {
      getFilters: jest.fn(),
    } as unknown as jest.Mocked<ResearchersReader>;

    useCase = new GetResearchersFiltersUseCase(researchersReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute without filters', () => {
    test.each([
      [
        'two baseUnits with counts',
        [
          { value: 'Escuela de Matemática', count: 15 },
          { value: 'Escuela de Biología', count: 8 },
        ],
      ],
      ['empty baseUnits', []],
      [
        'four baseUnits with different counts',
        [
          { value: 'Escuela de Matemática', count: 15 },
          { value: 'Escuela de Biología', count: 8 },
          { value: 'Escuela de Física', count: 12 },
          { value: 'Escuela de Química', count: 6 },
        ],
      ],
    ])('returns %s from reader', async (_label, baseUnit) => {
      const mockFilters = { baseUnit };

      researchersReader.getFilters.mockResolvedValue(mockFilters);

      const result = await useCase.execute();

      expect(researchersReader.getFilters).toHaveBeenCalledWith(undefined, undefined);
      expect(researchersReader.getFilters).toHaveBeenCalledTimes(1);
      expect(result.baseUnit).toHaveLength(baseUnit.length);
      expect(result.baseUnit).toEqual(baseUnit);
    });

    it('includes count for each baseUnit in the response', async () => {
      const mockFilters = {
        baseUnit: [
          { value: 'Escuela de Informática', count: 25 },
          { value: 'Escuela de Ingeniería', count: 18 },
        ],
      };

      researchersReader.getFilters.mockResolvedValue(mockFilters);

      const result = await useCase.execute();

      expect(result.baseUnit).toHaveLength(2);
      expect(result.baseUnit[0]).toHaveProperty('value');
      expect(result.baseUnit[0]).toHaveProperty('count');
      expect(result.baseUnit[0].count).toBe(25);
      expect(result.baseUnit[1].count).toBe(18);
    });
  });

  describe('execute with query parameter', () => {
    it('forwards query to the reader', async () => {
      const mockFilters = {
        baseUnit: [{ value: 'Escuela de Informática', count: 10 }],
      };

      researchersReader.getFilters.mockResolvedValue(mockFilters);

      await useCase.execute('machine learning');

      expect(researchersReader.getFilters).toHaveBeenCalledWith(
        'machine learning',
        undefined,
      );
    });

    it('returns filtered results when query is provided', async () => {
      const mockFilters = {
        baseUnit: [
          { value: 'Escuela de Informática', count: 8 },
          { value: 'Escuela de Ingeniería', count: 5 },
        ],
      };

      researchersReader.getFilters.mockResolvedValue(mockFilters);

      const result = await useCase.execute('AI');

      expect(result.baseUnit).toHaveLength(2);
      expect(researchersReader.getFilters).toHaveBeenCalledWith('AI', undefined);
    });
  });

  describe('execute with filter parameters', () => {
    it('forwards filters to the reader', async () => {
      const mockFilters = {
        baseUnit: [{ value: 'Escuela de Informática', count: 12 }],
      };
      const requestFilters = { unit: ['Escuela de Informática'] };

      researchersReader.getFilters.mockResolvedValue(mockFilters);

      await useCase.execute(undefined, requestFilters);

      expect(researchersReader.getFilters).toHaveBeenCalledWith(
        undefined,
        requestFilters,
      );
    });

    it('returns results filtered by unit when filters are provided', async () => {
      const mockFilters = {
        baseUnit: [{ value: 'CIMPA', count: 10 }],
      };
      const requestFilters = { unit: ['CIMPA'] };

      researchersReader.getFilters.mockResolvedValue(mockFilters);

      const result = await useCase.execute(undefined, requestFilters);

      expect(result.baseUnit).toHaveLength(1);
      expect(result.baseUnit[0].value).toBe('CIMPA');
    });
  });

  describe('execute with both query and filters', () => {
    it('forwards both query and filters to the reader', async () => {
      const mockFilters = {
        baseUnit: [{ value: 'Escuela de Informática', count: 5 }],
      };
      const requestFilters = { unit: ['Escuela de Informática'] };

      researchersReader.getFilters.mockResolvedValue(mockFilters);

      await useCase.execute('data science', requestFilters);

      expect(researchersReader.getFilters).toHaveBeenCalledWith(
        'data science',
        requestFilters,
      );
    });
  });

  describe('error handling', () => {
    it('handles undefined response from reader', async () => {
      researchersReader.getFilters.mockResolvedValue(undefined as never);

      await expect(useCase.execute()).resolves.toBeUndefined();
      expect(researchersReader.getFilters).toHaveBeenCalledTimes(1);
    });

    it('does not mutate reader result', async () => {
      const filters = {
        baseUnit: [{ value: 'Escuela de Informática', count: 10 }],
      };

      researchersReader.getFilters.mockResolvedValue(filters);

      const result = await useCase.execute();

      expect(result).toBe(filters);
      expect(researchersReader.getFilters).toHaveBeenCalledTimes(1);
    });

    it('propagates errors thrown by the reader', async () => {
      researchersReader.getFilters.mockRejectedValue(new Error('DataBase error'));

      await expect(useCase.execute()).rejects.toThrow('DataBase error');
      expect(researchersReader.getFilters).toHaveBeenCalledTimes(1);
    });
  });
});
