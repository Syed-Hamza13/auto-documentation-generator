-- ============================================
-- AI DOCUMENTATION GENERATOR - SUPABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  repo_source TEXT NOT NULL,
  repo_type TEXT NOT NULL CHECK (repo_type IN ('github', 'gitlab', 'zip')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'generating', 'completed', 'failed')),
  local_path TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- ============================================
-- 3. DOCUMENTATION FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documentation_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  content TEXT NOT NULL,
  file_size INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for documentation lookups
CREATE INDEX IF NOT EXISTS idx_docs_project_id ON documentation_files(project_id);
CREATE INDEX IF NOT EXISTS idx_docs_file_type ON documentation_files(file_type);

-- ============================================
-- 4. GENERATION LOGS TABLE (For tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'in_progress', 'completed', 'failed')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_project_id ON generation_logs(project_id);

-- ============================================
-- 5. RLS (Row Level Security) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- Users can see only their own data
CREATE POLICY "Users can see their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can see only their own projects
CREATE POLICY "Users can see own projects" ON projects
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Documentation files - inherit from projects
CREATE POLICY "Users can see own docs" ON documentation_files
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE auth.uid()::text = user_id::text
    )
  );

CREATE POLICY "Users can insert own docs" ON documentation_files
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE auth.uid()::text = user_id::text
    )
  );

-- ============================================
-- NOTES FOR SETUP
-- ============================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Go to Supabase Dashboard → SQL Editor → New Query
-- 3. Copy this entire script and run it
-- 4. All tables will be created with proper indexes and RLS policies
