/**
 * SQL query constants for the scientific productions repository.
 * These get composed together in the repository file to build complete queries.
 */

const SUMMARY_SELECT = `
  SELECT
    so.SCIENTIFIC_OUTPUT_ID                                       AS "id",
    so.TITLE                                                      AS "title",
    ucr_authors_sub.authors                                       AS "authors",
    sot.SCIENTIFIC_OUTPUT_TYPE_NAME                               AS "type",
    CASE
      WHEN sc.SCIENTIFIC_OUTPUT_ID IS NOT NULL THEN sc.OPEN_ACCESS
      ELSE NULL
    END                                                           AS "openAccess",
    so.PUBLICATION_YEAR                                           AS "publicationYear",
    so.DOI                                                        AS "doi",
    src.SOURCE_NAME                                               AS "journal",
    CASE
      WHEN sc.SCIENTIFIC_OUTPUT_ID IS NOT NULL THEN sc.VOLUME
      ELSE cl.VOLUME
    END                                                           AS "volume",
    CASE
      WHEN sc.SCIENTIFIC_OUTPUT_ID IS NOT NULL THEN sc.ISSUE_IDENTIFIER
      ELSE cl.ISSUE_IDENTIFIER
    END                                                           AS "issue",
    CASE
      WHEN sc.SCIENTIFIC_OUTPUT_ID IS NOT NULL THEN sc.SCOPUS_PAGE_RANGE
      ELSE cl.CLARIVATE_PAGE_RANGE
    END                                                           AS "pages",
    CASE
      WHEN sc.SCIENTIFIC_OUTPUT_ID IS NOT NULL THEN 'Scopus'
      ELSE 'Clarivate'
    END                                                           AS "source",
    keywords_sub.keywords                                         AS "keywords"
`;

const DETAIL_SELECT = `
  SELECT
    so.SCIENTIFIC_OUTPUT_ID                                       AS "id",
    so.TITLE                                                      AS "title",
    ucr_authors_sub.authors                                       AS "ucrAuthors",
    external_authors_sub.authors                                  AS "externalAuthors",
    units_sub.units                                               AS "unit",
    affiliations_sub.affiliations                                 AS "affiliations",
    sot.SCIENTIFIC_OUTPUT_TYPE_NAME                               AS "type",
    CASE
      WHEN sc.SCIENTIFIC_OUTPUT_ID IS NOT NULL THEN sc.OPEN_ACCESS
      ELSE NULL
    END                                                           AS "openAccess",
    so.PUBLICATION_YEAR                                           AS "publicationYear",
    NVL(sc.ABSTRACT, '')                                          AS "abstract",
    so.DOI                                                        AS "doi",
    src.SOURCE_NAME                                               AS "journal",
    CASE
      WHEN sc.SCIENTIFIC_OUTPUT_ID IS NOT NULL THEN sc.VOLUME
      ELSE cl.VOLUME
    END                                                           AS "volume",
    CASE
      WHEN sc.SCIENTIFIC_OUTPUT_ID IS NOT NULL THEN sc.ISSUE_IDENTIFIER
      ELSE cl.ISSUE_IDENTIFIER
    END                                                           AS "issue",
    CASE
      WHEN sc.SCIENTIFIC_OUTPUT_ID IS NOT NULL THEN sc.SCOPUS_PAGE_RANGE
      ELSE cl.CLARIVATE_PAGE_RANGE
    END                                                           AS "pages",
    CASE
      WHEN sc.SCIENTIFIC_OUTPUT_ID IS NOT NULL THEN sc.SCOPUS_CITATION_COUNT
      ELSE cl.CLARIVATE_CITATION_COUNT
    END                                                           AS "citationCount",
    CASE
      WHEN sc.SCIENTIFIC_OUTPUT_ID IS NOT NULL THEN 'Scopus'
      ELSE 'Clarivate'
    END                                                           AS "source",
    keywords_sub.keywords                                         AS "keywords"
`;

const BASE_FROM = `
      FROM PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT so
      LEFT JOIN PRODUCCION_CIENTIFICA.SCOPUS_SCIENTIFIC_OUTPUT sc
        ON sc.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
      LEFT JOIN PRODUCCION_CIENTIFICA.CLARIVATE_SCIENTIFIC_OUTPUT cl
        ON cl.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
      LEFT JOIN PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_TYPE sot
        ON sot.SCIENTIFIC_OUTPUT_TYPE_ID = NVL(sc.SCOPUS_TYPE, cl.CLARIVATE_TYPE)
      LEFT JOIN PRODUCCION_CIENTIFICA.SOURCE src
        ON src.SOURCE_ID = so.SOURCE
    `;

