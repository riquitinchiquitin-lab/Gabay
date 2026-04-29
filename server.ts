import fs from "fs";
import crypto from "crypto";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
// @ts-ignore
import xss from "xss-clean";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import axios from "axios";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

dotenv.config();

let dbInstance: Database.Database | null = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = new Database("postgress.db", { verbose: console.log });
    dbInstance.pragma('foreign_keys = ON');
  }
  return dbInstance;
}

// Function to initialize tables
function initializeDb() {
  const db = getDb();
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT NOT NULL DEFAULT 'USER',
        accessToken TEXT,
        refreshToken TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Word (
        id TEXT PRIMARY KEY,
        tagalog TEXT NOT NULL,
        english TEXT NOT NULL,
        category TEXT NOT NULL,
        exampleSentence TEXT,
        authorId TEXT REFERENCES User(id) ON DELETE SET NULL,
        correctCount INTEGER NOT NULL DEFAULT 0,
        incorrectCount INTEGER NOT NULL DEFAULT 0,
        lastReviewedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS SystemLog (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        details TEXT,
        userId TEXT,
        userEmail TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS SecurityConfig (
        id TEXT PRIMARY KEY,
        cloudflareToken TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables initialized successfully (SQLite).");
  } catch (err) {
    console.error("Failed to initialize database tables:", err);
  }
}

// Gabay Postgress Encryption Protocol (AES-256-CBC)
const ENCRYPTION_SERVICE = {
  algorithm: 'aes-256-cbc',
  key: crypto.scryptSync(process.env.KERNEL_SECRET || 'gabay-fallback-secret-2026', 'salt', 32),
  
  encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  },

  decrypt(text: string): string {
    if (!text || !text.includes(':')) return text;
    try {
      const [ivHex, encryptedHex] = text.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      return text; // Fallback to raw if decryption fails (e.g. migration period)
    }
  }
};
// Unified Error Response Helper
const handleApiError = (res: any, next: any, error: any, defaultMsg: string) => {
  console.error(`${defaultMsg}:`, error);
  
  if (error.code === "SQLITE_CONSTRAINT_UNIQUE") { // SQLite Unique Violation
    return res.status(400).json({ error: "The provided identifier is already in use." });
  }
  if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") { // Foreign Key Constraint Failure
    return res.status(401).json({ error: "Session invalid or user not found. Please log in again." });
  }
  if (error.code === "INFRASTRUCTURE_MISSING") {
    return next(error);
  }
  
  res.status(500).json({ 
    error: defaultMsg,
    details: process.env.NODE_ENV !== "production" ? error.message : undefined,
    code: error.code
  });
};

const app = express();
const PORT = 3000;

// Cloudflare IP Ranges (Gabay Protocol)
const CLOUDFLARE_IPS = [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
  '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
  '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
  '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
  '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
  '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32'
];

// Security Middleware (Gabay Protocol + Cloudflare Hardening)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://www.google.com", "https://i.ytimg.com", "https://*.googleusercontent.com"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameAncestors: ["'self'", "https://*.run.app", "https://ais-pre-*.run.app", "https://*.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Express Trust Proxy setup for AIS Environment
app.set("trust proxy", 1);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true },
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

// Apply global rate limiter
app.use("/api/", limiter);

// Data Sanitization & Protection
app.use(express.json({ limit: "15kb" })); // Body parser, limit payload size
app.use(xss()); // Sanitize user input from XSS
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(cookieParser());

const JWT_SECRET = process.env.SESSION_SECRET || "gabay-wika-jwt-secure-secret-2024";

// OAuth setup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || "";
const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

// Role-based JWT decode middleware
app.use((req: any, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      console.warn("Malformed or empty Bearer token received.");
      return next();
    }
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        console.warn("JWT Expired. User will need to re-authenticate.");
      } else {
        console.error("JWT Verify Error:", err.message, "Token preview:", token.substring(0, 10) + "...");
      }
    }
  }
  next();
});

