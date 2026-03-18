import React from 'react';
import { clearToken } from '../api';

type Tab = 'overview' | 'entry' | 'meta' | 'funnel' | 'insights';

interface Props {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'entry', label: 'Data Entry' },
  { key: 'meta', label: 'Meta Metrics' },
  { key: 'funnel', label: 'Full Funnel' },
  { key: 'insights', label: 'Insights' },
];

export default function Layout({ currentTab, onTabChange, children }: Props) {
  const handleBackup = () => {
    const token = localStorage.getItem('mohr_token');
    window.open(`/api/backup?token=${token}`, '_blank');
  };

  const handleLogout = () => {
    clearToken();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">
          Mohr Ads Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackup}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Backup
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="bg-slate-800/50 border-b border-slate-700 px-4 overflow-x-auto">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                currentTab === t.key
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
