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
      const mockItems = [
        {
          id: 1,
          projectManagerId: 2,
          projectManagerName: 'Koen Voorend',
          code: 'C3992',
          name: 'El costo de una vida digna en Costa Rica',
          projectType: 'Proyecto',
          fundingType: 'Fondos internos',
          researchType: 'Basica',
          status: 'Activo',
          startDate: '2023-06-01',
          endDate: '2025-12-31',
        },
        {
          id: 2,
          projectManagerId: 3,
          projectManagerName: 'Shu Wei Chou Chen',
          code: 'C4196',
          name: 'Analisis espacio-temporal del impacto de factores climaticos',
          projectType: 'Proyecto',
          fundingType: 'Fondos externos',
          researchType: 'Basica',
          status: 'Activo',
          startDate: '2024-01-01',
          endDate: '2026-12-15',
        },
      ];
      const mockCount = [{ totalCount: 12 }];
      const mockKeywords = [
        { projectId: 1, description: 'economia social' },
        { projectId: 1, description: 'pobreza' },
        { projectId: 2, description: 'clima' },
        { projectId: 2, description: 'salud publica' },
      ];

      mockDb.query
        .mockResolvedValueOnce(mockItems)
        .mockResolvedValueOnce(mockCount)
        .mockResolvedValueOnce(mockKeywords);

      const result = await repository.findPaginated(1, 10);

      expect(result.items).toEqual([
        {
          id: 1,
          projectManager: { id: 2, name: 'Koen Voorend' },
          code: 'C3992',
          name: 'El costo de una vida digna en Costa Rica',
          keywords: ['economia social', 'pobreza'],
          projectType: 'Proyecto',
          fundingType: 'Fondos internos',
          researchType: 'Basica',
          status: 'Activo',
          startDate: '2023-06-01',
          endDate: '2025-12-31',
        },
        {
          id: 2,
          projectManager: { id: 3, name: 'Shu Wei Chou Chen' },
          code: 'C4196',
          name: 'Analisis espacio-temporal del impacto de factores climaticos',
          keywords: ['clima', 'salud publica'],
          projectType: 'Proyecto',
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

    it('should apply the search term as a parameterized LIKE argument', async () => {
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      await repository.findPaginated(1, 10, 'clima');

      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('LIKE LOWER(?)');
      expect(mockDb.query.mock.calls[0][1]).toEqual(['%clima%', '%clima%']);
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
  });
});
