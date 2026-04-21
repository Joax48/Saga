import { Controller, Get, Query } from '@nestjs/common';

import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { ProjectsListRequestDto } from './dtos/projects-list-request.dto';
import { ProjectSummaryResponseDto } from './dtos/project-summary-response.dto';

import { GetProjectsPaginatedListUseCase } from '../../../application/use-cases/get-public-projects-paginated-list.use-case';

@Controller('projects')
export class PublicProjectsController {
  constructor(
    private readonly getProjectsPaginatedListUseCase: GetProjectsPaginatedListUseCase,
  ) {}

  @Get()
  async getProjectsPaginatedList(
    @Query() query: ProjectsListRequestDto,
  ): Promise<PaginatedListResponseDto<ProjectSummaryResponseDto>> {
    const projects = await this.getProjectsPaginatedListUseCase.execute(query);

    return projects;
  }
}
