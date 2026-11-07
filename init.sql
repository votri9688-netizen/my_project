-- init.sql – executed by PostgreSQL on first start
-- Create a read‑only user for the API
CREATE USER readonly_user WITH PASSWORD '${POSTGRES_READONLY_PASSWORD}';

-- Grant connection to database
GRANT CONNECT ON DATABASE mydb TO readonly_user;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO readonly_user;

-- Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Ensure future tables are also SELECT‑only for readonly_user
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;
