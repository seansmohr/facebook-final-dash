import React, { useState, useEffect, useCallback } from 'react';
import { api, hasToken, setToken } from './api';
import { WeekData, Summary, Advice } from './types';
import AuthGate from './components/AuthGate';
import Layout from './components/Layout';
import Overview from './components/Overview';
import WeeklyDataEntry from './components/WeeklyDataEntry';
import MetaMetrics from './components/MetaMetrics';
import FullFunnel from './components/FullFunnel';
import Insights from './components/Insights';

type Tab = 'overview' | 'entry' | 'meta' | 'funnel' | 'insights';

export default function App() {
  const [authed, setAuthed] = useState(hasToken());
  const [tab, setTab] = useState<Tab>('overview');
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [latestAdvice, setLatestAdvice] = useState<{ week_label: string | null; advice: Advice[] }>({ week_label: null, advice: [] });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [w, s, a] = await Promise.all([
        api.getWeeks(),
        api.getSummary(),
        api.getLatestAdvice(),
      ]);
      setWeeks(w);
      setSummary(s);
      setLatestAdvice(a);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed, fetchAll]);

  const handleLogin = async (password: string) => {
    const token = await api.login(password);
    setToken(token);
    setAuthed(true);
  };

  const handleSaved = () => {
    fetchAll();
  };

  if (!authed) {
    return <AuthGate onLogin={handleLogin} />;
  }

  return (
    <Layout currentTab={tab} onTabChange={setTab}>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400 text-lg">Loading dashboard...</div>
        </div>
      ) : (
        <>
          {tab === 'overview' && (
            <Overview weeks={weeks} summary={summary} advice={latestAdvice} />
          )}
          {tab === 'entry' && (
            <WeeklyDataEntry weeks={weeks} onSaved={handleSaved} />
          )}
          {tab === 'meta' && (
            <MetaMetrics weeks={weeks} />
          )}
          {tab === 'funnel' && (
            <FullFunnel weeks={weeks} />
          )}
          {tab === 'insights' && (
            <Insights weeks={weeks} />
          )}
        </>
      )}
    </Layout>
  );
}
