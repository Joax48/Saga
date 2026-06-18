import { NotFoundException } from '@nestjs/common';

import { GetScientificProductionDetailUseCase } from '../get-public-scientific-production-detail.use-case';
import type { ScientificProductionsReader } from '../../../modules/scientific-productions/scientific-productions.reader.contract';

describe('GetScientificProductionDetailUseCase', () => {
  let useCase: GetScientificProductionDetailUseCase;
  let scientificProductionsReader: jest.Mocked<ScientificProductionsReader>;

  beforeEach(() => {
    scientificProductionsReader = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<ScientificProductionsReader>;

    useCase = new GetScientificProductionDetailUseCase(scientificProductionsReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return the scientific production detail when the id exists', async () => {
      const scientificProduction = {
        id: '1',
        title: 'Test Publication',

        ucrAuthors: [
          {
            id: 1,
            name: 'Juan Pérez',
          },
        ],

        externalAuthors: [
          {
            id: 2,
            name: 'John Doe',
          },
        ],

        unit: [
          {
            id: 1,
            unit: 'CICIMA',
          },
        ],

        affiliations: [
          {
            id: 1,
            affiliation: 'Universidad de Costa Rica',
          },
        ],

        type: 'Article',
        openAccess: true,
        publicationYear: 2024,

        abstract: 'Abstract test',
        doi: '10.1234/test',
        journal: 'Test Journal',
        volume: '1',
        issue: '2',
        pages: '10-20',

        citationCount: 5,
        source: 'Scopus',

        keywords: [
          {
            id: 1,
            value: 'AI',
          },
          {
            id: 2,
            value: 'Machine Learning',
          },
        ],
      };

      scientificProductionsReader.getById.mockResolvedValue(scientificProduction);

      const result = await useCase.execute('1');

      expect(result).toEqual({
        id: '1',
        title: 'Test Publication',
        ucrAuthors: [
          {
            id: 1,
            name: 'Juan Pérez',
          },
        ],
        externalAuthors: [
          {
            id: 2,
            name: 'John Doe',
          },
        ],
        unit: [
          {
            id: 1,
            unit: 'CICIMA',
          },
        ],
        affiliations: [
          {
            id: 1,
            affiliation: 'Universidad de Costa Rica',
          },
        ],
        type: 'Article',
        openAccess: true,
        publicationYear: 2024,
        abstract: 'Abstract test',
        doi: '10.1234/test',
        journal: 'Test Journal',
        volume: '1',
        issue: '2',
        pages: '10-20',
        citationCount: 5,
        source: 'Scopus',
        keywords: [
          {
            id: 1,
            value: 'AI',
          },
          {
            id: 2,
            value: 'Machine Learning',
          },
        ],
      });

      expect(scientificProductionsReader.getById).toHaveBeenCalledWith('1');
      expect(scientificProductionsReader.getById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when the scientific production does not exist', async () => {
      scientificProductionsReader.getById.mockResolvedValue(null);

      await expect(useCase.execute('999')).rejects.toThrow(NotFoundException);

      await expect(useCase.execute('999')).rejects.toThrow(
        'Scientific production with id "999" not found',
      );

      expect(scientificProductionsReader.getById).toHaveBeenCalledWith('999');
    });

    it('should propagate reader errors', async () => {
      scientificProductionsReader.getById.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute('1')).rejects.toThrow('Database error');

      expect(scientificProductionsReader.getById).toHaveBeenCalledWith('1');
    });
  });
});
