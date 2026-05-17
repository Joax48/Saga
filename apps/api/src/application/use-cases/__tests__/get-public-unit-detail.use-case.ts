import { NotFoundException } from '@nestjs/common';
import { GetPublicUnitDetailUseCase } from '../get-public-unit-detail.use-case';
import type {
  UnitsReader,
  UnitDetailDto,
} from '../../../modules/units/units.reader.contract';

describe('GetPublicUnitDetailUseCase', () => {
  let useCase: GetPublicUnitDetailUseCase;
  let unitsReader: jest.Mocked<UnitsReader>;

  beforeEach(() => {
    unitsReader = {
      getPaginatedList: jest.fn(),
      getById: jest.fn(),
    } as unknown as jest.Mocked<UnitsReader>;

    useCase = new GetPublicUnitDetailUseCase(unitsReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return the unit detail when the unit exists', async () => {
      const mockUnit: UnitDetailDto = {
        id: 1,
        name: 'Escuela de Física',
        description: 'Investigación en física teórica y experimental.',
        email: 'physics@ucr.ac.cr',
        pageUrl: 'https://www.ucr.ac.cr',
        phoneNumber: '+506 2511-0000',
      };
      unitsReader.getById.mockResolvedValue(mockUnit);

      const result = await useCase.execute(1);

      expect(result).toEqual({
        id: 1,
        name: 'Escuela de Física',
        description: 'Investigación en física teórica y experimental.',
        email: 'physics@ucr.ac.cr',
        pageUrl: 'https://www.ucr.ac.cr',
        phoneNumber: '+506 2511-0000',
      });
      expect(unitsReader.getById).toHaveBeenCalledWith(1);
      expect(unitsReader.getById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when the unit does not exist', async () => {
      unitsReader.getById.mockResolvedValue(null);

      await expect(useCase.execute(99999)).rejects.toThrow(NotFoundException);
      expect(unitsReader.getById).toHaveBeenCalledWith(99999);
    });

    it('should throw NotFoundException with the correct message', async () => {
      unitsReader.getById.mockResolvedValue(null);

      await expect(useCase.execute(99999)).rejects.toThrow(
        'Unit with id 99999 not found',
      );
    });
  });
});
