const PROJECT_KEYWORDS_BY_PROJECT_IDS_SELECT = `
  SELECT
    project_keyword_link.PROJECT_ID AS "projectId",
    keyword.KEYWORD AS "description"
  FROM PROJECT_KEYWORD project_keyword_link
  INNER JOIN KEYWORD keyword
    ON project_keyword_link.KEYWORD_ID = keyword.KEYWORD_ID
`;

const PROFILE_FULL_NAME_SQL = (profileAlias: string): string => `(
  ${profileAlias}.PROFILE_NAME || ' ' || ${profileAlias}.PROFILE_FIRST_SURNAME ||
  CASE
    WHEN ${profileAlias}.PROFILE_LAST_SURNAME IS NULL OR ${profileAlias}.PROFILE_LAST_SURNAME = '' THEN ''
    ELSE ' ' || ${profileAlias}.PROFILE_LAST_SURNAME
  END
)`;

const SEARCH_PROJECTS_WHERE = `
  (
    TO_CHAR(research_project.PROJECT_ID) LIKE :searchTerm
    OR LOWER(research_project.PROJECT_NAME) LIKE LOWER(:searchTerm)
    OR LOWER(
      TO_CHAR(research_project.PROJECT_ID) || ' ' || research_project.PROJECT_NAME
    ) LIKE LOWER(:searchTerm)
  )
`;

const PROJECT_FILTER_BASIC_JOIN_BASE_WITHOUT_PERIOD = `
  FROM PROJECT research_project
  INNER JOIN PROJECT_TYPE project_type_lookup
    ON research_project.PROJECT_TYPE = project_type_lookup.PROJECT_TYPE_ID
  INNER JOIN PROJECT_FUNDING_TYPE funding_type_lookup
    ON research_project.PROJECT_FUNDING_TYPE = funding_type_lookup.PROJECT_FUNDING_TYPE_ID
  INNER JOIN PROJECT_RESEARCH_TYPE research_type_lookup
    ON research_project.PROJECT_RESEARCH_TYPE = research_type_lookup.PROJECT_RESEARCH_TYPE_ID
  INNER JOIN PROJECT_STATUS status_lookup
    ON research_project.PROJECT_STATUS = status_lookup.PROJECT_STATUS_ID
`;

const PROJECT_FILTER_PARTICIPANTS_JOIN_SUFFIX = `
  INNER JOIN UCR_PROFILE_PROJECT_UNIT member_participation
    ON research_project.PROJECT_ID = member_participation.PROJECT_ID
  INNER JOIN PROFILE member_profile
    ON member_participation.PROFILE_ID = member_profile.PROFILE_ID
`;

const PROJECT_START_DATES_CTE = `
  WITH project_start_dates AS (
    SELECT
      calendar_period.PROJECT_ID,
      MIN(calendar_period.PROJECT_START_DATE) AS PROJECT_START_DATE
    FROM PROJECT_PERIOD calendar_period
    GROUP BY calendar_period.PROJECT_ID
  )
`;

const PROJECT_FILTER_START_DATES_JOIN = `
  INNER JOIN project_start_dates
    ON research_project.PROJECT_ID = project_start_dates.PROJECT_ID
`;

const PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_SELECT = `
  SELECT research_type_lookup.PROJECT_RESEARCH_TYPE_NAME AS "label",
       LOWER(research_type_lookup.PROJECT_RESEARCH_TYPE_NAME) AS "optionValue",
  COUNT(DISTINCT research_project.PROJECT_ID) AS "optionCount"
`;

const PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_GROUP_ORDER = `
  GROUP BY research_type_lookup.PROJECT_RESEARCH_TYPE_NAME
  ORDER BY UPPER(research_type_lookup.PROJECT_RESEARCH_TYPE_NAME) ASC
`;

const PROJECT_TYPE_FILTER_OPTIONS_SELECT = `
  SELECT project_type_lookup.PROJECT_TYPE_NAME AS "label",
       LOWER(project_type_lookup.PROJECT_TYPE_NAME) AS "optionValue",
  COUNT(DISTINCT research_project.PROJECT_ID) AS "optionCount"
`;

const PROJECT_TYPE_FILTER_OPTIONS_GROUP_ORDER = `
  GROUP BY project_type_lookup.PROJECT_TYPE_NAME
  ORDER BY UPPER(project_type_lookup.PROJECT_TYPE_NAME) ASC
`;

