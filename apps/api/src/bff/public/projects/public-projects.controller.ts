import { Controller, Get, Query } from '@nestjs/common';

import { PaginatedListRequestDto } from '../common/dtos/paginated-list-request.dto';
import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { ProjectSummaryResponseDto } from './dtos/project-summary-response.dto';
import { SearchProjectsRequestDto } from './dtos/search-projects-request.dto';

import { GetProjectsPaginatedListUseCase } from '../../../application/use-cases/get-public-projects-paginated-list.use-case';
import { SearchPublicProjectsUseCase } from '../../../application/use-cases/search-public-projects.use-case';

@Controller('projects')
export class PublicProjectsController {
  constructor(
    private readonly getProjectsPaginatedListUseCase: GetProjectsPaginatedListUseCase,
    private readonly searchPublicProjectsUseCase: SearchPublicProjectsUseCase,
  ) {}

  @Get('search')
  async searchProjects(
    @Query() query: SearchProjectsRequestDto,
  ): Promise<PaginatedListResponseDto<ProjectSummaryResponseDto>> {
    const projects = await this.searchPublicProjectsUseCase.execute(query);

    return projects;
  }

  @Get()
  async getProjectsPaginatedList(
    @Query() query: PaginatedListRequestDto,
  ): Promise<PaginatedListResponseDto<ProjectSummaryResponseDto>> {
    const projects = await this.getProjectsPaginatedListUseCase.execute(query);

    return projects;
  }
}
