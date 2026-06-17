module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },

  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],

  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },

  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx?|jsx?)$',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
