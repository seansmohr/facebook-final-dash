/**
 * Client-side calculation engine — mirrors backend/src/services/calculations.ts exactly
 */

function div(a: number | null | undefined, b: number | null | undefined): number | null {
  if (a == null || b == null || b === 0) return null;
  return a / b;
}

export function calculate(d: Record<string, any>) {
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
