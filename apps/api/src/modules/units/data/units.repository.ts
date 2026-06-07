import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CLIENT } from '../../../common/database/database-client.contract';
import type { DatabaseClient } from '../../../common/database/database-client.contract';
import type { Unit } from '../unit.entity';
import { UnitSearchDTO } from '../../../bff/public/units/dtos/unit-search-dto';

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

type UnitCountRow = {
  totalCount: number;
};

export type UnitProfile = {
  id: number;
  baseUnit: string | null;
  name: string;
  ceaCategory: string | null;
  photoUrl: string | null;
};

export type UnitScientificProduction = {
  id: string;
  title: string;
  authors: string;
  type: string;
  publicationYear: number;
  doi: string | null;
  journal: string | null;
  volume: number | null;
  issue: number | null;
  pages: string | null;
  keywords: string;
};

export type UnitProject = {
  id: string;
  code: string;
  name: string;
  managerName: string;
  managerId: number;
  startDate: string;
  endDate: string;
  researchType: string;
  projectType: string;
  keywords: string | null;
};

const BASE_UNITS_SELECT = `
  SELECT
    u.unit_id AS "id",
    u.unit_name AS "name",
    u.logo_svg_content AS "logoSvgContent",
    u.logo_unit_acronym AS "logoUnitAcronym"
  FROM unit u
`;

const UNIT_DETAIL_SELECT = `
  SELECT
    u.unit_id AS "id",
    u.unit_name AS "name",
    u.unit_description AS "description",
    u.unit_email AS "email",
    u.unit_page_url AS "pageUrl",
    LISTAGG(up.phone_number, ', ') WITHIN GROUP (ORDER BY up.phone_number) AS "phoneNumber"
  FROM unit u
  LEFT JOIN unit_phone up ON up.unit_id = u.unit_id
`;

const COUNT_UNITS_QUERY = `
  SELECT COUNT(DISTINCT u.unit_id) AS "totalCount"
  FROM unit u
`;

@Injectable()
export class UnitsRepository {
  constructor(@Inject(DATABASE_CLIENT) private readonly databaseClient: DatabaseClient) {}

  async findPaginated(searchDTO: UnitSearchDTO): Promise<PaginatedResult<Unit>> {
    const [items, total] = await Promise.all([
      this.findItemsPage(searchDTO),
      this.countUnits(searchDTO),
    ]);
    return { items, total };
  }

  private buildWhere(searchDTO: UnitSearchDTO): {
    clause: string;
    params: Record<string, string | number | number[] | undefined>;
  } {
    const conditions: string[] = [];
    const params: Record<string, string | number | number[] | undefined> = {};

    conditions.push(`
      UPPER(u.unit_name) NOT LIKE '%ASESOR%'
      AND UPPER(u.unit_name) NOT LIKE '%ASAMBLEA%'
      AND UPPER(u.unit_name) NOT LIKE '%CONSEJO%'
    `);

    const researcherSubconditions: string[] = [];

    if (searchDTO.researcherIds?.length) {
      const ids = searchDTO.researcherIds.map((_, i) => `:rid${i}`).join(', ');

      searchDTO.researcherIds.forEach((id, i) => {
        params[`rid${i}`] = id;
      });

      researcherSubconditions.push(`
        EXISTS (
          SELECT 1
          FROM ucr_profile_project_unit ppu
          WHERE ppu.unit_id = u.unit_id
            AND ppu.profile_id IN (${ids})
        )
      `);
    }

    if (searchDTO.researcherBaseUnitIds?.length) {
      const ids = searchDTO.researcherBaseUnitIds.map((_, i) => `:rbuid${i}`).join(', ');

      searchDTO.researcherBaseUnitIds.forEach((id, i) => {
        params[`rbuid${i}`] = id;
      });

      researcherSubconditions.push(`
        EXISTS (
          SELECT 1
          FROM ucr_profile_work_unit pwu
          WHERE pwu.unit_id = u.unit_id
            AND pwu.profile_id IN (${ids})
        )
      `);
    }

    if (researcherSubconditions.length) {
      conditions.push(`(${researcherSubconditions.join(' OR ')})`);
    }

    if (searchDTO.q) {
      params.q = `%${searchDTO.q}%`;
      conditions.push(`u.unit_name LIKE :q`);
    }

    const clause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return { clause, params };
  }

  private buildOrderClause(unitSearchDTO: UnitSearchDTO): string {
    const direction = unitSearchDTO.sortOrder === 'desc' ? 'DESC' : 'ASC';
    return `ORDER BY u.unit_name ${direction}`;
  }

