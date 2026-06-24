import { Injectable } from '@nestjs/common';
import type {
  ProjectAssociatedProfileDto,
  ProjectDetailItemDto,
  ProjectListItemDto,
  ProjectsFiltersDto,
  ProjectsFiltersRequestDto,
  ProjectsPaginatedListDto,
  ProjectsSortRequestDto,
  ProjectsReader,
} from '../projects.reader.contract';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsReaderService implements ProjectsReader {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async getPaginatedList(
    page: number,
    limit: number,
    query?: string,
    filters?: ProjectsFiltersRequestDto,
    sort?: ProjectsSortRequestDto,
  ): Promise<ProjectsPaginatedListDto> {
    const projectsPage = await this.projectsRepository.findPaginated(
      page,
      limit,
      query,
      filters,
      sort,
    );

    let effectivePage = page;
    let effectiveItems = projectsPage.items;

    const totalPages = Math.max(1, Math.ceil(projectsPage.total / limit));

    // If the requested page is stale/out-of-range, clamp to the last valid page.
    if (projectsPage.total > 0 && page > totalPages) {
      effectivePage = totalPages;
      const lastPage = await this.projectsRepository.findPaginated(
        effectivePage,
        limit,
        query,
        filters,
        sort,
      );
      effectiveItems = lastPage.items;
    }

    return {
      items: effectiveItems.map(
        (project): ProjectListItemDto => ({
          id: project.id,
          projectManager: project.projectManager,
          code: project.code,
          name: project.name,
          keywords: project.keywords,
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

  async getFilters(
    query?: string,
    filters?: ProjectsFiltersRequestDto,
  ): Promise<ProjectsFiltersDto> {
    return this.projectsRepository.findFilterOptions(query, filters);
  }

  async getById(id: string): Promise<ProjectDetailItemDto | null> {
    const project = await this.projectsRepository.findById(id);

    if (!project) {
      return null;
    }

    return {
      id: String(project.id),
      code: project.code,
      title: project.name,
      description: project.description,
      manager: project.projectManager,
      unit: project.unit,
      disciplines: project.disciplines,
      researchType: project.researchType,
      projectType: project.projectType,
      fundingType: project.fundingType,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      keywords: project.keywords,
      associatedProfiles: project.associatedProfiles.map(
        (profile): ProjectAssociatedProfileDto => ({
          id: String(profile.id),
          name: profile.name,
          workUnits: profile.workUnits.map((unit) => ({
            id: String(unit.id),
            name: unit.name,
          })),
          ...(profile.role ? { role: profile.role } : {}),
          ...(profile.participationStartDate
            ? { participationStartDate: profile.participationStartDate }
            : {}),
          ...(profile.participationEndDate
            ? { participationEndDate: profile.participationEndDate }
            : {}),
        }),
      ),
    };
  }
}
