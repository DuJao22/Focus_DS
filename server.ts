import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_change_this";

// Database Setup
const db = new Database("focusos.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT,
    color TEXT,
    description TEXT,
    lastAccessed TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    projectId TEXT,
    userId TEXT,
    title TEXT,
    description TEXT,
    priority TEXT,
    estimatedMinutes INTEGER,
    deadline TEXT,
    status TEXT,
    strategicWeight INTEGER,
    FOREIGN KEY(projectId) REFERENCES projects(id),
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

// Ensure Admin User Exists
const ensureAdminUser = async () => {
  const adminUsername = "Dujao";
  const adminPassword = "30031936";
  const adminEmail = "dujao@focusos.net";

  const existingAdmin = db.prepare("SELECT * FROM users WHERE username = ?").get(adminUsername);

  if (!existingAdmin) {
    console.log(`Setting up admin user: ${adminUsername}`);
    const id = "admin-dujao";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    db.prepare("INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)")
      .run(id, adminUsername, adminEmail, hashedPassword);

    // Initial Seed For Admin
    const p1Id = "p1-" + id;
    db.prepare("INSERT INTO projects (id, userId, name, color, description, lastAccessed) VALUES (?, ?, ?, ?, ?, ?)")
      .run(p1Id, id, "Sistema Central", "#6366f1", "Gestão principal da FocusOS.", new Date().toISOString());

    db.prepare("INSERT INTO tasks (id, projectId, userId, title, description, priority, estimatedMinutes, deadline, status, strategicWeight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run("t1-" + id, p1Id, id, "Configuração Inicial", "Finalizar setup do servidor e banco de dados.", "urgent", 60, new Date().toISOString(), "completed", 10);

    console.log("Admin user created successfully.");
  }
};

ensureAdminUser();

app.use(cors());
app.use(express.json());

// Health Check for Render/Deployments
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API ROUTES

// Auth
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)");
    stmt.run(id, username, email, hashedPassword);
    
    const token = jwt.sign({ id, username }, JWT_SECRET);
    
    // Seed initial data for better first experience
    const projectsStmt = db.prepare("INSERT INTO projects (id, userId, name, color, description, lastAccessed) VALUES (?, ?, ?, ?, ?, ?)");
    const tasksStmt = db.prepare("INSERT INTO tasks (id, projectId, userId, title, description, priority, estimatedMinutes, deadline, status, strategicWeight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    const p1Id = "p1-" + id;
    projectsStmt.run(p1Id, id, "Ecosistema Pro", "#6366f1", "Plataforma centralizada para gestão de recursos e infraestrutura.", new Date().toISOString());
    
    tasksStmt.run("t1-" + id, p1Id, id, "Auditoria de Segurança", "Verificar protocolos de criptografia e acessos.", "urgent", 45, new Date().toISOString(), "todo", 9);
    tasksStmt.run("t2-" + id, p1Id, id, "Otimização de Banco", "Executar scripts de limpeza e indexação.", "medium", 30, new Date().toISOString(), "in-progress", 7);

    res.json({ token, user: { id, username, email } });
  } catch (error: any) {
    res.status(400).json({ error: "Username or email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  
  if (user && await bcrypt.compare(password, user.password_hash)) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Projects
app.get("/api/projects", authenticateToken, (req: any, res) => {
  const projects = db.prepare("SELECT * FROM projects WHERE userId = ?").all(req.user.id);
  res.json(projects);
});

app.post("/api/projects", authenticateToken, (req: any, res) => {
  const { id, name, color, description } = req.body;
  const stmt = db.prepare("INSERT INTO projects (id, userId, name, color, description) VALUES (?, ?, ?, ?, ?)");
  stmt.run(id, req.user.id, name, color, description);
  res.json({ id, name, color, description });
});

app.patch("/api/projects/:id", authenticateToken, (req: any, res) => {
  const { lastAccessed } = req.body;
  const stmt = db.prepare("UPDATE projects SET lastAccessed = ? WHERE id = ? AND userId = ?");
  stmt.run(lastAccessed, req.params.id, req.user.id);
  res.sendStatus(200);
});

// Tasks
app.get("/api/tasks", authenticateToken, (req: any, res) => {
  const tasks = db.prepare("SELECT * FROM tasks WHERE userId = ?").all(req.user.id);
  res.json(tasks);
});

app.post("/api/tasks", authenticateToken, (req: any, res) => {
  const { id, projectId, title, description, priority, estimatedMinutes, deadline, status, strategicWeight } = req.body;
  const stmt = db.prepare(`
    INSERT INTO tasks (id, projectId, userId, title, description, priority, estimatedMinutes, deadline, status, strategicWeight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, projectId, req.user.id, title, description, priority, estimatedMinutes, deadline, status, strategicWeight);
  res.json(req.body);
});

app.patch("/api/tasks/:id", authenticateToken, (req: any, res) => {
  const { status } = req.body;
  const stmt = db.prepare("UPDATE tasks SET status = ? WHERE id = ? AND userId = ?");
  stmt.run(status, req.params.id, req.user.id);
  res.sendStatus(200);
});

app.delete("/api/tasks/:id", authenticateToken, (req: any, res) => {
  const stmt = db.prepare("DELETE FROM tasks WHERE id = ? AND userId = ?");
  stmt.run(req.params.id, req.user.id);
  res.sendStatus(200);
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
