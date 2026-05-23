import { ProjectsRepository } from '../projects.repository';
import type { DatabaseClient } from '../../../../common/database/database-client.contract';

type DatabaseClientMock = {
  query: jest.Mock;
};

describe('ProjectsRepository', () => {
  let repository: ProjectsRepository;
  let mockDatabaseClient: DatabaseClientMock;

  beforeEach(() => {
    mockDatabaseClient = { query: jest.fn() };
    repository = new ProjectsRepository(mockDatabaseClient as unknown as DatabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findFilterOptions', () => {
    it('should return static counts for each filter option', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([
          { label: 'Basica', optionValue: 'basica', optionCount: 7 },
        ])
        .mockResolvedValueOnce([
          { label: 'Proyecto', optionValue: 'proyecto', optionCount: 8 },
        ])
        .mockResolvedValueOnce([{ label: '2024', optionValue: '2024', optionCount: 3 }])
        .mockResolvedValueOnce([
          { label: 'Activo', optionValue: 'activo', optionCount: 6 },
        ])
        .mockResolvedValueOnce([
          {
            label: 'Koen Voorend',
            optionValue: 'koen voorend',
            optionCount: 2,
          },
        ])
        .mockResolvedValueOnce([
          {
            label: 'economia social',
            optionValue: 'economia social',
            optionCount: 4,
          },
        ]);

      const result = await repository.findFilterOptions();

      expect(result).toEqual({
        researchType: [{ label: 'Basica', value: 'basica', count: 7 }],
        projectType: [{ label: 'Proyecto', value: 'proyecto', count: 8 }],
        startYear: [{ label: '2024', value: '2024', count: 3 }],
        status: [{ label: 'Activo', value: 'activo', count: 6 }],
        participants: [{ label: 'Koen Voorend', value: 'koen voorend', count: 2 }],
        keywords: [{ label: 'Economia Social', value: 'economia social', count: 4 }],
      });

      expect(mockDatabaseClient.query).toHaveBeenCalledTimes(6);
    });

    it('should compute dynamic counts by excluding each facet own filter', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([
          { label: 'Basica', optionValue: 'basica', optionCount: 7 },
        ])
        .mockResolvedValueOnce([
          { label: 'Proyecto', optionValue: 'proyecto', optionCount: 8 },
        ])
        .mockResolvedValueOnce([{ label: '2024', optionValue: '2024', optionCount: 3 }])
        .mockResolvedValueOnce([
          { label: 'Activo', optionValue: 'activo', optionCount: 6 },
        ])
        .mockResolvedValueOnce([
          {
            label: 'Koen Voorend',
            optionValue: 'koen voorend',
            optionCount: 2,
          },
        ])
        .mockResolvedValueOnce([
          {
            label: 'pobreza',
            optionValue: 'pobreza',
            optionCount: 4,
          },
        ]);

      await repository.findFilterOptions('clima', {
        researchType: ['Basica'],
        status: ['Activo'],
        keywords: ['pobreza'],
      });

      const researchTypeQuery = mockDatabaseClient.query.mock.calls[0][0] as string;
      expect(researchTypeQuery).toContain(
        'LOWER(status_lookup.PROJECT_STATUS_NAME) IN (:status',
      );
      expect(researchTypeQuery).toContain('EXISTS');
      expect(researchTypeQuery).not.toContain(
        'LOWER(research_type_lookup.PROJECT_RESEARCH_TYPE_NAME) IN (:researchType',
      );
      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({
        searchTermCode0: '%clima%',
        searchTermName1: '%clima%',
        status2: 'activo',
        keyword3: '%pobreza%',
      });

      const keywordsQuery = mockDatabaseClient.query.mock.calls[5][0] as string;
      expect(keywordsQuery).toContain(
        'LOWER(research_type_lookup.PROJECT_RESEARCH_TYPE_NAME) IN (:researchType',
      );
      expect(keywordsQuery).toContain(
        'LOWER(status_lookup.PROJECT_STATUS_NAME) IN (:status',
      );
      expect(keywordsQuery).not.toContain('EXISTS');
    });

    it('should keep the selected project type in the project type facet query', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([
          { label: 'Basica', optionValue: 'basica', optionCount: 7 },
        ])
        .mockResolvedValueOnce([
          { label: 'Proyecto', optionValue: 'proyecto', optionCount: 4 },
        ])
        .mockResolvedValueOnce([{ label: '2018', optionValue: '2018', optionCount: 4 }])
        .mockResolvedValueOnce([
          { label: 'Activo', optionValue: 'activo', optionCount: 6 },
        ])
        .mockResolvedValueOnce([
          { label: 'Koen Voorend', optionValue: 'koen voorend', optionCount: 2 },
        ])
        .mockResolvedValueOnce([
          { label: 'economia social', optionValue: 'economia social', optionCount: 4 },
        ]);

      await repository.findFilterOptions(undefined, {
        projectType: ['Proyecto'],
        startYear: ['2018'],
      });

      const projectTypeQuery = mockDatabaseClient.query.mock.calls[1][0] as string;
      expect(projectTypeQuery).toContain(
        'LOWER(project_type_lookup.PROJECT_TYPE_NAME) IN (:projectType',
      );
    });
  });

  describe('findPaginated', () => {
    it('should return the first page of projects with total count', async () => {
      const mockRows = [
        {
          id: 1,
          projectManagerId: 11,
          projectManagerName: 'Alice Manager',
          code: 'C3992',
          name: 'El costo de una vida digna en Costa Rica',
          keywords: 'costo de vida, economia',
          projectType: 'Humanistico',
          fundingType: 'Fondos internos',
          researchType: 'Basica',
          status: 'Activo',
          startDate: '2023-06-01',
          endDate: '2025-12-31',
        },
        {
          id: 2,
          projectManagerId: 12,
          projectManagerName: 'Bob Manager',
          code: 'C4196',
          name: 'Analisis espacio-temporal del impacto de factores climaticos',
          keywords: 'clima, impacto',
          projectType: 'Interdisciplinario',
          fundingType: 'Fondos externos',
          researchType: 'Basica',
          status: 'Activo',
          startDate: '2024-01-01',
          endDate: '2026-12-15',
        },
      ];
      const mockCount = [{ totalCount: 12 }];
      const mockKeywords = [
        { projectId: 1, description: 'costo de vida' },
        { projectId: 1, description: 'economia' },
        { projectId: 2, description: 'clima' },
        { projectId: 2, description: 'impacto' },
      ];

      mockDatabaseClient.query
        .mockResolvedValueOnce(mockRows)
        .mockResolvedValueOnce(mockCount)
        .mockResolvedValueOnce(mockKeywords);

      const result = await repository.findPaginated(1, 10);

      expect(result.items).toEqual([
        {
          id: 1,
          projectManager: {
            id: 11,
            name: 'Alice Manager',
          },
          code: 'C3992',
          name: 'El costo de una vida digna en Costa Rica',
          keywords: ['costo de vida', 'economia'],
          projectType: 'Humanistico',
          fundingType: 'Fondos internos',
          researchType: 'Basica',
          status: 'Activo',
          startDate: '2023-06-01',
          endDate: '2025-12-31',
        },
        {
          id: 2,
          projectManager: {
            id: 12,
            name: 'Bob Manager',
          },
          code: 'C4196',
          name: 'Analisis espacio-temporal del impacto de factores climaticos',
          keywords: ['clima', 'impacto'],
          projectType: 'Interdisciplinario',
          fundingType: 'Fondos externos',
          researchType: 'Basica',
          status: 'Activo',
          startDate: '2024-01-01',
          endDate: '2026-12-15',
        },
      ]);
      expect(result.total).toBe(12);
      expect(mockDatabaseClient.query).toHaveBeenCalledTimes(3);

      const keywordsQuery = mockDatabaseClient.query.mock.calls[2][0] as string;
      expect(keywordsQuery).toContain('FROM PROJECT_KEYWORD project_keyword_link');
      expect(keywordsQuery).toContain('INNER JOIN KEYWORD keyword');
      expect(mockDatabaseClient.query.mock.calls[2][1]).toEqual({
        projectId0: 1,
        projectId1: 2,
      });
    });

    it('should apply correct offset when navigating to page 2', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 12 }]);

      await repository.findPaginated(2, 10);

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('OFFSET :offset ROWS');
      expect(itemsQuery).toContain('FETCH NEXT :limit ROWS ONLY');
      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({
        offset: 10,
        limit: 10,
      });
    });

    it('should calculate offset correctly for small page sizes', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 20 }]);

      await repository.findPaginated(3, 5);

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('OFFSET :offset ROWS');
      expect(itemsQuery).toContain('FETCH NEXT :limit ROWS ONLY');
      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({ offset: 10, limit: 5 });
    });

    it('should handle an empty database gracefully', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 0 }]);

      const result = await repository.findPaginated(1, 10);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should default total to 0 if count query returns no rows', async () => {
      mockDatabaseClient.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await repository.findPaginated(1, 10);

      expect(result.total).toBe(0);
    });

    it('should default total to 0 if totalCount is undefined', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: undefined }]);

      const result = await repository.findPaginated(1, 10);

      expect(result.total).toBe(0);
    });

    it('should join lookup tables for project type, funding, research type and status', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain(
        'LEFT JOIN PROJECT_TYPE project_type_lookup',
      );
      expect(itemsQuery).toContain(
        'LEFT JOIN PROJECT_FUNDING_TYPE funding_type_lookup',
      );
      expect(itemsQuery).toContain(
        'LEFT JOIN PROJECT_RESEARCH_TYPE research_type_lookup',
      );
      expect(itemsQuery).toContain(
        'LEFT JOIN PROJECT_STATUS status_lookup',
      );
    });

    it('should order results alphabetically by project name', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('ORDER BY "name" ASC');
    });

    it('should return matching projects when a search term is provided', async () => {
      const mockRows = [
        {
          id: 1,
          projectManagerId: 11,
          projectManagerName: 'Alice Manager',
          code: 'C3992',
          name: 'El costo de una vida digna en Costa Rica',
          keywords: 'costo de vida, economia',
          projectType: 'Humanistico',
          fundingType: 'Fondos internos',
          researchType: 'Basica',
          status: 'Activo',
          startDate: '2023-06-01',
          endDate: '2025-12-31',
        },
      ];
      const mockCount = [{ totalCount: 1 }];
      const mockKeywords = [{ projectId: 1, description: 'costo de vida' }];

      mockDatabaseClient.query
        .mockResolvedValueOnce(mockRows)
        .mockResolvedValueOnce(mockCount)
        .mockResolvedValueOnce(mockKeywords);

      const result = await repository.findPaginated(1, 10, 'costo');

      expect(result.items[0]).toEqual({
        id: 1,
        projectManager: {
          id: 11,
          name: 'Alice Manager',
        },
        code: 'C3992',
        name: 'El costo de una vida digna en Costa Rica',
        keywords: ['costo de vida'],
        projectType: 'Humanistico',
        fundingType: 'Fondos internos',
        researchType: 'Basica',
        status: 'Activo',
        startDate: '2023-06-01',
        endDate: '2025-12-31',
      });
      expect(result.total).toBe(1);
      expect(mockDatabaseClient.query).toHaveBeenCalledTimes(3);
    });

    it('should pass the search term as a parameterized LIKE argument', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'clima');

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain(
        'TO_CHAR(research_project.PROJECT_ID) LIKE :searchTerm',
      );
      expect(itemsQuery).toContain(
        'LOWER(research_project.PROJECT_NAME) LIKE LOWER(:searchTerm)',
      );
      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({
        searchTerm: '%clima%',
        offset: 0,
        limit: 10,
      });
    });

    it('should apply correct offset when navigating to page 2', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 5 }]);

      await repository.findPaginated(2, 10, 'proyecto');

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('OFFSET :offset ROWS');
      expect(itemsQuery).toContain('FETCH NEXT :limit ROWS ONLY');
      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({
        searchTerm: '%proyecto%',
        offset: 10,
        limit: 10,
      });
    });

    it('should filter keywords through project keyword relation tables', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, null, { keywords: ['Clima', 'salud'] });

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('EXISTS');
      expect(itemsQuery).toContain('FROM PROJECT_KEYWORD project_keyword_link');
      expect(itemsQuery).toContain('INNER JOIN KEYWORD keyword');
      expect(itemsQuery).toContain('LOWER(keyword.KEYWORD) LIKE :keyword0');
      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({
        keyword0: '%clima%',
        keyword1: '%salud%',
        offset: 0,
        limit: 10,
      });
    });

    it('should return an empty list when no projects match', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 0 }]);

      const result = await repository.findPaginated(1, 10, 'xyznonexistent');

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should default total to 0 if count query returns no rows', async () => {
      mockDatabaseClient.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await repository.findPaginated(1, 10, 'missing');

      expect(result.total).toBe(0);
    });

    it('should return the project detail with associated profiles', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([
          {
            id: 'C3992',
            projectManagerId: 2,
            projectManagerName: 'Koen Voorend',
            code: 'C3992',
            name: 'El costo de una vida digna en Costa Rica',
            description: 'Descripcion del proyecto',
            unitId: 15,
            unitName: 'Instituto de Investigaciones Sociales',
            projectType: 'Proyecto',
            fundingType: 'Financiamiento UCREA',
            researchType: 'Basica',
            status: 'Vencido',
            startDate: '2023-06-01',
            endDate: '2025-12-31',
            principalParticipationStartDate: '2023-06-01',
            principalParticipationEndDate: '2025-12-31',
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 2,
            name: 'Koen Voorend',
            role: 'Principal',
            participationTypeId: 1,
            participationStartDate: '2023-06-01',
            participationEndDate: '2025-12-31',
            participationStartTs: new Date('2023-06-01'),
          },
          {
            id: 12,
            name: 'Maria Perez',
            role: 'Asociado',
            participationTypeId: 3,
            participationStartDate: '2023-06-01',
            participationEndDate: '',
            participationStartTs: new Date('2023-06-01'),
          },
        ])
        .mockResolvedValueOnce([
          { description: 'Ciencias Sociales' },
          { description: 'Estadistica' },
        ])
        .mockResolvedValueOnce([
          { description: 'economia social' },
          { description: 'pobreza' },
        ]);

      const result = await repository.findById('C3992');

      expect(result).toEqual({
        id: 'C3992',
        projectManager: {
          id: 2,
          name: 'Koen Voorend',
          participationStartDate: '2023-06-01',
          participationEndDate: '2025-12-31',
        },
        code: 'C3992',
        name: 'El costo de una vida digna en Costa Rica',
        description: 'Descripcion del proyecto',
        unit: { id: 15, name: 'Instituto de Investigaciones Sociales' },
        disciplines: ['Ciencias Sociales', 'Estadistica'],
        keywords: ['economia social', 'pobreza'],
        projectType: 'Proyecto',
        fundingType: 'Financiamiento UCREA',
        researchType: 'Basica',
        status: 'Vencido',
        startDate: '2023-06-01',
        endDate: '2025-12-31',
        associatedProfiles: [
          {
            id: 12,
            name: 'Maria Perez',
            role: 'Asociado',
            participationStartDate: '2023-06-01',
          },
        ],
      });
      expect(mockDatabaseClient.query).toHaveBeenCalledTimes(4);

      const detailQuery = mockDatabaseClient.query.mock.calls[0][0] as string;
      expect(detailQuery).toContain('FROM PROJECT research_project');
      expect(detailQuery).toContain('WHERE research_project.PROJECT_ID = :projectId');
      expect(detailQuery).toContain(
        "WHERE responsible_unit_membership.ASSOCIATION_TYPE = 'Unidad Responsable'",
      );
      expect(detailQuery).toContain('ROW_NUMBER() OVER');
      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({ projectId: 'C3992' });

      const associatedProfilesQuery = mockDatabaseClient.query.mock.calls[1][0] as string;
      expect(associatedProfilesQuery).toContain(
        'FROM UCR_PROFILE_PROJECT_UNIT member_participation',
      );
      expect(mockDatabaseClient.query.mock.calls[1][1]).toEqual({ projectId: 'C3992' });

      const disciplinesQuery = mockDatabaseClient.query.mock.calls[2][0] as string;
      expect(disciplinesQuery).toContain('FROM PROJECT_DISCIPLINE project_discipline_link');
      expect(mockDatabaseClient.query.mock.calls[2][1]).toEqual({ projectId: 'C3992' });

      const keywordsQuery = mockDatabaseClient.query.mock.calls[3][0] as string;
      expect(keywordsQuery).toContain('FROM PROJECT_KEYWORD project_keyword_link');
      expect(mockDatabaseClient.query.mock.calls[3][1]).toEqual({ projectId: 'C3992' });
    });

    it('should collapse multiple coordinators to the one with the latest participation start', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([
          {
            id: 'P1',
            projectManagerId: 9,
            projectManagerName: 'Lead Researcher',
            code: 'P1',
            name: 'Project',
            description: 'Desc',
            unitId: 1,
            unitName: 'Unit',
            projectType: 'T',
            fundingType: 'F',
            researchType: 'R',
            status: 'S',
            startDate: '2020-01-01',
            endDate: '2021-01-01',
            principalParticipationStartDate: '',
            principalParticipationEndDate: '',
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 5,
            name: 'Coord A',
            role: 'Coordinador',
            participationTypeId: 4,
            participationStartDate: '2020-01-01',
            participationEndDate: '',
            participationStartTs: new Date('2020-01-01'),
          },
          {
            id: 6,
            name: 'Coord B',
            role: 'Coordinador',
            participationTypeId: 4,
            participationStartDate: '2021-06-01',
            participationEndDate: '',
            participationStartTs: new Date('2021-06-01'),
          },
          {
            id: 7,
            name: 'Peer',
            role: 'Asociado',
            participationTypeId: 3,
            participationStartDate: '2019-01-01',
            participationEndDate: '',
            participationStartTs: new Date('2019-01-01'),
          },
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await repository.findById('P1');

      const coordinators = result?.associatedProfiles.filter(
        (p) => p.role === 'Coordinador',
      );
      expect(coordinators).toHaveLength(2);
      expect(coordinators?.[0].id).toBe(5);
      expect(coordinators?.[1].id).toBe(6);
    });

    it('should return null when the project detail query finds no rows', async () => {
      mockDatabaseClient.query.mockResolvedValueOnce([]);

      await expect(repository.findById('999')).resolves.toBeNull();
      expect(mockDatabaseClient.query).toHaveBeenCalledTimes(1);
    });

    it('should return null when the id is blank', async () => {
      await expect(repository.findById('   ')).resolves.toBeNull();
      expect(mockDatabaseClient.query).not.toHaveBeenCalled();
    });

    it('should ignore blank search terms and avoid WHERE/params', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, '   ');

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;
      const countQuery = mockDatabaseClient.query.mock.calls[1][0] as string;
      expect(itemsQuery).not.toContain(
        'TO_CHAR(research_project.PROJECT_ID) LIKE :searchTerm',
      );
      expect(countQuery).not.toContain(
        'TO_CHAR(research_project.PROJECT_ID) LIKE :searchTerm',
      );
      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({ offset: 0, limit: 10 });
      expect(mockDatabaseClient.query.mock.calls[1][1]).toEqual({});
    });

    it('should apply normalized and deduplicated IN filters for researchType, projectType, startYear and status', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, undefined, {
        researchType: [' Basica ', 'basica', 'Aplicada'],
        projectType: ['Interdisciplinario'],
        startYear: ['2024'],
        status: [' In-Progress ', 'in-progress'],
      });

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;
      const countQuery = mockDatabaseClient.query.mock.calls[1][0] as string;

      expect(itemsQuery).toContain(
        'LOWER(research_type_lookup.PROJECT_RESEARCH_TYPE_NAME) IN (:researchType0, :researchType1)',
      );
      expect(itemsQuery).toContain(
        'LOWER(project_type_lookup.PROJECT_TYPE_NAME) IN (:projectType0)',
      );
      expect(itemsQuery).toContain(
        "TO_CHAR(project_period_aggregate.AGGREGATE_START_DATE, 'YYYY') IN (:startYear0)",
      );
      expect(itemsQuery).toContain(
        'LOWER(status_lookup.PROJECT_STATUS_NAME) IN (:status0)',
      );

      expect(countQuery).toContain(
        'LOWER(research_type_lookup.PROJECT_RESEARCH_TYPE_NAME) IN (:researchType0, :researchType1)',
      );
      expect(countQuery).toContain(
        'LOWER(project_type_lookup.PROJECT_TYPE_NAME) IN (:projectType0)',
      );
      expect(countQuery).toContain(
        "TO_CHAR(project_period_aggregate.AGGREGATE_START_DATE, 'YYYY') IN (:startYear0)",
      );
      expect(countQuery).toContain(
        'LOWER(status_lookup.PROJECT_STATUS_NAME) IN (:status0)',
      );

      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({
        researchType0: 'basica',
        researchType1: 'aplicada',
        projectType0: 'interdisciplinario',
        startYear0: '2024',
        status0: 'in-progress',
        offset: 0,
        limit: 10,
      });
      expect(mockDatabaseClient.query.mock.calls[1][1]).toEqual({
        researchType0: 'basica',
        researchType1: 'aplicada',
        projectType0: 'interdisciplinario',
        startYear0: '2024',
        status0: 'in-progress',
      });
    });

    it('should apply participants filter using normalized project manager names', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, undefined, {
        participants: [' Alice Manager ', 'alice manager', 'Bob Manager'],
      });

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;

      expect(itemsQuery).toContain('LOWER(');
      expect(itemsQuery).toContain('TRIM(');
      expect(itemsQuery).toContain('profile.PROFILE_NAME');
      expect(itemsQuery).toContain('profile.PROFILE_FIRST_SURNAME');
      expect(itemsQuery).toContain('profile.PROFILE_LAST_SURNAME');
      expect(itemsQuery).toContain('= :participant0');
      expect(itemsQuery).toContain('= :participant1');
      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({
        participant0: 'alice manager',
        participant1: 'bob manager',
        offset: 0,
        limit: 10,
      });
      expect(mockDatabaseClient.query.mock.calls[1][1]).toEqual({
        participant0: 'alice manager',
        participant1: 'bob manager',
      });
    });

    it('should apply keywords filter as OR LIKE clauses with normalized values', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, undefined, {
        keywords: [' Clima ', 'impacto', 'clima'],
      });

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;

      expect(itemsQuery).toContain(
        '(LOWER(keyword.KEYWORD) LIKE :keyword0 OR LOWER(keyword.KEYWORD) LIKE :keyword1)',
      );
      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({
        keyword0: '%clima%',
        keyword1: '%impacto%',
        offset: 0,
        limit: 10,
      });
      expect(mockDatabaseClient.query.mock.calls[1][1]).toEqual({
        keyword0: '%clima%',
        keyword1: '%impacto%',
      });
    });

    it('should preserve parameter order when combining search term and filters', async () => {
      mockDatabaseClient.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'eco', {
        researchType: ['Basica'],
        keywords: ['clima'],
      });

      const itemsQuery = mockDatabaseClient.query.mock.calls[0][0] as string;

      expect(itemsQuery).toContain(
        'TO_CHAR(research_project.PROJECT_ID) LIKE :searchTerm',
      );
      expect(itemsQuery).toContain(
        'LOWER(research_project.PROJECT_NAME) LIKE LOWER(:searchTerm)',
      );
      expect(itemsQuery).toContain(
        'LOWER(research_type_lookup.PROJECT_RESEARCH_TYPE_NAME) IN (:researchType0)',
      );
      expect(itemsQuery).toContain('(LOWER(keyword.KEYWORD) LIKE :keyword0)');
      expect(mockDatabaseClient.query.mock.calls[0][1]).toEqual({
        searchTerm: '%eco%',
        researchType0: 'basica',
        keyword0: '%clima%',
        offset: 0,
        limit: 10,
      });
      expect(mockDatabaseClient.query.mock.calls[1][1]).toEqual({
        searchTerm: '%eco%',
        researchType0: 'basica',
        keyword0: '%clima%',
      });
    });
  });

  describe('internal helper coverage', () => {
    it('should return empty keywords map when private helper receives no project ids', async () => {
      const findKeywordsByProjectIds = (
        repository as unknown as {
          findKeywordsByProjectIds: (
            projectIds: number[],
          ) => Promise<Map<number, string[]>>;
        }
      ).findKeywordsByProjectIds.bind(repository);

      const result = await findKeywordsByProjectIds([]);

      expect(result).toEqual(new Map<number, string[]>());
      expect(mockDatabaseClient.query).not.toHaveBeenCalled();
    });

    it('should use default empty params in distinct options helper', async () => {
      const findDistinctFilterOptions = (
        repository as unknown as {
          findDistinctFilterOptions: (
            query: string,
            params?: string[],
          ) => Promise<Array<{ label: string; value: string; count: number }>>;
        }
      ).findDistinctFilterOptions.bind(repository);

      mockDatabaseClient.query.mockResolvedValueOnce([
        { label: 'Basica', optionValue: 'basica', optionCount: 2 },
      ]);

      const result = await findDistinctFilterOptions('SELECT 1');

      expect(result).toEqual([{ label: 'Basica', value: 'basica', count: 2 }]);
      expect(mockDatabaseClient.query).toHaveBeenCalledWith('SELECT 1', {});
    });
  });
});
