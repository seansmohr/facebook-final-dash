import React from 'react';
import { trendColor, trendArrow, wowChange } from '../utils/formatters';
import Sparkline from './Sparkline';

interface Props {
  title: string;
  value: string;
  previousValue?: number | null;
  currentValue?: number | null;
  data: number[];
  higherIsBetter?: boolean;
  color?: string;
}

export default function KPICard({
  title, value, previousValue, currentValue,
  data, higherIsBetter = true, color = '#3b82f6',
}: Props) {
  const change = wowChange(currentValue ?? null, previousValue ?? null);
  const colorClass = trendColor(currentValue ?? null, previousValue ?? null, higherIsBetter);
  const arrow = trendArrow(currentValue ?? null, previousValue ?? null);

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="text-sm text-slate-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {change && (
        <div className={`text-sm ${colorClass} mb-2`}>
          {arrow} {change} WoW
        </div>
      )}
      {data.length > 1 && (
        <div className="h-10 mt-1">
          <Sparkline data={data} color={color} />
        </div>
      )}
    </div>
  );
}
