import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PaginatedListRequestDto } from '../common/dtos/paginated-list-request.dto';
import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { UnitSummaryResponseDto } from './dtos/unit-summary-response.dto';
import { UnitDetailResponseDto } from './dtos/unit-detail-response.dto';
import { UnitProfileResponseDto } from './dtos/unit-profile-response.dto';
import { UnitScientificProductionResponseDto } from './dtos/unit-scientific-production-response.dto';
import { UnitProjectResponseDto } from './dtos/unit-project-response.dto';

import { GetUnitsPaginatedListUseCase } from '../../../application/use-cases/get-public-units-paginated-list.use-case';
import { GetPublicUnitDetailUseCase } from '../../../application/use-cases/get-public-unit-detail.use-case';
import { GetPublicUnitProfilesUseCase } from '../../../application/use-cases/get-public-unit-profiles.use-case';
import { GetPublicUnitScientificProductionsUseCase } from '../../../application/use-cases/get-public-unit-scientific-productions.use-case';
import { GetPublicUnitProjectsUseCase } from '../../../application/use-cases/get-public-unit-projects.use-case';
import { UnitSearchFiltersDTO } from './dtos/unit-search-filters-dto';
import { UnitSearchSortDTO } from './dtos/unit-search-sort-dto';
import { UnitSearchDTO } from './dtos/unit-search-dto';

@Controller('units')
export class PublicUnitsController {
  constructor(
    private readonly getUnitsPaginatedListUseCase: GetUnitsPaginatedListUseCase,
    private readonly getPublicUnitDetailUseCase: GetPublicUnitDetailUseCase,
    private readonly getPublicUnitProfilesUseCase: GetPublicUnitProfilesUseCase,
    private readonly getPublicUnitScientificProductionsUseCase: GetPublicUnitScientificProductionsUseCase,
    private readonly getPublicUnitProjectsUseCase: GetPublicUnitProjectsUseCase,
  ) {}

  @Get()
  async getUnitsPaginatedList(
    @Query() query: UnitSearchDTO,
  ): Promise<PaginatedListResponseDto<UnitSummaryResponseDto>> {
    return this.getUnitsPaginatedListUseCase.execute(query);
  }

  @Get(':id')
  async getUnitDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UnitDetailResponseDto> {
    return this.getPublicUnitDetailUseCase.execute(id);
  }

  @Get(':id/profiles')
  async getUnitProfiles(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UnitProfileResponseDto[]> {
    return this.getPublicUnitProfilesUseCase.execute(id);
  }

  @Get(':id/scientific-productions')
  async getUnitScientificProductions(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UnitScientificProductionResponseDto[]> {
    return this.getPublicUnitScientificProductionsUseCase.execute(id);
  }

  @Get(':id/projects')
  async getUnitProjects(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UnitProjectResponseDto[]> {
    return this.getPublicUnitProjectsUseCase.execute(id);
  }
}
