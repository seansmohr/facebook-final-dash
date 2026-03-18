import React from 'react';
import { WeekData, Summary, Advice } from '../types';
import { fmtDollar, fmtInt, fmtX } from '../utils/formatters';
import KPICard from './KPICard';
import AlertBanner from './AlertBanner';

interface Props {
  weeks: WeekData[];
  summary: Summary | null;
  advice: { week_label: string | null; advice: Advice[] };
}

export default function Overview({ weeks, summary, advice }: Props) {
  const latest = weeks[weeks.length - 1];
  const prev = weeks.length > 1 ? weeks[weeks.length - 2] : null;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Total Spend"
          value={fmtDollar(summary?.totalSpend)}
          data={weeks.map(w => w.spend ?? 0)}
          currentValue={latest?.spend}
          previousValue={prev?.spend}
          higherIsBetter={false}
        />
        <KPICard
          title="Total Leads"
          value={fmtInt(summary?.totalLeads)}
          data={weeks.map(w => w.leads ?? 0)}
          currentValue={latest?.leads}
          previousValue={prev?.leads}
          color="#8b5cf6"
        />
        <KPICard
          title="Avg CPL"
          value={fmtDollar(summary?.avgCPL)}
          data={weeks.map(w => w.cost_per_lead ?? 0)}
          currentValue={latest?.cost_per_lead}
          previousValue={prev?.cost_per_lead}
          higherIsBetter={false}
          color="#f59e0b"
        />
        <KPICard
          title="New Clients"
          value={fmtInt(summary?.totalClients)}
          data={weeks.map(w => w.new_clients ?? 0)}
          currentValue={latest?.new_clients}
          previousValue={prev?.new_clients}
          color="#10b981"
        />
        <KPICard
          title="Revenue"
          value={fmtDollar(summary?.totalRevenue)}
          data={weeks.map(w => w.revenue ?? 0)}
          currentValue={latest?.revenue}
          previousValue={prev?.revenue}
          color="#10b981"
        />
        <KPICard
          title="ROAS"
          value={fmtX(summary?.overallROAS)}
          data={weeks.map(w => w.roas ?? 0)}
          currentValue={latest?.roas}
          previousValue={prev?.roas}
          color={summary?.overallROAS != null && summary.overallROAS >= 1 ? '#10b981' : '#ef4444'}
        />
      </div>

      {/* Advice */}
      {advice.advice.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            Insights — {advice.week_label || 'Latest Week'}
          </h2>
          <AlertBanner advice={advice.advice} />
        </div>
      )}

      {/* Weekly Table */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Weekly Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">Week</th>
                <th className="text-right py-2 px-3">Spend</th>
                <th className="text-right py-2 px-3">Leads</th>
                <th className="text-right py-2 px-3">CPL</th>
                <th className="text-right py-2 px-3">Attend.</th>
                <th className="text-right py-2 px-3">Clients</th>
                <th className="text-right py-2 px-3">Revenue</th>
                <th className="text-right py-2 px-3">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.week_label} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                  <td className="py-2 px-3 text-white font-medium">{w.week_label}</td>
                  <td className="py-2 px-3 text-right">{fmtDollar(w.spend)}</td>
                  <td className="py-2 px-3 text-right">{fmtInt(w.leads)}</td>
                  <td className="py-2 px-3 text-right">{fmtDollar(w.cost_per_lead)}</td>
                  <td className="py-2 px-3 text-right">{fmtInt(w.attendees)}</td>
                  <td className="py-2 px-3 text-right">{fmtInt(w.new_clients)}</td>
                  <td className="py-2 px-3 text-right">{fmtDollar(w.revenue)}</td>
                  <td className={`py-2 px-3 text-right ${w.roas != null && w.roas < 1 ? 'text-red-400' : 'text-green-400'}`}>
                    {fmtX(w.roas)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
