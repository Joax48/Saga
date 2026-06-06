import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggerModule } from './common/logger/logger.module';
import { SearchModule } from './modules/search/search.module';
import { CacheModule } from './modules/cache/cache.module';
import { DatabaseModule } from './common/database/database.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { UnitsModule } from './modules/units/units.module';
import { PublicUnitsController } from './bff/public/units/public-units.controller';
import { GetUnitsPaginatedListUseCase } from './application/use-cases/get-public-units-paginated-list.use-case';
import { GetPublicUnitDetailUseCase } from './application/use-cases/get-public-unit-detail.use-case';
import { GetUnitsFiltersUseCase } from './application/use-cases/get-public-units-filters.use-case';
import { GetPublicUnitProfilesUseCase } from './application/use-cases/get-public-unit-profiles.use-case';
import { GetPublicUnitScientificProductionsUseCase } from './application/use-cases/get-public-unit-scientific-productions.use-case';
import { GetPublicUnitProjectsUseCase } from './application/use-cases/get-public-unit-projects.use-case';
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
import { GetResearcherProfileUseCase } from './application/use-cases/get-public-researcher-profile.use-case';
import { GetResearchersFiltersUseCase } from './application/use-cases/get-public-researchers-filters.use-case';
import { GetResearcherCollaborationCountriesUseCase } from './application/use-cases/get-public-researcher-collaboration-countries.use-case';
import { GetResearchersCollaborationFacetUseCase } from './application/use-cases/get-public-researchers-collaboration-facet.use-case';
import { UpdateResearcherLinksUseCase } from './application/use-cases/update-researcher-links.use-case';
import { GetProjectDetailUseCase } from './application/use-cases/get-public-project-detail.use-case';
import { GetScientificProductionsFiltersUseCase } from './application/use-cases/get-public-scientific-production-filters.use-case';

const REQUIRED_ENVIRONMENT_VARIABLES = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_CONNECT_STRING',
  'DB_SCHEMA',
] as const;

const validateEnvironment = (env: Record<string, string | undefined>) => {
  for (const key of REQUIRED_ENVIRONMENT_VARIABLES) {
    if (!env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  return env;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnvironment,
    }),
    LoggerModule,
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
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    GetProjectsPaginatedListUseCase,
    GetProjectsFiltersUseCase,
    GetProjectDetailUseCase,
    GetScientificProductionPaginatedListUseCase,
    GetScientificProductionDetailUseCase,
    GetScientificProductionsFiltersUseCase,
    GetResearchersPaginatedListUseCase,
    GetResearcherDetailUseCase,
    GetResearcherProfileUseCase,
    GetResearchersFiltersUseCase,
    GetResearcherCollaborationCountriesUseCase,
    GetResearchersCollaborationFacetUseCase,
    UpdateResearcherLinksUseCase,
    GetUnitsPaginatedListUseCase,
    GetPublicUnitDetailUseCase,
    GetUnitsFiltersUseCase,
    GetPublicUnitProfilesUseCase,
    GetPublicUnitScientificProductionsUseCase,
    GetPublicUnitProjectsUseCase,
  ],
})
export class AppModule {}
