import { GetScientificProductionsFiltersUseCase } from "../get-public-scientific-production-filters.use-case";
import type { ScientificProductionsReader } from "../../../modules/scientific-productions/scientific-productions.reader.contract";

describe('GetScientificProductionsFiltersUseCase', () => {
  let useCase: GetScientificProductionsFiltersUseCase;
  let reader: jest.Mocked<ScientificProductionsReader>;

  beforeEach(() => {
    reader = {
      getFilters: jest.fn(),
    } as unknown as jest.Mocked<ScientificProductionsReader>;

    useCase = new GetScientificProductionsFiltersUseCase(reader);
  });

  it('should return filters from the reader', async () => {
    const response = {
      years: ['2024', '2023'],
      types: ['Articulo', 'Libro'],
      keywords: ['clima'],
    };

    reader.getFilters.mockResolvedValue(response);

    const result = await useCase.execute();

    expect(result).toEqual(response);
    expect(reader.getFilters).toHaveBeenCalledWith(undefined);
  });

  it('should forward filters to the reader', async () => {
    reader.getFilters.mockResolvedValue({
      years: [],
      types: [],
      keywords: [],
    });

    const filters = {
      q: 'clima',
    };

    await useCase.execute(filters);

    expect(reader.getFilters).toHaveBeenCalledWith(filters);
  });

  it('should propagate reader errors', async () => {
    reader.getFilters.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(useCase.execute()).rejects.toThrow(
      'Database error',
    );
  });
});