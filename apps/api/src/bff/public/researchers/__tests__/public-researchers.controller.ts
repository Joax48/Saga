import { NotFoundException } from '@nestjs/common';
import { PublicResearchersController } from '../public-researchers.controller';
import { GetResearchersPaginatedListUseCase } from '../../../../application/use-cases/get-public-researchers-paginated-list.use-case';
import { GetResearcherDetailUseCase } from '../../../../application/use-cases/get-public-researcher-detail.use-case';
import { GetResearcherProfileUseCase } from '../../../../application/use-cases/get-public-researcher-profile.use-case';
import { GetResearchersFiltersUseCase } from '../../../../application/use-cases/get-public-researchers-filters.use-case';
import { ResearchersListRequestDto } from '../dtos/researchers-list-request.dto';
import { ResearchersFiltersRequestQueryDto } from '../dtos/researchers-filters-request.dto';

describe('PublicResearchersController', () => {
  let controller: PublicResearchersController;
  let useCase: jest.Mocked<GetResearchersPaginatedListUseCase>;
  let detailUseCase: jest.Mocked<GetResearcherDetailUseCase>;
  let profileUseCase: jest.Mocked<GetResearcherProfileUseCase>;
  let filtersUseCase: jest.Mocked<GetResearchersFiltersUseCase>;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetResearchersPaginatedListUseCase>;

    detailUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetResearcherDetailUseCase>;
    profileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetResearcherProfileUseCase>;
    filtersUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetResearchersFiltersUseCase>;

    controller = new PublicResearchersController(
      useCase,
      detailUseCase,
      profileUseCase,
      filtersUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getResearchersPaginatedList', () => {
    it('should return the paginated researcher list from the use case', async () => {
      const mockQuery = new ResearchersListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      const mockResponse = {
        items: [
          {
            id: 'a1b2c3',
            idUcrProfile: 'B12345',
            profileType: 'UCR' as const,
            baseUnit: 'CIMPA',
            name: 'Luis',
            firstSurname: 'Mora',
            secondSurname: 'Jimenez',
            ceaCategory: 'Investigador Asociado',
            orcidId: '0000-0001-2345-6789',
            linkedin: null,
            researchGate: null,
            scopus: null,
            photoUrl: null,
            linkedUnits: [],
          },
          {
            id: 'd4e5f6',
            idUcrProfile: 'C67890',
            profileType: 'EXTERNAL' as const,
            baseUnit: 'CIBCM',
            name: 'Ana',
            firstSurname: 'Vargas',
            secondSurname: 'Solano',
            ceaCategory: null,
            orcidId: null,
            linkedin: 'https://linkedin.com/in/ana-vargas',
            researchGate: null,
            scopus: null,
            photoUrl: 'https://example.com/photo.jpg',
            linkedUnits: [],
          },
        ],
        page: 1,
        limit: 10,
        total: 2,
      };
      useCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.getResearchersPaginatedList(mockQuery);

      expect(result).toEqual(mockResponse);
      expect(useCase.execute).toHaveBeenCalledWith(mockQuery);
      expect(useCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should forward pagination parameters to the use case', async () => {
      const mockQuery = new ResearchersListRequestDto();
      mockQuery.page = 3;
      mockQuery.limit = 5;
      useCase.execute.mockResolvedValue({
        items: [],
        page: 3,
        limit: 5,
        total: 20,
      });

      await controller.getResearchersPaginatedList(mockQuery);

      expect(useCase.execute).toHaveBeenCalledWith(mockQuery);
    });

    it('should forward the unit filter parameter to the use case', async () => {
      const mockQuery = new ResearchersListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      mockQuery.unit = ['CIMPA'];
      useCase.execute.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      await controller.getResearchersPaginatedList(mockQuery);

      expect(useCase.execute).toHaveBeenCalledWith(mockQuery);
    });

    it('should forward the q search parameter to the use case', async () => {
      const mockQuery = new ResearchersListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      mockQuery.q = 'Luis';
      useCase.execute.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      await controller.getResearchersPaginatedList(mockQuery);

      expect(useCase.execute).toHaveBeenCalledWith(mockQuery);
    });

    it('should return an empty list when no researchers exist', async () => {
      const mockQuery = new ResearchersListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      useCase.execute.mockResolvedValue({
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      });

      const result = await controller.getResearchersPaginatedList(mockQuery);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should propagate database errors to the exception layer', async () => {
      const mockQuery = new ResearchersListRequestDto();
      mockQuery.page = 1;
      mockQuery.limit = 10;
      useCase.execute.mockRejectedValue(new Error('Connection to database lost'));

      await expect(controller.getResearchersPaginatedList(mockQuery)).rejects.toThrow(
        'Connection to database lost',
      );
    });
  });

  describe('getFilters', () => {
    it('should return filter options from the use case', async () => {
      const mockResult = {
        baseUnit: [
          { value: 'CIMPA', count: 10 },
          { value: 'CIGEFI', count: 5 },
        ],
      };
      filtersUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.getFilters({} as ResearchersFiltersRequestQueryDto);

      expect(result).toEqual(mockResult);
      expect(filtersUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should forward q and unit parameters to the use case', async () => {
      filtersUseCase.execute.mockResolvedValue({ baseUnit: [] });

      const query = { q: 'Luis', unit: ['CIMPA'] } as ResearchersFiltersRequestQueryDto;
      await controller.getFilters(query);

      expect(filtersUseCase.execute).toHaveBeenCalledWith('Luis', { unit: ['CIMPA'] });
    });

    it('should pass undefined q when not provided', async () => {
      filtersUseCase.execute.mockResolvedValue({ baseUnit: [] });

      const query = { unit: ['CIMPA'] } as ResearchersFiltersRequestQueryDto;
      await controller.getFilters(query);

      expect(filtersUseCase.execute).toHaveBeenCalledWith(undefined, { unit: ['CIMPA'] });
    });

    it('should propagate errors from the use case', async () => {
      filtersUseCase.execute.mockRejectedValue(new Error('DB error'));

      await expect(
        controller.getFilters({} as ResearchersFiltersRequestQueryDto),
      ).rejects.toThrow('DB error');
    });
  });

  describe('getResearcherDetail', () => {
    it('should return the researcher from the use case', async () => {
      const mockResearcher = {
        id: 'a1b2c3',
        idUcrProfile: 'B12345',
        profileType: 'UCR' as const,
        baseUnit: 'CIMPA',
        name: 'Luis',
        firstSurname: 'Mora',
        secondSurname: 'Jimenez',
        ceaCategory: null,
        orcidId: null,
        linkedin: null,
        researchGate: null,
        scopus: null,
        photoUrl: null,
        linkedUnits: [],
      };
      detailUseCase.execute.mockResolvedValue(mockResearcher);

      const result = await controller.getResearcherDetail('a1b2c3');

      expect(result).toEqual(mockResearcher);
      expect(detailUseCase.execute).toHaveBeenCalledWith('a1b2c3');
      expect(detailUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should forward the id parameter to the use case', async () => {
      detailUseCase.execute.mockResolvedValue({} as never);

      await controller.getResearcherDetail('specific-id-123');

      expect(detailUseCase.execute).toHaveBeenCalledWith('specific-id-123');
    });

    it('should propagate NotFoundException from the use case', async () => {
      detailUseCase.execute.mockRejectedValue(
        new NotFoundException('Researcher not found'),
      );

      await expect(controller.getResearcherDetail('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should propagate database errors from the use case', async () => {
      detailUseCase.execute.mockRejectedValue(new Error('DB error'));

      await expect(controller.getResearcherDetail('1')).rejects.toThrow('DB error');
    });
  });

  describe('getResearcherProfile', () => {
    it('should return the researcher profile from the use case', async () => {
      const mockProfile = {
        id: '1',
        idUcrProfile: 'UCR001',
        profileType: 'UCR' as const,
        baseUnit: 'CIMPA',
        name: 'Juan',
        firstSurname: 'Perez',
        secondSurname: 'Mora',
        ceaCategory: null,
        orcidId: null,
        linkedin: null,
        researchGate: null,
        scopus: null,
        photoUrl: null,
        linkedUnits: [],
        alternativeNames: [],
        keywords: [],
        education: [],
        experience: [],
        projects: [],
        scientificOutputs: [],
      };
      profileUseCase.execute.mockResolvedValue(mockProfile);

      const result = await controller.getResearcherProfile('1');

      expect(result).toEqual(mockProfile);
      expect(profileUseCase.execute).toHaveBeenCalledWith('1');
      expect(profileUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should forward the id parameter to the use case', async () => {
      profileUseCase.execute.mockResolvedValue({} as never);

      await controller.getResearcherProfile('profile-id-456');

      expect(profileUseCase.execute).toHaveBeenCalledWith('profile-id-456');
    });

    it('should propagate NotFoundException from the use case', async () => {
      profileUseCase.execute.mockRejectedValue(
        new NotFoundException('Researcher not found'),
      );

      await expect(
        controller.getResearcherProfile('missing-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should propagate database errors from the use case', async () => {
      profileUseCase.execute.mockRejectedValue(new Error('DB error'));

      await expect(controller.getResearcherProfile('1')).rejects.toThrow('DB error');
    });
  });
});
