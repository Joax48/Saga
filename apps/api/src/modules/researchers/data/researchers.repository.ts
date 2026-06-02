import { Inject, Injectable } from '@nestjs/common';

import {
  DATABASE_CLIENT,
  DatabaseClient,
} from '../../../common/database/database-client.contract';
import type { Researcher } from '../researcher.entity';
import type { ResearchersFiltersRequestDto } from '../researchers.reader.contract';

// ─── Internal types ───────────────────────────────────────────────────────────

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

// Shape returned by Oracle for the COUNT(*) row
type ResearcherCountRow = {
  totalCount: number;
};

// Shape returned by Oracle for the per-unit count query
type BaseUnitCountRow = {
  baseUnit: string;
  count: number;
};

// Allowlist of junction tables that map profiles to units. Typed as a literal
// union so the table name interpolated into the SELECT cannot drift from a
// known-safe value (no SQL injection surface even though the inputs are
// internal).
type ProfileUnitJoinTable = 'UCR_PROFILE_PROJECT_UNIT' | 'UCR_PROFILE_WORK_UNIT';

// ─── Base SQL queries ─────────────────────────────────────────────────────────

/**
 * Membership join that turns PROFILE into the set of "researchers".
 *
 * A profile is a researcher when it appears in either UCR_PROFILE (internal
 * member) or EXTERNAL_PROFILE (external co-author). The UNION ALL also carries
 * the profile type so callers can label each row 'UCR' or 'EXTERNAL'.
 *
 * It is expressed as an inner JOIN (not a WHERE filter) so the dynamic WHERE
 * clause built at query time can still be appended cleanly.
 */
const RESEARCHER_PROFILE_TYPE_JOIN = `
  JOIN (
    SELECT PROFILE_ID, 'UCR' AS PROFILE_TYPE FROM PRODUCCION_CIENTIFICA.UCR_PROFILE
    UNION ALL
    SELECT PROFILE_ID, 'EXTERNAL' AS PROFILE_TYPE
    FROM (
      SELECT PROFILE_ID FROM PRODUCCION_CIENTIFICA.EXTERNAL_PROFILE
      MINUS
      SELECT PROFILE_ID FROM PRODUCCION_CIENTIFICA.UCR_PROFILE
    )
  ) profile_kind ON profile_kind.PROFILE_ID = p.PROFILE_ID
`;

/**
 * Main SELECT joining tables from the PRODUCCION_CIENTIFICA schema:
 *  - PROFILE       → name and surnames (base table for every profile)
 *  - UCR_PROFILE   → internal contact info (orcid, linkedin, photo); NULL for externals
 *  - UNIT          → academic unit name
 *
 * UCR_PROFILE is LEFT JOINed because external profiles have no row there, so
 * their orcid/linkedin/photo come back NULL.
 *
 * The subquery inside the units LEFT JOIN picks ONE unit per researcher
 * (the one with the lowest UNIT_ID) to avoid duplicate rows.
 *
 * IMPORTANT — Oracle with OUT_FORMAT_OBJECT returns column aliases in
 * UPPERCASE unless they are wrapped in double quotes. All aliases here
 * use double quotes to preserve the camelCase that TypeScript expects.
 */
const BASE_RESEARCHERS_SELECT = `
  SELECT
    p.PROFILE_ID        AS "id",
    up.PROFILE_ID       AS "idUcrProfile",
    u.UNIT_NAME         AS "baseUnit",
    p.PROFILE_NAME      AS "name",
    p.PROFILE_FIRST_SURNAME  AS "firstSurname",
    p.PROFILE_LAST_SURNAME   AS "secondSurname",
    up.CEA_CATEGORY     AS "ceaCategory",
    up.ORCID_ID         AS "orcidId",
    up.LINKEDIN_URL     AS "linkedin",
    up.RESEARCH_GATE_URL AS "researchGate",
    p.SCOPUS_PROFILE_LINK AS "scopus",
    up.PROFILE_IMAGE_URL  AS "photoUrl",
    profile_kind.PROFILE_TYPE AS "profileType",
    ext_inst.INSTITUTION_NAME AS "institution",
    ext_c.COUNTRY_NAME        AS "country"
  FROM PRODUCCION_CIENTIFICA.PROFILE p
  ${RESEARCHER_PROFILE_TYPE_JOIN}
  LEFT JOIN PRODUCCION_CIENTIFICA.UCR_PROFILE up ON up.PROFILE_ID = p.PROFILE_ID
  LEFT JOIN (
    SELECT PROFILE_ID, MIN(INSTITUTION_ID) AS INSTITUTION_ID
    FROM PRODUCCION_CIENTIFICA.EXTERNAL_PROFILE_INSTITUTION
    GROUP BY PROFILE_ID
  ) epi ON epi.PROFILE_ID = p.PROFILE_ID
  LEFT JOIN PRODUCCION_CIENTIFICA.INSTITUTION ext_inst ON ext_inst.INSTITUTION_ID = epi.INSTITUTION_ID
  LEFT JOIN PRODUCCION_CIENTIFICA.COUNTRY ext_c ON ext_c.COUNTRY_ID = ext_inst.INSTITUTION_COUNTRY
  LEFT JOIN (
    SELECT PROFILE_ID, MIN(UNIT_ID) AS UNIT_ID
    FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT
    GROUP BY PROFILE_ID
  ) uppu ON uppu.PROFILE_ID = p.PROFILE_ID
  LEFT JOIN PRODUCCION_CIENTIFICA.UNIT u ON u.UNIT_ID = uppu.UNIT_ID
`;

