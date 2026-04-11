import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { PROJECTS_READER } from './projects.reader.contract';
import { ProjectsReaderService } from './data/projects.reader-service';
import { ProjectsRepository } from './data/projects.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    ProjectsRepository,
    ProjectsReaderService,
    {
      provide: PROJECTS_READER,
      useExisting: ProjectsReaderService,
    },
  ],
  exports: [PROJECTS_READER],
})
export class ProjectsModule {}