  private async findItemsPage(unitSearchDTO: UnitSearchDTO): Promise<Unit[]> {
    const { clause, params } = this.buildWhere(unitSearchDTO);
    const orderClause = this.buildOrderClause(unitSearchDTO);

    const offset = this.calculateOffset(unitSearchDTO.page, unitSearchDTO.limit);

    return this.databaseClient.query<Unit>(
      `
      ${BASE_UNITS_SELECT}
      ${clause}
      ${orderClause}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `,
      {
        ...params,
        offset,
        limit: unitSearchDTO.limit,
      },
    );
  }

  private async countUnits(searchDTO: UnitSearchDTO): Promise<number> {
    const { clause, params } = this.buildWhere(searchDTO);

    const totalRows = await this.databaseClient.query<UnitCountRow>(
      `${COUNT_UNITS_QUERY} ${clause}`,
      params,
    );

    return totalRows[0]?.totalCount ?? 0;
  }

  async findById(id: number): Promise<Unit | null> {
    const rows = await this.databaseClient.query<Unit>(
      `
      ${UNIT_DETAIL_SELECT}
      WHERE u.unit_id = :id
      GROUP BY
        u.unit_id,
        u.unit_name,
        u.unit_description,
        u.unit_email,
        u.unit_page_url
      `,
      { id },
    );

    return rows[0] ?? null;
  }

  async findProfilesByUnitId(unitId: number): Promise<UnitProfile[]> {
    return this.databaseClient.query<UnitProfile>(
      `
        SELECT
          P.profile_id    AS "id",
          U.unit_name     AS "baseUnit",
          INITCAP(TRIM(
            P.profile_name || ' ' || P.profile_first_surname || ' ' || P.profile_last_surname
          ))              AS "name",
          UP.cea_category AS "ceaCategory",
          UP.profile_image_url AS "photoUrl"
        FROM UCR_Profile UP
        JOIN Profile P ON P.profile_id = UP.profile_id
        JOIN UCR_PROFILE_WORK_UNIT PWU ON PWU.profile_id = P.profile_id
          AND PWU.unit_id = :unitId
          AND PWU.year = EXTRACT(YEAR FROM SYSDATE)
        LEFT JOIN Unit U ON U.unit_id = PWU.unit_id
        ORDER BY P.profile_name ASC
      `,
      { unitId },
    );
  }

async findScientificProductionsByUnitId(
  unitId: number,
): Promise<UnitScientificProduction[]> {
  return this.databaseClient.query<UnitScientificProduction>(
    `
      SELECT
        SO.scientific_output_id AS "id",
        SO.title                AS "title",
        (
          SELECT LISTAGG(
                   INITCAP(TRIM(P.profile_name || ' ' || P.profile_first_surname)),
                   ';'
                 )
                 WITHIN GROUP (ORDER BY P.profile_name)
          FROM Scientific_Output_Profile SOP
          JOIN Profile P ON P.profile_id = SOP.profile_id
          WHERE SOP.scientific_output_id = SO.scientific_output_id
        )                       AS "authors",
        COALESCE(CSO.CLARIVATE_TYPE, SCSO.SCOPUS_TYPE) AS "type",
        SO.publication_year     AS "publicationYear",
        SO.doi                  AS "doi",
        S.source_name           AS "journal",
        COALESCE(CSO.volume, SCSO.volume) AS "volume",
        COALESCE(CSO.issue_identifier, SCSO.issue_identifier) AS "issue",
        COALESCE(CSO.clarivate_page_range, SCSO.scopus_page_range) AS "pages",
        (
          SELECT LISTAGG(K.keyword, ',') WITHIN GROUP (ORDER BY K.keyword)
          FROM Scientific_Output_Keyword SOK
          JOIN Keyword K ON K.keyword_id = SOK.keyword_id
          WHERE SOK.scientific_output_id = SO.scientific_output_id
        )                       AS "keywords"
      FROM Scientific_Output_Unit SOU
      JOIN Scientific_Output SO ON SO.scientific_output_id = SOU.scientific_output_id
      LEFT JOIN Source S ON S.source_id = SO.SOURCE
      LEFT JOIN Clarivate_Scientific_Output CSO ON CSO.scientific_output_id = SO.scientific_output_id
      LEFT JOIN Scopus_Scientific_Output SCSO ON SCSO.scientific_output_id = SO.scientific_output_id
      WHERE SOU.unit_id = :unitId
      ORDER BY SO.publication_year DESC
    `,
    { unitId },
  );
}

