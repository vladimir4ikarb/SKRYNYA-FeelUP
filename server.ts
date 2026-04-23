import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Handle ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, 'backups');

// Ensure backup directory exists safely
try {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
} catch (err) {
  console.error("Failed to create backup directory:", err);
}

// Cleanup: Remove backups older than 7 days
function cleanupOldBackups() {
  if (fs.existsSync(BACKUP_DIR)) {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = new Date();
    files.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        const diffDays = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays > 7 && file.startsWith('backup-')) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old backup: ${file}`);
        }
      } catch (e) {
        console.error(`Failed to process file ${file} during cleanup:`, e);
      }
    });
  }
}

async function startServer() {
  const expressApp = express();
  const PORT = 3000;

  expressApp.use(express.json({ limit: '50mb' })); // Allow large backup payloads

  // API Routes
  expressApp.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get list of backups
  expressApp.get("/api/backups", (req, res) => {
    try {
      const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('backup-'))
        .map(f => {
          const stats = fs.statSync(path.join(BACKUP_DIR, f));
          return { name: f, date: stats.mtime, size: stats.size };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      res.json(files);
    } catch (err) {
      res.status(500).json({ error: "Failed to list backups" });
    }
  });

  // Save a backup pushed from the client
  expressApp.post("/api/backups/save", async (req, res) => {
    try {
      const { data, timestamp } = req.body;
      if (!data) return res.status(400).json({ error: "Missing backup data" });

      const dateStr = timestamp ? timestamp.split('T')[0] : new Date().toISOString().split('T')[0];
      const fileName = `backup-${dateStr}.json`;
      const filePath = path.join(BACKUP_DIR, fileName);

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Backup pushed from client saved to ${filePath}`);
      
      cleanupOldBackups();
      res.json({ message: "Backup saved successfully" });
    } catch (err) {
      console.error("Failed to save pushed backup:", err);
      res.status(500).json({ error: "Failed to save backup" });
    }
  });

  // Download a backup
  expressApp.get("/api/backups/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(BACKUP_DIR, filename);
    if (fs.existsSync(filePath) && filename.startsWith('backup-')) {
      res.download(filePath);
    } else {
      res.status(404).send("Backup not found");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    expressApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    expressApp.use(express.static(distPath));
    expressApp.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  expressApp.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