const PROJECT_START_YEAR_FILTER_OPTIONS_SELECT = `
  ${PROJECT_START_DATES_CTE}
  SELECT TO_CHAR(project_start_dates.PROJECT_START_DATE, 'YYYY') AS "label",
       TO_CHAR(project_start_dates.PROJECT_START_DATE, 'YYYY') AS "optionValue",
  COUNT(DISTINCT research_project.PROJECT_ID) AS "optionCount"
  FROM PROJECT research_project
  ${PROJECT_FILTER_START_DATES_JOIN}
  INNER JOIN PROJECT_TYPE project_type_lookup
    ON research_project.PROJECT_TYPE = project_type_lookup.PROJECT_TYPE_ID
  INNER JOIN PROJECT_FUNDING_TYPE funding_type_lookup
    ON research_project.PROJECT_FUNDING_TYPE = funding_type_lookup.PROJECT_FUNDING_TYPE_ID
  INNER JOIN PROJECT_RESEARCH_TYPE research_type_lookup
    ON research_project.PROJECT_RESEARCH_TYPE = research_type_lookup.PROJECT_RESEARCH_TYPE_ID
  INNER JOIN PROJECT_STATUS status_lookup
    ON research_project.PROJECT_STATUS = status_lookup.PROJECT_STATUS_ID
`;

const PROJECT_START_YEAR_FILTER_OPTIONS_GROUP_ORDER = `
  GROUP BY TO_CHAR(project_start_dates.PROJECT_START_DATE, 'YYYY')
  ORDER BY TO_CHAR(project_start_dates.PROJECT_START_DATE, 'YYYY') DESC
`;

const PROJECT_STATUS_FILTER_OPTIONS_SELECT = `
  SELECT status_lookup.PROJECT_STATUS_NAME AS "label",
       LOWER(status_lookup.PROJECT_STATUS_NAME) AS "optionValue",
  COUNT(DISTINCT research_project.PROJECT_ID) AS "optionCount"
`;

const PROJECT_STATUS_FILTER_OPTIONS_GROUP_ORDER = `
  GROUP BY status_lookup.PROJECT_STATUS_NAME
  ORDER BY UPPER(status_lookup.PROJECT_STATUS_NAME) ASC
`;

const PROJECT_KEYWORDS_FILTER_OPTIONS_SELECT = `
  SELECT keyword.KEYWORD AS "label",
    LOWER(keyword.KEYWORD) AS "optionValue",
    COUNT(DISTINCT research_project.PROJECT_ID) AS "optionCount"
`;

const PROJECT_KEYWORDS_FILTER_OPTIONS_JOIN = `
  INNER JOIN PROJECT_KEYWORD project_keyword_link
    ON project_keyword_link.PROJECT_ID = research_project.PROJECT_ID
  INNER JOIN KEYWORD keyword
    ON project_keyword_link.KEYWORD_ID = keyword.KEYWORD_ID
`;

const PROJECT_KEYWORDS_FILTER_OPTIONS_GROUP_ORDER = `
  GROUP BY keyword.KEYWORD
  ORDER BY UPPER(keyword.KEYWORD) ASC
`;

const PROJECT_PRIMARY_INVESTIGATOR_SUBQUERY = `
  SELECT
    PROJECT_ID,
    PROFILE_ID,
    PARTICIPATION_START_DATE,
    PARTICIPATION_END_DATE
  FROM (
    SELECT
      member_participation.PROJECT_ID,
      member_participation.PROFILE_ID,
      member_participation.PARTICIPATION_START_DATE,
      member_participation.PARTICIPATION_END_DATE,
      ROW_NUMBER() OVER (
        PARTITION BY member_participation.PROJECT_ID
        ORDER BY
          member_participation.PARTICIPATION_START_DATE DESC NULLS LAST,
          member_participation.PROFILE_ID ASC
      ) AS participation_rank
    FROM UCR_PROFILE_PROJECT_UNIT member_participation
    WHERE member_participation.PARTICIPATION = 1
  )
  WHERE participation_rank = 1
`;

const PROJECT_RESPONSIBLE_UNIT_SUBQUERY = `
  SELECT
    responsible_unit_membership.PROJECT_ID,
    MIN(responsible_unit_membership.UNIT_ID) AS UNIT_ID
  FROM PROJECT_UNIT responsible_unit_membership
  WHERE responsible_unit_membership.ASSOCIATION_TYPE = 'Unidad Responsable'
  GROUP BY responsible_unit_membership.PROJECT_ID
`;

