-- ==============================================================================
-- PostgreSQL Supabase Hardened Security Schema & Row-Level Security
-- ZERO Anonymous Bypasses | Multi-Tenant Data Isolation | Audit Logging
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  icon TEXT DEFAULT '⚡',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users / Profiles Table (Synchronized with Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- matches auth.uid()::text
  team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
  username TEXT,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'Developer', -- 'Admin', 'Manager', 'Developer', 'Tester'
  avatar TEXT,
  requires_mfa BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Profile Provisioning Trigger on auth.users registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, username, role, avatar)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Developer'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Custom Roles
CREATE TABLE IF NOT EXISTS custom_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb
);

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'Medium',
  deadline TEXT,
  status TEXT DEFAULT 'Active',
  created_at TEXT,
  soft_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TEXT
);

-- 5. Sprints Table
CREATE TABLE IF NOT EXISTS sprints (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'Active'
);

-- 6. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id TEXT REFERENCES sprints(id) ON DELETE SET NULL,
  assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'To Do', -- 'To Do', 'In Progress', 'Review', 'Done'
  priority TEXT DEFAULT 'Medium',
  due_date TEXT,
  story_points INT DEFAULT 1,
  git_branch TEXT,
  linked_pr_number INT,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TEXT
);

-- 7. Bugs Table
CREATE TABLE IF NOT EXISTS bugs (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
  status TEXT DEFAULT 'Open', -- 'Open', 'In Progress', 'Fixed', 'Closed'
  reproduction_steps TEXT,
  assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
  git_branch TEXT,
  created_at TEXT,
  resolved_at TEXT
);

-- 8. Code Files Table
CREATE TABLE IF NOT EXISTS code_files (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  language TEXT DEFAULT 'javascript',
  content TEXT DEFAULT '',
  updated_at TEXT,
  UNIQUE(project_id, filename)
);

-- 9. Code Queries Table
CREATE TABLE IF NOT EXISTS code_queries (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  timestamp TEXT
);

-- 10. Git Branches Table
CREATE TABLE IF NOT EXISTS git_branches (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT DEFAULT 'main',
  created_at TEXT,
  UNIQUE(project_id, name)
);

-- 11. Git Commits Table
CREATE TABLE IF NOT EXISTS git_commits (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  hash TEXT NOT NULL,
  message TEXT NOT NULL,
  author TEXT NOT NULL,
  timestamp TEXT,
  branch TEXT DEFAULT 'main'
);

-- 12. Git Pull Requests Table
CREATE TABLE IF NOT EXISTS git_pull_requests (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_branch TEXT NOT NULL,
  target_branch TEXT NOT NULL,
  status TEXT DEFAULT 'Open', -- 'Open', 'Merged', 'Closed'
  author TEXT NOT NULL,
  linked_task_id TEXT,
  linked_bug_id TEXT,
  created_at TEXT
);

-- 13. Chat Channels Table
CREATE TABLE IF NOT EXISTS chat_channels (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  topic TEXT,
  is_direct BOOLEAN DEFAULT FALSE,
  created_at TEXT
);

-- 14. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  channel_id TEXT REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  message TEXT NOT NULL,
  timestamp TEXT
);

-- 15. Internal Mail / Messaging
CREATE TABLE IF NOT EXISTS mails (
  id TEXT PRIMARY KEY,
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  timestamp TEXT
);

-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Whiteboard Engine Persistence Table
CREATE TABLE IF NOT EXISTS whiteboards (
  id TEXT PRIMARY KEY, -- wb-${projectId}
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  elements JSONB DEFAULT '[]'::jsonb,
  pan JSONB DEFAULT '{"x": 0, "y": 0}'::jsonb,
  zoom REAL DEFAULT 1,
  updated_at TEXT,
  UNIQUE(project_id)
);

-- 18. Pipelines Table
CREATE TABLE IF NOT EXISTS pipelines (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Running', 'Success', 'Failed'
  branch TEXT DEFAULT 'main',
  commit_hash TEXT,
  duration TEXT,
  started_at TEXT,
  finished_at TEXT
);

-- 19. Webhooks Table
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TEXT
);

-- ==============================================================================
-- ROW LEVEL SECURITY HARDENING
-- ZERO ANONYMOUS BYPASSES — STRICT AUTHENTICATED ACCESS
-- ==============================================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE git_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE git_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE git_pull_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mails ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Helper functions for authenticated identity evaluation
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text AND role = 'Admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.current_user_team_id()
RETURNS TEXT AS $$
  SELECT team_id FROM public.users
  WHERE id = auth.uid()::text;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. Teams, Users & Custom Roles
CREATE POLICY "Allow authenticated read teams" ON teams FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated read users" ON users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow user update self" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Allow insert profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Allow authenticated read custom_roles" ON custom_roles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow admin manage custom_roles" ON custom_roles FOR ALL USING (auth.uid() IS NOT NULL AND public.is_admin());

-- 2. Projects (Admin cross-team view, non-admin strictly isolated to assigned team)
CREATE POLICY "Project team access policy" ON projects FOR ALL USING (
  auth.uid() IS NOT NULL AND (public.is_admin() OR team_id = public.current_user_team_id())
);

