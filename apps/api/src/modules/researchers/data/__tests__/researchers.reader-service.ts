import { ResearchersReaderService } from '../researchers.reader-service';
import { ResearchersRepository } from '../researchers.repository';

describe('ResearchersReaderService', () => {
  let service: ResearchersReaderService;
  let repository: jest.Mocked<ResearchersRepository>;

  beforeEach(() => {
    repository = {
      findPaginated: jest.fn(),
      findLinkedUnitsByResearcherIds: jest.fn(),
      findById: jest.fn(),
      findLinkedUnits: jest.fn(),
      findAlternativeNames: jest.fn(),
      findKeywords: jest.fn(),
      findEducation: jest.fn(),
      findExperience: jest.fn(),
      findProjects: jest.fn(),
      findScientificOutputs: jest.fn(),
      findKeywordsByProjectIds: jest.fn(),
      findAuthorsByOutputIds: jest.fn(),
      findKeywordsByOutputIds: jest.fn(),
      getBaseUnitCounts: jest.fn(),
    } as unknown as jest.Mocked<ResearchersRepository>;

    service = new ResearchersReaderService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaginatedList', () => {
    it('should return a paginated list with page, limit and total metadata', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: 'a1b2c3',
            idUcrProfile: 'B12345',
            baseUnit: 'CIMPA',
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
            baseUnit: 'CIBCM',
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
        ],
        total: 25,
      };
      repository.findPaginated.mockResolvedValue(mockRepositoryResult);
      repository.findLinkedUnitsByResearcherIds.mockResolvedValue(new Map());

      const result = await service.getPaginatedList(1, 10);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(25);
      expect(result.items).toHaveLength(2);
      expect(repository.findPaginated).toHaveBeenCalledWith(1, 10, undefined, undefined);
      expect(repository.findLinkedUnitsByResearcherIds).toHaveBeenCalled();
    });

    it('should map all researcher fields from the repository to the response', async () => {
      const mockRepositoryResult = {
        items: [
          {
            id: 'g7h8i9',
            idUcrProfile: 'D11111',
            baseUnit: 'CIPRONA',
            name: 'Carlos',
            firstSurname: 'Solano',
            secondSurname: 'Quesada',
            ceaCategory: 'Investigador Principal',
            orcidId: '0000-0002-9876-5432',
            linkedin: 'https://linkedin.com/in/carlos-solano',
            researchGate: 'https://researchgate.net/profile/carlos-solano',
            scopus: '123456789',
            photoUrl: 'https://example.com/carlos.jpg',
          },
        ],
        total: 1,
      };
      repository.findPaginated.mockResolvedValue(mockRepositoryResult);
      repository.findLinkedUnitsByResearcherIds.mockResolvedValue(
        new Map([
          [
            'g7h8i9',
            [
              { id: '1', name: 'CIPRONA' },
              { id: '2', name: 'CIMPA' },
            ],
          ],
        ]),
      );

      const result = await service.getPaginatedList(1, 10);

      expect(result.items[0]).toEqual({
        id: 'g7h8i9',
        idUcrProfile: 'D11111',
        baseUnit: 'CIPRONA',
        name: 'Carlos',
        firstSurname: 'Solano',
        secondSurname: 'Quesada',
        ceaCategory: 'Investigador Principal',
        orcidId: '0000-0002-9876-5432',
        linkedin: 'https://linkedin.com/in/carlos-solano',
        researchGate: 'https://researchgate.net/profile/carlos-solano',
        scopus: '123456789',
        photoUrl: 'https://example.com/carlos.jpg',
        linkedUnits: [
          { id: '1', name: 'CIPRONA' },
          { id: '2', name: 'CIMPA' },
        ],
      });
    });

    it('should delegate pagination parameters to the repository unchanged', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });
      repository.findLinkedUnitsByResearcherIds.mockResolvedValue(new Map());

      await service.getPaginatedList(4, 20);

      expect(repository.findPaginated).toHaveBeenCalledWith(4, 20, undefined, undefined);
      expect(repository.findPaginated).toHaveBeenCalledTimes(1);
    });

    it('should forward the optional q search term to the repository', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });
      repository.findLinkedUnitsByResearcherIds.mockResolvedValue(new Map());

      await service.getPaginatedList(1, 10, 'Luis');

      expect(repository.findPaginated).toHaveBeenCalledWith(1, 10, 'Luis', undefined);
      expect(repository.findPaginated).toHaveBeenCalledTimes(1);
    });

    it('should forward the optional unit filter to the repository', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });
      repository.findLinkedUnitsByResearcherIds.mockResolvedValue(new Map());

      await service.getPaginatedList(1, 10, undefined, { unit: ['CIMPA'] });

      expect(repository.findPaginated).toHaveBeenCalledWith(1, 10, undefined, {
        unit: ['CIMPA'],
      });
      expect(repository.findPaginated).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when no researchers exist', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });
      repository.findLinkedUnitsByResearcherIds.mockResolvedValue(new Map());

      const result = await service.getPaginatedList(1, 10);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should use page and limit from input parameters, not from the repository result', async () => {
      repository.findPaginated.mockResolvedValue({ items: [], total: 0 });

      const result = await service.getPaginatedList(3, 15);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(15);
    });
  });

  describe('getById', () => {
    it('should return null when the researcher does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.getById('nonexistent-id');

      expect(result).toBeNull();
      expect(repository.findById).toHaveBeenCalledWith('nonexistent-id');
    });

    it('should not call findLinkedUnits when researcher is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await service.getById('nonexistent-id');

      expect(repository.findLinkedUnits).not.toHaveBeenCalled();
    });

    it('should return researcher with empty linkedUnits when none exist', async () => {
      repository.findById.mockResolvedValue({
        id: 'a1b2c3', idUcrProfile: 'B12345', baseUnit: 'CIMPA',
        name: 'Luis', firstSurname: 'Mora', secondSurname: 'Jimenez',
        ceaCategory: null, orcidId: null, linkedin: null,
        researchGate: null, scopus: null, photoUrl: null,
      });
      repository.findLinkedUnits.mockResolvedValue([]);

      const result = await service.getById('a1b2c3');

      expect(result).not.toBeNull();
      expect(result!.linkedUnits).toEqual([]);
    });

    it('should return researcher with mapped linkedUnits', async () => {
      repository.findById.mockResolvedValue({
        id: 'a1b2c3', idUcrProfile: 'B12345', baseUnit: 'CIMPA',
        name: 'Luis', firstSurname: 'Mora', secondSurname: 'Jimenez',
        ceaCategory: null, orcidId: null, linkedin: null,
        researchGate: null, scopus: null, photoUrl: null,
      });
      repository.findLinkedUnits.mockResolvedValue([
        { id: 1, name: 'CIMPA' },
        { id: 2, name: 'CIGEFI' },
      ]);

      const result = await service.getById('a1b2c3');

      expect(result!.linkedUnits).toEqual([
        { id: '1', name: 'CIMPA' },
        { id: '2', name: 'CIGEFI' },
      ]);
    });

    it('should coerce linkedUnit ids to string', async () => {
      repository.findById.mockResolvedValue({
        id: 'a1b2c3', idUcrProfile: 'B12345', baseUnit: 'CIMPA',
        name: 'Luis', firstSurname: 'Mora', secondSurname: 'Jimenez',
        ceaCategory: null, orcidId: null, linkedin: null,
        researchGate: null, scopus: null, photoUrl: null,
      });
      repository.findLinkedUnits.mockResolvedValue([{ id: 99, name: 'CIGEFI' }]);

      const result = await service.getById('a1b2c3');

      expect(result!.linkedUnits[0].id).toBe('99');
    });

    it('should propagate errors from findById', async () => {
      repository.findById.mockRejectedValue(new Error('DB error'));

      await expect(service.getById('1')).rejects.toThrow('DB error');
    });

    it('should propagate errors from findLinkedUnits', async () => {
      repository.findById.mockResolvedValue({
        id: 'a1b2c3', idUcrProfile: 'B12345', baseUnit: 'CIMPA',
        name: 'Luis', firstSurname: 'Mora', secondSurname: 'Jimenez',
        ceaCategory: null, orcidId: null, linkedin: null,
        researchGate: null, scopus: null, photoUrl: null,
      });
      repository.findLinkedUnits.mockRejectedValue(new Error('Units query failed'));

      await expect(service.getById('a1b2c3')).rejects.toThrow('Units query failed');
    });
  });

  describe('getProfile', () => {
    const baseResearcher = {
      id: '1',
      idUcrProfile: 'UCR001',
      baseUnit: 'CIMPA',
      name: 'Juan',
      firstSurname: 'Perez',
      secondSurname: 'Mora',
      ceaCategory: null,
      orcidId: null,
      linkedin: null,
      researchGate: null,
      scopus: null,
      photoUrl: null,
    };

    function mockEmptySubQueries() {
      repository.findAlternativeNames.mockResolvedValueOnce([]);
      repository.findLinkedUnits.mockResolvedValueOnce([]);
      repository.findKeywords.mockResolvedValueOnce([]);
      repository.findEducation.mockResolvedValueOnce([]);
      repository.findExperience.mockResolvedValueOnce([]);
      repository.findProjects.mockResolvedValueOnce([]);
      repository.findScientificOutputs.mockResolvedValueOnce([]);
      repository.findKeywordsByProjectIds.mockResolvedValueOnce(new Map());
      repository.findAuthorsByOutputIds.mockResolvedValueOnce(new Map());
      repository.findKeywordsByOutputIds.mockResolvedValueOnce(new Map());
    }

    it('should return null when researcher is not found', async () => {
      repository.findById.mockResolvedValueOnce(null);

      const result = await service.getProfile('nonexistent-id');

      expect(result).toBeNull();
      expect(repository.findById).toHaveBeenCalledWith('nonexistent-id');
    });

    it('should not call any sub-queries when researcher is not found', async () => {
      repository.findById.mockResolvedValueOnce(null);

      await service.getProfile('nonexistent-id');

      expect(repository.findAlternativeNames).not.toHaveBeenCalled();
      expect(repository.findLinkedUnits).not.toHaveBeenCalled();
      expect(repository.findKeywords).not.toHaveBeenCalled();
      expect(repository.findEducation).not.toHaveBeenCalled();
      expect(repository.findExperience).not.toHaveBeenCalled();
      expect(repository.findProjects).not.toHaveBeenCalled();
      expect(repository.findScientificOutputs).not.toHaveBeenCalled();
    });

    it('should map basic researcher fields', async () => {
      repository.findById.mockResolvedValueOnce(baseResearcher);
      mockEmptySubQueries();

      const result = await service.getProfile('1');

      expect(result).toMatchObject({
        id: '1',
        idUcrProfile: 'UCR001',
        baseUnit: 'CIMPA',
        name: 'Juan',
        firstSurname: 'Perez',
        secondSurname: 'Mora',
      });
    });

    it('should coerce openAccess value 1 to true', async () => {
      repository.findById.mockResolvedValueOnce(baseResearcher);
      repository.findAlternativeNames.mockResolvedValueOnce([]);
      repository.findLinkedUnits.mockResolvedValueOnce([]);
      repository.findKeywords.mockResolvedValueOnce([]);
      repository.findEducation.mockResolvedValueOnce([]);
      repository.findExperience.mockResolvedValueOnce([]);
      repository.findProjects.mockResolvedValueOnce([]);
      repository.findScientificOutputs.mockResolvedValueOnce([{
        id: 'out-1', title: 'Paper', typeName: null, openAccess: 1,
        publicationYear: 2022, doi: null, journal: null, volume: null, issue: null, pages: null,
        citationCount: null,
      }]);
      repository.findKeywordsByProjectIds.mockResolvedValueOnce(new Map());
      repository.findAuthorsByOutputIds.mockResolvedValueOnce(new Map());
      repository.findKeywordsByOutputIds.mockResolvedValueOnce(new Map());

      const result = await service.getProfile('1');

      expect(result!.scientificOutputs[0].openAccess).toBe(true);
    });

    it('should coerce openAccess value 0 to false', async () => {
      repository.findById.mockResolvedValueOnce(baseResearcher);
      repository.findAlternativeNames.mockResolvedValueOnce([]);
      repository.findLinkedUnits.mockResolvedValueOnce([]);
      repository.findKeywords.mockResolvedValueOnce([]);
      repository.findEducation.mockResolvedValueOnce([]);
      repository.findExperience.mockResolvedValueOnce([]);
      repository.findProjects.mockResolvedValueOnce([]);
      repository.findScientificOutputs.mockResolvedValueOnce([{
        id: 'out-1', title: 'Paper', typeName: null, openAccess: 0,
        publicationYear: 2022, doi: null, journal: null, volume: null, issue: null, pages: null,
        citationCount: null,
      }]);
      repository.findKeywordsByProjectIds.mockResolvedValueOnce(new Map());
      repository.findAuthorsByOutputIds.mockResolvedValueOnce(new Map());
      repository.findKeywordsByOutputIds.mockResolvedValueOnce(new Map());

      const result = await service.getProfile('1');

      expect(result!.scientificOutputs[0].openAccess).toBe(false);
    });

    it('should coerce openAccess null to false', async () => {
      repository.findById.mockResolvedValueOnce(baseResearcher);
      repository.findAlternativeNames.mockResolvedValueOnce([]);
      repository.findLinkedUnits.mockResolvedValueOnce([]);
      repository.findKeywords.mockResolvedValueOnce([]);
      repository.findEducation.mockResolvedValueOnce([]);
      repository.findExperience.mockResolvedValueOnce([]);
      repository.findProjects.mockResolvedValueOnce([]);
      repository.findScientificOutputs.mockResolvedValueOnce([{
        id: 'out-1', title: 'Paper', typeName: null, openAccess: null,
        publicationYear: 2022, doi: null, journal: null, volume: null, issue: null, pages: null,
        citationCount: null,
      }]);
      repository.findKeywordsByProjectIds.mockResolvedValueOnce(new Map());
      repository.findAuthorsByOutputIds.mockResolvedValueOnce(new Map());
      repository.findKeywordsByOutputIds.mockResolvedValueOnce(new Map());

      const result = await service.getProfile('1');

      expect(result!.scientificOutputs[0].openAccess).toBe(false);
    });

    it('should convert experience dates to ISO strings', async () => {
      const startDate = new Date('2016-01-01T00:00:00.000Z');
      const endDate = new Date('2020-12-31T00:00:00.000Z');

      repository.findById.mockResolvedValueOnce(baseResearcher);
      repository.findAlternativeNames.mockResolvedValueOnce([]);
      repository.findLinkedUnits.mockResolvedValueOnce([]);
      repository.findKeywords.mockResolvedValueOnce([]);
      repository.findEducation.mockResolvedValueOnce([]);
      repository.findExperience.mockResolvedValueOnce([{
        position: 'Professor', organization: 'UCR', startDate, endDate,
      }]);
      repository.findProjects.mockResolvedValueOnce([]);
      repository.findScientificOutputs.mockResolvedValueOnce([]);
      repository.findKeywordsByProjectIds.mockResolvedValueOnce(new Map());
      repository.findAuthorsByOutputIds.mockResolvedValueOnce(new Map());
      repository.findKeywordsByOutputIds.mockResolvedValueOnce(new Map());

      const result = await service.getProfile('1');

      expect(result!.experience[0].startDate).toBe(startDate.toISOString());
      expect(result!.experience[0].endDate).toBe(endDate.toISOString());
    });

    it('should map null experience dates to null', async () => {
      repository.findById.mockResolvedValueOnce(baseResearcher);
      repository.findAlternativeNames.mockResolvedValueOnce([]);
      repository.findLinkedUnits.mockResolvedValueOnce([]);
      repository.findKeywords.mockResolvedValueOnce([]);
      repository.findEducation.mockResolvedValueOnce([]);
      repository.findExperience.mockResolvedValueOnce([{
        position: 'Professor', organization: 'UCR', startDate: null, endDate: null,
      }]);
      repository.findProjects.mockResolvedValueOnce([]);
      repository.findScientificOutputs.mockResolvedValueOnce([]);
      repository.findKeywordsByProjectIds.mockResolvedValueOnce(new Map());
      repository.findAuthorsByOutputIds.mockResolvedValueOnce(new Map());
      repository.findKeywordsByOutputIds.mockResolvedValueOnce(new Map());

      const result = await service.getProfile('1');

      expect(result!.experience[0].startDate).toBeNull();
      expect(result!.experience[0].endDate).toBeNull();
    });

    it('should map null graduationYear to null', async () => {
      repository.findById.mockResolvedValueOnce(baseResearcher);
      repository.findAlternativeNames.mockResolvedValueOnce([]);
      repository.findLinkedUnits.mockResolvedValueOnce([]);
      repository.findKeywords.mockResolvedValueOnce([]);
      repository.findEducation.mockResolvedValueOnce([{
        degree: 'PhD', fieldOfStudy: 'CS', institution: 'UCR',
        country: 'Costa Rica', graduationYear: null,
      }]);
      repository.findExperience.mockResolvedValueOnce([]);
      repository.findProjects.mockResolvedValueOnce([]);
      repository.findScientificOutputs.mockResolvedValueOnce([]);
      repository.findKeywordsByProjectIds.mockResolvedValueOnce(new Map());
      repository.findAuthorsByOutputIds.mockResolvedValueOnce(new Map());
      repository.findKeywordsByOutputIds.mockResolvedValueOnce(new Map());

      const result = await service.getProfile('1');

      expect(result!.education[0].graduationYear).toBeNull();
    });

    it('should map project keywords from the keywords map', async () => {
      repository.findById.mockResolvedValueOnce(baseResearcher);
      repository.findAlternativeNames.mockResolvedValueOnce([]);
      repository.findLinkedUnits.mockResolvedValueOnce([]);
      repository.findKeywords.mockResolvedValueOnce([]);
      repository.findEducation.mockResolvedValueOnce([]);
      repository.findExperience.mockResolvedValueOnce([]);
      repository.findProjects.mockResolvedValueOnce([{
        id: 'proj-1', code: 'P001', name: 'AI Research', manager: null,
        startDate: null, endDate: null, researchType: null, projectType: null, status: null,
      }]);
      repository.findScientificOutputs.mockResolvedValueOnce([]);
      repository.findKeywordsByProjectIds.mockResolvedValueOnce(
        new Map([['proj-1', ['AI', 'ML']]]),
      );
      repository.findAuthorsByOutputIds.mockResolvedValueOnce(new Map());
      repository.findKeywordsByOutputIds.mockResolvedValueOnce(new Map());

      const result = await service.getProfile('1');

      expect(result!.projects[0].keywords).toEqual(['AI', 'ML']);
    });

    it('should map scientific output authors from the authors map', async () => {
      repository.findById.mockResolvedValueOnce(baseResearcher);
      repository.findAlternativeNames.mockResolvedValueOnce([]);
      repository.findLinkedUnits.mockResolvedValueOnce([]);
      repository.findKeywords.mockResolvedValueOnce([]);
      repository.findEducation.mockResolvedValueOnce([]);
      repository.findExperience.mockResolvedValueOnce([]);
      repository.findProjects.mockResolvedValueOnce([]);
      repository.findScientificOutputs.mockResolvedValueOnce([{
        id: 'out-1', title: 'A Study', typeName: null, openAccess: 0,
        publicationYear: 2022, doi: null, journal: null, volume: null, issue: null, pages: null,
        citationCount: null,
      }]);
      repository.findKeywordsByProjectIds.mockResolvedValueOnce(new Map());
      repository.findAuthorsByOutputIds.mockResolvedValueOnce(
        new Map([['out-1', ['Juan Perez', 'Maria Lopez']]]),
      );
      repository.findKeywordsByOutputIds.mockResolvedValueOnce(new Map());

      const result = await service.getProfile('1');

      expect(result!.scientificOutputs[0].authors).toEqual(['Juan Perez', 'Maria Lopez']);
    });

    it('should propagate errors from sub-queries', async () => {
      repository.findById.mockResolvedValueOnce(baseResearcher);
      repository.findAlternativeNames.mockRejectedValueOnce(new Error('Sub-query failed'));
      repository.findLinkedUnits.mockResolvedValueOnce([]);
      repository.findKeywords.mockResolvedValueOnce([]);
      repository.findEducation.mockResolvedValueOnce([]);
      repository.findExperience.mockResolvedValueOnce([]);
      repository.findProjects.mockResolvedValueOnce([]);
      repository.findScientificOutputs.mockResolvedValueOnce([]);

      await expect(service.getProfile('1')).rejects.toThrow('Sub-query failed');
    });
  });

  describe('getFilters', () => {
    it('should return base unit counts from the repository', async () => {
      repository.getBaseUnitCounts.mockResolvedValue([
        { baseUnit: 'CIMPA', count: 10 },
        { baseUnit: 'CIGEFI', count: 5 },
      ]);

      const result = await service.getFilters();

      expect(result.baseUnit).toEqual([
        { value: 'CIMPA', count: 10 },
        { value: 'CIGEFI', count: 5 },
      ]);
    });

    it('should delegate search query and filters to the repository', async () => {
      repository.getBaseUnitCounts.mockResolvedValue([]);

      await service.getFilters('Ana', { unit: ['CIMPA'] });

      expect(repository.getBaseUnitCounts).toHaveBeenCalledWith('Ana', { unit: ['CIMPA'] });
    });

    it('should coerce count to Number when Oracle returns a string', async () => {
      repository.getBaseUnitCounts.mockResolvedValue([
        { baseUnit: 'CIMPA', count: '15' as unknown as number },
      ]);

      const result = await service.getFilters();

      expect(typeof result.baseUnit[0].count).toBe('number');
      expect(result.baseUnit[0].count).toBe(15);
    });

    it('should return empty baseUnit array when no units exist', async () => {
      repository.getBaseUnitCounts.mockResolvedValue([]);

      const result = await service.getFilters();

      expect(result.baseUnit).toEqual([]);
    });

    it('should propagate errors from the repository', async () => {
      repository.getBaseUnitCounts.mockRejectedValue(new Error('DB error'));

      await expect(service.getFilters()).rejects.toThrow('DB error');
    });
  });
});
