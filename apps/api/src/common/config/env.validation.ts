const REQUIRED_ENVIRONMENT_VARIABLES = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_CONNECT_STRING',
  'DB_SCHEMA',
  'NODE_ENV',
] as const;

const ORACLE_SCHEMA_PATTERN = /^[A-Za-z][A-Za-z0-9_$#]*$/;

export function validateEnvironment(
  env: Record<string, string | undefined>,
): Record<string, string | undefined> {
  for (const key of REQUIRED_ENVIRONMENT_VARIABLES) {
    if (!env[key]?.trim()) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  if (!ORACLE_SCHEMA_PATTERN.test(env.DB_SCHEMA!)) {
    throw new Error('DB_SCHEMA must be a valid Oracle identifier');
  }

  return env;
}