// Middleware to check authentication
const isAuthenticated = (req: any, res: express.Response, next: express.NextFunction) => {
  if (req.user && req.user.userId) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

const isAdmin = (req: any, res: express.Response, next: express.NextFunction) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ error: "Forbidden: Admin access required" });
  }
};

// Helper for System Logging
async function createLog(action: string, details?: string, user?: any) {
  try {
    const id = crypto.randomUUID();
    getDb().prepare(
      'INSERT INTO SystemLog (id, action, details, userId, userEmail) VALUES (?, ?, ?, ?, ?)'
    ).run(id, action, details, user?.userId, user?.email ? ENCRYPTION_SERVICE.encrypt(user.email) : undefined);
  } catch (err) {
    console.error("Failed to create system log:", err);
  }
}

// Auth Routes
app.get("/api/auth/url", (req, res) => {
  const redirectUri = `${APP_URL}/auth/callback`;
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // Force consent to get refresh token
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile", 
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/youtube.readonly"
    ],
    redirect_uri: redirectUri,
  });
  res.json({ url });
});

app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  const { code } = req.query;
  try {
    const redirectUri = `${APP_URL}/auth/callback`;
    const { tokens } = await oauth2Client.getToken({
      code: String(code),
      redirect_uri: redirectUri,
    });
    
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new Error("Invalid token payload");

    // Check if this is the first user or matched bootstrap email
    const userCount = (getDb().prepare('SELECT COUNT(*) as count FROM User').get() as any).count;
    const bootstrapAdminEmail = "riquitin.chiquitin@gmail.com";
    const isBootstrapAdmin = (userCount === 0 || payload.email === bootstrapAdminEmail);

    const encryptedEmail = ENCRYPTION_SERVICE.encrypt(payload.email);
    const encryptedName = payload.name ? ENCRYPTION_SERVICE.encrypt(payload.name) : undefined;
    const accessToken = tokens.access_token ? ENCRYPTION_SERVICE.encrypt(tokens.access_token) : null;
    const refreshToken = tokens.refresh_token ? ENCRYPTION_SERVICE.encrypt(tokens.refresh_token) : null;
    const role = isBootstrapAdmin ? "ADMIN" : "USER";
    const id = crypto.randomUUID();

    const upsertQuery = `
      INSERT INTO User (id, email, name, role, accessToken, refreshToken)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        accessToken = EXCLUDED.accessToken,
        refreshToken = COALESCE(EXCLUDED.refreshToken, User.refreshToken),
        role = CASE WHEN ? = 1 THEN 'ADMIN' ELSE User.role END
      RETURNING *
    `;
    
    const user = getDb().prepare(upsertQuery).get(
      id, payload.email, encryptedName, role, accessToken, refreshToken, isBootstrapAdmin ? 1 : 0
    ) as any;

    const token = jwt.sign({ 
      userId: user.id, 
      role: user.role, 
      name: user.name, 
      email: user.email 
    }, JWT_SECRET, { expiresIn: '7d' });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}' }, '*');
              window.close();
            } else {
              window.location.href = '/?token=${token}';
            }
          </script>
          <p>Authentication successful. Closing window...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/auth/me", isAuthenticated, (req: any, res) => {
  res.json({
    id: req.user.userId,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true });
});

