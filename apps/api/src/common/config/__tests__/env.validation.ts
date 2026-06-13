import { validateEnvironment } from '../env.validation';

const validEnvironment = {
  DB_USER: 'user',
  DB_PASSWORD: 'password',
  DB_CONNECT_STRING: 'localhost/service',
  DB_SCHEMA: 'SCHEMA',
  NODE_ENV: 'test',
};

describe('validateEnvironment', () => {
  it('returns the environment when all required variables are valid', () => {
    expect(validateEnvironment(validEnvironment)).toBe(validEnvironment);
  });

  it.each([
    'DB_USER',
    'DB_PASSWORD',
    'DB_CONNECT_STRING',
    'DB_SCHEMA',
    'NODE_ENV',
  ] as const)('throws when %s is missing', (key) => {
    const environment = {
      ...validEnvironment,
      [key]: undefined,
    };

    expect(() => validateEnvironment(environment)).toThrow(
      `Missing environment variable: ${key}`,
    );
  });

  it.each(['123SCHEMA', 'INVALID-SCHEMA', 'SCHEMA NAME', 'SCHEMA; DROP TABLE USERS'])(
    'rejects invalid Oracle schema %s',
    (schema) => {
      const environment = {
        ...validEnvironment,
        DB_SCHEMA: schema,
      };

      expect(() => validateEnvironment(environment)).toThrow('DB_SCHEMA must be a valid Oracle identifier');
    },
  );

  it.each(['SCHEMA', 'APP_SCHEMA', 'SCHEMA$1', 'SCHEMA#1'])(
    'accepts valid Oracle schema %s',
    (schema) => {
      const environment = {
        ...validEnvironment,
        DB_SCHEMA: schema,
      };

      expect(validateEnvironment(environment)).toBe(environment);
    },
  );
});
