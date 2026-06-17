import { GetHomeSearchUseCase } from '../get-public-home-search.use-case';
import type { ProjectsReader } from '../../../modules/projects/projects.reader.contract';
import type { ResearchersReader } from '../../../modules/researchers/researchers.reader.contract';
import type { ScientificProductionsReader } from '../../../modules/scientific-productions/scientific-productions.reader.contract';
import type { UnitsReader } from '../../../modules/units/units.reader.contract';

describe('GetHomeSearchUseCase', () => {
  let useCase: GetHomeSearchUseCase;
  let projectsReader: jest.Mocked<ProjectsReader>;
  let researchersReader: jest.Mocked<ResearchersReader>;
  let scientificProductionsReader: jest.Mocked<ScientificProductionsReader>;
  let unitsReader: jest.Mocked<UnitsReader>;

  beforeEach(() => {
    projectsReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
      getFilters: jest.fn(),
    } as unknown as jest.Mocked<ProjectsReader>;
    researchersReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
      getProfile: jest.fn(),
      getFilters: jest.fn(),
    } as unknown as jest.Mocked<ResearchersReader>;
    scientificProductionsReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
      getFilters: jest.fn(),
    } as unknown as jest.Mocked<ScientificProductionsReader>;
    unitsReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
      getFilterOptions: jest.fn(),
      getProfilesByUnitId: jest.fn(),
      getScientificProductionsByUnitId: jest.fn(),
      getProjectsByUnitId: jest.fn(),
    } as unknown as jest.Mocked<UnitsReader>;

    useCase = new GetHomeSearchUseCase(
      projectsReader,
      researchersReader,
      scientificProductionsReader,
      unitsReader,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should query the 4 modules in parallel and return the aggregated response', async () => {
      projectsReader.getPaginatedList.mockResolvedValue({
        items: [
          {
            id: 1,
            projectManager: { id: 101, name: 'Alice Manager' },
            code: 'C3992',
            name: 'Proyecto de ejemplo',
            keywords: ['clima'],
            projectType: 'Basico',
            researchType: 'Aplicada',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      });
      researchersReader.getPaginatedList.mockResolvedValue({
        items: [
          {
            id: 'r1',
            idUcrProfile: 'UCR001',
            baseUnit: 'CIMPA',
            name: 'Juan',
            firstSurname: 'Perez',
            secondSurname: 'Mora',
            ceaCategory: 'A',
            institution: 'UCR',
            country: 'Costa Rica',
            institutions: [],
            orcidId: null,
            linkedin: null,
            researchGate: null,
            scopus: null,
            photoUrl: null,
            linkedUnits: [],
            profileType: 'UCR',
            workUnits: [],
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      });
      scientificProductionsReader.getPaginatedList.mockResolvedValue({
        items: [
          {
            id: 'sp1',
            title: 'Produccion cientifica',
            authors: null,
            type: 'Articulo',
            openAccess: true,
            publicationYear: 2024,
            doi: null,
            journal: null,
            volume: null,
            issue: null,
            pages: null,
            keywords: null,
            source: null,
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      });
      unitsReader.getPaginatedList.mockResolvedValue({
        items: [
          {
            id: 7,
            name: 'CIMPA',
            logoSvgContent: '<svg />',
            logoUnitAcronym: 'CIMPA',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      });

      const result = await useCase.execute({ q: 'ciencia' });

      expect(result.q).toBe('ciencia');
      expect(result.projects.items).toHaveLength(1);
      expect(result.researchers.items).toHaveLength(1);
      expect(result.scientificProductions.items).toHaveLength(1);
      expect(result.units.items).toHaveLength(1);

      expect(projectsReader.getPaginatedList).toHaveBeenCalledWith(1, 10, 'ciencia');
      expect(researchersReader.getPaginatedList).toHaveBeenCalledWith(1, 10, 'ciencia', {
        profileType: 'UCR',
      });
      expect(scientificProductionsReader.getPaginatedList).toHaveBeenCalledWith(1, 10, {
        q: 'ciencia',
      });
      expect(unitsReader.getPaginatedList).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        q: 'ciencia',
        isEmpty: false,
        sortBy: 'name',
        sortOrder: 'asc',
      });
    });

    it('should return empty sections when the search query is blank', async () => {
      const result = await useCase.execute({ q: '   ' });

      expect(result.q).toBeUndefined();
      expect(result.projects.items).toEqual([]);
      expect(result.researchers.items).toEqual([]);
      expect(result.scientificProductions.items).toEqual([]);
      expect(result.units.items).toEqual([]);
      expect(projectsReader.getPaginatedList).not.toHaveBeenCalled();
      expect(researchersReader.getPaginatedList).not.toHaveBeenCalled();
      expect(scientificProductionsReader.getPaginatedList).not.toHaveBeenCalled();
      expect(unitsReader.getPaginatedList).not.toHaveBeenCalled();
    });
  });
});