const PROJECT_PERIOD_SUMMARY_SUBQUERY = `
  SELECT
    calendar_period.PROJECT_ID,
    MIN(calendar_period.PROJECT_START_DATE) AS AGGREGATE_START_DATE,
    MAX(calendar_period.PROJECT_END_DATE) AS AGGREGATE_END_DATE
  FROM PROJECT_PERIOD calendar_period
  GROUP BY calendar_period.PROJECT_ID
`;

const PROJECT_MANAGER_PROFILE_NAME_SQL = PROFILE_FULL_NAME_SQL('manager_profile');

const PROJECT_BASE_FROM = `
  FROM PROJECT research_project
  LEFT JOIN (${PROJECT_PRIMARY_INVESTIGATOR_SUBQUERY}) principal_investigator_participation
    ON research_project.PROJECT_ID = principal_investigator_participation.PROJECT_ID
  LEFT JOIN PROFILE manager_profile
    ON manager_profile.PROFILE_ID = principal_investigator_participation.PROFILE_ID

  LEFT JOIN (${PROJECT_RESPONSIBLE_UNIT_SUBQUERY}) responsible_unit_aggregate
    ON research_project.PROJECT_ID = responsible_unit_aggregate.PROJECT_ID
  LEFT JOIN UNIT responsible_unit
    ON responsible_unit.UNIT_ID = responsible_unit_aggregate.UNIT_ID

  LEFT JOIN (${PROJECT_PERIOD_SUMMARY_SUBQUERY}) project_period_aggregate
    ON research_project.PROJECT_ID = project_period_aggregate.PROJECT_ID
  LEFT JOIN PROJECT_TYPE project_type_lookup
    ON research_project.PROJECT_TYPE = project_type_lookup.PROJECT_TYPE_ID
  LEFT JOIN PROJECT_FUNDING_TYPE funding_type_lookup
    ON research_project.PROJECT_FUNDING_TYPE = funding_type_lookup.PROJECT_FUNDING_TYPE_ID
  LEFT JOIN PROJECT_RESEARCH_TYPE research_type_lookup
    ON research_project.PROJECT_RESEARCH_TYPE = research_type_lookup.PROJECT_RESEARCH_TYPE_ID
  LEFT JOIN PROJECT_STATUS status_lookup
    ON research_project.PROJECT_STATUS = status_lookup.PROJECT_STATUS_ID
`;

const PROJECT_BASE_SELECT = `
  SELECT
    research_project.PROJECT_ID AS "id",
    manager_profile.PROFILE_ID AS "projectManagerId",
    ${PROJECT_MANAGER_PROFILE_NAME_SQL} AS "projectManagerName",
    research_project.PROJECT_ID AS "code",
    research_project.PROJECT_NAME AS "name",
    responsible_unit.UNIT_ID AS "unitId",
    responsible_unit.UNIT_NAME AS "unitName",
    project_type_lookup.PROJECT_TYPE_NAME AS "projectType",
    funding_type_lookup.PROJECT_FUNDING_TYPE_NAME AS "fundingType",
    research_type_lookup.PROJECT_RESEARCH_TYPE_NAME AS "researchType",
    status_lookup.PROJECT_STATUS_NAME AS "status",
    CASE
      WHEN project_period_aggregate.AGGREGATE_START_DATE IS NULL THEN ''
      ELSE TO_CHAR(project_period_aggregate.AGGREGATE_START_DATE, 'YYYY-MM-DD')
    END AS "startDate",
    CASE
      WHEN project_period_aggregate.AGGREGATE_END_DATE IS NULL THEN ''
      ELSE TO_CHAR(project_period_aggregate.AGGREGATE_END_DATE, 'YYYY-MM-DD')
    END AS "endDate"
`;

const COUNT_PROJECTS_QUERY = `
  SELECT COUNT(DISTINCT research_project.PROJECT_ID) AS "totalCount"
  ${PROJECT_BASE_FROM}
`;