// Developer Login Bypass
app.post("/api/auth/dev-login", async (req, res, next) => {
  if (process.env.VITE_DISABLE_DEV_AUTH === "true") {
    return res.status(403).json({ error: "Developer login is disabled." });
  }
  try {
    const adminEmail = "riquitin.chiquitin@gmail.com";
    const id = crypto.randomUUID();
    const name = ENCRYPTION_SERVICE.encrypt("Developer Admin");
    
    const upsertQuery = `
      INSERT INTO User (id, email, name, role)
      VALUES (?, ?, ?, 'ADMIN')
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = 'ADMIN'
      RETURNING *
    `;
    const user = getDb().prepare(upsertQuery).get(id, adminEmail, name) as any;

    const token = jwt.sign({ 
      userId: user.id, 
      role: user.role, 
      name: "Developer Admin", 
      email: adminEmail 
    }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    handleApiError(res, next, error, "Dev login failed");
  }
});

// Management Routes
app.get("/api/admin/users", isAdmin, async (req: any, res, next) => {
  try {
    const users = getDb().prepare(`
      SELECT u.*, (SELECT COUNT(*) FROM Word WHERE authorId = u.id) as wordCount
      FROM User u
      ORDER BY u.createdAt DESC
    `).all() as any[];
    const decryptedUsers = users.map(u => ({
      ...u,
      name: u.name ? ENCRYPTION_SERVICE.decrypt(u.name as string) : u.name,
      _count: { words: parseInt(u.wordCount as string) }
    }));
    res.json(decryptedUsers);
  } catch (error) {
    handleApiError(res, next, error, "Failed to fetch users");
  }
});

app.post("/api/admin/users", isAdmin, async (req: any, res, next) => {
  try {
    const { email, name, role } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    const id = crypto.randomUUID();
    const encryptedName = ENCRYPTION_SERVICE.encrypt(name || email.split('@')[0]);
    const userRole = role || "USER";

    const user = getDb().prepare(
      'INSERT INTO User (id, email, name, role) VALUES (?, ?, ?, ?) RETURNING *'
    ).get(id, email, encryptedName, userRole) as any;

    await createLog("USER_CREATED", `Admin created user: ${email} (${user.role})`, req.user);
    res.json({
      ...user,
      name: name || email.split('@')[0]
    });
  } catch (error) {
    handleApiError(res, next, error, "Failed to create user. Email might already exist.");
  }
});

app.patch("/api/admin/users/:id/role", isAdmin, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const oldUser = getDb().prepare('SELECT * FROM User WHERE id = ?').get(id) as any;
    
    const user = getDb().prepare(
      'UPDATE User SET role = ? WHERE id = ? RETURNING *'
    ).get(role, id) as any;
    await createLog("USER_ROLE_UPDATE", `Changed ${oldUser?.email} from ${oldUser?.role} to ${role}`, req.user);
    res.json(user);
  } catch (error) {
    handleApiError(res, next, error, "Failed to update role");
  }
});

