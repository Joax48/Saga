import { Injectable } from '@nestjs/common';
import type {
  ProjectListItemDto,
  ProjectsPaginatedListDto,
  ProjectsReader,
} from '../projects.reader.contract';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsReaderService implements ProjectsReader {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async getPaginatedList(page: number, limit: number): Promise<ProjectsPaginatedListDto> {
    const projectsPage = await this.projectsRepository.findPaginated(page, limit);

    return {
      items: projectsPage.items.map(
        (project): ProjectListItemDto => ({
          code: project.code,
          name: project.name,
          researchType: project.researchType,
          startDate: project.startDate,
          endDate: project.endDate,
        }),
      ),
      page,
      limit,
      total: projectsPage.total,
    };
  }
}
