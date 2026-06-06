import { PaginatedListResponseDto } from '../../common/dtos/paginated-list-response.dto';
import { ProjectSummaryResponseDto } from '../../projects/dtos/project-summary-response.dto';
import { ResearcherSummaryResponseDto } from '../../researchers/dtos/researcher-summary-response.dto';
import { ScientificProductioSummaryResponseDto } from '../../scientific-productions/dtos/public-scientific-productions-summary-response.dto';
import { UnitSummaryResponseDto } from '../../units/dtos/unit-summary-response.dto';

export class HomeResponseDto {
  q?: string;
  projects!: PaginatedListResponseDto<ProjectSummaryResponseDto>;
  researchers!: PaginatedListResponseDto<ResearcherSummaryResponseDto>;
  scientificProductions!: PaginatedListResponseDto<ScientificProductioSummaryResponseDto>;
  units!: PaginatedListResponseDto<UnitSummaryResponseDto>;
}
