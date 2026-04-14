// Researchers service — business logic on top of the researchers repository.
// Expected methods: findAll, findById, search, count, findFeatured, remove.

import { Injectable } from '@nestjs/common';
import type {
  ResearcherListItemDto,
  ResearchersPaginatedListDto,
  ResearchersReader,
} from '../researchers.reader.contract';
import { ResearchersRepository } from './researchers.repository';

@Injectable()
export class ResearchersReaderService implements ResearchersReader {
  constructor(private readonly researchersRepository: ResearchersRepository) {}

  async getPaginatedList(
    page: number,
    limit: number,
    name?: string,
  ): Promise<ResearchersPaginatedListDto> {
    const researchersPage = await this.researchersRepository.findPaginated(page, limit, name);

    return {
      items: researchersPage.items.map(
        (researcher): ResearcherListItemDto => ({
          id: researcher.id,
          idUcrProfile: researcher.idUcrProfile,
          baseUnit: researcher.baseUnit,
          name: researcher.name,
          firstSurname: researcher.firstSurname,
          secondSurname: researcher.secondSurname,
          ceaCategory: researcher.ceaCategory,
          orcidId: researcher.orcidId,
          linkedin: researcher.linkedin,
          researchGate: researcher.researchGate,
          scopus: researcher.scopus,
          photoUrl: researcher.photoUrl,
        }),
      ),
      page,
      limit,
      total: researchersPage.total,
    };
  }
}
