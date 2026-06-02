/*
Database setup script.
Usage:
  - Set environment variable SUPABASE_DB_URL to your Postgres connection string (from Supabase -> Settings -> Database -> Connection string)
  - Run: node ./scripts/create-db.js

Warning: This script runs DDL against the provided Postgres connection. Use a service role / admin connection string.
*/

const { Client } = require('pg');

// Allow passing connection string as CLI arg or env var
const argvConn = process.argv[2];
const connectionString = argvConn || process.env.SUPABASE_DB_URL || process.env.SUPABASE_CONNECTION;

if (!connectionString) {
  console.error('ERROR: Postgres connection string is not set.');
  console.error('Usage examples:');
  console.error('  PowerShell: $env:SUPABASE_DB_URL="postgres://..."; npm run create-db');
  console.error('  Or with direct node: node ./scripts/create-db.js "postgres://user:pass@host:5432/db"');
  process.exit(1);
}

const sql = `
BEGIN;

-- Table to store editable content per page (JSON)
CREATE TABLE IF NOT EXISTS pages_content (
  page TEXT PRIMARY KEY,
  content JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Private content (single row keyed by id)
CREATE TABLE IF NOT EXISTS private_content (
  id BIGINT PRIMARY KEY,
  notes TEXT,
  gallery TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT,
  email TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blog posts (basic schema)
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assets (images, files) referenced by other tables
CREATE TABLE IF NOT EXISTS assets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  url TEXT NOT NULL,
  type TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents (e.g., CV files)
CREATE TABLE IF NOT EXISTS documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT,
  url TEXT,
  doc_type TEXT,
  page TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Projects and related techs
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  summary TEXT,
  description TEXT,
  repo_url TEXT,
  live_url TEXT,
  cover_asset_id BIGINT REFERENCES assets(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_techs (
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  tech TEXT,
  PRIMARY KEY (project_id, tech)
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  level TEXT,
  meta JSONB
);

-- Experiences
CREATE TABLE IF NOT EXISTS experiences (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT,
  company TEXT,
  start_date DATE,
  end_date DATE,
  bullets JSONB,
  meta JSONB
);

-- Resume items (flexible sections)
CREATE TABLE IF NOT EXISTS resume_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  section TEXT,
  data JSONB,
  ordering INT DEFAULT 0
);

COMMIT;
`;

(async () => {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to database, running schema...');
    await client.query(sql);
    console.log('Schema applied successfully.');
    console.log('You can now run the app; use the SERVICE ROLE or DB connection string when running server-side migrations.');
  } catch (err) {
    console.error('Error applying schema:', err.message || err);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
})();