-- 3. Tasks
CREATE POLICY "Task team access policy" ON tasks FOR ALL USING (
  auth.uid() IS NOT NULL AND (public.is_admin() OR team_id = public.current_user_team_id())
);

-- 4. Bugs: Team/Admin isolation on SELECT, INSERT, DELETE
CREATE POLICY "Bug select policy" ON bugs FOR SELECT USING (
  auth.uid() IS NOT NULL AND (public.is_admin() OR team_id = public.current_user_team_id())
);

CREATE POLICY "Bug insert policy" ON bugs FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (public.is_admin() OR team_id = public.current_user_team_id())
);

CREATE POLICY "Bug delete policy" ON bugs FOR DELETE USING (
  auth.uid() IS NOT NULL AND (public.is_admin() OR team_id = public.current_user_team_id())
);

-- Database-level RBAC: Only Admin or assigned Developer can transition bug status to 'Fixed'
CREATE POLICY "Bug update policy" ON bugs FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (public.is_admin() OR team_id = public.current_user_team_id())
) WITH CHECK (
  auth.uid() IS NOT NULL AND (
    public.is_admin() OR (
      team_id = public.current_user_team_id() AND (
        status != 'Fixed' OR assigned_to = auth.uid()::text
      )
    )
  )
);

-- 5. Sprints
CREATE POLICY "Sprint team access policy" ON sprints FOR ALL USING (
  auth.uid() IS NOT NULL AND (public.is_admin() OR team_id = public.current_user_team_id())
);

-- 6. Code Files & Queries
CREATE POLICY "Code file access policy" ON code_files FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects WHERE projects.id = code_files.project_id AND
    (public.is_admin() OR projects.team_id = public.current_user_team_id())
  )
);

CREATE POLICY "Code query access policy" ON code_queries FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects WHERE projects.id = code_queries.project_id AND
    (public.is_admin() OR projects.team_id = public.current_user_team_id())
  )
);

-- 7. Git Branches, Commits, PRs
CREATE POLICY "Git branch access policy" ON git_branches FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects WHERE projects.id = git_branches.project_id AND
    (public.is_admin() OR projects.team_id = public.current_user_team_id())
  )
);

CREATE POLICY "Git commit access policy" ON git_commits FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects WHERE projects.id = git_commits.project_id AND
    (public.is_admin() OR projects.team_id = public.current_user_team_id())
  )
);

CREATE POLICY "Git PR access policy" ON git_pull_requests FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects WHERE projects.id = git_pull_requests.project_id AND
    (public.is_admin() OR projects.team_id = public.current_user_team_id())
  )
);

-- 8. Chat Channels & Messages
CREATE POLICY "Chat channel access policy" ON chat_channels FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects WHERE projects.id = chat_channels.project_id AND
    (public.is_admin() OR projects.team_id = public.current_user_team_id())
  )
);

CREATE POLICY "Chat message access policy" ON chat_messages FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects WHERE projects.id = chat_messages.project_id AND
    (public.is_admin() OR projects.team_id = public.current_user_team_id())
  )
);

-- 9. Whiteboards
CREATE POLICY "Whiteboard access policy" ON whiteboards FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects WHERE projects.id = whiteboards.project_id AND
    (public.is_admin() OR projects.team_id = public.current_user_team_id())
  )
);

-- 10. Audit Logs
CREATE POLICY "Audit logs access policy" ON audit_logs FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects WHERE projects.id = audit_logs.project_id AND
    (public.is_admin() OR projects.team_id = public.current_user_team_id())
  )
);

-- 11. Pipelines & Webhooks
CREATE POLICY "Pipelines access policy" ON pipelines FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects WHERE projects.id = pipelines.project_id AND
    (public.is_admin() OR projects.team_id = public.current_user_team_id())
  )
);

CREATE POLICY "Webhooks access policy" ON webhooks FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects WHERE projects.id = webhooks.project_id AND
    (public.is_admin() OR projects.team_id = public.current_user_team_id())
  )
);

-- 12. Mails: Strict Sender/Recipient Isolation & Admin Access
CREATE POLICY "Mails access policy" ON mails FOR ALL USING (
  auth.uid() IS NOT NULL AND (to_user = auth.uid()::text OR from_user = auth.uid()::text OR public.is_admin())
) WITH CHECK (
  auth.uid() IS NOT NULL AND (from_user = auth.uid()::text OR public.is_admin())
);

-- ==============================================================================
-- PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_git_branch ON tasks(git_branch);
CREATE INDEX IF NOT EXISTS idx_bugs_project_id ON bugs(project_id);
CREATE INDEX IF NOT EXISTS idx_bugs_team_id ON bugs(team_id);
CREATE INDEX IF NOT EXISTS idx_bugs_git_branch ON bugs(git_branch);
CREATE INDEX IF NOT EXISTS idx_code_files_project_id ON code_files(project_id);
CREATE INDEX IF NOT EXISTS idx_git_commits_project_id ON git_commits(project_id);
CREATE INDEX IF NOT EXISTS idx_git_prs_project_id ON git_pull_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_whiteboards_project_id ON whiteboards(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_project_id ON audit_logs(project_id);