const PROJECT_DETAIL_SELECT = `
  ${PROJECT_BASE_SELECT},
    research_project.PROJECT_DESCRIPTION AS "description",
    CASE
      WHEN principal_investigator_participation.PARTICIPATION_START_DATE IS NULL THEN ''
      ELSE TO_CHAR(
        principal_investigator_participation.PARTICIPATION_START_DATE,
        'YYYY-MM-DD'
      )
    END AS "principalParticipationStartDate",
    CASE
      WHEN principal_investigator_participation.PARTICIPATION_END_DATE IS NULL THEN ''
      ELSE TO_CHAR(
        principal_investigator_participation.PARTICIPATION_END_DATE,
        'YYYY-MM-DD'
      )
    END AS "principalParticipationEndDate"
  ${PROJECT_BASE_FROM}
`;

const PARTICIPANT_PROFILE_NAME_SQL = PROFILE_FULL_NAME_SQL('member_profile');

const COORDINATOR_PARTICIPATION_ID = 4;

const PROJECT_PARTICIPATIONS_SELECT = `
  SELECT
    member_profile.PROFILE_ID AS "id",
    ${PARTICIPANT_PROFILE_NAME_SQL} AS "name",
    participation_kind.PROJECT_PARTICIPATION_NAME AS "role",
    member_participation.PARTICIPATION AS "participationTypeId",
    CASE
      WHEN member_participation.PARTICIPATION_START_DATE IS NULL THEN ''
      ELSE TO_CHAR(member_participation.PARTICIPATION_START_DATE, 'YYYY-MM-DD')
    END AS "participationStartDate",
    CASE
      WHEN member_participation.PARTICIPATION_END_DATE IS NULL THEN ''
      ELSE TO_CHAR(member_participation.PARTICIPATION_END_DATE, 'YYYY-MM-DD')
    END AS "participationEndDate",
    member_participation.PARTICIPATION_START_DATE AS "participationStartTs",
    member_participation.PARTICIPATION_END_DATE AS "participationEndTs"
  FROM UCR_PROFILE_PROJECT_UNIT member_participation
  INNER JOIN PROFILE member_profile
    ON member_participation.PROFILE_ID = member_profile.PROFILE_ID
  INNER JOIN PROJECT_PARTICIPATION participation_kind
    ON member_participation.PARTICIPATION = participation_kind.PROJECT_PARTICIPATION_ID
`;

const PROJECT_DISCIPLINES_BY_PROJECT_SELECT = `
  SELECT
    discipline.DISCIPLINE_NAME AS "description"
  FROM PROJECT_DISCIPLINE project_discipline_link
  INNER JOIN DISCIPLINE discipline
    ON project_discipline_link.DISCIPLINE_ID = discipline.DISCIPLINE_ID
`;

const PROJECT_KEYWORDS_BY_PROJECT_SELECT = `
  SELECT
    keyword.KEYWORD AS "description"
  FROM PROJECT_KEYWORD project_keyword_link
  INNER JOIN KEYWORD keyword
    ON project_keyword_link.KEYWORD_ID = keyword.KEYWORD_ID
`;

export {
  PROFILE_FULL_NAME_SQL,
  PROJECT_START_DATES_CTE,
  COUNT_PROJECTS_QUERY,
  SEARCH_PROJECTS_WHERE,
  PROJECT_FILTER_BASIC_JOIN_BASE_WITHOUT_PERIOD,
  PROJECT_FILTER_START_DATES_JOIN,
  PROJECT_FILTER_PARTICIPANTS_JOIN_SUFFIX,
  PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_SELECT,
  PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_TYPE_FILTER_OPTIONS_SELECT,
  PROJECT_TYPE_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_START_YEAR_FILTER_OPTIONS_SELECT,
  PROJECT_START_YEAR_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_STATUS_FILTER_OPTIONS_SELECT,
  PROJECT_STATUS_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_KEYWORDS_BY_PROJECT_IDS_SELECT,
  PROJECT_KEYWORDS_FILTER_OPTIONS_SELECT,
  PROJECT_KEYWORDS_FILTER_OPTIONS_JOIN,
  PROJECT_KEYWORDS_FILTER_OPTIONS_GROUP_ORDER,
  COORDINATOR_PARTICIPATION_ID,
  PROJECT_PRIMARY_INVESTIGATOR_SUBQUERY,
  PROJECT_PERIOD_SUMMARY_SUBQUERY,
  PROJECT_BASE_SELECT,
  PROJECT_BASE_FROM,
  PROJECT_DETAIL_SELECT,
  PROJECT_PARTICIPATIONS_SELECT,
  PROJECT_DISCIPLINES_BY_PROJECT_SELECT,
  PROJECT_KEYWORDS_BY_PROJECT_SELECT,
};
