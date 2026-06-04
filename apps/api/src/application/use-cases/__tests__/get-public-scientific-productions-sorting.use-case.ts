import { GetScientificProductionPaginatedListUseCase } from '../get-public-scientific-productions-paginated-list.use-case';
import { ScientificProductionsListRequestDto } from '../../../bff/public/scientific-productions/dtos/scientific-productions-list-request.dto';
import type {
  ScientificProductionsReader,
  ScientificProductionSortBy,
  ScientificProductionSortOrder,
} from '../../../modules/scientific-productions/scientific-productions.reader.contract';

describe('GetScientificProductionPaginatedListUseCase (sorting)', () => {
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

  const defaultReaderResult = {
    items: [],
    page: 1,
    limit: 10,
    total: 0,
  };

  const executeWithSort = async (
    sortBy: ScientificProductionSortBy,
    sortOrder: ScientificProductionSortOrder,
  ) => {
    scientificProductionsReader.getPaginatedList.mockResolvedValue(defaultReaderResult);

    return useCase.execute({
      page: 1,
      limit: 10,
      sortBy,
      sortOrder,
    } as ScientificProductionsListRequestDto);
  };

  const assertSortCall = (
    sortBy: ScientificProductionSortBy,
    sortOrder: ScientificProductionSortOrder,
  ) => {
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
      sortBy,
      sortOrder,
    );
    expect(scientificProductionsReader.getPaginatedList).toHaveBeenCalledTimes(1);
  };

  it('should forward publication year descending sorting to the reader', async () => {
    await executeWithSort('publication_year', 'desc');
    assertSortCall('publication_year', 'desc');

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
      'publication_year',
      'desc',
    );
  });

  it('should forward publication year ascending sorting to the reader', async () => {
    await executeWithSort('publication_year', 'asc');
    assertSortCall('publication_year', 'asc');
  });

  it('should forward title descending sorting to the reader', async () => {
    await executeWithSort('title', 'desc');
    assertSortCall('title', 'desc');
  });

  it('should forward title ascending sorting to the reader', async () => {
    await executeWithSort('title', 'asc');
    assertSortCall('title', 'asc');
  });
});
