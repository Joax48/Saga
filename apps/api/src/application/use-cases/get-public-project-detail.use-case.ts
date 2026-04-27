import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ProjectDetailResponseDto } from '../../bff/public/projects/dtos/project-detail-response.dto';
import {
  PROJECTS_READER,
  type ProjectsReader,
} from '../../modules/projects/projects.reader.contract';

@Injectable()
export class GetProjectDetailUseCase {
  constructor(
    @Inject(PROJECTS_READER)
    private readonly projectsReader: ProjectsReader,
  ) {}

  async execute(id: string): Promise<ProjectDetailResponseDto> {
    const project = await this.projectsReader.getById(id);

    if (!project) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }

    return project;
  }
}
