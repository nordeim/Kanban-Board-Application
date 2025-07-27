-- Database initialization script
-- Creates necessary extensions and initial setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create custom types if needed
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'CREATOR', 'EDITOR', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Set default permissions
GRANT ALL PRIVILEGES ON DATABASE sponsorflow_dev TO sponsorflow;
GRANT CREATE ON SCHEMA public TO sponsorflow;

-- Performance optimizations
ALTER DATABASE sponsorflow_dev SET random_page_cost = 1.1;
ALTER DATABASE sponsorflow_dev SET effective_cache_size = '3GB';
ALTER DATABASE sponsorflow_dev SET shared_buffers = '1GB';
