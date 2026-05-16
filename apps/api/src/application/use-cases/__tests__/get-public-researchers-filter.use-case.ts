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

  test.each([
    ['two baseUnits', ['Escuela de Matemática', 'Escuela de Biología']],
    ['empty baseUnits', []],
    [
      'four baseUnits',
      [
        'Escuela de Matemática',
        'Escuela de Biología',
        'Escuela de Física',
        'Escuela de Química',
      ],
    ],
  ])('returns %s from reader', async (_label, baseUnit) => {
    const mockFilters = { baseUnit };

    researchersReader.getFilters.mockResolvedValue(mockFilters);

    const result = await useCase.execute();

    expect(researchersReader.getFilters).toHaveBeenCalledTimes(1);
    expect(result.baseUnit).toHaveLength(baseUnit.length);
    expect(result.baseUnit).toEqual(baseUnit);
  });

  it('handles undefined response from reader', async () => {
    researchersReader.getFilters.mockResolvedValue(undefined as never);

    await expect(useCase.execute()).resolves.toBeUndefined();
    expect(researchersReader.getFilters).toHaveBeenCalledTimes(1);
  });

  it('does not mutate reader result', async () => {
    const filters = { baseUnit: ['Escuela de Informática'] };

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
