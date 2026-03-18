/**
 * Formatting utilities for consistent display across the dashboard
 */

export function fmtDollar(v: number | null | undefined): string {
  if (v == null) return '—';
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtInt(v: number | null | undefined): string {
  if (v == null) return '—';
  return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function fmtPct(v: number | null | undefined, isDecimal = true): string {
  if (v == null) return '—';
  const pct = isDecimal ? v * 100 : v;
  return `${pct.toFixed(1)}%`;
}

export function fmtX(v: number | null | undefined): string {
  if (v == null) return '—';
  return `${v.toFixed(2)}x`;
}

export function fmtFloat(v: number | null | undefined, decimals = 2): string {
  if (v == null) return '—';
  return v.toFixed(decimals);
}

/** Returns 'text-green-400', 'text-red-400', or 'text-slate-400' based on direction */
export function trendColor(current: number | null, previous: number | null, higherIsBetter = true): string {
  if (current == null || previous == null) return 'text-slate-400';
  if (current > previous) return higherIsBetter ? 'text-green-400' : 'text-red-400';
  if (current < previous) return higherIsBetter ? 'text-red-400' : 'text-green-400';
  return 'text-slate-400';
}

/** Returns triangle arrow or dash */
export function trendArrow(current: number | null, previous: number | null): string {
  if (current == null || previous == null) return '—';
  if (current > previous) return '\u25B2';
  if (current < previous) return '\u25BC';
  return '—';
}

/** WoW % change */
export function wowChange(current: number | null, previous: number | null): string {
  if (current == null || previous == null || previous === 0) return '';
  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}