/**
 * Base COUNT query: only needs PROFILE plus the membership join
 * since there are no duplicate rows when counting by PROFILE_ID.
 */
const COUNT_RESEARCHERS_QUERY = `
  SELECT COUNT(*) AS "totalCount"
  FROM PRODUCCION_CIENTIFICA.PROFILE p
  ${RESEARCHER_PROFILE_TYPE_JOIN}
`;

// ─── WHERE clause helper type ─────────────────────────────────────────────────

type BuiltWhereClause = {
  clause: string; // SQL text with bind variables (:1, :2, ...)
  params: unknown[]; // values in the same order as the bind variables
};

type FilterField = keyof ResearchersFiltersRequestDto;

// ─── Repository ───────────────────────────────────────────────────────────────

@Injectable()
export class ResearchersRepository {
  /**
   * Injects DATABASE_CLIENT which points to OracleDatabaseProvider.
   * Previously DatabaseService (in-memory alasql mock) was used here.
   * This change allows reading real UCR data imported from the .dmp file
   * into the PRODUCCION_CIENTIFICA schema.
   */
  constructor(
    @Inject(DATABASE_CLIENT)
    private readonly databaseClient: DatabaseClient,
  ) {}

  // ── Paginated query ───────────────────────────────────────────────────────

  async findPaginated(
    page: number,
    limit: number,
    searchTerm?: string | null,
    filters?: ResearchersFiltersRequestDto,
  ): Promise<PaginatedResult<Researcher>> {
    const offset = this.calculateOffset(page, limit);
    const builtWhereClause = this.buildWhereClause(searchTerm, filters);

    // Run both queries in parallel to reduce total wait time
    const [items, total] = await Promise.all([
      this.findItemsPage(limit, offset, builtWhereClause),
      this.countResearchers(builtWhereClause),
    ]);

    return { items, total };
  }

  /**
   * Fetches one page of researchers.
   * Oracle does not support LIMIT/OFFSET (MySQL/PostgreSQL syntax).
   * Instead it uses the SQL:2011 standard syntax:
   *   OFFSET n ROWS FETCH NEXT m ROWS ONLY
   */
  private async findItemsPage(
    limit: number,
    offset: number,
    builtWhereClause: BuiltWhereClause,
  ): Promise<Researcher[]> {
    return this.databaseClient.query<Researcher>(
      `
        ${BASE_RESEARCHERS_SELECT}
        ${builtWhereClause.clause}
        ORDER BY p.PROFILE_NAME ASC, p.PROFILE_FIRST_SURNAME ASC, p.PROFILE_LAST_SURNAME ASC
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
      `,
      builtWhereClause.params,
    );
  }

  /**
   * Counts the total researchers matching the current filters.
   * Number() is used because Oracle may return the COUNT value as a string
   * in some driver versions.
   */
  private async countResearchers(builtWhereClause: BuiltWhereClause): Promise<number> {
    const totalRows = await this.databaseClient.query<ResearcherCountRow>(
      `
        ${COUNT_RESEARCHERS_QUERY}
        ${builtWhereClause.clause}
      `,
      builtWhereClause.params,
    );

    return Number(totalRows[0]?.totalCount ?? 0);
  }

  // ── Dynamic WHERE builder ─────────────────────────────────────────────────

