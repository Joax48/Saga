import {
  Controller,
  Get,
  Param,
  Query,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PaginatedListResponseDto } from '../common/dtos/paginated-list-response.dto';
import { ResearcherProfileResponseDto } from './dtos/researcher-profile-response.dto';
import { ResearcherSummaryResponseDto } from './dtos/researcher-summary-response.dto';
import { ResearchersListRequestDto } from './dtos/researchers-list-request.dto';
import { ResearchersListRequestNestedDto } from './dtos/researchers-list-request-nested.dto';
import { ResearchersFiltersRequestQueryDto } from './dtos/researchers-filters-request.dto';
import { GetResearchersPaginatedListUseCase } from '../../../application/use-cases/get-public-researchers-paginated-list.use-case';
import { GetResearcherDetailUseCase } from '../../../application/use-cases/get-public-researcher-detail.use-case';
import { GetResearcherProfileUseCase } from '../../../application/use-cases/get-public-researcher-profile.use-case';
import { GetResearchersFiltersUseCase } from '../../../application/use-cases/get-public-researchers-filters.use-case';
import { UpdateResearcherLinksUseCase } from '../../../application/use-cases/update-researcher-links.use-case';
import { UpdateResearcherPhotoUseCase } from '../../../application/use-cases/update-researcher-photo.use-case';
import { DeleteResearcherPhotoUseCase } from '../../../application/use-cases/delete-researcher-photo.use-case';
import { GetResearcherCollaborationCountriesUseCase } from '../../../application/use-cases/get-public-researcher-collaboration-countries.use-case';
import { GetResearchersCollaborationFacetUseCase } from '../../../application/use-cases/get-public-researchers-collaboration-facet.use-case';
import { UpdateResearcherLinksDto } from './dtos/researcher-update-links.dto';

@Controller('researchers')
export class PublicResearchersController {
  constructor(
    private readonly getResearchersPaginatedListUseCase: GetResearchersPaginatedListUseCase,
    private readonly getResearcherDetailUseCase: GetResearcherDetailUseCase,
    private readonly getResearcherProfileUseCase: GetResearcherProfileUseCase,
    private readonly getResearchersFiltersUseCase: GetResearchersFiltersUseCase,
    private readonly updateResearcherPhotoUseCase: UpdateResearcherPhotoUseCase,
    private readonly deleteResearcherPhotoUseCase: DeleteResearcherPhotoUseCase,
    private readonly getResearcherCollaborationCountriesUseCase: GetResearcherCollaborationCountriesUseCase,
    private readonly getResearchersCollaborationFacetUseCase: GetResearchersCollaborationFacetUseCase,
    private readonly updateResearcherLinksUseCase: UpdateResearcherLinksUseCase,
  ) {}

  @Get('filters')
  getFilters(@Query() query: ResearchersFiltersRequestQueryDto) {
    return this.getResearchersFiltersUseCase.execute(query.q, {
      unit: query.unit,
      collaborationCountry: query.collaborationCountry,
    });
  }

  // Separate (slow) facet so the unit filter above is never blocked by it.
  @Get('filters/collaboration')
  getCollaborationFacet(@Query() query: ResearchersFiltersRequestQueryDto) {
    return this.getResearchersCollaborationFacetUseCase.execute(query.q, {
      unit: query.unit,
      collaborationCountry: query.collaborationCountry,
    });
  }

  @Get('nested')
  async getResearchersPaginatedListNested(
    @Query() query: ResearchersListRequestNestedDto,
  ): Promise<PaginatedListResponseDto<ResearcherSummaryResponseDto>> {
    const researchers = await this.getResearchersPaginatedListUseCase.execute(query);

    return researchers;
  }

  @Get()
  async getResearchersPaginatedList(
    @Query() query: ResearchersListRequestDto,
  ): Promise<PaginatedListResponseDto<ResearcherSummaryResponseDto>> {
    const researchers = await this.getResearchersPaginatedListUseCase.execute(query);

    return researchers;
  }

  @Get(':id/profile')
  async getResearcherProfile(
    @Param('id') id: string,
  ): Promise<ResearcherProfileResponseDto> {
    return await this.getResearcherProfileUseCase.execute(id);
  }

  @Get(':id/collaboration-countries')
  async getResearcherCollaborationCountries(@Param('id') id: string) {
    return await this.getResearcherCollaborationCountriesUseCase.execute(id);
  }

  @Get(':id')
  async getResearcherDetail(
    @Param('id') id: string,
  ): Promise<ResearcherSummaryResponseDto> {
    return await this.getResearcherDetailUseCase.execute(id);
  }

  @Patch(':id/photo')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('photo'))
  async updateResearcherPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResearcherProfileResponseDto> {
    await this.updateResearcherPhotoUseCase.execute(id, file);
    return await this.getResearcherProfileUseCase.execute(id);
  }

  @Delete(':id/photo')
  @HttpCode(HttpStatus.OK)
  async deleteResearcherPhoto(
    @Param('id') id: string,
  ): Promise<ResearcherProfileResponseDto> {
    await this.deleteResearcherPhotoUseCase.execute(id);
    return await this.getResearcherProfileUseCase.execute(id);
  }

  @Patch(':id/links')
  @HttpCode(HttpStatus.OK)
  async updateResearcherLinks(
    @Param('id') id: string,
    @Body() dto: UpdateResearcherLinksDto,
  ): Promise<ResearcherProfileResponseDto> {
    await this.updateResearcherLinksUseCase.execute(id, dto);
    return await this.getResearcherProfileUseCase.execute(id);
  }
}
