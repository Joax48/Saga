import { Controller, Get, Param, Query } from '@nestjs/common';

import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { ProjectDetailResponseDto } from './dtos/project-detail-response.dto';
import { ProjectsListRequestDto } from './dtos/projects-list-request.dto';
import { ProjectSummaryResponseDto } from './dtos/project-summary-response.dto';

import { GetProjectDetailUseCase } from '../../../application/use-cases/get-public-project-detail.use-case';
import { GetProjectsPaginatedListUseCase } from '../../../application/use-cases/get-public-projects-paginated-list.use-case';

@Controller('projects')
export class PublicProjectsController {
  constructor(
    private readonly getProjectsPaginatedListUseCase: GetProjectsPaginatedListUseCase,
    private readonly getProjectDetailUseCase: GetProjectDetailUseCase,
  ) {}

  @Get()
  async getProjectsPaginatedList(
    @Query() query: ProjectsListRequestDto,
  ): Promise<PaginatedListResponseDto<ProjectSummaryResponseDto>> {
    const projects = await this.getProjectsPaginatedListUseCase.execute(query);

    return projects;
  }

  @Get(':id')
  async getProjectDetail(@Param('id') id: string): Promise<ProjectDetailResponseDto> {
    return this.getProjectDetailUseCase.execute(id);
  }
}
