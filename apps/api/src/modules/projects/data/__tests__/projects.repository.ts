import { ProjectsRepository } from '../projects.repository';
import type { DatabaseService } from '../../../../common/database/database.service';

type DatabaseServiceMock = {
  query: jest.Mock;
};

describe('ProjectsRepository', () => {
  let repository: ProjectsRepository;
  let mockDb: DatabaseServiceMock;

  beforeEach(() => {
    mockDb = { query: jest.fn() };
    repository = new ProjectsRepository(mockDb as unknown as DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      mockDb.query
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
      expect(mockDb.query).toHaveBeenCalledTimes(3);

      const keywordsQuery = mockDb.query.mock.calls[2][0] as string;
      expect(keywordsQuery).toContain('FROM Project_Keyword_Relation');
      expect(keywordsQuery).toContain('INNER JOIN Project_Keyword');
      expect(mockDb.query.mock.calls[2][1]).toEqual([1, 2]);
    });

    it('should apply correct offset when navigating to page 2', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 12 }]);

      await repository.findPaginated(2, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LIMIT 10');
      expect(itemsQuery).toContain('OFFSET 10');
    });

    it('should calculate offset correctly for small page sizes', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 20 }]);

      await repository.findPaginated(3, 5);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LIMIT 5');
      expect(itemsQuery).toContain('OFFSET 10');
    });

    it('should handle an empty database gracefully', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      const result = await repository.findPaginated(1, 10);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should default total to 0 if count query returns no rows', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await repository.findPaginated(1, 10);

      expect(result.total).toBe(0);
    });

    it('should default total to 0 if totalCount is undefined', async () => {
      mockDb.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ totalCount: undefined }]);

      const result = await repository.findPaginated(1, 10);

      expect(result.total).toBe(0);
    });

    it('should join lookup tables for project type, funding, research type and status', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('INNER JOIN Project_Type');
      expect(itemsQuery).toContain('INNER JOIN Funding_Type');
      expect(itemsQuery).toContain('INNER JOIN Research_Type');
      expect(itemsQuery).toContain('INNER JOIN Project_Status');
    });

    it('should order results alphabetically by project name', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10);

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('ORDER BY Project.name ASC');
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

      mockDb.query
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
      expect(mockDb.query).toHaveBeenCalledTimes(3);
    });

    it('should pass the search term as a parameterized LIKE argument', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'clima');

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LIKE LOWER(?)');
      expect(mockDb.query.mock.calls[0][1]).toEqual(['%clima%', '%clima%']);
    });

    it('should apply correct offset when navigating to page 2', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 5 }]);

      await repository.findPaginated(2, 10, 'proyecto');

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LIMIT 10');
      expect(itemsQuery).toContain('OFFSET 10');
    });

    it('should filter keywords through project keyword relation tables', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, null, { keywords: ['Clima', 'salud'] });

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('EXISTS');
      expect(itemsQuery).toContain('FROM Project_Keyword_Relation');
      expect(itemsQuery).toContain('INNER JOIN Project_Keyword');
      expect(itemsQuery).toContain('LOWER(Project_Keyword.description) LIKE ?');
      expect(mockDb.query.mock.calls[0][1]).toEqual(['%clima%', '%salud%']);
    });

    it('should return an empty list when no projects match', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      const result = await repository.findPaginated(1, 10, 'xyznonexistent');

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should default total to 0 if count query returns no rows', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await repository.findPaginated(1, 10, 'missing');

      expect(result.total).toBe(0);
    });

    it('should return the project detail with associated profiles', async () => {
      mockDb.query
        .mockResolvedValueOnce([
          {
            id: 1,
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
          },
        ])
        .mockResolvedValueOnce([
          { id: 2, name: 'Koen Voorend', role: 'Investigador principal' },
          { id: 12, name: 'Maria Perez', role: 'Co-investigadora' },
        ])
        .mockResolvedValueOnce([
          { description: 'Ciencias Sociales' },
          { description: 'Estadistica' },
        ])
        .mockResolvedValueOnce([
          { description: 'economia social' },
          { description: 'pobreza' },
        ]);

      const result = await repository.findById('1');

      expect(result).toEqual({
        id: 1,
        projectManager: { id: 2, name: 'Koen Voorend' },
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
          { id: 2, name: 'Koen Voorend', role: 'Investigador principal' },
          { id: 12, name: 'Maria Perez', role: 'Co-investigadora' },
        ],
      });
      expect(mockDb.query).toHaveBeenCalledTimes(4);

      const detailQuery = mockDb.query.mock.calls[0][0] as string;
      expect(detailQuery).toContain('INNER JOIN Unit ON Project.base_unit = Unit.id');
      expect(detailQuery).toContain('WHERE Project.id = ?');

      const associatedProfilesQuery = mockDb.query.mock.calls[1][0] as string;
      expect(associatedProfilesQuery).toContain('FROM Project_Researcher');
      expect(mockDb.query.mock.calls[1][1]).toEqual([1]);

      const disciplinesQuery = mockDb.query.mock.calls[2][0] as string;
      expect(disciplinesQuery).toContain('FROM Project_Discipline_Relation');
      expect(disciplinesQuery).toContain('INNER JOIN Project_Discipline');
      expect(mockDb.query.mock.calls[2][1]).toEqual([1]);

      const keywordsQuery = mockDb.query.mock.calls[3][0] as string;
      expect(keywordsQuery).toContain('FROM Project_Keyword_Relation');
      expect(keywordsQuery).toContain('INNER JOIN Project_Keyword');
      expect(mockDb.query.mock.calls[3][1]).toEqual([1]);
    });

    it('should return null when the id is invalid', async () => {
      const result = await repository.findById('invalid-id');

      expect(result).toBeNull();
      expect(mockDb.query).not.toHaveBeenCalled();
    });

    it('should return null when the project detail query finds no rows', async () => {
      mockDb.query.mockResolvedValueOnce([]);

      await expect(repository.findById('999')).resolves.toBeNull();
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should ignore blank search terms and avoid WHERE/params', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, '   ');

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      const countQuery = mockDb.query.mock.calls[1][0] as string;
      expect(itemsQuery).not.toContain('WHERE LOWER(Project.code) LIKE LOWER(?)');
      expect(countQuery).not.toContain('WHERE LOWER(Project.code) LIKE LOWER(?)');
      expect(mockDb.query.mock.calls[0][1]).toEqual([]);
      expect(mockDb.query.mock.calls[1][1]).toEqual([]);
    });

    it('should apply normalized and deduplicated IN filters for researchType, projectType, startYear and status', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, undefined, {
        researchType: [' Basica ', 'basica', 'Aplicada'],
        projectType: ['Interdisciplinario'],
        startYear: ['2024'],
        status: [' In-Progress ', 'in-progress'],
      });

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      const countQuery = mockDb.query.mock.calls[1][0] as string;

      expect(itemsQuery).toContain('LOWER(Research_Type.description) IN (?, ?)');
      expect(itemsQuery).toContain('LOWER(Project_Type.description) IN (?)');
      expect(itemsQuery).toContain('SUBSTR(Project.start_date, 1, 4) IN (?)');
      expect(itemsQuery).toContain('LOWER(Project_Status.description) IN (?)');

      expect(countQuery).toContain('LOWER(Research_Type.description) IN (?, ?)');
      expect(countQuery).toContain('LOWER(Project_Type.description) IN (?)');
      expect(countQuery).toContain('SUBSTR(Project.start_date, 1, 4) IN (?)');
      expect(countQuery).toContain('LOWER(Project_Status.description) IN (?)');

      expect(mockDb.query.mock.calls[0][1]).toEqual([
        'basica',
        'aplicada',
        'interdisciplinario',
        '2024',
        'in-progress',
      ]);
      expect(mockDb.query.mock.calls[1][1]).toEqual([
        'basica',
        'aplicada',
        'interdisciplinario',
        '2024',
        'in-progress',
      ]);
    });

    it('should apply participants filter using normalized project manager names', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, undefined, {
        participants: [' Alice Manager ', 'alice manager', 'Bob Manager'],
      });

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;

      expect(itemsQuery).toContain('LOWER(');
      expect(itemsQuery).toContain('Researcher.name');
      expect(itemsQuery).toContain('Researcher.first_surname');
      expect(itemsQuery).toContain('Researcher.second_surname');
      expect(itemsQuery).toContain('IN (?, ?)');
      expect(mockDb.query.mock.calls[0][1]).toEqual(['alice manager', 'bob manager']);
      expect(mockDb.query.mock.calls[1][1]).toEqual(['alice manager', 'bob manager']);
    });

    it('should apply keywords filter as OR LIKE clauses with normalized values', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, undefined, {
        keywords: [' Clima ', 'impacto', 'clima'],
      });

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;

      expect(itemsQuery).toContain(
        '(LOWER(Project_Keyword.description) LIKE ? OR LOWER(Project_Keyword.description) LIKE ?)',
      );
      expect(mockDb.query.mock.calls[0][1]).toEqual(['%clima%', '%impacto%']);
      expect(mockDb.query.mock.calls[1][1]).toEqual(['%clima%', '%impacto%']);
    });

    it('should preserve parameter order when combining search term and filters', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'eco', {
        researchType: ['Basica'],
        keywords: ['clima'],
      });

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;

      expect(itemsQuery).toContain('LOWER(Project.code) LIKE LOWER(?)');
      expect(itemsQuery).toContain('LOWER(Project.name) LIKE LOWER(?)');
      expect(itemsQuery).toContain('LOWER(Research_Type.description) IN (?)');
      expect(itemsQuery).toContain('(LOWER(Project_Keyword.description) LIKE ?)');
      expect(mockDb.query.mock.calls[0][1]).toEqual([
        '%eco%',
        '%eco%',
        'basica',
        '%clima%',
      ]);
      expect(mockDb.query.mock.calls[1][1]).toEqual([
        '%eco%',
        '%eco%',
        'basica',
        '%clima%',
      ]);
    });
  });
});
