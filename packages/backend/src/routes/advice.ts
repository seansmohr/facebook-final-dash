/**
 * GET /api/advice/latest    — Advice for most recent week
 * GET /api/advice/:label    — Advice for specific week
 * GET /api/advice           — All advice history
 */
import { Router } from 'express';
import db from '../db';
import { generateAdvice } from '../services/adviceEngine';

const router = Router();

// Get all advice history
router.get('/', (_req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM advice_log ORDER BY created_at DESC'
    ).all() as any[];

    const data = rows.map(r => ({
      ...r,
      actions: JSON.parse(r.actions),
    }));

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get advice for most recent week
router.get('/latest', (_req, res) => {
  try {
    const latestWeek = db.prepare(
      'SELECT * FROM weeks WHERE spend IS NOT NULL ORDER BY id DESC LIMIT 1'
    ).get() as any;

    if (!latestWeek) {
      return res.json({ success: true, data: { week_label: null, advice: [] } });
    }

    const previousWeek = db.prepare(
      'SELECT * FROM weeks WHERE id < ? ORDER BY id DESC LIMIT 1'
    ).get(latestWeek.id) as any | undefined;

    const recentWeeks = db.prepare(
      'SELECT * FROM weeks WHERE id <= ? ORDER BY id DESC LIMIT 4'
    ).all(latestWeek.id) as any[];

    let fourWeekAvg: Partial<any> | null = null;
    if (recentWeeks.length >= 2) {
      fourWeekAvg = {
        cost_per_lead: avg(recentWeeks.map((w: any) => w.cost_per_lead)),
        cpa: avg(recentWeeks.map((w: any) => w.cpa)),
        close_rate: avg(recentWeeks.map((w: any) => w.close_rate)),
        roas: avg(recentWeeks.map((w: any) => w.roas)),
        cpm: avg(recentWeeks.map((w: any) => w.cpm)),
        connect_rate: avg(recentWeeks.map((w: any) => w.connect_rate)),
        cvr: avg(recentWeeks.map((w: any) => w.cvr)),
        hook_rate: avg(recentWeeks.map((w: any) => w.hook_rate)),
        hold_rate: avg(recentWeeks.map((w: any) => w.hold_rate)),
      };
    }

    const advice = generateAdvice(latestWeek, previousWeek || null, fourWeekAvg);
    res.json({ success: true, data: { week_label: latestWeek.week_label, advice } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get advice for specific week
router.get('/:label', (req, res) => {
  try {
    const label = decodeURIComponent(req.params.label);

    // First check stored advice
    const stored = db.prepare(
      'SELECT * FROM advice_log WHERE week_label = ? ORDER BY id ASC'
    ).all(label) as any[];

    if (stored.length > 0) {
      const data = stored.map(r => ({
        type: r.advice_type,
        title: r.title,
        message: r.message,
        actions: JSON.parse(r.actions),
      }));
      return res.json({ success: true, data: { week_label: label, advice: data } });
    }

    // Generate fresh if not stored
    const week = db.prepare('SELECT * FROM weeks WHERE week_label = ?').get(label) as any;
    if (!week) {
      return res.json({ success: true, data: { week_label: label, advice: [] } });
    }

    const previousWeek = db.prepare(
      'SELECT * FROM weeks WHERE id < ? ORDER BY id DESC LIMIT 1'
    ).get(week.id) as any | undefined;

    const recentWeeks = db.prepare(
      'SELECT * FROM weeks WHERE id <= ? ORDER BY id DESC LIMIT 4'
    ).all(week.id) as any[];

    let fourWeekAvg: Partial<any> | null = null;
    if (recentWeeks.length >= 2) {
      fourWeekAvg = {
        cost_per_lead: avg(recentWeeks.map((w: any) => w.cost_per_lead)),
        cpa: avg(recentWeeks.map((w: any) => w.cpa)),
      };
    }

    const advice = generateAdvice(week, previousWeek || null, fourWeekAvg);
    res.json({ success: true, data: { week_label: label, advice } });
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