// System Logs
app.get("/api/admin/logs", isAdmin, async (req: any, res) => {
  try {
    const logs = getDb().prepare('SELECT * FROM SystemLog ORDER BY createdAt DESC LIMIT 100').all() as any[];
    const decryptedLogs = logs.map(l => ({
      ...l,
      userEmail: l.userEmail ? ENCRYPTION_SERVICE.decrypt(l.userEmail as string) : l.userEmail
    }));
    res.json(decryptedLogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Security Generator (Verdant/Gabay Standard)
app.get("/api/admin/security/generate-key", isAdmin, async (req: any, res) => {
  try {
    const newKey = crypto.randomBytes(48).toString('base64');
    await createLog("SECURITY_KEY_GEN", "Admin generated a new entropy-rich kernel secret proposal", req.user);
    res.json({ key: newKey });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate security key" });
  }
});

// Cloudflare Config
app.get("/api/admin/security/config", isAdmin, async (req: any, res) => {
  try {
    const envToken = process.env.CLOUDFLARE_TUNNEL_TOKEN;
    const dbConfig = getDb().prepare('SELECT * FROM SecurityConfig WHERE id = ?').get("GLOBAL") as any;
    
    // Prioritize environment variable if set
    if (envToken) {
      return res.json({ 
        cloudflareToken: "********", // Mask for security
        source: "ENVIRONMENT",
      });
    }

    res.json({
      cloudflareToken: dbConfig?.cloudflareToken ? ENCRYPTION_SERVICE.decrypt(dbConfig.cloudflareToken as string) : "",
      source: dbConfig ? "DATABASE" : "NONE",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch security config" });
  }
});

app.post("/api/admin/security/config", isAdmin, async (req: any, res) => {
  try {
    const { cloudflareToken } = req.body;
    const encryptedToken = ENCRYPTION_SERVICE.encrypt(cloudflareToken);
    
    const upsertQuery = `
      INSERT INTO SecurityConfig (id, cloudflareToken, updatedAt)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        cloudflareToken = EXCLUDED.cloudflareToken,
        updatedAt = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const config = getDb().prepare(upsertQuery).get("GLOBAL", encryptedToken);
    
    await createLog("SECURITY_CONFIG_UPDATE", `Cloudflare Tunnel configuration updated in database (Env Override: ${!!process.env.CLOUDFLARE_TUNNEL_TOKEN})`, req.user);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to update security config" });
  }
});

// System Stats
app.get("/api/admin/stats", isAdmin, async (req: any, res, next) => {
  try {
    const userCount = (getDb().prepare('SELECT COUNT(*) as count FROM User').get() as any).count;
    const wordCount = (getDb().prepare('SELECT COUNT(*) as count FROM Word').get() as any).count;
    const logCount = (getDb().prepare('SELECT COUNT(*) as count FROM SystemLog').get() as any).count;
    
    res.json({
      userCount: parseInt(userCount as string),
      wordCount: parseInt(wordCount as string),
      logCount: parseInt(logCount as string),
      dbStatus: "CONNECTED_SQLITE_LOCAL",
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      usingDefaultSecret: JWT_SECRET === "gabay-wika-jwt-secure-secret-2024",
    });
  } catch (error) {
    handleApiError(res, next, error, "Failed to fetch stats");
  }
});

// Database Backup (Encrypted Neural JSON Snapshot)
app.get("/api/admin/database/backup", isAdmin, async (req: any, res) => {
  try {
    // Collect all system data for the Neural Snapshot
    const users = getDb().prepare('SELECT * FROM User').all();
    const words = getDb().prepare('SELECT * FROM Word').all();
    const logs = getDb().prepare('SELECT * FROM SystemLog').all();
    const config = getDb().prepare('SELECT * FROM SecurityConfig WHERE id = ?').get("GLOBAL");

    const data = {
      users,
      words,
      logs,
      config,
      timestamp: new Date().toISOString(),
      protocol: "GABAY_NEURAL_SNAPSHOT_V3_SQLITE"
    };

    const snapshotBuffer = Buffer.from(JSON.stringify(data));
    
    // Gabay Neural Encryption (AES-256-GCM)
    const ENCRYPTION_KEY = crypto.scryptSync(JWT_SECRET, 'gabay-salt', 32); 
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    
    const encrypted = Buffer.concat([cipher.update(snapshotBuffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    // Final payload: IV (12) + AuthTag (16) + EncryptedData (rest)
    const finalBuffer = Buffer.concat([iv, authTag, encrypted]);
    
    await createLog("DATABASE_BACKUP", "Neural JSON snapshot generated and downloaded (Postgress Encrypted)", req.user);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=gabay_neural_snapshot_${Date.now()}.enc`);
    res.send(finalBuffer);
  } catch (error) {
    console.error("Backup error:", error);
    res.status(500).json({ error: "Failed to create security snapshot" });
  }
});

// Protective API Routes
app.get("/api/words", isAuthenticated, async (req: any, res, next) => {
  try {
    const { search, category } = req.query;
    const query = `
      SELECT w.*, u.name as authorName
      FROM Word w
      LEFT JOIN User u ON w.authorId = u.id
      WHERE (? IS NULL OR w.category = ?)
        AND (? = 1 OR w.authorId = ?)
      ORDER BY w.createdAt DESC
    `;
    const rawWords = getDb().prepare(query).all(
      category || null,
      category || null,
      req.user.role === "ADMIN" ? 1 : 0,
      req.user.userId
    ) as any[];

    // Post-fetch decryption and filtering for encrypted fields
    let words = rawWords.map(w => ({
      ...w,
      tagalog: ENCRYPTION_SERVICE.decrypt(w.tagalog as string),
      english: ENCRYPTION_SERVICE.decrypt(w.english as string),
      exampleSentence: w.exampleSentence ? ENCRYPTION_SERVICE.decrypt(w.exampleSentence as string) : w.exampleSentence,
      author: { name: w.authorName }
    }));

    if (search) {
      const s = String(search).toLowerCase();
      words = words.filter(w => 
        w.tagalog.toLowerCase().includes(s) || 
        w.english.toLowerCase().includes(s)
      );
    }

    res.json(words);
  } catch (error) {
    handleApiError(res, next, error, "Failed to fetch words");
  }
});

app.post("/api/words", isAuthenticated, async (req: any, res, next) => {
  try {
    const { tagalog, english, category } = req.body;
    const id = crypto.randomUUID();
    const encryptedTagalog = ENCRYPTION_SERVICE.encrypt(tagalog);
    const encryptedEnglish = ENCRYPTION_SERVICE.encrypt(english);
    
    const word = getDb().prepare(
      'INSERT INTO Word (id, tagalog, english, category, authorId) VALUES (?, ?, ?, ?, ?) RETURNING *'
    ).get(id, encryptedTagalog, encryptedEnglish, category, req.user.userId) as any;

    res.json({
      ...word,
      tagalog,
      english
    });
  } catch (error) {
    handleApiError(res, next, error, "Failed to create word");
  }
});

app.delete("/api/words/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const word = getDb().prepare('SELECT * FROM Word WHERE id = ?').get(id) as any;
    
    if (!word) return res.status(404).json({ error: "Not found" });
    
    // Check ownership or admin
    if (word.authorId !== req.user.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    getDb().prepare('DELETE FROM Word WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting word:", error);
    res.status(500).json({ error: "Failed to delete word" });
  }
});

// Smart Learning: Log practice/game results
app.post("/api/words/:id/log-result", isAuthenticated, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const { correct } = req.body;
    
    const query = `
      UPDATE Word
      SET 
        correctCount = correctCount + ?,
        incorrectCount = incorrectCount + ?,
        lastReviewedAt = CURRENT_TIMESTAMP,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    getDb().prepare(query).run(correct ? 1 : 0, correct ? 0 : 1, id);

    res.json({ success: true });
  } catch (error) {
    handleApiError(res, next, error, "Failed to log word result");
  }
});

// YouTube Integration
app.get("/api/youtube/library", isAuthenticated, async (req: any, res) => {
  try {
    const user = getDb().prepare('SELECT * FROM User WHERE id = ?').get(req.user.userId) as any;

    if (!user || !user.accessToken) {
      return res.status(401).json({ error: "YouTube not connected" });
    }

    const accessToken = ENCRYPTION_SERVICE.decrypt(user.accessToken as string);
    const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        part: "snippet,contentDetails",
        myRating: "like",
        maxResults: 24
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    res.json(response.data.items);
  } catch (error: any) {
    console.error("YouTube Library Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch YouTube library" });
  }
});

// Vite middleware setup
async function startServer() {
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

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // DB initialization and Health check
    try {
      initializeDb();
      const userCount = (getDb().prepare('SELECT COUNT(*) as count FROM User').get() as any).count;
      console.log(`SQLite storage active. Current user count: ${userCount}`);
      await createLog("SYSTEM_STARTUP", "Application kernel started with Gabay Protocol (SQLite) active");
    } catch (dbError) {
      console.error("CRITICAL DATABASE ERROR AT STARTUP:", dbError);
    }
  });

  // Global Centralized Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    if (err.code === "INFRASTRUCTURE_MISSING") {
      return res.status(503).json({
        type: "INFRASTRUCTURE_ERROR",
        message: err.message,
        details: "Gabay Security Protocol requires a database instance to persist neural data."
      });
    }

    console.error("KERNEL_ERROR_UNHANDLED:", err);
    // Only attempt to log if it's not a prisma error caused by missing DB
    if (err.code !== "INFRASTRUCTURE_MISSING") {
      createLog("SYSTEM_ERROR", `Unhandled exception: ${err.message}`, req.user);
    }
    
    res.status(500).json({ 
      error: "Internal security violation or system error.", 
      id: crypto.randomBytes(4).toString('hex') 
    });
  });
}

startServer();
