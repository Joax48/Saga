import { Injectable } from '@nestjs/common';
import type {
  ResearcherListItemDto,
  ResearchersFiltersRequestDto,
  ResearchersPaginatedListDto,
  ResearchersReader,
} from '../researchers.reader.contract';
import { ResearchersRepository } from './researchers.repository';

/**
 * Service layer between the repository and the use cases.
 * Its responsibility is to transform raw database records (entities)
 * into the format the application expects (DTOs).
 */
@Injectable()
export class ResearchersReaderService implements ResearchersReader {
  constructor(private readonly researchersRepository: ResearchersRepository) {}

  // ── Paginated list ────────────────────────────────────────────────────────

  async getPaginatedList(
    page: number,
    limit: number,
    query?: string,
    filters?: ResearchersFiltersRequestDto,
  ): Promise<ResearchersPaginatedListDto> {
    const researchersPage = await this.researchersRepository.findPaginated(
      page,
      limit,
      query,
      filters,
    );

    return {
      // Maps each Researcher entity to the DTO exposed by the API
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

  // ── Detail by ID ──────────────────────────────────────────────────────────

  async getById(id: string): Promise<ResearcherListItemDto | null> {
    const researcher = await this.researchersRepository.findById(id);

    if (!researcher) {
      return null;
    }

    return {
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
    };
  }

  // ── Filters with count ────────────────────────────────────────────────────

  /**
   * Returns the available academic units along with the number of
   * researchers that belong to each one.
   *
   * Before: called getDistinctBaseUnits() which returned string[],
   *         and the frontend hardcoded count: 0 for every option.
   *
   * Now: calls getBaseUnitCounts() which runs a GROUP BY + COUNT in
   *      Oracle and returns the real number of researchers per unit.
   *      Number() is used to ensure the count is numeric, since Oracle
   *      may return LOB-type values in certain driver contexts.
   */
  async getFilters(): Promise<{ baseUnit: { value: string; count: number }[] }> {
    const units = await this.researchersRepository.getBaseUnitCounts();

    return {
      baseUnit: units.map(({ baseUnit, count }) => ({
        value: baseUnit,
        count: Number(count),
      })),
    };
  }
}
