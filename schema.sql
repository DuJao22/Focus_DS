-- Database Schema for FocusOS (SQLite3)

-- Users Table: Core authentication and profile data
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table: Contain groups of tasks
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  description TEXT,
  lastAccessed TEXT,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tasks Table: Individual productivity units
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  estimatedMinutes INTEGER DEFAULT 30,
  deadline TEXT,
  status TEXT CHECK(status IN ('backlog', 'todo', 'in-progress', 'blocked', 'completed')),
  strategicWeight INTEGER DEFAULT 5,
  FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Initial Indexing for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(userId);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(userId);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(projectId);
