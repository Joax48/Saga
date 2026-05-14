import { Inject, Injectable } from '@nestjs/common';

import { ProjectsFiltersResponseDto } from '../../bff/public/projects/dtos/projects-filters-response.dto';
import { ProjectsFiltersRequestDto } from '../../bff/public/projects/dtos/projects-filters-request.dto';
import {
  PROJECTS_READER,
  type ProjectsReader,
} from '../../modules/projects/projects.reader.contract';

@Injectable()
export class GetProjectsFiltersUseCase {
  constructor(
    @Inject(PROJECTS_READER)
    private readonly projectsReader: ProjectsReader,
  ) {}

  async execute(input: ProjectsFiltersRequestDto): Promise<ProjectsFiltersResponseDto> {
    return this.projectsReader.getFilterOptions(input.q, {
      researchType: input.researchType,
      projectType: input.projectType,
      startYear: input.startYear,
      status: input.status,
      participants: input.participants,
      keywords: input.keywords,
    });
  }
}