  async findProjectsByUnitId(unitId: number): Promise<UnitProject[]> {
    return this.databaseClient.query<UnitProject>(
      `
        SELECT
          P.project_id                            AS "id",
          P.project_id                            AS "code",
          P.project_name                          AS "name",
          (
            SELECT TRIM(
              PR.profile_name || ' ' || PR.profile_first_surname || ' ' || PR.profile_last_surname
            )
            FROM UCR_PROFILE_PROJECT_UNIT PPPU
            JOIN Profile PR ON PR.profile_id = PPPU.profile_id
            WHERE PPPU.project_id = P.project_id
              AND PPPU.participation = 1
            FETCH FIRST 1 ROWS ONLY
          )                                       AS "managerName",
          (
            SELECT PPPU.profile_id
            FROM UCR_PROFILE_PROJECT_UNIT PPPU
            WHERE PPPU.project_id = P.project_id
              AND PPPU.participation = 1
            FETCH FIRST 1 ROWS ONLY
          )                                       AS "managerId",
          TO_CHAR(PP.project_start_date, 'DD/MM/YYYY') AS "startDate",
          TO_CHAR(PP.project_end_date,   'DD/MM/YYYY') AS "endDate",
          RT.project_research_type_name           AS "researchType",
          PT.project_type_name                    AS "projectType",
          (
            SELECT LISTAGG(K.keyword, ',') WITHIN GROUP (ORDER BY K.keyword)
            FROM (
              SELECT K.keyword
              FROM Project_Keyword PK
              JOIN Keyword K ON K.keyword_id = PK.keyword_id
              WHERE PK.project_id = P.project_id
              FETCH FIRST 20 ROWS ONLY
            ) K
          )                                       AS "keywords"
        FROM Project_Unit PU
        JOIN Project P ON P.project_id = PU.project_id
        JOIN Project_Period PP ON PP.project_id = P.project_id
        JOIN Project_Research_Type RT ON RT.project_research_type_id = P.project_research_type
        JOIN Project_Type PT ON PT.project_type_id = P.project_type
        WHERE PU.unit_id = :unitId
        ORDER BY PP.project_start_date DESC
      `,
      { unitId },
    );
  }

  private calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  async findResearchersForUnitsByBaseUnit(
    q?: string,
  ): Promise<{ id: number; name: string; firstSurname: string | null; count: number }[]> {
    const conditions: string[] = [];
    const params: Record<string, string> = {};

    if (q) {
      params.q = `%${q}%`;
      conditions.push(`u.unit_name LIKE :q`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return this.databaseClient.query<{
      id: number;
      name: string;
      firstSurname: string | null;
      count: number;
    }>(
      `
      SELECT
        p.PROFILE_ID            AS "id",
        p.PROFILE_NAME          AS "name",
        p.PROFILE_FIRST_SURNAME AS "firstSurname",
        COUNT(DISTINCT pwu.unit_id) AS "count"
      FROM ucr_profile_work_unit pwu
      JOIN profile p ON p.PROFILE_ID = pwu.PROFILE_ID
      JOIN unit u ON u.unit_id = pwu.unit_id
      ${whereClause}
      GROUP BY p.PROFILE_ID, p.PROFILE_NAME, p.PROFILE_FIRST_SURNAME
      ORDER BY p.PROFILE_NAME
      `,
      params,
    );
  }

  async findResearchersForUnits(
    q?: string,
  ): Promise<{ id: number; name: string; firstSurname: string | null; count: number }[]> {
    const conditions: string[] = [];
    const params: Record<string, string> = {};

    if (q) {
      params.q = `%${q}%`;
      conditions.push(`u.unit_name LIKE :q`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return this.databaseClient.query<{
      id: number;
      name: string;
      firstSurname: string | null;
      count: number;
    }>(
      `
      SELECT
        p.PROFILE_ID          AS "id",
        p.PROFILE_NAME        AS "name",
        p.PROFILE_FIRST_SURNAME AS "firstSurname",
        COUNT(DISTINCT ppu.unit_id) AS "count"
      FROM ucr_profile_project_unit ppu
      JOIN profile p ON p.PROFILE_ID = ppu.PROFILE_ID
      JOIN unit u ON u.unit_id = ppu.unit_id
      ${whereClause}
      GROUP BY p.PROFILE_ID, p.PROFILE_NAME, p.PROFILE_FIRST_SURNAME
      ORDER BY p.PROFILE_NAME
      `,
      params,
    );
  }
}
