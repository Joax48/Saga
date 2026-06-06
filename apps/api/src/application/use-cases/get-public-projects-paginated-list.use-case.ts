import { Inject, Injectable } from '@nestjs/common';

import { PaginatedListResponseDto } from '../../bff/public/common/dtos/paginated-list-response.dto';
import { ProjectsListRequestDto } from '../../bff/public/projects/dtos/projects-list-request.dto';
import { ProjectSummaryResponseDto } from '../../bff/public/projects/dtos/project-summary-response.dto';

import {
  PROJECTS_READER,
  type ProjectsPaginatedListDto,
  type ProjectsFiltersRequestDto,
  type ProjectsSortRequestDto,
  type ProjectsReader,
} from '../../modules/projects/projects.reader.contract';

@Injectable()
export class GetProjectsPaginatedListUseCase {
  constructor(
    @Inject(PROJECTS_READER)
    private readonly projectsReader: ProjectsReader,
  ) {}

  async execute(
    input: ProjectsListRequestDto,
  ): Promise<PaginatedListResponseDto<ProjectSummaryResponseDto>> {
    const filters: ProjectsFiltersRequestDto = {
      researchType: input.researchType,
      projectType: input.projectType,
      startYear: input.startYear,
      status: input.status,
      participants: input.participants,
      keywords: input.keywords,
    };
    const sort: ProjectsSortRequestDto = {
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    const projects = await this.projectsReader.getPaginatedList(
      input.page,
      input.limit,
      input.q,
      filters,
      sort,
    );

    return this.mapToResponseDto(projects);
  }

  private mapToResponseDto(
    projects: ProjectsPaginatedListDto,
  ): PaginatedListResponseDto<ProjectSummaryResponseDto> {
    return {
      items: projects.items.map((project) => ({
        id: project.id,
        projectManager: project.projectManager,
        code: project.code,
        name: project.name,
        keywords: project.keywords,
        projectType: project.projectType,
        researchType: project.researchType,
        startDate: project.startDate,
        endDate: project.endDate,
      })),
      page: projects.page,
      limit: projects.limit,
      total: projects.total,
    };
  }
}
