import { GetProjectsFiltersUseCase } from '../get-public-projects-filters.use-case';
import type { ProjectsReader } from '../../../modules/projects/projects.reader.contract';

describe('GetProjectsFiltersUseCase', () => {
  let useCase: GetProjectsFiltersUseCase;
  let projectsReader: jest.Mocked<ProjectsReader>;

  beforeEach(() => {
    projectsReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
      getFilters: jest.fn(),
    } as unknown as jest.Mocked<ProjectsReader>;

    useCase = new GetProjectsFiltersUseCase(projectsReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return filter options from the reader', async () => {
    const mockResponse = {
      researchType: [{ label: 'Basica', value: 'basica', count: 2 }],
      projectType: [{ label: 'Proyecto', value: 'proyecto', count: 3 }],
      startYear: [{ label: '2024', value: '2024', count: 1 }],
      status: [{ label: 'Activo', value: 'activo', count: 4 }],
      participants: [{ label: 'Koen Voorend', value: 'koen voorend', count: 1 }],
      keywords: [{ label: 'Economia', value: 'economia', count: 5 }],
    };

    projectsReader.getFilters.mockResolvedValue(mockResponse);

    const result = await useCase.execute({
      q: 'clima',
      researchType: ['Basica'],
      projectType: ['Proyecto'],
      startYear: ['2024'],
      status: ['Activo'],
      participants: ['Koen Voorend'],
      keywords: ['Economia'],
    });

    expect(result).toEqual(mockResponse);
    expect(projectsReader.getFilters).toHaveBeenCalledWith('clima', {
      researchType: ['Basica'],
      projectType: ['Proyecto'],
      startYear: ['2024'],
      status: ['Activo'],
      participants: ['Koen Voorend'],
      keywords: ['Economia'],
    });
    expect(projectsReader.getFilters).toHaveBeenCalledTimes(1);
  });

  it('should pass undefined filters through unchanged', async () => {
    const mockResponse = {
      researchType: [],
      projectType: [],
      startYear: [],
      status: [],
      participants: [],
      keywords: [],
    };

    projectsReader.getFilters.mockResolvedValue(mockResponse);

    const result = await useCase.execute({});

    expect(result).toEqual(mockResponse);
    expect(projectsReader.getFilters).toHaveBeenCalledWith(undefined, {
      researchType: undefined,
      projectType: undefined,
      startYear: undefined,
      status: undefined,
      participants: undefined,
      keywords: undefined,
    });
  });
});
