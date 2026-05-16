import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchModule } from './modules/search/search.module';
import { CacheModule } from './modules/cache/cache.module';
import { DatabaseModule } from './common/database/database.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { UnitsModule } from './modules/units/units.module';
import { PublicUnitsController } from './bff/public/units/public-units.controller';
import { GetUnitsPaginatedListUseCase } from './application/use-cases/get-public-units-paginated-list.use-case';
import { GetPublicUnitDetailUseCase } from './application/use-cases/get-public-unit-detail.use-case';
import { ResearchersModule } from './modules/researchers/researchers.module';
import { ScientificProductionsModule } from './modules/scientific-productions/scientific-productions.module';
import { PublicProjectsController } from './bff/public/projects/public-projects.controller';
import { PublicScientificProductionsController } from './bff/public/scientific-productions/public-scientific-productions.controller';
import { GetProjectsPaginatedListUseCase } from './application/use-cases/get-public-projects-paginated-list.use-case';
import { GetProjectsFiltersUseCase } from './application/use-cases/get-public-projects-filters.use-case';

import { PublicResearchersController } from './bff/public/researchers/public-researchers.controller';
import { GetResearchersPaginatedListUseCase } from './application/use-cases/get-public-researchers-paginated-list.use-case';
import { GetScientificProductionPaginatedListUseCase } from './application/use-cases/get-public-scientific-productions-paginated-list.use-case';
import { GetScientificProductionDetailUseCase } from './application/use-cases/get-public-scientific-production-detail.use-case';
import { GetResearcherDetailUseCase } from './application/use-cases/get-public-researcher-detail.use-case';
import { GetResearchersFiltersUseCase } from './application/use-cases/get-public-researchers-filters.use-case';
import { GetProjectDetailUseCase } from './application/use-cases/get-public-project-detail.use-case';

// Root application module.
// When domain modules (ResearchersModule, UnitsModule, ProjectsModule,
// ScientificProductionsModule, AuthModule), BFF controllers, DatabaseModule,
// and application queries are implemented, import and register them here.

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '../../.env'],
    }),
    SearchModule,
    CacheModule,
    DatabaseModule,
    ProjectsModule,
    ScientificProductionsModule,
    UnitsModule,
    ResearchersModule,
  ],
  controllers: [
    PublicProjectsController,
    PublicScientificProductionsController,
    PublicResearchersController,
    PublicUnitsController,
  ],
  providers: [
    GetProjectsPaginatedListUseCase,
    GetProjectsFiltersUseCase,
    GetProjectDetailUseCase,
    GetScientificProductionPaginatedListUseCase,
    GetScientificProductionDetailUseCase,
    GetResearchersPaginatedListUseCase,
    GetResearcherDetailUseCase,
    GetUnitsPaginatedListUseCase,
    GetPublicUnitDetailUseCase,
    GetResearchersFiltersUseCase,
  ],
})
export class AppModule {}
