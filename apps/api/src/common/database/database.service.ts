// Database service — wraps the pg Pool to execute parameterized SQL queries.
// Injects DATABASE_POOL and exposes a generic query<T>(text, params) method.
