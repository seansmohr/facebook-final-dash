export interface WeekData {
  id?: number;
  week_label: string;

  // Meta Ads Manager inputs
  spend: number | null;
  leads: number | null;
  cpm: number | null;
  ctr: number | null;
  impressions: number | null;
  reach: number | null;
  link_clicks: number | null;
  landing_page_views: number | null;
  hook_rate: number | null;
  hold_rate: number | null;

  // Downstream funnel inputs
  attendees: number | null;
  autobooked_appts: number | null;
  total_appts: number | null;
  appts_due: number | null;
  live_calls: number | null;
  new_clients: number | null;
  future_sales: number | null;
  proj_close_rate: number;
  revenue: number | null;
  avg_fyc: number | null;
  notes: string;

  // Auto-calculated
  cpc: number | null;
  connect_rate: number | null;
  cvr: number | null;
  cost_per_lead: number | null;
  frequency: number | null;
  attendee_pct: number | null;
  autobook_rate: number | null;
  lead_to_appt_rate: number | null;
  cost_per_appt: number | null;
  appt_to_live_rate: number | null;
  close_rate: number | null;
  cpa: number | null;
  total_sales_proj: number | null;
  proj_cpa: number | null;
  conversion_rate: number | null;
  proj_conversion_rate: number | null;
  roas: number | null;
}

export interface Advice {
  type: 'critical' | 'warning' | 'info' | 'positive';
  title: string;
  message: string;
  actions: string[];
}

export interface Summary {
  weeksCount: number;
  totalSpend: number;
  totalLeads: number;
  totalClients: number;
  totalRevenue: number;
  totalAppts: number;
  totalLiveCalls: number;
  totalAttendees: number;
  avgCPL: number | null;
  avgCPA: number | null;
  overallROAS: number | null;
  overallCloseRate: number | null;
}

// All 2026 week labels for the dropdown
export const WEEK_LABELS_2026: string[] = [
  '1/4 - 1/10', '1/11 - 1/17', '1/18 - 1/24', '1/25 - 1/31',
  '2/1 - 2/7', '2/8 - 2/14', '2/9 - 2/15', '2/15 - 2/21', '2/16 - 2/22',
  '2/22 - 2/28', '2/23 - 3/1',
  '3/1 - 3/7', '3/2 - 3/8', '3/8 - 3/14', '3/9 - 3/15',
  '3/15 - 3/21', '3/16 - 3/22', '3/22 - 3/28', '3/23 - 3/29',
  '3/29 - 4/4', '3/30 - 4/5',
  '4/5 - 4/11', '4/6 - 4/12', '4/12 - 4/18', '4/13 - 4/19',
  '4/19 - 4/25', '4/20 - 4/26', '4/26 - 5/2', '4/27 - 5/3',
  '5/3 - 5/9', '5/4 - 5/10', '5/10 - 5/16', '5/11 - 5/17',
  '5/17 - 5/23', '5/18 - 5/24', '5/24 - 5/30', '5/25 - 5/31',
  '5/31 - 6/6', '6/1 - 6/7', '6/7 - 6/13', '6/8 - 6/14',
  '6/14 - 6/20', '6/15 - 6/21', '6/21 - 6/27', '6/22 - 6/28',
  '6/28 - 7/4', '6/29 - 7/5',
  '7/5 - 7/11', '7/6 - 7/12', '7/12 - 7/18', '7/13 - 7/19',
  '7/19 - 7/25', '7/20 - 7/26', '7/26 - 8/1', '7/27 - 8/2',
  '8/2 - 8/8', '8/3 - 8/9', '8/9 - 8/15', '8/10 - 8/16',
  '8/16 - 8/22', '8/17 - 8/23', '8/23 - 8/29', '8/24 - 8/30',
  '8/30 - 9/5', '8/31 - 9/6',
  '9/6 - 9/12', '9/7 - 9/13', '9/13 - 9/19', '9/14 - 9/20',
  '9/20 - 9/26', '9/21 - 9/27', '9/27 - 10/3', '9/28 - 10/4',
  '10/4 - 10/10', '10/5 - 10/11', '10/11 - 10/17', '10/12 - 10/18',
  '10/15 - 10/21', '10/18 - 10/24', '10/19 - 10/25',
  '10/25 - 10/31', '10/26 - 11/1',
  '11/1 - 11/7', '11/2 - 11/8', '11/8 - 11/14', '11/9 - 11/15',
  '11/15 - 11/21', '11/16 - 11/22', '11/22 - 11/28', '11/23 - 11/29',
  '11/29 - 12/5', '11/30 - 12/6',
  '12/6 - 12/12', '12/7 - 12/13', '12/13 - 12/19', '12/14 - 12/20',
  '12/20 - 12/26', '12/21 - 12/27', '12/27 - 1/2', '12/28 - 1/3',
];