// Subqueries reused across both SELECT variants
const AUTHORS_ALL_SUBQUERY = `
LEFT JOIN (
  SELECT sop.SCIENTIFIC_OUTPUT_ID,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id'   VALUE p.PROFILE_ID,
        'name' VALUE NVL(
                  p.PROFILE_NAME || ' ' || p.PROFILE_FIRST_SURNAME
                    || NVL2(p.PROFILE_LAST_SURNAME, ' ' || p.PROFILE_LAST_SURNAME, ''),
                  an.NAME || ' ' || an.FIRST_SURNAME
                    || NVL2(an.LAST_SURNAME, ' ' || an.LAST_SURNAME, '')
        )
      ) 
      ORDER BY p.PROFILE_NAME
      RETURNING BLOB
    ) AS authors
  FROM PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_PROFILE sop
  JOIN PRODUCCION_CIENTIFICA.PROFILE p ON p.PROFILE_ID = sop.PROFILE_ID
  LEFT JOIN (
    SELECT PROFILE_ID, NAME, FIRST_SURNAME, LAST_SURNAME,
           ROW_NUMBER() OVER (PARTITION BY PROFILE_ID ORDER BY ALTERNATIVE_NAME_ID) AS rn
    FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_ALTERNATIVE_NAME
  ) an ON an.PROFILE_ID = sop.PROFILE_ID AND an.rn = 1
  GROUP BY sop.SCIENTIFIC_OUTPUT_ID
) authors_sub ON authors_sub.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
`;

const UCR_AUTHORS_SUBQUERY = `
  LEFT JOIN (
    SELECT sop.SCIENTIFIC_OUTPUT_ID,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id'      VALUE p.PROFILE_ID,
          'name'    VALUE NVL(
            p.PROFILE_NAME || ' ' || p.PROFILE_FIRST_SURNAME
              || NVL2(p.PROFILE_LAST_SURNAME, ' ' || p.PROFILE_LAST_SURNAME, ''),
            an.NAME || ' ' || an.FIRST_SURNAME
              || NVL2(an.LAST_SURNAME, ' ' || an.LAST_SURNAME, '')
          ),
          'country' VALUE 'Costa Rica'
        )
        ORDER BY p.PROFILE_NAME
        RETURNING BLOB
      ) AS authors
    FROM PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_PROFILE sop
    JOIN PRODUCCION_CIENTIFICA.PROFILE p ON p.PROFILE_ID = sop.PROFILE_ID
    JOIN PRODUCCION_CIENTIFICA.UCR_PROFILE ucr ON ucr.PROFILE_ID = sop.PROFILE_ID
    LEFT JOIN (
      SELECT PROFILE_ID, NAME, FIRST_SURNAME, LAST_SURNAME,
              ROW_NUMBER() OVER (PARTITION BY PROFILE_ID ORDER BY ALTERNATIVE_NAME_ID) AS rn
      FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_ALTERNATIVE_NAME
    ) an ON an.PROFILE_ID = sop.PROFILE_ID AND an.rn = 1
    GROUP BY sop.SCIENTIFIC_OUTPUT_ID
  ) ucr_authors_sub ON ucr_authors_sub.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
`;

const EXTERNAL_AUTHORS_SUBQUERY = `
  LEFT JOIN (
    SELECT sop.SCIENTIFIC_OUTPUT_ID,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id'      VALUE p.PROFILE_ID,
          'name'    VALUE NVL(
            p.PROFILE_NAME || ' ' || p.PROFILE_FIRST_SURNAME
              || NVL2(p.PROFILE_LAST_SURNAME, ' ' || p.PROFILE_LAST_SURNAME, ''),
            an.NAME || ' ' || an.FIRST_SURNAME
              || NVL2(an.LAST_SURNAME, ' ' || an.LAST_SURNAME, '')
          ),
          'country' VALUE c.COUNTRY_NAME
        )
        ORDER BY p.PROFILE_NAME
        RETURNING BLOB
      ) AS authors
    FROM PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_PROFILE sop
    JOIN PRODUCCION_CIENTIFICA.PROFILE p ON p.PROFILE_ID = sop.PROFILE_ID
    JOIN PRODUCCION_CIENTIFICA.EXTERNAL_PROFILE ep ON ep.PROFILE_ID = sop.PROFILE_ID
    LEFT JOIN (
      SELECT PROFILE_ID, MIN(INSTITUTION_ID) AS INSTITUTION_ID
      FROM PRODUCCION_CIENTIFICA.EXTERNAL_PROFILE_INSTITUTION
      GROUP BY PROFILE_ID
    ) epi ON epi.PROFILE_ID = sop.PROFILE_ID
    LEFT JOIN PRODUCCION_CIENTIFICA.INSTITUTION i ON i.INSTITUTION_ID = epi.INSTITUTION_ID
    LEFT JOIN PRODUCCION_CIENTIFICA.COUNTRY c ON c.COUNTRY_ID = i.INSTITUTION_COUNTRY
    LEFT JOIN (
      SELECT PROFILE_ID, NAME, FIRST_SURNAME, LAST_SURNAME,
             ROW_NUMBER() OVER (PARTITION BY PROFILE_ID ORDER BY ALTERNATIVE_NAME_ID) AS rn
      FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_ALTERNATIVE_NAME
    ) an ON an.PROFILE_ID = sop.PROFILE_ID AND an.rn = 1
    GROUP BY sop.SCIENTIFIC_OUTPUT_ID
  ) external_authors_sub ON external_authors_sub.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
`;

