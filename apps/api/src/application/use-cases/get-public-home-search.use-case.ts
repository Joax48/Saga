import { Inject, Injectable } from '@nestjs/common';

import { PaginatedListResponseDto } from '../../bff/public/common/dtos/paginated-list-response.dto';
import { HomeSearchRequestDto } from '../../bff/public/home/dtos/home-search-request.dto';
import { ProjectSummaryResponseDto } from '../../bff/public/projects/dtos/project-summary-response.dto';
import { ResearcherSummaryResponseDto } from '../../bff/public/researchers/dtos/researcher-summary-response.dto';
import { ScientificProductionSummaryResponseDto } from '../../bff/public/scientific-productions/dtos/public-scientific-productions-summary-response.dto';
import { UnitSummaryResponseDto } from '../../bff/public/units/dtos/unit-summary-response.dto';
import {
  PROJECTS_READER,
  type ProjectsReader,
  type ProjectsPaginatedListDto,
} from '../../modules/projects/projects.reader.contract';
import {
  RESEARCHERS_READER,
  type ResearchersPaginatedListDto,
  type ResearchersReader,
} from '../../modules/researchers/researchers.reader.contract';
import {
  SCIENTIFIC_PRODUCTIONS_READER,
  type ScientificProductionsPaginatedListDto,
  type ScientificProductionsReader,
} from '../../modules/scientific-productions/scientific-productions.reader.contract';
import {
  UNITS_READER,
  type UnitsPaginatedListDto,
  type UnitsReader,
} from '../../modules/units/units.reader.contract';
import { HomeResponseDto } from '../../bff/public/home/dtos/home-response.dto';

const HOMEPAGE_SEARCH_LIMIT = 10;

@Injectable()
export class GetHomeSearchUseCase {
  constructor(
    @Inject(PROJECTS_READER)
    private readonly projectsReader: ProjectsReader,
    @Inject(RESEARCHERS_READER)
    private readonly researchersReader: ResearchersReader,
    @Inject(SCIENTIFIC_PRODUCTIONS_READER)
    private readonly scientificProductionsReader: ScientificProductionsReader,
    @Inject(UNITS_READER)
    private readonly unitsReader: UnitsReader,
  ) {}

  async execute(input: HomeSearchRequestDto): Promise<HomeResponseDto> {
    const q = input.q?.trim();

    if (!q) {
      return this.buildEmptyResponse();
    }

    const [projects, researchers, scientificProductions, units] = await Promise.all([
      this.projectsReader.getPaginatedList(1, HOMEPAGE_SEARCH_LIMIT, q),
      this.researchersReader.getPaginatedList(1, HOMEPAGE_SEARCH_LIMIT, q, {
        profileType: 'UCR',
      }),
      this.scientificProductionsReader.getPaginatedList(1, HOMEPAGE_SEARCH_LIMIT, q),
      this.unitsReader.getPaginatedList({
        page: 1,
        limit: HOMEPAGE_SEARCH_LIMIT,
        q,
        isEmpty: false,
        sortBy: 'name',
        sortOrder: 'asc',
      }),
    ]);

    return {
      q,
      projects: this.mapProjectsResponse(projects),
      researchers: this.mapResearchersResponse(researchers),
      scientificProductions: this.mapScientificProductionsResponse(scientificProductions),
      units: this.mapUnitsResponse(units),
    };
  }

  private buildEmptyResponse(): HomeResponseDto {
    return {
      q: undefined,
      projects: this.createEmptyPaginatedResponse<ProjectSummaryResponseDto>(),
      researchers: this.createEmptyPaginatedResponse<ResearcherSummaryResponseDto>(),
      scientificProductions:
        this.createEmptyPaginatedResponse<ScientificProductionSummaryResponseDto>(),
      units: this.createEmptyPaginatedResponse<UnitSummaryResponseDto>(),
    };
  }

  private createEmptyPaginatedResponse<T>(): PaginatedListResponseDto<T> {
    return {
      items: [],
      page: 1,
      limit: HOMEPAGE_SEARCH_LIMIT,
      total: 0,
    };
  }

  private mapProjectsResponse(
    projects: ProjectsPaginatedListDto,
  ): PaginatedListResponseDto<ProjectSummaryResponseDto> {
    return {
      items: projects.items.map((project) => ({ ...project })),
      page: projects.page,
      limit: projects.limit,
      total: projects.total,
    };
  }

  private mapResearchersResponse(
    researchers: ResearchersPaginatedListDto,
  ): PaginatedListResponseDto<ResearcherSummaryResponseDto> {
    return {
      items: researchers.items.map((researcher) => ({ ...researcher })),
      page: researchers.page,
      limit: researchers.limit,
      total: researchers.total,
    };
  }

  private mapScientificProductionsResponse(
    scientificProductions: ScientificProductionsPaginatedListDto,
  ): PaginatedListResponseDto<ScientificProductionSummaryResponseDto> {
    return {
      items: scientificProductions.items.map((scientificProduction) => ({
        ...scientificProduction,
      })),
      page: scientificProductions.page,
      limit: scientificProductions.limit,
      total: scientificProductions.total,
    };
  }

  private mapUnitsResponse(
    units: UnitsPaginatedListDto,
  ): PaginatedListResponseDto<UnitSummaryResponseDto> {
    return {
      items: units.items.map((unit) => ({ ...unit })),
      page: units.page,
      limit: units.limit,
      total: units.total,
    };
  }
}
