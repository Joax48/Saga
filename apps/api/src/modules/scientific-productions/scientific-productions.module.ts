import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { SCIENTIFIC_PRODUCTIONS_READER } from './scientific-productions.reader.contract';
import { ScientificProductionsService } from './data/scientific-productions.reader-service';
import { ScientificProductionRepository } from './data/scientific-productions.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    ScientificProductionsService,
    ScientificProductionRepository,
    {
      provide: SCIENTIFIC_PRODUCTIONS_READER,
      useExisting: ScientificProductionsService,
    },
  ],
  exports: [SCIENTIFIC_PRODUCTIONS_READER],
})
export class ScientificProductionsModule {}
