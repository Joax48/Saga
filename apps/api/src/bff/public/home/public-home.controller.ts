import { Controller, Get, Query } from '@nestjs/common';

import { HomeSearchRequestDto } from './dtos/home-search-request.dto';
import { HomeResponseDto } from './dtos/home-response.dto';
import { GetHomeSearchUseCase } from '../../../application/use-cases/get-public-home-search.use-case';

@Controller('home')
export class PublicHomeController {
  constructor(private readonly getHomeSearchUseCase: GetHomeSearchUseCase) {}

  @Get()
  async getHome(@Query() query: HomeSearchRequestDto): Promise<HomeResponseDto> {
    return this.getHomeSearchUseCase.execute(query);
  }
}