const UNITS_SUBQUERY = `
  LEFT JOIN (
    SELECT SCIENTIFIC_OUTPUT_ID,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id'   VALUE UNIT_ID,
          'unit' VALUE UNIT_NAME
        ) ORDER BY UNIT_NAME
        RETURNING BLOB
      ) AS units
    FROM (
      SELECT DISTINCT sop.SCIENTIFIC_OUTPUT_ID, u.UNIT_ID, u.UNIT_NAME
      FROM PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_PROFILE sop
      JOIN PRODUCCION_CIENTIFICA.UCR_PROFILE ucr ON ucr.PROFILE_ID = sop.PROFILE_ID
      JOIN PRODUCCION_CIENTIFICA.UCR_PROFILE_WORK_UNIT pwu ON pwu.PROFILE_ID = sop.PROFILE_ID
      JOIN PRODUCCION_CIENTIFICA.UNIT u ON u.UNIT_ID = pwu.UNIT_ID
    )
    GROUP BY SCIENTIFIC_OUTPUT_ID
  ) units_sub ON units_sub.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
`;

const AFFILIATIONS_SUBQUERY = `
  LEFT JOIN (
    SELECT SCIENTIFIC_OUTPUT_ID,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id'          VALUE INSTITUTION_ID,
          'affiliation' VALUE INSTITUTION_NAME
        ) ORDER BY INSTITUTION_NAME
        RETURNING BLOB
      ) AS affiliations
    FROM (
      SELECT DISTINCT sop.SCIENTIFIC_OUTPUT_ID, i.INSTITUTION_ID, i.INSTITUTION_NAME
      FROM PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_PROFILE sop
      JOIN PRODUCCION_CIENTIFICA.EXTERNAL_PROFILE ep ON ep.PROFILE_ID = sop.PROFILE_ID
      JOIN PRODUCCION_CIENTIFICA.UCR_PROFILE_EDUCATION edu ON edu.PROFILE_ID = sop.PROFILE_ID
      JOIN PRODUCCION_CIENTIFICA.INSTITUTION i ON i.INSTITUTION_ID = edu.INSTITUTION
    )
    GROUP BY SCIENTIFIC_OUTPUT_ID
  ) affiliations_sub ON affiliations_sub.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
`;

const KEYWORDS_SUBQUERY = `
  LEFT JOIN (
    SELECT sok.SCIENTIFIC_OUTPUT_ID,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id'    VALUE k.KEYWORD_ID,
          'value' VALUE INITCAP(k.KEYWORD)
        )
        ORDER BY k.KEYWORD
        RETURNING BLOB
      ) AS keywords
    FROM PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_KEYWORD sok
    JOIN PRODUCCION_CIENTIFICA.KEYWORD k ON k.KEYWORD_ID = sok.KEYWORD_ID
    GROUP BY sok.SCIENTIFIC_OUTPUT_ID
  ) keywords_sub ON keywords_sub.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
`;

export {
  SUMMARY_SELECT,
  DETAIL_SELECT,
  BASE_FROM,
  AUTHORS_ALL_SUBQUERY,
  UCR_AUTHORS_SUBQUERY,
  EXTERNAL_AUTHORS_SUBQUERY,
  UNITS_SUBQUERY,
  AFFILIATIONS_SUBQUERY,
  KEYWORDS_SUBQUERY,
};
