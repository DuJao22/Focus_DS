import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Database } from "@sqlitecloud/drivers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_change_this";
const CONNECTION_STRING = process.env.SQLITE_CLOUD_CONNECTION_STRING;

if (!CONNECTION_STRING) {
  console.warn("SQLITE_CLOUD_CONNECTION_STRING is missing. Using local focusos.db for fallback if needed, but this might fail on Render.");
}

// Database Setup
const db = new Database(CONNECTION_STRING || "focusos.db");

// Initialize Database Schema
async function initDb() {
  try {
    await db.sql(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await db.sql(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        userId TEXT,
        name TEXT,
        color TEXT,
        description TEXT,
        lastAccessed TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);

    await db.sql(`
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
        tags TEXT,
        FOREIGN KEY(projectId) REFERENCES projects(id),
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);

    // Migration for existing databases
    try {
      await db.sql(`ALTER TABLE tasks ADD COLUMN tags TEXT`);
      console.log("Migration: Added tags column to tasks table.");
    } catch (e: any) {
      const msg = e.message || String(e);
      if (msg.includes('duplicate column name') || msg.includes('already exists')) {
        // Column already exists, ignore
      } else {
        console.log("Migration check (tags):", msg);
      }
    }

    console.log("Database schema initialized.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
}

// Ensure Admin User Exists
const ensureAdminUser = async () => {
  const adminUsername = "Dujao";
  const adminPassword = "30031936";
  const adminEmail = "dujao@focusos.net";

  try {
    const results: any = await db.sql`SELECT * FROM users WHERE username = ${adminUsername}`;
    const existingAdmin = results[0];

    if (!existingAdmin) {
      console.log(`Setting up admin user: ${adminUsername}`);
      const id = "admin-dujao";
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await db.sql`INSERT INTO users (id, username, email, password_hash) VALUES (${id}, ${adminUsername}, ${adminEmail}, ${hashedPassword})`;

      // Initial Seed For Admin
      const p1Id = "p1-" + id;
      await db.sql`INSERT INTO projects (id, userId, name, color, description, lastAccessed) VALUES (${p1Id}, ${id}, "Sistema Central", "#6366f1", "Gestão principal da FocusOS.", ${new Date().toISOString()})`;

      await db.sql`INSERT INTO tasks (id, projectId, userId, title, description, priority, estimatedMinutes, deadline, status, strategicWeight) VALUES (${"t1-" + id}, ${p1Id}, ${id}, "Configuração Inicial", "Finalizar setup do servidor e banco de dados.", "urgent", 60, ${new Date().toISOString()}, "completed", 10)`;

      console.log("Admin user created successfully.");
    }
  } catch (err) {
    console.error("Error ensuring admin user:", err);
  }
};

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
    await db.sql`INSERT INTO users (id, username, email, password_hash) VALUES (${id}, ${username}, ${email}, ${hashedPassword})`;
    
    const token = jwt.sign({ id, username }, JWT_SECRET);
    
    const p1Id = "p1-" + id;
    await db.sql`INSERT INTO projects (id, userId, name, color, description, lastAccessed) VALUES (${p1Id}, ${id}, "Ecosistema Pro", "#6366f1", "Plataforma centralizada para gestão de recursos e infraestrutura.", ${new Date().toISOString()})`;
    
    await db.sql`INSERT INTO tasks (id, projectId, userId, title, description, priority, estimatedMinutes, deadline, status, strategicWeight) VALUES (${"t1-" + id}, ${p1Id}, ${id}, "Auditoria de Segurança", "Verificar protocolos de criptografia e acessos.", "urgent", 45, ${new Date().toISOString()}, "todo", 9)`;
    await db.sql`INSERT INTO tasks (id, projectId, userId, title, description, priority, estimatedMinutes, deadline, status, strategicWeight) VALUES (${"t2-" + id}, ${p1Id}, ${id}, "Otimização de Banco", "Executar scripts de limpeza e indexação.", "medium", 30, ${new Date().toISOString()}, "in-progress", 7)`;

    res.json({ token, user: { id, username, email } });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(400).json({ error: "Username or email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const results: any = await db.sql`SELECT * FROM users WHERE username = ${username}`;
    const user = results[0];
    
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Projects
app.get("/api/projects", authenticateToken, async (req: any, res) => {
  try {
    const projects = await db.sql`SELECT * FROM projects WHERE userId = ${req.user.id}`;
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/projects", authenticateToken, async (req: any, res) => {
  const { id, name, color, description, lastAccessed } = req.body;
  try {
    await db.sql`INSERT INTO projects (id, userId, name, color, description, lastAccessed) VALUES (${id}, ${req.user.id}, ${name}, ${color}, ${description}, ${lastAccessed})`;
    res.json({ id, name, color, description, lastAccessed });
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.patch("/api/projects/:id", authenticateToken, async (req: any, res) => {
  const { lastAccessed } = req.body;
  try {
    await db.sql`UPDATE projects SET lastAccessed = ${lastAccessed} WHERE id = ${req.params.id} AND userId = ${req.user.id}`;
    res.sendStatus(200);
  } catch (err) {
    console.error("Update project error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/projects/:id", authenticateToken, async (req: any, res) => {
  try {
    // Manually delete tasks first to ensure integrity if cascade is not set
    await db.sql`DELETE FROM tasks WHERE projectId = ${req.params.id} AND userId = ${req.user.id}`;
    await db.sql`DELETE FROM projects WHERE id = ${req.params.id} AND userId = ${req.user.id}`;
    res.sendStatus(200);
  } catch (err) {
    console.error("Delete project error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Tasks
app.get("/api/tasks", authenticateToken, async (req: any, res) => {
  try {
    const tasks = await db.sql`SELECT * FROM tasks WHERE userId = ${req.user.id}`;
    res.json(tasks);
  } catch (err) {
    console.error("Fetch tasks error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/tasks", authenticateToken, async (req: any, res) => {
  const { id, projectId, title, description, priority, estimatedMinutes, deadline, status, strategicWeight, tags } = req.body;
  try {
    const tagsJson = JSON.stringify(tags || []);
    await db.sql`
      INSERT INTO tasks (id, projectId, userId, title, description, priority, estimatedMinutes, deadline, status, strategicWeight, tags)
      VALUES (${id}, ${projectId}, ${req.user.id}, ${title}, ${description}, ${priority}, ${estimatedMinutes}, ${deadline}, ${status}, ${strategicWeight}, ${tagsJson})
    `;
    res.json(req.body);
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.patch("/api/tasks/:id", authenticateToken, async (req: any, res) => {
  const { status } = req.body;
  try {
    await db.sql`UPDATE tasks SET status = ${status} WHERE id = ${req.params.id} AND userId = ${req.user.id}`;
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/tasks/:id", authenticateToken, async (req: any, res) => {
  try {
    await db.sql`DELETE FROM tasks WHERE id = ${req.params.id} AND userId = ${req.user.id}`;
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/tasks/:id", authenticateToken, async (req: any, res) => {
  const { title, description, projectId, priority, status, estimatedMinutes, deadline, strategicWeight, tags } = req.body;
  try {
    const tagsJson = JSON.stringify(tags || []);
    await db.sql`
      UPDATE tasks 
      SET title = ${title}, 
          description = ${description}, 
          projectId = ${projectId}, 
          priority = ${priority}, 
          status = ${status}, 
          estimatedMinutes = ${estimatedMinutes}, 
          deadline = ${deadline}, 
          strategicWeight = ${strategicWeight}, 
          tags = ${tagsJson}
      WHERE id = ${req.params.id} AND userId = ${req.user.id}
    `;
    res.json(req.body);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

async function startServer() {
  await initDb();
  await ensureAdminUser();

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
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Listening on http://0.0.0.0:${PORT}`);
    console.log(`Static files serving from: ${path.join(process.cwd(), 'dist')}`);
  });
}

startServer();
