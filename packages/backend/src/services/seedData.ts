/**
 * Seeds the database with existing historical data on first run.
 * Only runs if the weeks table is empty.
 */
import Database from 'better-sqlite3';
import { calculate } from './calculations';

const SEED_WEEKS = [
  {
    week_label: '2/9 - 2/15',
    spend: 537.26,
    leads: 65,
    cpm: null,
    ctr: null,
    impressions: null,
    reach: null,
    link_clicks: null,
    landing_page_views: null,
    hook_rate: null,
    hold_rate: null,
    attendees: 5,
    autobooked_appts: 2,
    total_appts: 6,
    appts_due: 4,
    live_calls: 3,
    new_clients: 1,
    future_sales: 3,
    proj_close_rate: 65,
    revenue: 289.17,
    avg_fyc: 289.17,
    notes: 'First week of ads',
  },
  {
    week_label: '2/16 - 2/22',
    spend: 1004.51,
    leads: 73,
    cpm: null,
    ctr: null,
    impressions: null,
    reach: null,
    link_clicks: null,
    landing_page_views: null,
    hook_rate: null,
    hold_rate: null,
    attendees: 13,
    autobooked_appts: 8,
    total_appts: 20,
    appts_due: 20,
    live_calls: 11,
    new_clients: 0,
    future_sales: 3,
    proj_close_rate: 65,
    revenue: 0,
    avg_fyc: 0,
    notes: '',
  },
  {
    week_label: '2/23 - 3/1',
    spend: 1021.55,
    leads: 81,
    cpm: 81.79,
    ctr: 2.77,
    impressions: null,
    reach: null,
    link_clicks: null,
    landing_page_views: null,
    hook_rate: null,
    hold_rate: null,
    attendees: 44,
    autobooked_appts: 4,
    total_appts: 20,
    appts_due: 20,
    live_calls: 15,
    new_clients: 0,
    future_sales: 4,
    proj_close_rate: 65,
    revenue: 0,
    avg_fyc: 0,
    notes: 'Connect Rate: 84% (entered manually pre-v2)',
  },
  {
    week_label: '3/2 - 3/8',
    spend: 1046.90,
    leads: 53,
    cpm: 89.17,
    ctr: 3.82,
    impressions: null,
    reach: null,
    link_clicks: null,
    landing_page_views: null,
    hook_rate: null,
    hold_rate: null,
    attendees: 54,
    autobooked_appts: 6,
    total_appts: 45,
    appts_due: 45,
    live_calls: 6,
    new_clients: 4,
    future_sales: 2,
    proj_close_rate: 65,
    revenue: 3327.43,
    avg_fyc: 831.86,
    notes: 'Connect Rate: 73.21% (entered manually pre-v2)',
  },
  {
    week_label: '3/9 - 3/15',
    spend: 1166.66,
    leads: 54,
    cpm: 101.15,
    ctr: 3.87,
    impressions: null,
    reach: null,
    link_clicks: null,
    landing_page_views: null,
    hook_rate: null,
    hold_rate: null,
    attendees: 18,
    autobooked_appts: 3,
    total_appts: 26,
    appts_due: 26,
    live_calls: 11,
    new_clients: 2,
    future_sales: 2,
    proj_close_rate: 65,
    revenue: 1610.92,
    avg_fyc: 805.46,
    notes: 'Connect Rate: 68.61% (entered manually pre-v2)',
  },
];

export function seedInitialData(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM weeks').get() as { cnt: number };
  if (count.cnt > 0) return; // Already has data

  console.log('Seeding initial data...');

  const insertStmt = db.prepare(`
    INSERT INTO weeks (
      week_label, spend, leads, cpm, ctr, impressions, reach,
      link_clicks, landing_page_views, hook_rate, hold_rate,
      attendees, autobooked_appts, total_appts, appts_due,
      live_calls, new_clients, future_sales, proj_close_rate,
      revenue, avg_fyc, notes,
      cpc, connect_rate, cvr, cost_per_lead, frequency,
      attendee_pct, autobook_rate, lead_to_appt_rate,
      cost_per_appt, appt_to_live_rate, close_rate,
      cpa, total_sales_proj, proj_cpa,
      conversion_rate, proj_conversion_rate, roas
    ) VALUES (
      @week_label, @spend, @leads, @cpm, @ctr, @impressions, @reach,
      @link_clicks, @landing_page_views, @hook_rate, @hold_rate,
      @attendees, @autobooked_appts, @total_appts, @appts_due,
      @live_calls, @new_clients, @future_sales, @proj_close_rate,
      @revenue, @avg_fyc, @notes,
      @cpc, @connect_rate, @cvr, @cost_per_lead, @frequency,
      @attendee_pct, @autobook_rate, @lead_to_appt_rate,
      @cost_per_appt, @appt_to_live_rate, @close_rate,
      @cpa, @total_sales_proj, @proj_cpa,
      @conversion_rate, @proj_conversion_rate, @roas
    )
  `);

  const insertMany = db.transaction((weeks: typeof SEED_WEEKS) => {
    for (const week of weeks) {
      const calc = calculate(week);
      insertStmt.run({ ...week, ...calc });
    }
  });

  insertMany(SEED_WEEKS);
  console.log(`Seeded ${SEED_WEEKS.length} weeks of historical data.`);
}
