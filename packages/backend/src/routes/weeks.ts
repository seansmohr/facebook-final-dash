/**
 * Weeks API Routes
 *
 * GET    /api/weeks           — List all weeks with data
 * GET    /api/weeks/summary   — Get aggregate totals
 * GET    /api/weeks/:label    — Get single week
 * PUT    /api/weeks/:label    — Create or update week data
 * DELETE /api/weeks/:label    — Delete a week
 */
import { Router } from 'express';
import db from '../db';
import { calculate } from '../services/calculations';
import { generateAdvice } from '../services/adviceEngine';

const router = Router();

// List all weeks with data
router.get('/', (_req, res) => {
  try {
    const weeks = db.prepare(
      'SELECT * FROM weeks ORDER BY week_label ASC'
    ).all();
    res.json({ success: true, data: weeks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Aggregate summary
router.get('/summary', (_req, res) => {
  try {
    const summary = db.prepare(`
      SELECT
        COUNT(*) as weeks_count,
        SUM(spend) as total_spend,
        SUM(leads) as total_leads,
        SUM(new_clients) as total_clients,
        SUM(revenue) as total_revenue,
        SUM(total_appts) as total_appts,
        SUM(live_calls) as total_live_calls,
        SUM(attendees) as total_attendees
      FROM weeks
      WHERE spend IS NOT NULL
    `).get() as any;

    const result = {
      weeksCount: summary.weeks_count || 0,
      totalSpend: summary.total_spend || 0,
      totalLeads: summary.total_leads || 0,
      totalClients: summary.total_clients || 0,
      totalRevenue: summary.total_revenue || 0,
      totalAppts: summary.total_appts || 0,
      totalLiveCalls: summary.total_live_calls || 0,
      totalAttendees: summary.total_attendees || 0,
      avgCPL: summary.total_leads > 0 ? summary.total_spend / summary.total_leads : null,
      avgCPA: summary.total_clients > 0 ? summary.total_spend / summary.total_clients : null,
      overallROAS: summary.total_spend > 0 ? summary.total_revenue / summary.total_spend : null,
      overallCloseRate: summary.total_live_calls > 0 ? summary.total_clients / summary.total_live_calls : null,
    };

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single week
router.get('/:label', (req, res) => {
  try {
    const label = decodeURIComponent(req.params.label);
    const week = db.prepare('SELECT * FROM weeks WHERE week_label = ?').get(label);
    res.json({ success: true, data: week || null });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create or update week
router.put('/:label', (req, res) => {
  try {
    const label = decodeURIComponent(req.params.label);
    const input = req.body;
    const calc = calculate(input);
    const merged = { week_label: label, ...input, ...calc };

    // Upsert
    const existing = db.prepare('SELECT id FROM weeks WHERE week_label = ?').get(label);

    if (existing) {
      const setClauses: string[] = [];
      const values: any = {};
      for (const [key, val] of Object.entries(merged)) {
        if (key === 'week_label' || key === 'id' || key === 'created_at') continue;
        setClauses.push(`${key} = @${key}`);
        values[key] = val ?? null;
      }
      values.week_label = label;
      setClauses.push("updated_at = datetime('now')");
      db.prepare(
        `UPDATE weeks SET ${setClauses.join(', ')} WHERE week_label = @week_label`
      ).run(values);
    } else {
      const columns = [
        'week_label', 'spend', 'leads', 'cpm', 'ctr', 'impressions', 'reach',
        'link_clicks', 'landing_page_views', 'hook_rate', 'hold_rate',
        'attendees', 'autobooked_appts', 'total_appts', 'appts_due',
        'live_calls', 'new_clients', 'future_sales', 'proj_close_rate',
        'revenue', 'avg_fyc', 'notes',
        'cpc', 'connect_rate', 'cvr', 'cost_per_lead', 'frequency',
        'attendee_pct', 'autobook_rate', 'lead_to_appt_rate',
        'cost_per_appt', 'appt_to_live_rate', 'close_rate',
        'cpa', 'total_sales_proj', 'proj_cpa',
        'conversion_rate', 'proj_conversion_rate', 'roas',
      ];
      const placeholders = columns.map(c => `@${c}`).join(', ');
      const vals: any = {};
      for (const col of columns) {
        vals[col] = merged[col] ?? null;
      }
      db.prepare(
        `INSERT INTO weeks (${columns.join(', ')}) VALUES (${placeholders})`
      ).run(vals);
    }

    // Generate and store advice
    const savedWeek = db.prepare('SELECT * FROM weeks WHERE week_label = ?').get(label) as any;

    // Get previous week for comparison
    const previousWeek = db.prepare(
      'SELECT * FROM weeks WHERE week_label < ? ORDER BY week_label DESC LIMIT 1'
    ).get(label) as any | undefined;

    // Get 4-week rolling average
    const recentWeeks = db.prepare(
      'SELECT * FROM weeks WHERE week_label <= ? ORDER BY week_label DESC LIMIT 4'
    ).all(label) as any[];

    let fourWeekAvg: Partial<any> | null = null;
    if (recentWeeks.length >= 2) {
      fourWeekAvg = {
        cost_per_lead: avg(recentWeeks.map(w => w.cost_per_lead)),
        cpa: avg(recentWeeks.map(w => w.cpa)),
        close_rate: avg(recentWeeks.map(w => w.close_rate)),
        roas: avg(recentWeeks.map(w => w.roas)),
        cpm: avg(recentWeeks.map(w => w.cpm)),
        connect_rate: avg(recentWeeks.map(w => w.connect_rate)),
        cvr: avg(recentWeeks.map(w => w.cvr)),
        hook_rate: avg(recentWeeks.map(w => w.hook_rate)),
        hold_rate: avg(recentWeeks.map(w => w.hold_rate)),
      };
    }

    const adviceItems = generateAdvice(savedWeek, previousWeek || null, fourWeekAvg);

    // Clear old advice for this week and insert new
    db.prepare('DELETE FROM advice_log WHERE week_label = ?').run(label);
    const insertAdvice = db.prepare(
      'INSERT INTO advice_log (week_label, advice_type, title, message, actions) VALUES (?, ?, ?, ?, ?)'
    );
    for (const a of adviceItems) {
      insertAdvice.run(label, a.type, a.title, a.message, JSON.stringify(a.actions));
    }

    res.json({ success: true, data: { ...savedWeek, advice: adviceItems } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a week
router.delete('/:label', (req, res) => {
  try {
    const label = decodeURIComponent(req.params.label);
    db.prepare('DELETE FROM weeks WHERE week_label = ?').run(label);
    db.prepare('DELETE FROM advice_log WHERE week_label = ?').run(label);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function avg(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v != null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export default router;
