import { NotFoundException } from '../../../application/common/exceptions';

import { GetProjectDetailUseCase } from '../get-public-project-detail.use-case';
import type { ProjectsReader } from '../../../modules/projects/projects.reader.contract';

describe('GetProjectDetailUseCase', () => {
  let useCase: GetProjectDetailUseCase;
  let projectsReader: jest.Mocked<ProjectsReader>;

  beforeEach(() => {
    projectsReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
    } as unknown as jest.Mocked<ProjectsReader>;

    useCase = new GetProjectDetailUseCase(projectsReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the project detail from the reader', async () => {
    const project = {
      id: '1',
      code: 'C3992',
      title: 'El costo de una vida digna en Costa Rica',
      description: 'Descripcion del proyecto',
      manager: {
        id: 2,
        name: 'Koen Voorend',
        participationStartDate: '2023-06-01',
        participationEndDate: '2025-12-31',
      },
      unit: { id: 15, name: 'Instituto de Investigaciones Sociales' },
      disciplines: ['Ciencias Sociales', 'Estadistica'],
      researchType: 'Basica',
      projectType: 'Proyecto',
      fundingType: 'Financiamiento UCREA',
      status: 'Vencido',
      startDate: '2023-06-01',
      endDate: '2025-12-31',
      keywords: ['pobreza', 'economia social'],
      associatedProfiles: [
        {
          id: '2',
          name: 'Koen Voorend',
          workUnits: [{ id: '15', name: 'Instituto de Investigaciones Sociales' }],
          role: 'Investigador principal',
        },
      ],
    };
    projectsReader.getById.mockResolvedValue(project);

    await expect(useCase.execute('1')).resolves.toEqual(project);
    expect(projectsReader.getById).toHaveBeenCalledWith('1');
  });

  it('should throw NotFoundException when the project does not exist', async () => {
    projectsReader.getById.mockResolvedValue(null);

    await expect(useCase.execute('99')).rejects.toThrow(NotFoundException);
  });
});
