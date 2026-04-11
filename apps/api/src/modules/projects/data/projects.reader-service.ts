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
          projectType: project.projectType,
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

  async searchByNameOrCode(
    query: string,
    page: number,
    limit: number,
  ): Promise<ProjectsPaginatedListDto> {
    const projectsPage = await this.projectsRepository.searchByNameOrCode(
      query,
      page,
      limit,
    );

    let effectivePage = page;
    let effectiveItems = projectsPage.items;

    const totalPages = Math.max(1, Math.ceil(projectsPage.total / limit));

    // If the requested page is stale/out-of-range, clamp to the last valid page.
    if (projectsPage.total > 0 && page > totalPages) {
      effectivePage = totalPages;
      const lastPage = await this.projectsRepository.searchByNameOrCode(
        query,
        effectivePage,
        limit,
      );
      effectiveItems = lastPage.items;
    }

    return {
      items: effectiveItems.map(
        (project): ProjectListItemDto => ({
          code: project.code,
          name: project.name,
          projectType: project.projectType,
          researchType: project.researchType,
          startDate: project.startDate,
          endDate: project.endDate,
        }),
      ),
      page: effectivePage,
      limit,
      total: projectsPage.total,
    };
  }
}
