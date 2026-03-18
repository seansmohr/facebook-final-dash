import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import db from './db';
import { authMiddleware } from './middleware/auth';
import weeksRouter from './routes/weeks';
import adviceRouter from './routes/advice';
import { seedInitialData } from './services/seedData';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check (no auth required)
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Auth endpoint — verify password
app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  const correct = process.env.DASHBOARD_PASSWORD || 'mohr2026';
  if (password === correct) {
    res.json({ success: true, data: { token: Buffer.from(password).toString('base64') } });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

// Protected routes
app.use('/api/weeks', authMiddleware, weeksRouter);
app.use('/api/advice', authMiddleware, adviceRouter);

// Backup endpoint — download the SQLite database file
app.get('/api/backup', authMiddleware, (_req, res) => {
  const dbPath = process.env.DATABASE_PATH || './data/mohr-ads.db';
  res.download(dbPath, 'mohr-ads-backup.db');
});

// Serve frontend static files in production
if (process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

// Seed initial data on first run
seedInitialData(db);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mohr Ads Dashboard running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  db.close();
  process.exit(0);
});