  private tokenizeSearchTerm(searchTerm?: string | null): string[] {
    const normalized = searchTerm?.trim();
    if (!normalized) return [];
    // Each word becomes a starts-with pattern so only names/surnames that
    // BEGIN with the token match (e.g. "Shu" won't match "Huertas").
    // Tokens are AND-ed across fields in buildWhereClause, so a multi-word
    // query like "Kenneth Osorio" matches "Kenneth Santiago Osorio Masís"
    // because "Kenneth" starts the name and "Osorio" starts a surname.
    return normalized
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => `${token}%`);
  }

  private normalizeFilterValues(values?: string[]): string[] {
    // Removes duplicates, trims whitespace, and lowercases for comparison
    return Array.from(
      new Set((values ?? []).map((v) => v.trim().toLowerCase()).filter(Boolean)),
    );
  }

  /**
   * Pushes a value into the params array and returns the corresponding
   * Oracle bind variable name (:1, :2, :3, ...).
   *
   * Oracle does not support "?" as a placeholder (unlike MySQL).
   * The node-oracledb driver uses ":number" for positional binding.
   * This method tracks the count automatically based on the array length.
   */
  private addParam(params: unknown[], value: unknown): string {
    params.push(value);
    return `:${params.length}`;
  }

  /**
   * Dynamically builds the WHERE clause based on the received parameters.
   * Returns an empty clause if there is no search term and no filters.
   *
   * Text search: searches name and surnames with a case-insensitive LIKE
   * using Oracle's LOWER() function.
   *
   * Unit filter: uses EXISTS with a subquery to check whether the researcher
   * belongs to any of the selected units. EXISTS is required here because a
   * researcher can belong to multiple units (many-to-many via UCR_PROFILE_PROJECT_UNIT).
   */
  private shouldSkipFilter(field: FilterField, excludedFilters: FilterField[]): boolean {
    return excludedFilters.includes(field);
  }

  private buildWhereClause(
    searchTerm?: string | null,
    filters?: ResearchersFiltersRequestDto,
    excludedFilters: FilterField[] = [],
  ): BuiltWhereClause {
    const clauses: string[] = [];
    const params: unknown[] = [];

    const searchTokens = this.tokenizeSearchTerm(searchTerm);
    if (searchTokens.length > 0) {
      // Each token must start at least one name field (name, first surname,
      // or second surname). Tokens are AND-ed so multi-word queries work:
      // "Kenneth Osorio" matches "Kenneth Santiago Osorio Masís" because
      // "Kenneth" starts PROFILE_NAME and "Osorio" starts PROFILE_LAST_SURNAME.
      const tokenClauses = searchTokens.map((token) => {
        const b1 = this.addParam(params, token);
        const b2 = this.addParam(params, token);
        const b3 = this.addParam(params, token);
        return (
          `(LOWER(p.PROFILE_NAME) LIKE LOWER(${b1}) ` +
          `OR LOWER(p.PROFILE_FIRST_SURNAME) LIKE LOWER(${b2}) ` +
          `OR LOWER(p.PROFILE_LAST_SURNAME) LIKE LOWER(${b3}))`
        );
      });
      clauses.push(`(${tokenClauses.join(' AND ')})`);
    }

    if (filters?.profileType && ['UCR', 'EXTERNAL'].includes(filters.profileType)) {
      clauses.push(`profile_kind.PROFILE_TYPE = ${this.addParam(params, filters.profileType)}`);
    }

    const units = this.normalizeFilterValues(filters?.unit);
    if (!this.shouldSkipFilter('unit', excludedFilters) && units.length > 0) {
      // EXISTS prevents duplicate rows when a researcher has multiple units
      const placeholders = units.map((unit) => this.addParam(params, unit)).join(', ');
      clauses.push(`EXISTS (
        SELECT 1
        FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT uppu2
        JOIN PRODUCCION_CIENTIFICA.UNIT u2 ON u2.UNIT_ID = uppu2.UNIT_ID
        WHERE uppu2.PROFILE_ID = p.PROFILE_ID
          AND LOWER(u2.UNIT_NAME) IN (${placeholders})
      )`);
    }

    return {
      clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
      params,
    };
  }

  private calculateOffset(page: number, limit: number): number {
    // Standard pagination formula: page 1 → offset 0, page 2 → offset N, etc.
    return (page - 1) * limit;
  }

  // ── Find by ID ────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Researcher | null> {
    const researchers = await this.databaseClient.query<Researcher>(
      // :1 is the first (and only) bind variable; id is passed as an array.
      // Filter on PROFILE_ID (the shared key) so both UCR and external profiles resolve.
      `${BASE_RESEARCHERS_SELECT} WHERE p.PROFILE_ID = :1`,
      [id],
    );

    return researchers[0] ?? null;
  }

  // ── Profile sub-queries (per researcher) ──────────────────────────────────

  /** Alternative names registered for the profile. */
  async findAlternativeNames(profileId: string): Promise<
    {
      name: string;
      firstSurname: string;
      lastSurname: string | null;
    }[]
  > {
    return this.databaseClient.query(
      `
        SELECT
          NAME          AS "name",
          FIRST_SURNAME AS "firstSurname",
          LAST_SURNAME  AS "lastSurname"
        FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_ALTERNATIVE_NAME
        WHERE PROFILE_ID = :1
        ORDER BY ALTERNATIVE_NAME_ID ASC
      `,
      [profileId],
    );
  }

  /** Keywords associated with the researcher (academic interests). */
  async findKeywords(profileId: string): Promise<{ keyword: string }[]> {
    return this.databaseClient.query(
      `
        SELECT k.KEYWORD AS "keyword"
        FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_KEYWORD upk
        JOIN PRODUCCION_CIENTIFICA.KEYWORD k ON k.KEYWORD_ID = upk.KEYWORD_ID
        WHERE upk.PROFILE_ID = :1
        ORDER BY k.KEYWORD ASC
      `,
      [profileId],
    );
  }

  /**
   * Academic education entries.
   * Joins to ACADEMIC_DEGREE, DISCIPLINE (field of study), INSTITUTION and COUNTRY.
   */
  async findEducation(profileId: string): Promise<
    {
      degree: string;
      fieldOfStudy: string;
      institution: string;
      country: string | null;
      graduationYear: number | null;
    }[]
  > {
    return this.databaseClient.query(
      `
        SELECT
          ad.ACADEMIC_DEGREE_NAME AS "degree",
          d.DISCIPLINE_NAME       AS "fieldOfStudy",
          inst.INSTITUTION_NAME   AS "institution",
          c.COUNTRY_NAME          AS "country",
          ed.GRADUATION_YEAR      AS "graduationYear"
        FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_EDUCATION ed
        JOIN PRODUCCION_CIENTIFICA.ACADEMIC_DEGREE ad ON ad.ACADEMIC_DEGREE_ID = ed.DEGREE_LEVEL
        JOIN PRODUCCION_CIENTIFICA.DISCIPLINE d ON d.DISCIPLINE_ID = ed.FIELD_OF_STUDY
        JOIN PRODUCCION_CIENTIFICA.INSTITUTION inst ON inst.INSTITUTION_ID = ed.INSTITUTION
        LEFT JOIN PRODUCCION_CIENTIFICA.COUNTRY c ON c.COUNTRY_ID = inst.INSTITUTION_COUNTRY
        WHERE ed.PROFILE_ID = :1
        ORDER BY ed.GRADUATION_YEAR DESC NULLS LAST
      `,
      [profileId],
    );
  }

  /** Work experience entries. */
  async findExperience(profileId: string): Promise<
    {
      position: string;
      organization: string;
      startDate: Date | null;
      endDate: Date | null;
    }[]
  > {
    return this.databaseClient.query(
      `
        SELECT
          POSITION     AS "position",
          ORGANIZATION AS "organization",
          START_DATE   AS "startDate",
          END_DATE     AS "endDate"
        FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_EXPERIENCE
        WHERE PROFILE_ID = :1
        ORDER BY START_DATE DESC NULLS LAST
      `,
      [profileId],
    );
  }

  /**
   * Distinct units linked to the researcher through projects or postgrad activity.
   * Pulls every unit referenced in UCR_PROFILE_PROJECT_UNIT for this profile.
   */
  async findLinkedUnits(profileId: string): Promise<{ id: string; name: string }[]> {
    return this.findProfileUnits('UCR_PROFILE_PROJECT_UNIT', profileId);
  }

  /** Official work units for a single profile, from UCR_PROFILE_WORK_UNIT. */
  async findWorkUnits(profileId: string): Promise<{ id: string; name: string }[]> {
    return this.findProfileUnits('UCR_PROFILE_WORK_UNIT', profileId);
  }

  /**
   * Batch version of findWorkUnits — pulls work units for many researchers
   * in one round-trip and groups them by profile id.
   */
  async findWorkUnitsByResearcherIds(
    profileIds: string[],
  ): Promise<Map<string, { id: string; name: string }[]>> {
    return this.findProfileUnitsByIds('UCR_PROFILE_WORK_UNIT', profileIds);
  }

  /** All institutions for a set of external profiles, grouped by profile id. */
  async findInstitutionsByResearcherIds(
    profileIds: string[],
  ): Promise<Map<string, { name: string; country: string | null }[]>> {
    if (profileIds.length === 0) return new Map();

    const placeholders = profileIds.map((_, i) => `:${i + 1}`).join(', ');
    const rows = await this.databaseClient.query<{
      profileId: string;
      name: string;
      country: string | null;
    }>(
      `
        SELECT
          epi.PROFILE_ID        AS "profileId",
          inst.INSTITUTION_NAME AS "name",
          c.COUNTRY_NAME        AS "country"
        FROM PRODUCCION_CIENTIFICA.EXTERNAL_PROFILE_INSTITUTION epi
        JOIN PRODUCCION_CIENTIFICA.INSTITUTION inst ON inst.INSTITUTION_ID = epi.INSTITUTION_ID
        LEFT JOIN PRODUCCION_CIENTIFICA.COUNTRY c ON c.COUNTRY_ID = inst.INSTITUTION_COUNTRY
        WHERE epi.PROFILE_ID IN (${placeholders})
        ORDER BY epi.PROFILE_ID ASC, inst.INSTITUTION_NAME ASC
      `,
      profileIds,
    );

    return rows.reduce((acc, row) => {
      const list = acc.get(String(row.profileId)) ?? [];
      list.push({ name: row.name, country: row.country });
      acc.set(String(row.profileId), list);
      return acc;
    }, new Map<string, { name: string; country: string | null }[]>());
  }

  /** All institutions for a set of external profiles, grouped by profile id. */
  async findInstitutionsByResearcherIds(
    profileIds: string[],
  ): Promise<Map<string, { name: string; country: string | null }[]>> {
    if (profileIds.length === 0) return new Map();

    const placeholders = profileIds.map((_, i) => `:${i + 1}`).join(', ');
    const rows = await this.databaseClient.query<{
      profileId: string;
      name: string;
      country: string | null;
    }>(
      `
        SELECT
          epi.PROFILE_ID        AS "profileId",
          inst.INSTITUTION_NAME AS "name",
          c.COUNTRY_NAME        AS "country"
        FROM PRODUCCION_CIENTIFICA.EXTERNAL_PROFILE_INSTITUTION epi
        JOIN PRODUCCION_CIENTIFICA.INSTITUTION inst ON inst.INSTITUTION_ID = epi.INSTITUTION_ID
        LEFT JOIN PRODUCCION_CIENTIFICA.COUNTRY c ON c.COUNTRY_ID = inst.INSTITUTION_COUNTRY
        WHERE epi.PROFILE_ID IN (${placeholders})
        ORDER BY epi.PROFILE_ID ASC, inst.INSTITUTION_NAME ASC
      `,
      profileIds,
    );

    return rows.reduce((acc, row) => {
      const list = acc.get(String(row.profileId)) ?? [];
      list.push({ name: row.name, country: row.country });
      acc.set(String(row.profileId), list);
      return acc;
    }, new Map<string, { name: string; country: string | null }[]>());
  }

  /**
   * Batch version of findLinkedUnits — pulls linked units for many researchers
   * in one round-trip and groups them by profile id. Used by the paginated list
   * so each card can show all of a researcher's units, not just the base one.
   */
  async findLinkedUnitsByResearcherIds(
    profileIds: string[],
  ): Promise<Map<string, { id: string; name: string }[]>> {
    return this.findProfileUnitsByIds('UCR_PROFILE_PROJECT_UNIT', profileIds);
  }

  /**
   * Shared SELECT for any profile↔unit join table. The two callers differ only
   * in which junction table they read from; the projection, join and ordering
   * are identical.
   */
  private async findProfileUnits(
    joinTable: ProfileUnitJoinTable,
    profileId: string,
  ): Promise<{ id: string; name: string }[]> {
    return this.databaseClient.query(
      `
        SELECT DISTINCT
          u.UNIT_ID   AS "id",
          u.UNIT_NAME AS "name"
        FROM PRODUCCION_CIENTIFICA.${joinTable} jt
        JOIN PRODUCCION_CIENTIFICA.UNIT u ON u.UNIT_ID = jt.UNIT_ID
        WHERE jt.PROFILE_ID = :1 AND u.UNIT_NAME IS NOT NULL
        ORDER BY u.UNIT_NAME ASC
      `,
      [profileId],
    );
  }

  /** Batch counterpart of findProfileUnits — groups rows by profile id. */
  private async findProfileUnitsByIds(
    joinTable: ProfileUnitJoinTable,
    profileIds: string[],
  ): Promise<Map<string, { id: string; name: string }[]>> {
    if (profileIds.length === 0) return new Map();

    const placeholders = profileIds.map((_, i) => `:${i + 1}`).join(', ');
    const rows = await this.databaseClient.query<{
      profileId: string;
      id: string;
      name: string;
    }>(
      `
        SELECT DISTINCT
          jt.PROFILE_ID AS "profileId",
          u.UNIT_ID     AS "id",
          u.UNIT_NAME   AS "name"
        FROM PRODUCCION_CIENTIFICA.${joinTable} jt
        JOIN PRODUCCION_CIENTIFICA.UNIT u ON u.UNIT_ID = jt.UNIT_ID
        WHERE jt.PROFILE_ID IN (${placeholders}) AND u.UNIT_NAME IS NOT NULL
        ORDER BY jt.PROFILE_ID ASC, u.UNIT_NAME ASC
      `,
      profileIds,
    );

    return rows.reduce((acc, row) => {
      const key = String(row.profileId);
      const list = acc.get(key) ?? [];
      list.push({ id: String(row.id), name: row.name });
      acc.set(key, list);
      return acc;
    }, new Map<string, { id: string; name: string }[]>());
  }

  /**
   * Projects the researcher participates in.
   * One row per project (distinct PROJECT_ID), with the most recent participation period.
   * Project keywords are looked up separately to keep this query flat.
   */
  async findProjects(profileId: string): Promise<
    {
      id: string;
      code: string;
      name: string;
      manager: string | null;
      startDate: Date | null;
      endDate: Date | null;
      researchType: string | null;
      projectType: string | null;
      status: string | null;
    }[]
  > {
    return this.databaseClient.query(
      `
        SELECT
          p.PROJECT_ID                AS "id",
          p.PROJECT_ID                AS "code",
          p.PROJECT_NAME              AS "name",
          NULL                        AS "manager",
          period.PROJECT_START_DATE   AS "startDate",
          period.PROJECT_END_DATE     AS "endDate",
          prt.PROJECT_RESEARCH_TYPE_NAME AS "researchType",
          pt.PROJECT_TYPE_NAME        AS "projectType",
          ps.PROJECT_STATUS_NAME      AS "status"
        FROM PRODUCCION_CIENTIFICA.PROJECT p
        JOIN (
          SELECT DISTINCT PROJECT_ID
          FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT
          WHERE PROFILE_ID = :1
        ) up ON up.PROJECT_ID = p.PROJECT_ID
        LEFT JOIN PRODUCCION_CIENTIFICA.PROJECT_TYPE pt ON pt.PROJECT_TYPE_ID = p.PROJECT_TYPE
        LEFT JOIN PRODUCCION_CIENTIFICA.PROJECT_RESEARCH_TYPE prt ON prt.PROJECT_RESEARCH_TYPE_ID = p.PROJECT_RESEARCH_TYPE
        LEFT JOIN PRODUCCION_CIENTIFICA.PROJECT_STATUS ps ON ps.PROJECT_STATUS_ID = p.PROJECT_STATUS
        LEFT JOIN (
          SELECT PROJECT_ID,
                 MIN(PROJECT_START_DATE) AS PROJECT_START_DATE,
                 MAX(PROJECT_END_DATE)   AS PROJECT_END_DATE
          FROM PRODUCCION_CIENTIFICA.PROJECT_PERIOD
          GROUP BY PROJECT_ID
        ) period ON period.PROJECT_ID = p.PROJECT_ID
        ORDER BY period.PROJECT_START_DATE DESC NULLS LAST, p.PROJECT_NAME ASC
      `,
      [profileId],
    );
  }

  /** Keywords for a set of projects, grouped by project id. */
  async findKeywordsByProjectIds(projectIds: string[]): Promise<Map<string, string[]>> {
    if (projectIds.length === 0) {
      return new Map();
    }

    const placeholders = projectIds.map((_, i) => `:${i + 1}`).join(', ');
    const rows = await this.databaseClient.query<{
      projectId: string;
      keyword: string;
    }>(
      `
        SELECT pk.PROJECT_ID AS "projectId", k.KEYWORD AS "keyword"
        FROM PRODUCCION_CIENTIFICA.PROJECT_KEYWORD pk
        JOIN PRODUCCION_CIENTIFICA.KEYWORD k ON k.KEYWORD_ID = pk.KEYWORD_ID
        WHERE pk.PROJECT_ID IN (${placeholders})
        ORDER BY pk.PROJECT_ID ASC, k.KEYWORD ASC
      `,
      projectIds,
    );

    return rows.reduce((acc, row) => {
      const list = acc.get(row.projectId) ?? [];
      list.push(row.keyword);
      acc.set(row.projectId, list);
      return acc;
    }, new Map<string, string[]>());
  }

  /**
   * Scientific outputs authored by the researcher.
   * Joins SCIENTIFIC_OUTPUT_PROFILE with SOURCE and the two type-specific tables
   * (Scopus/Clarivate) which carry volume/issue/page metadata and the type id.
   * COALESCE prefers Scopus values, falling back to Clarivate when missing.
   */
  async findScientificOutputs(profileId: string): Promise<
    {
      id: string;
      title: string;
      typeName: string | null;
      openAccess: number | null;
      publicationYear: number | null;
      doi: string | null;
      journal: string | null;
      volume: string | null;
      issue: string | null;
      pages: string | null;
      citationCount: number | null;
    }[]
  > {
    return this.databaseClient.query(
      `
        SELECT
          so.SCIENTIFIC_OUTPUT_ID    AS "id",
          so.TITLE                   AS "title",
          sot.SCIENTIFIC_OUTPUT_TYPE_NAME AS "typeName",
          scopus.OPEN_ACCESS         AS "openAccess",
          so.PUBLICATION_YEAR        AS "publicationYear",
          so.DOI                     AS "doi",
          src.SOURCE_NAME            AS "journal",
          COALESCE(scopus.VOLUME, clar.VOLUME)                       AS "volume",
          COALESCE(scopus.ISSUE_IDENTIFIER, clar.ISSUE_IDENTIFIER)   AS "issue",
          COALESCE(scopus.SCOPUS_PAGE_RANGE, clar.CLARIVATE_PAGE_RANGE) AS "pages",
          COALESCE(scopus.SCOPUS_CITATION_COUNT, clar.CLARIVATE_CITATION_COUNT) AS "citationCount"
        FROM PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_PROFILE sop
        JOIN PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT so ON so.SCIENTIFIC_OUTPUT_ID = sop.SCIENTIFIC_OUTPUT_ID
        LEFT JOIN PRODUCCION_CIENTIFICA.SOURCE src ON src.SOURCE_ID = so.SOURCE
        LEFT JOIN PRODUCCION_CIENTIFICA.SCOPUS_SCIENTIFIC_OUTPUT scopus ON scopus.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
        LEFT JOIN PRODUCCION_CIENTIFICA.CLARIVATE_SCIENTIFIC_OUTPUT clar ON clar.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
        LEFT JOIN PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_TYPE sot
          ON sot.SCIENTIFIC_OUTPUT_TYPE_ID = COALESCE(scopus.SCOPUS_TYPE, clar.CLARIVATE_TYPE)
        WHERE sop.PROFILE_ID = :1
        ORDER BY so.PUBLICATION_YEAR DESC NULLS LAST, so.TITLE ASC
      `,
      [profileId],
    );
  }

  /**
   * Precomputed h-index from UCR_PROFILE_METRIC. Returns null when the row
   * does not exist (the table is sparsely populated — ~2% of UCR profiles),
   * so callers can fall back to computing it from citation counts.
   */
  async findHIndexByProfileId(profileId: string): Promise<number | null> {
    const rows = await this.databaseClient.query<{ hIndex: number | null }>(
      `
        SELECT H_INDEX AS "hIndex"
        FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_METRIC
        WHERE PROFILE_ID = :1
        FETCH FIRST 1 ROWS ONLY
      `,
      [profileId],
    );

    const value = rows[0]?.hIndex;
    return value == null ? null : Number(value);
  }

  /** Co-authors per scientific output (used to render the authors line). */
  async findAuthorsByOutputIds(outputIds: string[]): Promise<Map<string, string[]>> {
    if (outputIds.length === 0) {
      return new Map();
    }

    const placeholders = outputIds.map((_, i) => `:${i + 1}`).join(', ');
    const rows = await this.databaseClient.query<{
      outputId: string;
      fullName: string;
    }>(
      `
        SELECT
          sop.SCIENTIFIC_OUTPUT_ID AS "outputId",
          TRIM(p.PROFILE_NAME || ' ' || p.PROFILE_FIRST_SURNAME ||
               CASE WHEN p.PROFILE_LAST_SURNAME IS NULL THEN ''
                    ELSE ' ' || p.PROFILE_LAST_SURNAME END) AS "fullName"
        FROM PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_PROFILE sop
        JOIN PRODUCCION_CIENTIFICA.PROFILE p ON p.PROFILE_ID = sop.PROFILE_ID
        WHERE sop.SCIENTIFIC_OUTPUT_ID IN (${placeholders})
        ORDER BY sop.SCIENTIFIC_OUTPUT_ID ASC, p.PROFILE_FIRST_SURNAME ASC
      `,
      outputIds,
    );

    return rows.reduce((acc, row) => {
      const list = acc.get(row.outputId) ?? [];
      list.push(row.fullName);
      acc.set(row.outputId, list);
      return acc;
    }, new Map<string, string[]>());
  }

  /** Keywords per scientific output, grouped by output id. */
  async findKeywordsByOutputIds(outputIds: string[]): Promise<Map<string, string[]>> {
    if (outputIds.length === 0) {
      return new Map();
    }

    const placeholders = outputIds.map((_, i) => `:${i + 1}`).join(', ');
    const rows = await this.databaseClient.query<{
      outputId: string;
      keyword: string;
    }>(
      `
        SELECT sok.SCIENTIFIC_OUTPUT_ID AS "outputId", k.KEYWORD AS "keyword"
        FROM PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_KEYWORD sok
        JOIN PRODUCCION_CIENTIFICA.KEYWORD k ON k.KEYWORD_ID = sok.KEYWORD_ID
        WHERE sok.SCIENTIFIC_OUTPUT_ID IN (${placeholders})
        ORDER BY sok.SCIENTIFIC_OUTPUT_ID ASC, k.KEYWORD ASC
      `,
      outputIds,
    );

    return rows.reduce((acc, row) => {
      const list = acc.get(row.outputId) ?? [];
      list.push(row.keyword);
      acc.set(row.outputId, list);
      return acc;
    }, new Map<string, string[]>());
  }

  // ── Researcher count per unit (for filters) ───────────────────────────────

  /**
   * Returns how many researchers belong to each academic unit, recalculated
   * dynamically based on the current search term and the rest of the filters.
   *
   * The `unit` facet is intentionally EXCLUDED from the WHERE clause: if the
   * user already picked "Física", we still want to show how many researchers
   * each *other* unit would return (so the option can be switched), instead
   * of zeroing them out.
   *
   * COUNT(DISTINCT) is used because a researcher may appear in
   * UCR_PROFILE_PROJECT_UNIT multiple times (one record per project).
   */
  async getBaseUnitCounts(
    searchTerm?: string | null,
    filters?: ResearchersFiltersRequestDto,
  ): Promise<BaseUnitCountRow[]> {
    const builtWhereClause = this.buildWhereClause(searchTerm, filters, ['unit']);
    const extraConditions = builtWhereClause.clause
      ? `AND ${builtWhereClause.clause.replace(/^WHERE\s+/i, '')}`
      : '';

    return this.databaseClient.query<BaseUnitCountRow>(
      `
        SELECT u.UNIT_NAME AS "baseUnit", COUNT(DISTINCT p.PROFILE_ID) AS "count"
        FROM PRODUCCION_CIENTIFICA.PROFILE p
        ${RESEARCHER_PROFILE_TYPE_JOIN}
        JOIN PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT uppu ON uppu.PROFILE_ID = p.PROFILE_ID
        JOIN PRODUCCION_CIENTIFICA.UNIT u ON u.UNIT_ID = uppu.UNIT_ID
        WHERE u.UNIT_NAME IS NOT NULL
        ${extraConditions}
        GROUP BY u.UNIT_NAME
        ORDER BY u.UNIT_NAME ASC
      `,
      builtWhereClause.params,
    );
  }
}
