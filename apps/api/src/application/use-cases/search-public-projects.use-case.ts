import { Inject, Injectable } from '@nestjs/common';

import { PaginatedListResponseDto } from '../../bff/public/common/dtos/paginated-list-response.dto';
import { ProjectSummaryResponseDto } from '../../bff/public/projects/dtos/project-summary-response.dto';
import { SearchProjectsRequestDto } from '../../bff/public/projects/dtos/search-projects-request.dto';

import {
  PROJECTS_READER,
  type ProjectsPaginatedListDto,
  type ProjectsReader,
} from '../../modules/projects/projects.reader.contract';

@Injectable()
export class SearchPublicProjectsUseCase {
  constructor(
    @Inject(PROJECTS_READER)
    private readonly projectsReader: ProjectsReader,
  ) {}

  async execute(
    input: SearchProjectsRequestDto,
  ): Promise<PaginatedListResponseDto<ProjectSummaryResponseDto>> {
    const projects = await this.projectsReader.searchByNameOrCode(
      input.q,
      input.page,
      input.limit,
    );

    return this.mapToResponseDto(projects);
  }

  private mapToResponseDto(
    projects: ProjectsPaginatedListDto,
  ): PaginatedListResponseDto<ProjectSummaryResponseDto> {
    return {
      items: projects.items.map((project) => ({
        code: project.code,
        name: project.name,
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
