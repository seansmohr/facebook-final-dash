import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { WeekData, Advice } from '../types';
import AlertBanner from './AlertBanner';
import { fmtDollar, fmtPct, fmtX } from '../utils/formatters';

interface Props {
  weeks: WeekData[];
}

export default function Insights({ weeks }: Props) {
  const [latestAdvice, setLatestAdvice] = useState<Advice[]>([]);
  const [allAdvice, setAllAdvice] = useState<any[]>([]);
  const [latestLabel, setLatestLabel] = useState<string>('');
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const [latest, all] = await Promise.all([
          api.getLatestAdvice(),
          api.getAllAdvice(),
        ]);
        setLatestAdvice(latest.advice || []);
        setLatestLabel(latest.week_label || '');
        setAllAdvice(all || []);
      } catch (err) {
        console.error('Failed to load advice:', err);
      }
    };
    load();
  }, [weeks]);

  // Compute 4-week rolling averages
  const recent4 = weeks.slice(-4);
  const latest = weeks[weeks.length - 1];

  const rollingAvg = (getter: (w: WeekData) => number | null): number | null => {
    const vals = recent4.map(getter).filter((v): v is number => v != null);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const avgCPL = rollingAvg(w => w.cost_per_lead);
  const avgCPA = rollingAvg(w => w.cpa);
  const avgROAS = rollingAvg(w => w.roas);
  const avgCloseRate = rollingAvg(w => w.close_rate);
  const avgConnectRate = rollingAvg(w => w.connect_rate);
  const avgCVR = rollingAvg(w => w.cvr);

  // Group advice by week
  const adviceByWeek: Record<string, any[]> = {};
  for (const a of allAdvice) {
    if (!adviceByWeek[a.week_label]) adviceByWeek[a.week_label] = [];
    adviceByWeek[a.week_label].push(a);
  }
  const weekLabels = Object.keys(adviceByWeek).reverse();

  const toggleWeek = (label: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const BenchmarkRow = ({ label, current, avg, format, higherIsBetter = true }: {
    label: string; current: number | null; avg: number | null;
    format: (v: number | null) => string; higherIsBetter?: boolean;
  }) => {
    let color = 'text-slate-300';
    if (current != null && avg != null) {
      const better = higherIsBetter ? current > avg : current < avg;
      color = better ? 'text-green-400' : 'text-red-400';
    }
    return (
      <tr className="border-b border-slate-700/50">
        <td className="py-2 px-3 text-slate-400">{label}</td>
        <td className={`py-2 px-3 text-right ${color}`}>{format(current)}</td>
        <td className="py-2 px-3 text-right text-slate-400">{format(avg)}</td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Latest Advice */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          Latest Insights — {latestLabel || 'No data yet'}
        </h2>
        {latestAdvice.length > 0 ? (
          <AlertBanner advice={latestAdvice} />
        ) : (
          <p className="text-slate-400">No advice generated yet. Enter at least 2 weeks of data.</p>
        )}
      </div>

      {/* Benchmark: Current vs 4-Week Avg */}
      {latest && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Current Week vs 4-Week Average</h2>
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left py-2 px-3">Metric</th>
                  <th className="text-right py-2 px-3">This Week</th>
                  <th className="text-right py-2 px-3">4-Wk Avg</th>
                </tr>
              </thead>
              <tbody>
                <BenchmarkRow label="CPL" current={latest.cost_per_lead} avg={avgCPL} format={v => v != null ? fmtDollar(v) : '\u2014'} higherIsBetter={false} />
                <BenchmarkRow label="CPA" current={latest.cpa} avg={avgCPA} format={v => v != null ? fmtDollar(v) : '\u2014'} higherIsBetter={false} />
                <BenchmarkRow label="ROAS" current={latest.roas} avg={avgROAS} format={v => v != null ? fmtX(v) : '\u2014'} />
                <BenchmarkRow label="Close Rate" current={latest.close_rate} avg={avgCloseRate} format={v => v != null ? fmtPct(v) : '\u2014'} />
                <BenchmarkRow label="Connect Rate" current={latest.connect_rate} avg={avgConnectRate} format={v => v != null ? `${v.toFixed(1)}%` : '\u2014'} />
                <BenchmarkRow label="CVR" current={latest.cvr} avg={avgCVR} format={v => v != null ? `${v.toFixed(1)}%` : '\u2014'} />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Advice */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Advice History</h2>
        <div className="space-y-2">
          {weekLabels.map(label => {
            const items = adviceByWeek[label];
            const isOpen = expandedWeeks.has(label);
            return (
              <div key={label} className="bg-slate-800 rounded-lg border border-slate-700">
                <button
                  onClick={() => toggleWeek(label)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-white font-medium">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">{items.length} insight{items.length > 1 ? 's' : ''}</span>
                    <span className="text-slate-500">{isOpen ? '\u25BC' : '\u25B6'}</span>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <AlertBanner
                      advice={items.map((a: any) => ({
                        type: a.advice_type || a.type,
                        title: a.title,
                        message: a.message,
                        actions: typeof a.actions === 'string' ? JSON.parse(a.actions) : a.actions,
                      }))}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {weekLabels.length === 0 && (
            <p className="text-slate-400">No historical advice yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
