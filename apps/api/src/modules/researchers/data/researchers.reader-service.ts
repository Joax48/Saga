import { Injectable } from '@nestjs/common';
import type {
  ResearcherCollaborationCountryDto,
  ResearcherListItemDto,
  ResearcherProfileDto,
  ResearcherScientificOutputDto,
  ResearchersCollaborationFacetDto,
  ResearchersFiltersDto,
  ResearchersFiltersRequestDto,
  ResearchersPaginatedListDto,
  ResearchersReader,
} from '../researchers.reader.contract';
import { ResearchersRepository } from './researchers.repository';

/**
 * Converts the photo BLOB to a base64 data URL, or null if no photo is stored.
 * Every photo is stored as JPEG (see UpdateResearcherPhotoUseCase), so the mime
 * type is fixed and no per-buffer format detection is needed.
 */
function resolvePhotoUrl(photoData: Buffer | null): string | null {
  if (!photoData?.length) return null;
  return `data:image/jpeg;base64,${photoData.toString('base64')}`;
}

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

    // Fetch every researcher's linked units in a single batch query so the
    // card can show all units (with a tooltip when there are more than one).
    // baseUnit is resolved here too (independent "units" query) now that it is
    // no longer joined inside the main researcher query.
    const researcherIds = researchersPage.items.map((r) => r.id);
    const [
      linkedUnitsByResearcherId,
      workUnitsByResearcherId,
      institutionsByResearcherId,
      baseUnitByResearcherId,
    ] = await Promise.all([
      this.researchersRepository.findLinkedUnitsByResearcherIds(researcherIds),
      this.researchersRepository.findWorkUnitsByResearcherIds(researcherIds),
      this.researchersRepository.findInstitutionsByResearcherIds(researcherIds),
      this.researchersRepository.findBaseUnitsByResearcherIds(researcherIds),
    ]);

    return {
      // Maps each Researcher entity to the DTO exposed by the API
      items: researchersPage.items.map(
        (researcher): ResearcherListItemDto => ({
          id: researcher.id,
          idUcrProfile: researcher.idUcrProfile,
          baseUnit: baseUnitByResearcherId.get(String(researcher.id)) ?? '',
          name: researcher.name,
          firstSurname: researcher.firstSurname,
          secondSurname: researcher.secondSurname,
          ceaCategory: researcher.ceaCategory,
          institution: researcher.institution,
          country: researcher.country,
          institutions: institutionsByResearcherId.get(String(researcher.id)) ?? [],
          orcidId: researcher.orcidId,
          linkedin: researcher.linkedin,
          researchGate: researcher.researchGate,
          scopus: researcher.scopus,
          photo: resolvePhotoUrl(researcher.photoData),
          profileType: researcher.profileType,
          linkedUnits: linkedUnitsByResearcherId.get(researcher.id) ?? [],
          workUnits: workUnitsByResearcherId.get(String(researcher.id)) ?? [],
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

    const [linkedUnits, workUnitsRows, baseUnitByResearcherId] = await Promise.all([
      this.researchersRepository.findLinkedUnits(id),
      this.researchersRepository.findWorkUnits(id),
      this.researchersRepository.findBaseUnitsByResearcherIds([id]),
    ]);

    return {
      id: researcher.id,
      idUcrProfile: researcher.idUcrProfile,
      baseUnit: baseUnitByResearcherId.get(String(id)) ?? '',
      name: researcher.name,
      firstSurname: researcher.firstSurname,
      secondSurname: researcher.secondSurname,
      ceaCategory: researcher.ceaCategory,
      institution: researcher.institution,
      country: researcher.country,
      institutions: [],
      orcidId: researcher.orcidId,
      linkedin: researcher.linkedin,
      researchGate: researcher.researchGate,
      scopus: researcher.scopus,
      photo: resolvePhotoUrl(researcher.photoData),
      profileType: researcher.profileType,
      linkedUnits: linkedUnits.map((u) => ({ id: String(u.id), name: u.name })),
      workUnits: workUnitsRows.map((u) => ({ id: String(u.id), name: u.name })),
    };
  }

  // ── Full profile ──────────────────────────────────────────────────────────

  /**
   * Aggregates every section of the public researcher profile into a single DTO.
   * All sub-queries run in parallel after the main row exists.
   */
  async getProfile(id: string): Promise<ResearcherProfileDto | null> {
    const researcher = await this.researchersRepository.findById(id);

    if (!researcher) {
      return null;
    }

    const [
      alternativeNamesRows,
      linkedUnitsRows,
      workUnitsRows,
      keywordsRows,
      educationRows,
      experienceRows,
      projectsRows,
      outputsRows,
      institutionsMap,
      hIndex,
      baseUnitByResearcherId,
    ] = await Promise.all([
      this.researchersRepository.findAlternativeNames(id),
      this.researchersRepository.findLinkedUnits(id),
      this.researchersRepository.findWorkUnits(id),
      this.researchersRepository.findKeywords(id),
      this.researchersRepository.findEducation(id),
      this.researchersRepository.findExperience(id),
      this.researchersRepository.findProjects(id),
      this.researchersRepository.findScientificOutputs(id),
      this.researchersRepository.findInstitutionsByResearcherIds([id]),
      this.researchersRepository.findHIndexByProfileId(id),
      this.researchersRepository.findBaseUnitsByResearcherIds([id]),
    ]);
    const institutionsRows = institutionsMap.get(id) ?? [];

    const projectIds = projectsRows.map((row) => row.id);

    const projectKeywordsByProjectId =
      await this.researchersRepository.findKeywordsByProjectIds(projectIds);

    const scientificOutputs: ResearcherScientificOutputDto[] = outputsRows.map((row) => ({
      id: String(row.id),
      title: row.title,
      authors: this.parseJsonSafely<{ name: string }[]>(row.authors, []).map(
        (a) => a.name,
      ),
      type: {
        category: row.typeName ?? 'Producción científica',
        subcategory: row.typeName ?? '',
      },
      // Oracle returns NUMBER(1) — coerce to boolean.
      openAccess: Number(row.openAccess) === 1,
      publicationYear: Number(row.publicationYear ?? 0),
      doi: row.doi,
      journal: row.journal,
      volume: row.volume,
      issue: row.issue,
      pages: row.pages,
      citationCount: row.citationCount == null ? null : Number(row.citationCount),
      keywords: this.parseJsonSafely<{ value: string }[]>(row.keywords, []).map(
        (k) => k.value,
      ),
    }));

    return {
      id: researcher.id,
      idUcrProfile: researcher.idUcrProfile,
      baseUnit: baseUnitByResearcherId.get(String(id)) ?? '',
      name: researcher.name,
      firstSurname: researcher.firstSurname,
      secondSurname: researcher.secondSurname,
      ceaCategory: researcher.ceaCategory,
      institution: researcher.institution,
      country: researcher.country,
      institutions: institutionsRows,
      orcidId: researcher.orcidId,
      linkedin: researcher.linkedin,
      researchGate: researcher.researchGate,
      scopus: researcher.scopus,
      photo: resolvePhotoUrl(researcher.photoData),
      profileType: researcher.profileType,
      alternativeNames: alternativeNamesRows.map((row) => ({
        name: row.name,
        firstSurname: row.firstSurname,
        lastSurname: row.lastSurname,
      })),
      linkedUnits: linkedUnitsRows.map((row) => ({
        id: String(row.id),
        name: row.name,
      })),
      workUnits: workUnitsRows.map((row) => ({
        id: String(row.id),
        name: row.name,
      })),
      keywords: keywordsRows.map((row) => row.keyword),
      education: educationRows.map((row) => ({
        degree: row.degree,
        fieldOfStudy: row.fieldOfStudy,
        institution: row.institution,
        country: row.country,
        graduationYear: row.graduationYear == null ? null : Number(row.graduationYear),
      })),
      experience: experienceRows.map((row) => ({
        position: row.position,
        organization: row.organization,
        startDate: row.startDate ? row.startDate.toISOString() : null,
        endDate: row.endDate ? row.endDate.toISOString() : null,
      })),
      projects: projectsRows.map((row) => ({
        id: String(row.id),
        code: row.code,
        name: row.name,
        manager: row.manager ?? '',
        startDate: row.startDate ? row.startDate.toISOString() : null,
        endDate: row.endDate ? row.endDate.toISOString() : null,
        researchType: row.researchType,
        projectType: row.projectType,
        status: row.status,
        keywords: projectKeywordsByProjectId.get(String(row.id)) ?? [],
      })),
      scientificOutputs,
      hIndex,
    };
  }

  private parseJsonSafely<T>(value: unknown, fallback: T): T {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value !== 'string') return value as T;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
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
  async getFilters(
    query?: string,
    filters?: ResearchersFiltersRequestDto,
  ): Promise<ResearchersFiltersDto> {
    const units = await this.researchersRepository.getBaseUnitCounts(query, filters);

    return {
      baseUnit: units.map(({ baseUnit, count }) => ({
        value: baseUnit,
        count: Number(count),
      })),
    };
  }

  /**
   * Collaboration-country facet, served on its own endpoint. The query is
   * expensive (~5s over the co-authorship graph), so it is kept separate from
   * getFilters to never block the fast unit filter.
   */
  async getCollaborationFacet(
    query?: string,
    filters?: ResearchersFiltersRequestDto,
  ): Promise<ResearchersCollaborationFacetDto> {
    const rows = await this.researchersRepository.getCollaborationCountryCounts(
      query,
      filters,
    );

    return {
      // getCollaborationCountryCounts reuses the BaseUnitCountRow shape, so the
      // country name comes back under the `baseUnit` key.
      collaborationCountry: rows.map(({ baseUnit, count }) => ({
        value: baseUnit,
        count: Number(count),
      })),
    };
  }

  // ── Collaboration countries (for the profile map) ─────────────────────────

  async getCollaborationCountries(
    id: string,
  ): Promise<ResearcherCollaborationCountryDto[]> {
    const rows =
      await this.researchersRepository.findCollaborationCountriesByProfileId(id);

    return rows.map(({ country, count }) => ({
      country,
      count: Number(count),
    }));
  }
}
