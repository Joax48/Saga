module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '/__tests__/.*\\.ts$',
  testPathIgnorePatterns: ['<rootDir>/__tests__/e2e/common/'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    // Exclude files that should not contain logic by convention.
    // DTOs, entities, and module definitions are pure declarations.
    // If any of these ever contain logic, they should get their own
    // __tests__/ file — but that should be the exception, not the rule.
    '!**/*.module.ts',
    '!**/*.entity.ts',
    '!**/*.dto.ts',
    '!**/*.contract.ts',
    '!**/dtos/**',
    '!**/tables/**',
    '!**/main.ts',
    '!**/__tests__/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
