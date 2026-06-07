const sharp = jest.fn(() => ({
  rotate: jest.fn().mockReturnThis(),
  resize: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-jpeg')),
}));

module.exports = sharp;
module.exports.default = sharp;
