import { GetResearchersPaginatedListUseCase } from '../get-public-researchers-paginated-list.use-case';
import type { ResearchersReader } from '../../../modules/researchers/researchers.reader.contract';

describe('GetResearchersPaginatedListUseCase', () => {
  let useCase: GetResearchersPaginatedListUseCase;
  let researchersReader: jest.Mocked<ResearchersReader>;

  beforeEach(() => {
    researchersReader = {
      getPaginatedList: jest.fn(),
    } as unknown as jest.Mocked<ResearchersReader>;

    useCase = new GetResearchersPaginatedListUseCase(researchersReader);
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
            idUcrProfile: 'UCR001',
            profileType: 'UCR' as const,
            baseUnit: 'CIMPA',
            name: 'Juan',
            firstSurname: 'Perez',
            secondSurname: 'Mora',
            ceaCategory: 'A',
            orcidId: '0000-0001-2345-6789',
            linkedin: null,
            researchGate: null,
            scopus: null,
            photoUrl: null,
            institution: null,
            country: null,
            institutions: [],
            linkedUnits: [],
            workUnits: [],
          },
          {
            id: '2',
            idUcrProfile: 'UCR002',
            profileType: 'EXTERNAL' as const,
            baseUnit: 'CIGEFI',
            name: 'Maria',
            firstSurname: 'Gomez',
            secondSurname: 'Vargas',
            ceaCategory: null,
            orcidId: null,
            linkedin: null,
            researchGate: null,
            scopus: null,
            photoUrl: null,
            institution: null,
            country: null,
            institutions: [],
            linkedUnits: [],
            workUnits: [],
          },
        ],
        page: 1,
        limit: 10,
        total: 2,
      };
      researchersReader.getPaginatedList.mockResolvedValue(mockReaderResult);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(2);
      expect(researchersReader.getPaginatedList).toHaveBeenCalledWith(1, 10, undefined, {
        unit: undefined,
      });
    });

    it('should map each item to the ResearcherSummaryResponseDto format', async () => {
      const mockReaderResult = {
        items: [
          {
            id: '1',
            idUcrProfile: 'UCR001',
            profileType: 'UCR' as const,
            baseUnit: 'CIMPA',
            name: 'Juan',
            firstSurname: 'Perez',
            secondSurname: 'Mora',
            ceaCategory: 'A',
            institution: null,
            country: null,
            institutions: [],
            orcidId: '0000-0001-2345-6789',
            linkedin: null,
            researchGate: null,
            scopus: null,
            photoUrl: null,
            institution: null,
            country: null,
            institutions: [],
            linkedUnits: [],
            workUnits: [],
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      };
      researchersReader.getPaginatedList.mockResolvedValue(mockReaderResult);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result.items[0]).toEqual({
        id: '1',
        idUcrProfile: 'UCR001',
        profileType: 'UCR',
        baseUnit: 'CIMPA',
        name: 'Juan',
        firstSurname: 'Perez',
        secondSurname: 'Mora',
        ceaCategory: 'A',
        institution: null,
        country: null,
        institutions: [],
        orcidId: '0000-0001-2345-6789',
        linkedin: null,
        researchGate: null,
        scopus: null,
        photoUrl: null,
        institution: null,
        country: null,
        institutions: [],
        linkedUnits: [],
        workUnits: [],
      });
    });

    it('should forward page and limit to the researchers reader', async () => {
      researchersReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 3,
        limit: 5,
        total: 20,
      });

      await useCase.execute({ page: 3, limit: 5 });

      expect(researchersReader.getPaginatedList).toHaveBeenCalledWith(3, 5, undefined, {
        unit: undefined,
      });
      expect(researchersReader.getPaginatedList).toHaveBeenCalledTimes(1);
    });

    it('should forward optional q search term to the researchers reader', async () => {
      researchersReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      await useCase.execute({ page: 1, limit: 10, q: 'Juan' });

      expect(researchersReader.getPaginatedList).toHaveBeenCalledWith(1, 10, 'Juan', {
        unit: undefined,
      });
    });

    it('should forward optional unit filter to the researchers reader', async () => {
      researchersReader.getPaginatedList.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      await useCase.execute({ page: 1, limit: 10, unit: ['CIMPA'] });

      expect(researchersReader.getPaginatedList).toHaveBeenCalledWith(1, 10, undefined, {
        unit: ['CIMPA'],
      });
    });

    it('should return an empty list when no researchers are available', async () => {
      researchersReader.getPaginatedList.mockResolvedValue({
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
      researchersReader.getPaginatedList.mockRejectedValue(
        new Error('Connection to database lost'),
      );

      await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow(
        'Connection to database lost',
      );
    });
  });
});
