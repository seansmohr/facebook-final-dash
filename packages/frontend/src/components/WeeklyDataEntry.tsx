import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { WeekData, WEEK_LABELS_2026 } from '../types';
import { calculate } from '../utils/calculations';
import { fmtDollar, fmtPct, fmtFloat } from '../utils/formatters';

interface Props {
  weeks: WeekData[];
  onSaved: () => void;
}

const EMPTY_FORM: Record<string, any> = {
  spend: '', leads: '', cpm: '', ctr: '',
  impressions: '', reach: '', link_clicks: '', landing_page_views: '',
  hook_rate: '', hold_rate: '',
  attendees: '', autobooked_appts: '', total_appts: '',
  appts_due: '', live_calls: '', new_clients: '',
  future_sales: '', proj_close_rate: '65',
  revenue: '', avg_fyc: '', notes: '',
};

export default function WeeklyDataEntry({ weeks, onSaved }: Props) {
  const existingLabels = new Set(weeks.map(w => w.week_label));
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [form, setForm] = useState<Record<string, any>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!selectedWeek) {
      const firstEmpty = WEEK_LABELS_2026.find(l => !existingLabels.has(l));
      const latestWithData = weeks.length > 0 ? weeks[weeks.length - 1].week_label : null;
      setSelectedWeek(latestWithData || firstEmpty || WEEK_LABELS_2026[0]);
    }
  }, [weeks]);

  useEffect(() => {
    if (!selectedWeek) return;
    const existing = weeks.find(w => w.week_label === selectedWeek);
    if (existing) {
      const loaded: Record<string, any> = {};
      for (const key of Object.keys(EMPTY_FORM)) {
        loaded[key] = existing[key as keyof WeekData] ?? '';
      }
      setForm(loaded);
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setSaveMsg('');
  }, [selectedWeek, weeks]);

  const calc = useMemo(() => {
    const numForm: Record<string, any> = {};
    for (const [k, v] of Object.entries(form)) {
      if (k === 'notes') continue;
      numForm[k] = v === '' || v === null ? null : Number(v);
    }
    return calculate(numForm);
  }, [form]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaveMsg('');
  };

  const handleSave = async () => {
    if (!selectedWeek) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const payload: Record<string, any> = {};
      for (const [k, v] of Object.entries(form)) {
        if (k === 'notes') {
          payload[k] = v;
        } else {
          payload[k] = v === '' || v === null ? null : Number(v);
        }
      }
      await api.saveWeek(selectedWeek, payload);
      setSaveMsg('Saved!');
      onSaved();
    } catch (err: any) {
      setSaveMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWeek || !confirm(`Delete all data for ${selectedWeek}?`)) return;
    try {
      await api.deleteWeek(selectedWeek);
      onSaved();
      setSaveMsg('Deleted');
    } catch (err: any) {
      setSaveMsg(`Error: ${err.message}`);
    }
  };

  const jumpToNextEmpty = () => {
    const next = WEEK_LABELS_2026.find(l => !existingLabels.has(l));
    if (next) setSelectedWeek(next);
  };

  const NumInput = ({ label, field, prefix, suffix }: { label: string; field: string; prefix?: string; suffix?: string }) => (
    <div className="flex items-center gap-2 mb-2">
      <label className="text-sm text-slate-400 w-40 shrink-0">{label}</label>
      <div className="flex items-center bg-slate-700 rounded border border-slate-600 flex-1">
        {prefix && <span className="text-slate-400 pl-2 text-sm">{prefix}</span>}
        <input
          type="number"
          step="any"
          value={form[field] ?? ''}
          onChange={e => handleChange(field, e.target.value)}
          className="bg-transparent px-2 py-1.5 text-white text-sm w-full focus:outline-none"
        />
        {suffix && <span className="text-slate-400 pr-2 text-sm">{suffix}</span>}
      </div>
    </div>
  );

  const CalcRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1.5 border-b border-slate-700/50">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Week selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedWeek}
          onChange={e => setSelectedWeek(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {WEEK_LABELS_2026.map(label => (
            <option key={label} value={label}>
              {label} {existingLabels.has(label) ? '\u2713' : ''}
            </option>
          ))}
        </select>
        <button
          onClick={jumpToNextEmpty}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Jump to Next Empty {'\u2192'}
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Inputs */}
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-3">Meta Ads Manager</h3>
            <NumInput label="Ad Spend" field="spend" prefix="$" />
            <NumInput label="Leads" field="leads" />
            <NumInput label="CPM" field="cpm" prefix="$" />
            <NumInput label="CTR" field="ctr" suffix="%" />
            <NumInput label="Impressions" field="impressions" />
            <NumInput label="Reach" field="reach" />
            <NumInput label="Link Clicks" field="link_clicks" />
            <NumInput label="Landing Page Views" field="landing_page_views" />
            <NumInput label="Hook Rate" field="hook_rate" suffix="%" />
            <NumInput label="Hold Rate" field="hold_rate" suffix="%" />
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide mb-3">Funnel Metrics</h3>
            <NumInput label="Attendees" field="attendees" />
            <NumInput label="Autobooked Appts" field="autobooked_appts" />
            <NumInput label="Total Appts" field="total_appts" />
            <NumInput label="Appts Due" field="appts_due" />
            <NumInput label="Live Calls" field="live_calls" />
            <NumInput label="New Clients" field="new_clients" />
            <NumInput label="Future Sales" field="future_sales" />
            <NumInput label="Proj Close Rate" field="proj_close_rate" suffix="%" />
            <NumInput label="Revenue" field="revenue" prefix="$" />
            <NumInput label="Avg FYC" field="avg_fyc" prefix="$" />
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Notes</h3>
            <textarea
              value={form.notes || ''}
              onChange={e => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Weekly notes, observations, changes made..."
            />
          </div>
        </div>

        {/* RIGHT: Auto-calculated */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3">Auto-Calculated</h3>
          <div className="space-y-0">
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-2 mb-1">Meta Metrics</div>
            <CalcRow label="CPC" value={calc.cpc != null ? fmtDollar(calc.cpc) : '\u2014'} />
            <CalcRow label="Connect Rate" value={calc.connect_rate != null ? `${calc.connect_rate.toFixed(1)}%` : '\u2014'} />
            <CalcRow label="CVR (Page)" value={calc.cvr != null ? `${calc.cvr.toFixed(1)}%` : '\u2014'} />
            <CalcRow label="Cost Per Lead" value={calc.cost_per_lead != null ? fmtDollar(calc.cost_per_lead) : '\u2014'} />
            <CalcRow label="Frequency" value={calc.frequency != null ? fmtFloat(calc.frequency) : '\u2014'} />

            <div className="text-xs text-slate-500 uppercase tracking-wide mt-4 mb-1">Funnel Metrics</div>
            <CalcRow label="Attendee %" value={calc.attendee_pct != null ? fmtPct(calc.attendee_pct) : '\u2014'} />
            <CalcRow label="Autobook Rate" value={calc.autobook_rate != null ? fmtPct(calc.autobook_rate) : '\u2014'} />
            <CalcRow label="Lead \u2192 Appt Rate" value={calc.lead_to_appt_rate != null ? fmtPct(calc.lead_to_appt_rate) : '\u2014'} />
            <CalcRow label="Cost per Appt" value={calc.cost_per_appt != null ? fmtDollar(calc.cost_per_appt) : '\u2014'} />
            <CalcRow label="Appt \u2192 Live Call Rate" value={calc.appt_to_live_rate != null ? fmtPct(calc.appt_to_live_rate) : '\u2014'} />
            <CalcRow label="Close Rate" value={calc.close_rate != null ? fmtPct(calc.close_rate) : '\u2014'} />

            <div className="text-xs text-slate-500 uppercase tracking-wide mt-4 mb-1">Revenue & ROI</div>
            <CalcRow label="CPA" value={calc.cpa != null ? fmtDollar(calc.cpa) : '\u2014'} />
            <CalcRow label="Total Sales (incl Proj)" value={calc.total_sales_proj != null ? fmtFloat(calc.total_sales_proj, 1) : '\u2014'} />
            <CalcRow label="Proj CPA" value={calc.proj_cpa != null ? fmtDollar(calc.proj_cpa) : '\u2014'} />
            <CalcRow label="Conversion Rate" value={calc.conversion_rate != null ? fmtPct(calc.conversion_rate) : '\u2014'} />
            <CalcRow label="Proj Conversion Rate" value={calc.proj_conversion_rate != null ? fmtPct(calc.proj_conversion_rate) : '\u2014'} />
            <CalcRow label="ROAS" value={calc.roas != null ? `${calc.roas.toFixed(2)}x` : '\u2014'} />
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !selectedWeek}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save Week'}
        </button>
        {existingLabels.has(selectedWeek) && (
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 text-red-400 hover:text-red-300 text-sm"
          >
            Delete Week
          </button>
        )}
        {saveMsg && (
          <span className={`text-sm ${saveMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {saveMsg}
          </span>
        )}
      </div>
    </div>
  );
}
