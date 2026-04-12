import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { UNITS_READER } from './units.reader.contract';
import { UnitsReaderService } from './data/units.reader-service';
import { UnitsRepository } from './data/units.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    UnitsRepository,
    UnitsReaderService,
    {
      provide: UNITS_READER,
      useExisting: UnitsReaderService,
    },
  ],
  exports: [UNITS_READER],
})
export class UnitsModule {}
