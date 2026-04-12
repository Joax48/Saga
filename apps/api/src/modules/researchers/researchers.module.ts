// Researchers module — registers ResearchersRepository and ResearchersService.
// Exports ResearchersService for use in other modules and application queries.

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { RESEARCHERS_READER } from './researchers.reader.contract';
import { ResearchersReaderService } from './data/researchers.reader-service';
import { ResearchersRepository } from './data/researchers.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    ResearchersRepository,
    ResearchersReaderService,
    {
      provide: RESEARCHERS_READER,
      useExisting: ResearchersReaderService,
    },
  ],
  exports: [RESEARCHERS_READER],
})
export class ResearchersModule {}
