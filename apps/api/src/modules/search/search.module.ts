import { Module } from '@nestjs/common';

import { PublicHomeController } from '../../bff/public/home/public-home.controller';
import { GetHomeSearchUseCase } from '../../application/use-cases/get-public-home-search.use-case';
import { ProjectsModule } from '../projects/projects.module';
import { ResearchersModule } from '../researchers/researchers.module';
import { ScientificProductionsModule } from '../scientific-productions/scientific-productions.module';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [ProjectsModule, ResearchersModule, ScientificProductionsModule, UnitsModule],
  controllers: [PublicHomeController],
  providers: [GetHomeSearchUseCase],
})
export class SearchModule {}
