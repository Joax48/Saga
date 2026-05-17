import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ResearcherProfileResponseDto } from '../../bff/public/researchers/dtos/researcher-profile-response.dto';
import {
  RESEARCHERS_READER,
  type ResearchersReader,
} from '../../modules/researchers/researchers.reader.contract';

@Injectable()
export class GetResearcherProfileUseCase {
  constructor(
    @Inject(RESEARCHERS_READER)
    private readonly researchersReader: ResearchersReader,
  ) {}

  async execute(id: string): Promise<ResearcherProfileResponseDto> {
    const profile = await this.researchersReader.getProfile(id);

    if (!profile) {
      throw new NotFoundException(`Researcher with id "${id}" not found`);
    }

    return profile;
  }
}
