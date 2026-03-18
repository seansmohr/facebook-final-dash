import React from 'react';
import { WeekData } from '../types';
import { fmtDollar, fmtInt, fmtPct, fmtX, fmtFloat } from '../utils/formatters';

interface Props {
  weeks: WeekData[];
}

export default function FullFunnel({ weeks }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="text-xs whitespace-nowrap">
        <thead>
          {/* Group headers */}
          <tr className="border-b border-slate-700">
            <th className="sticky left-0 bg-slate-900 z-10 px-2 py-1"></th>
            <th colSpan={10} className="text-blue-400 px-2 py-1 text-left font-semibold">Meta Metrics</th>
            <th colSpan={5} className="text-purple-400 px-2 py-1 text-left font-semibold">Webinar</th>
            <th colSpan={5} className="text-amber-400 px-2 py-1 text-left font-semibold">Sales Pipeline</th>
            <th colSpan={6} className="text-green-400 px-2 py-1 text-left font-semibold">Revenue & ROI</th>
          </tr>
          {/* Column headers */}
          <tr className="border-b border-slate-700 text-slate-400">
            <th className="sticky left-0 bg-slate-900 z-10 text-left px-2 py-2">Week</th>
            {/* Meta */}
            <th className="text-right px-2 py-2">Spend</th>
            <th className="text-right px-2 py-2">Leads</th>
            <th className="text-right px-2 py-2">CPM</th>
            <th className="text-right px-2 py-2">CTR</th>
            <th className="text-right px-2 py-2">CPC</th>
            <th className="text-right px-2 py-2">Conn%</th>
            <th className="text-right px-2 py-2">CVR%</th>
            <th className="text-right px-2 py-2">Hook%</th>
            <th className="text-right px-2 py-2">Hold%</th>
            <th className="text-right px-2 py-2">Freq</th>
            {/* Webinar */}
            <th className="text-right px-2 py-2">Attend</th>
            <th className="text-right px-2 py-2">Att%</th>
            <th className="text-right px-2 py-2">AutoBk</th>
            <th className="text-right px-2 py-2">TotAppts</th>
            <th className="text-right px-2 py-2">L{'\u2192'}A%</th>
            {/* Sales */}
            <th className="text-right px-2 py-2">Due</th>
            <th className="text-right px-2 py-2">LiveCalls</th>
            <th className="text-right px-2 py-2">A{'\u2192'}L%</th>
            <th className="text-right px-2 py-2">Clients</th>
            <th className="text-right px-2 py-2">Close%</th>
            {/* Revenue */}
            <th className="text-right px-2 py-2">Revenue</th>
            <th className="text-right px-2 py-2">FYC</th>
            <th className="text-right px-2 py-2">CPA</th>
            <th className="text-right px-2 py-2">ProjCPA</th>
            <th className="text-right px-2 py-2">ROAS</th>
            <th className="text-right px-2 py-2">Conv%</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map(w => (
            <tr key={w.week_label} className="border-b border-slate-700/50 hover:bg-slate-800/50">
              <td className="sticky left-0 bg-slate-900 z-10 px-2 py-2 text-white font-medium">{w.week_label}</td>
              {/* Meta */}
              <td className="text-right px-2 py-2">{fmtDollar(w.spend)}</td>
              <td className="text-right px-2 py-2">{fmtInt(w.leads)}</td>
              <td className="text-right px-2 py-2">{w.cpm != null ? fmtDollar(w.cpm) : '\u2014'}</td>
              <td className="text-right px-2 py-2">{w.ctr != null ? `${w.ctr.toFixed(2)}%` : '\u2014'}</td>
              <td className="text-right px-2 py-2">{w.cpc != null ? fmtDollar(w.cpc) : '\u2014'}</td>
              <td className={`text-right px-2 py-2 ${w.connect_rate != null && w.connect_rate < 70 ? 'text-red-400' : ''}`}>
                {w.connect_rate != null ? `${w.connect_rate.toFixed(1)}%` : '\u2014'}
              </td>
              <td className={`text-right px-2 py-2 ${w.cvr != null && w.cvr < 15 ? 'text-red-400' : ''}`}>
                {w.cvr != null ? `${w.cvr.toFixed(1)}%` : '\u2014'}
              </td>
              <td className={`text-right px-2 py-2 ${w.hook_rate != null && w.hook_rate < 25 ? 'text-amber-400' : ''}`}>
                {w.hook_rate != null ? `${w.hook_rate.toFixed(1)}%` : '\u2014'}
              </td>
              <td className="text-right px-2 py-2">{w.hold_rate != null ? `${w.hold_rate.toFixed(1)}%` : '\u2014'}</td>
              <td className={`text-right px-2 py-2 ${w.frequency != null && w.frequency > 3 ? 'text-red-400' : ''}`}>
                {w.frequency != null ? fmtFloat(w.frequency) : '\u2014'}
              </td>
              {/* Webinar */}
              <td className="text-right px-2 py-2">{fmtInt(w.attendees)}</td>
              <td className="text-right px-2 py-2">{w.attendee_pct != null ? fmtPct(w.attendee_pct) : '\u2014'}</td>
              <td className="text-right px-2 py-2">{fmtInt(w.autobooked_appts)}</td>
              <td className="text-right px-2 py-2">{fmtInt(w.total_appts)}</td>
              <td className="text-right px-2 py-2">{w.lead_to_appt_rate != null ? fmtPct(w.lead_to_appt_rate) : '\u2014'}</td>
              {/* Sales */}
              <td className="text-right px-2 py-2">{fmtInt(w.appts_due)}</td>
              <td className="text-right px-2 py-2">{fmtInt(w.live_calls)}</td>
              <td className="text-right px-2 py-2">{w.appt_to_live_rate != null ? fmtPct(w.appt_to_live_rate) : '\u2014'}</td>
              <td className="text-right px-2 py-2">{fmtInt(w.new_clients)}</td>
              <td className={`text-right px-2 py-2 ${w.close_rate != null && w.close_rate < 0.20 ? 'text-red-400' : ''}`}>
                {w.close_rate != null ? fmtPct(w.close_rate) : '\u2014'}
              </td>
              {/* Revenue */}
              <td className="text-right px-2 py-2">{fmtDollar(w.revenue)}</td>
              <td className="text-right px-2 py-2">{w.avg_fyc != null ? fmtDollar(w.avg_fyc) : '\u2014'}</td>
              <td className={`text-right px-2 py-2 ${w.cpa != null && w.cpa > 500 ? 'text-red-400' : ''}`}>
                {w.cpa != null ? fmtDollar(w.cpa) : '\u2014'}
              </td>
              <td className="text-right px-2 py-2">{w.proj_cpa != null ? fmtDollar(w.proj_cpa) : '\u2014'}</td>
              <td className={`text-right px-2 py-2 ${w.roas != null ? (w.roas < 1 ? 'text-red-400' : 'text-green-400') : ''}`}>
                {fmtX(w.roas)}
              </td>
              <td className="text-right px-2 py-2">{w.conversion_rate != null ? fmtPct(w.conversion_rate) : '\u2014'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
