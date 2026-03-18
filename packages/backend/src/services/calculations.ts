/**
 * Server-side calculation engine.
 * All auto-calculated fields are computed here before persisting to SQLite.
 * These same formulas are mirrored on the frontend for instant feedback.
 */

export interface WeekInput {
  spend?: number | null;
  leads?: number | null;
  cpm?: number | null;
  ctr?: number | null;
  impressions?: number | null;
  reach?: number | null;
  link_clicks?: number | null;
  landing_page_views?: number | null;
  hook_rate?: number | null;
  hold_rate?: number | null;
  attendees?: number | null;
  autobooked_appts?: number | null;
  total_appts?: number | null;
  appts_due?: number | null;
  live_calls?: number | null;
  new_clients?: number | null;
  future_sales?: number | null;
  proj_close_rate?: number;
  revenue?: number | null;
  avg_fyc?: number | null;
}

export interface CalculatedFields {
  cpc: number | null;
  connect_rate: number | null;
  cvr: number | null;
  cost_per_lead: number | null;
  frequency: number | null;
  attendee_pct: number | null;
  autobook_rate: number | null;
  lead_to_appt_rate: number | null;
  cost_per_appt: number | null;
  appt_to_live_rate: number | null;
  close_rate: number | null;
  cpa: number | null;
  total_sales_proj: number | null;
  proj_cpa: number | null;
  conversion_rate: number | null;
  proj_conversion_rate: number | null;
  roas: number | null;
}

function div(a: number | null | undefined, b: number | null | undefined): number | null {
  if (a == null || b == null || b === 0) return null;
  return a / b;
}

export function calculate(d: WeekInput): CalculatedFields {
  const s = d.spend ?? null;
  const l = d.leads ?? null;
  const lc = d.link_clicks ?? null;
  const lpv = d.landing_page_views ?? null;
  const imp = d.impressions ?? null;
  const rch = d.reach ?? null;
  const att = d.attendees ?? null;
  const ab = d.autobooked_appts ?? null;
  const ta = d.total_appts ?? null;
  const ad = d.appts_due ?? null;
  const liveCalls = d.live_calls ?? null;
  const nc = d.new_clients ?? null;
  const fs = d.future_sales ?? null;
  const pcr = d.proj_close_rate ?? 65;
  const rev = d.revenue ?? null;

  // Meta auto-calcs
  const cpc = div(s, lc);
  const connect_rate_raw = div(lpv, lc);
  const connect_rate = connect_rate_raw != null ? connect_rate_raw * 100 : null;
  const cvr_raw = div(l, lpv);
  const cvr = cvr_raw != null ? cvr_raw * 100 : null;
  const cost_per_lead = div(s, l);
  const frequency = div(imp, rch);

  // Funnel auto-calcs
  const attendee_pct = div(att, l);
  const autobook_rate = div(ab, att);
  const lead_to_appt_rate = div(ta, l);
  const cost_per_appt = div(s, ta);
  const appt_to_live_rate = div(liveCalls, ad);
  const close_rate = div(nc, liveCalls);
  const cpa = div(s, nc);
  const total_sales_proj = (nc ?? 0) + (fs ?? 0) * (pcr / 100);
  const proj_cpa = s != null && total_sales_proj > 0 ? s / total_sales_proj : null;
  const conversion_rate = div(nc, l);
  const proj_conversion_rate = l != null && total_sales_proj > 0 ? total_sales_proj / l : null;
  const roas = div(rev, s);

  return {
    cpc, connect_rate, cvr, cost_per_lead, frequency,
    attendee_pct, autobook_rate, lead_to_appt_rate,
    cost_per_appt, appt_to_live_rate, close_rate,
    cpa, total_sales_proj, proj_cpa,
    conversion_rate, proj_conversion_rate, roas,
  };
}
