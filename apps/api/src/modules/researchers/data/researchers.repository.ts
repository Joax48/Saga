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

// ─── Base SQL queries ─────────────────────────────────────────────────────────

/**
 * Main SELECT joining tables from the PRODUCCION_CIENTIFICA schema:
 *  - UCR_PROFILE        → researcher contact info (orcid, linkedin, photo)
 *  - PROFILE            → name and surnames
 *  - UCR_PROFILE_WORK_UNIT → researcher's actual base unit assignment
 *  - UNIT               → academic unit name
 *
 * Base unit comes strictly from UCR_PROFILE_WORK_UNIT (the researcher's
 * direct work unit), NOT from UCR_PROFILE_PROJECT_UNIT (project-linked units).
 * If UCR_PROFILE_WORK_UNIT has no data, baseUnit returns NULL — which is
 * semantically correct rather than showing a project-linked unit as base.
 *
 * The subquery takes the most recent year when a researcher has multiple
 * work unit records over time.
 *
 * IMPORTANT — Oracle with OUT_FORMAT_OBJECT returns column aliases in
 * UPPERCASE unless wrapped in double quotes. All aliases here use double
 * quotes to preserve the camelCase that TypeScript expects.
 */
const BASE_RESEARCHERS_SELECT = `
  SELECT
    p.PROFILE_ID             AS "id",
    up.PROFILE_ID            AS "idUcrProfile",
    u_base.UNIT_NAME         AS "baseUnit",
    p.PROFILE_NAME           AS "name",
    p.PROFILE_FIRST_SURNAME  AS "firstSurname",
    p.PROFILE_LAST_SURNAME   AS "secondSurname",
    NULL                     AS "ceaCategory",
    up.ORCID_ID              AS "orcidId",
    up.LINKEDIN_URL          AS "linkedin",
    up.RESEARCH_GATE_URL     AS "researchGate",
    p.SCOPUS_PROFILE_LINK    AS "scopus",
    up.PROFILE_IMAGE_URL     AS "photoUrl"
  FROM PRODUCCION_CIENTIFICA.UCR_PROFILE up
  JOIN PRODUCCION_CIENTIFICA.PROFILE p ON p.PROFILE_ID = up.PROFILE_ID
  LEFT JOIN (
    SELECT PROFILE_ID, MAX(YEAR) AS YEAR
    FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_WORK_UNIT
    GROUP BY PROFILE_ID
  ) wu_latest ON wu_latest.PROFILE_ID = up.PROFILE_ID
  LEFT JOIN PRODUCCION_CIENTIFICA.UCR_PROFILE_WORK_UNIT wu
    ON wu.PROFILE_ID = up.PROFILE_ID AND wu.YEAR = wu_latest.YEAR
  LEFT JOIN PRODUCCION_CIENTIFICA.UNIT u_base ON u_base.UNIT_ID = wu.UNIT_ID
`;

/**
 * Base COUNT query: only needs UCR_PROFILE + PROFILE.
 * The work-unit join is excluded here because it does not affect the
 * researcher count — a researcher with no base unit still counts.
 */
const COUNT_RESEARCHERS_QUERY = `
  SELECT COUNT(*) AS "totalCount"
  FROM PRODUCCION_CIENTIFICA.UCR_PROFILE up
  JOIN PRODUCCION_CIENTIFICA.PROFILE p ON p.PROFILE_ID = up.PROFILE_ID
`;

// ─── WHERE clause helper type ─────────────────────────────────────────────────

type BuiltWhereClause = {
  clause: string; // SQL text with bind variables (:1, :2, ...)
  params: unknown[]; // values in the same order as the bind variables
};

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

  private normalizeSearchTerm(searchTerm?: string | null): string | null {
    const normalized = searchTerm?.trim();
    // Wraps the term with % wildcards for a LIKE contains-match
    return normalized ? `%${normalized}%` : null;
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
  private buildWhereClause(
    searchTerm?: string | null,
    filters?: ResearchersFiltersRequestDto,
  ): BuiltWhereClause {
    const clauses: string[] = [];
    const params: unknown[] = [];

    const normalizedSearchTerm = this.normalizeSearchTerm(searchTerm);
    if (normalizedSearchTerm) {
      const b1 = this.addParam(params, normalizedSearchTerm);
      const b2 = this.addParam(params, normalizedSearchTerm);
      const b3 = this.addParam(params, normalizedSearchTerm);
      clauses.push(
        `(LOWER(p.PROFILE_NAME) LIKE LOWER(${b1}) OR LOWER(p.PROFILE_FIRST_SURNAME) LIKE LOWER(${b2}) OR LOWER(p.PROFILE_LAST_SURNAME) LIKE LOWER(${b3}))`,
      );
    }

    const units = this.normalizeFilterValues(filters?.unit);
    if (units.length > 0) {
      // EXISTS prevents duplicate rows when a researcher has multiple units
      const placeholders = units.map((unit) => this.addParam(params, unit)).join(', ');
      clauses.push(`EXISTS (
        SELECT 1
        FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT uppu2
        JOIN PRODUCCION_CIENTIFICA.UNIT u2 ON u2.UNIT_ID = uppu2.UNIT_ID
        WHERE uppu2.PROFILE_ID = up.PROFILE_ID
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
      // :1 is the first (and only) bind variable; id is passed as an array
      `${BASE_RESEARCHERS_SELECT} WHERE up.PROFILE_ID = :1`,
      [id],
    );

    return researchers[0] ?? null;
  }

  // ── Researcher count per unit (for filters) ───────────────────────────────

  /**
   * Returns how many researchers belong to each academic unit.
   * This data is used in the filter sidebar to show "(N)" next to each
   * option, indicating how many results that filter would return.
   *
   * COUNT(DISTINCT) is used because a researcher may appear in
   * UCR_PROFILE_PROJECT_UNIT multiple times (one record per project).
   */
  async getBaseUnitCounts(): Promise<BaseUnitCountRow[]> {
    return this.databaseClient.query<BaseUnitCountRow>(`
      SELECT u.UNIT_NAME AS "baseUnit", COUNT(DISTINCT up.PROFILE_ID) AS "count"
      FROM PRODUCCION_CIENTIFICA.UCR_PROFILE up
      JOIN PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT uppu ON uppu.PROFILE_ID = up.PROFILE_ID
      JOIN PRODUCCION_CIENTIFICA.UNIT u ON u.UNIT_ID = uppu.UNIT_ID
      WHERE u.UNIT_NAME IS NOT NULL
      GROUP BY u.UNIT_NAME
      ORDER BY u.UNIT_NAME ASC
    `);
  }
}
