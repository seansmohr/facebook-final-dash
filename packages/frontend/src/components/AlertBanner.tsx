import React, { useState } from 'react';
import { Advice } from '../types';

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string; titleColor: string }> = {
  critical: { bg: 'bg-red-900/30', border: 'border-red-500/50', icon: '\uD83D\uDEA8', titleColor: 'text-red-400' },
  warning: { bg: 'bg-amber-900/30', border: 'border-amber-500/50', icon: '\u26A0\uFE0F', titleColor: 'text-amber-400' },
  info: { bg: 'bg-blue-900/30', border: 'border-blue-500/50', icon: '\u2139\uFE0F', titleColor: 'text-blue-400' },
  positive: { bg: 'bg-green-900/30', border: 'border-green-500/50', icon: '\u2705', titleColor: 'text-green-400' },
};

interface Props {
  advice: Advice[];
}

export default function AlertBanner({ advice }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  if (advice.length === 0) return null;

  const toggle = (i: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {advice.map((a, i) => {
        const style = SEVERITY_STYLES[a.type] || SEVERITY_STYLES.info;
        const isOpen = expanded.has(i);
        return (
          <div
            key={i}
            className={`${style.bg} border ${style.border} rounded-lg p-4 cursor-pointer transition-all`}
            onClick={() => toggle(i)}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{style.icon}</span>
              <div className="flex-1">
                <div className={`font-semibold ${style.titleColor}`}>{a.title}</div>
                <div className="text-sm text-slate-300 mt-1">{a.message}</div>
                {isOpen && a.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</div>
                    {a.actions.map((action, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-blue-400 mt-0.5">{'\u2192'}</span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-slate-500 text-sm">{isOpen ? '\u25BC' : '\u25B6'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
