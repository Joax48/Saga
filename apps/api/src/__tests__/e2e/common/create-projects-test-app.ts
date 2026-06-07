import type { INestApplication } from '@nestjs/common';

import { createTestApp } from './create-test-app';

import {
  DATABASE_CLIENT,
  type DatabaseClient,
} from '../../../common/database/database-client.contract';
import { PublicProjectsController } from '../../../bff/public/projects/public-projects.controller';
import { ProjectsRepository } from '../../../modules/projects/data/projects.repository';
import { GetProjectsPaginatedListUseCase } from '../../../application/use-cases/get-public-projects-paginated-list.use-case';
import { GetProjectDetailUseCase } from '../../../application/use-cases/get-public-project-detail.use-case';
import { GetProjectsFiltersUseCase } from '../../../application/use-cases/get-public-projects-filters.use-case';
import { PROJECTS_READER } from '../../../modules/projects/projects.reader.contract';
import { ProjectsReaderService } from '../../../modules/projects/data/projects.reader-service';

export async function createProjectsTestApp(
  databaseClient: jest.Mocked<DatabaseClient>,
): Promise<INestApplication> {
  const { app } = await createTestApp({
    controllers: [PublicProjectsController],
    providers: [
      ProjectsRepository,
      GetProjectsPaginatedListUseCase,
      GetProjectDetailUseCase,
      GetProjectsFiltersUseCase,
      ProjectsReaderService,
      {
        provide: PROJECTS_READER,
        useExisting: ProjectsReaderService,
      },
      {
        provide: DATABASE_CLIENT,
        useValue: databaseClient,
      },
    ],
  });
  return app;
}
