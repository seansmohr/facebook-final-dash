import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'mohr-ads.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Performance settings for SQLite
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS weeks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_label TEXT UNIQUE NOT NULL,

    -- Meta Ads Manager inputs (manually entered)
    spend REAL,
    leads INTEGER,
    cpm REAL,
    ctr REAL,
    impressions INTEGER,
    reach INTEGER,
    link_clicks INTEGER,
    landing_page_views INTEGER,
    hook_rate REAL,
    hold_rate REAL,

    -- Downstream funnel inputs (manually entered)
    attendees INTEGER,
    autobooked_appts INTEGER,
    total_appts INTEGER,
    appts_due INTEGER,
    live_calls INTEGER,
    new_clients INTEGER,
    future_sales INTEGER,
    proj_close_rate REAL DEFAULT 65,
    revenue REAL,
    avg_fyc REAL,
    notes TEXT,

    -- Auto-calculated (computed before saving)
    cpc REAL,
    connect_rate REAL,
    cvr REAL,
    cost_per_lead REAL,
    frequency REAL,
    attendee_pct REAL,
    autobook_rate REAL,
    lead_to_appt_rate REAL,
    cost_per_appt REAL,
    appt_to_live_rate REAL,
    close_rate REAL,
    cpa REAL,
    total_sales_proj REAL,
    proj_cpa REAL,
    conversion_rate REAL,
    proj_conversion_rate REAL,
    roas REAL,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS advice_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_label TEXT NOT NULL,
    advice_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    actions TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
