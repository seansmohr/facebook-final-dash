import React from 'react';
import { WeekData } from '../types';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { fmtDollar, fmtFloat } from '../utils/formatters';

interface Props {
  weeks: WeekData[];
}

interface MetricConfig {
  key: string;
  label: string;
  color: string;
  format: (v: any) => string;
  threshold?: { value: number; label: string; color: string };
  getValue: (w: WeekData) => number | null;
}

const METRICS: MetricConfig[] = [
  {
    key: 'cpm', label: 'CPM', color: '#f59e0b',
    format: (v: number) => fmtDollar(v),
    getValue: w => w.cpm,
  },
  {
    key: 'ctr', label: 'CTR', color: '#8b5cf6',
    format: (v: number) => `${v.toFixed(2)}%`,
    getValue: w => w.ctr,
  },
  {
    key: 'cpc', label: 'CPC', color: '#3b82f6',
    format: (v: number) => fmtDollar(v),
    getValue: w => w.cpc,
  },
  {
    key: 'connect_rate', label: 'Connect Rate', color: '#10b981',
    format: (v: number) => `${v.toFixed(1)}%`,
    threshold: { value: 70, label: '70% min', color: '#ef4444' },
    getValue: w => w.connect_rate,
  },
  {
    key: 'cvr', label: 'CVR (Page)', color: '#06b6d4',
    format: (v: number) => `${v.toFixed(1)}%`,
    threshold: { value: 15, label: '15% min', color: '#ef4444' },
    getValue: w => w.cvr,
  },
  {
    key: 'hook_rate', label: 'Hook Rate', color: '#ec4899',
    format: (v: number) => `${v.toFixed(1)}%`,
    threshold: { value: 25, label: '25% min', color: '#f59e0b' },
    getValue: w => w.hook_rate,
  },
  {
    key: 'hold_rate', label: 'Hold Rate', color: '#a855f7',
    format: (v: number) => `${v.toFixed(1)}%`,
    getValue: w => w.hold_rate,
  },
  {
    key: 'frequency', label: 'Frequency', color: '#f97316',
    format: (v: number) => fmtFloat(v),
    threshold: { value: 3.0, label: '3.0 max', color: '#ef4444' },
    getValue: w => w.frequency,
  },
  {
    key: 'cost_per_lead', label: 'Cost Per Lead', color: '#ef4444',
    format: (v: number) => fmtDollar(v),
    getValue: w => w.cost_per_lead,
  },
];

export default function MetaMetrics({ weeks }: Props) {
  const chartData = weeks.map(w => {
    const point: Record<string, any> = { week: w.week_label };
    for (const m of METRICS) {
      point[m.key] = m.getValue(w);
    }
    return point;
  });

  const latest = weeks[weeks.length - 1];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {METRICS.map(metric => {
        const currentVal = latest ? metric.getValue(latest) : null;
        const hasData = chartData.some(d => d[metric.key] != null);
        return (
          <div key={metric.key} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-slate-400">{metric.label}</div>
              <div className="text-lg font-bold text-white">
                {currentVal != null ? metric.format(currentVal) : '\u2014'}
              </div>
            </div>
            {hasData && (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      width={45}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [metric.format(val), metric.label]}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    {metric.threshold && (
                      <ReferenceLine
                        y={metric.threshold.value}
                        stroke={metric.threshold.color}
                        strokeDasharray="3 3"
                        label={{ value: metric.threshold.label, fill: metric.threshold.color, fontSize: 10 }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey={metric.key}
                      stroke={metric.color}
                      strokeWidth={2}
                      dot={{ r: 3, fill: metric.color }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
