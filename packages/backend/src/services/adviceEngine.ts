/**
 * Actionable Advice Engine (v2)
 *
 * THIS IS THE KEY FEATURE of the dashboard.
 * Analyzes weekly data + trends to generate specific, actionable recommendations.
 *
 * Each piece of advice:
 * - Cites the exact numbers driving the recommendation
 * - Provides 2-4 specific action steps
 * - Is prioritized by severity (critical > warning > info > positive)
 *
 * v2 additions: Hook Rate, Hold Rate, CVR, Frequency advice rules.
 */

export interface WeekData {
  week_label: string;
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
  attendees: number | null;
  total_appts: number | null;
  appts_due: number | null;
  live_calls: number | null;
  new_clients: number | null;
  future_sales: number | null;
  revenue: number | null;
  avg_fyc: number | null;
  // Calculated
  cpc: number | null;
  connect_rate: number | null;
  cvr: number | null;
  cost_per_lead: number | null;
  frequency: number | null;
  attendee_pct: number | null;
  close_rate: number | null;
  appt_to_live_rate: number | null;
  cpa: number | null;
  roas: number | null;
  total_sales_proj: number | null;
  proj_cpa: number | null;
}

export interface Advice {
  type: 'critical' | 'warning' | 'info' | 'positive';
  title: string;
  message: string;
  actions: string[];
}

const fmt$ = (v: number) => `$${v.toFixed(2)}`;
const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;
const fmtPctDirect = (v: number) => `${v.toFixed(1)}%`;

export function generateAdvice(
  current: WeekData,
  previous: WeekData | null,
  fourWeekAvg: Partial<WeekData> | null
): Advice[] {
  const advice: Advice[] = [];

  if (!current.spend || !current.leads) return advice;

  const cpl = current.cost_per_lead ?? (current.spend / current.leads);
  const prevCpl = previous?.cost_per_lead ??
    (previous?.spend && previous?.leads ? previous.spend / previous.leads : null);

  // ─── LEAD QUALITY DEGRADATION ───
  if (
    previous &&
    current.ctr && previous.ctr && current.ctr > previous.ctr &&
    prevCpl && cpl > prevCpl
  ) {
    const ctrChange = ((current.ctr / previous.ctr - 1) * 100).toFixed(0);
    const cplChange = ((cpl / prevCpl - 1) * 100).toFixed(0);
    advice.push({
      type: 'critical',
      title: 'Lead Quality Degradation Detected',
      message: `CTR is up ${ctrChange}% but CPL also rose ${cplChange}%. Your ads are attracting more clicks from lower-quality traffic. Meta is likely expanding into audience segments that click but don't convert.`,
      actions: [
        'Check Ads Manager placement breakdown — if Audience Network share is growing, exclude it',
        'Review age/gender breakdown for segments with high CTR but low conversion',
        'Consider narrowing your audience or pulling budget back 15-20% to force Meta to focus on your core audience',
        'If running Advantage+ placements, switch to manual placements and exclude low-performing ones',
      ],
    });
  }

  // ─── CONNECT RATE DROP ───
  if (current.connect_rate != null && current.connect_rate < 70) {
    advice.push({
      type: 'critical',
      title: 'Low Connect Rate — Traffic Quality Issue',
      message: `Only ${fmtPctDirect(current.connect_rate)} of ad clickers are reaching your landing page. ${(100 - current.connect_rate).toFixed(0)}% of clicks are wasted.`,
      actions: [
        'Review placement breakdown — Audience Network, Reels, and Stories often generate accidental clicks',
        'Exclude any placement with connect rate below 60%',
        'Test landing page load speed on mobile (aim for under 3 seconds)',
        'Check if the drop correlates with increased mobile traffic share',
      ],
    });
  } else if (
    previous &&
    current.connect_rate != null && previous.connect_rate != null &&
    current.connect_rate < previous.connect_rate - 5
  ) {
    advice.push({
      type: 'warning',
      title: 'Connect Rate Declining',
      message: `Connect rate dropped from ${fmtPctDirect(previous.connect_rate)} to ${fmtPctDirect(current.connect_rate)}.`,
      actions: [
        'Check if Meta shifted delivery to different placements this week',
        'Review mobile vs desktop split — mobile connect rates are typically lower',
        'Verify landing page is loading properly on all devices',
      ],
    });
  }

  // ─── CVR (LANDING PAGE CONVERSION RATE) ───
  if (current.cvr != null && current.cvr < 15) {
    advice.push({
      type: 'warning',
      title: 'Low Landing Page Conversion Rate',
      message: `Landing page CVR at ${fmtPctDirect(current.cvr)}. Traffic is reaching the page but not registering.`,
      actions: [
        'Check page load speed on mobile — slow pages kill conversion',
        'Simplify the registration form (name + email + phone only)',
        'Ensure headline matches the ad promise — message mismatch causes drop-off',
        'Test the page yourself on multiple devices and browsers',
      ],
    });
  } else if (
    previous &&
    current.cvr != null && previous.cvr != null &&
    current.cvr < previous.cvr * 0.80
  ) {
    const drop = ((1 - current.cvr / previous.cvr) * 100).toFixed(0);
    advice.push({
      type: 'warning',
      title: 'Landing Page CVR Dropping',
      message: `CVR dropped ${drop}% from ${fmtPctDirect(previous.cvr)} to ${fmtPctDirect(current.cvr)}.`,
      actions: [
        'Check if you changed the landing page recently',
        'Verify the form is submitting properly (test a registration yourself)',
        'Review traffic quality — if connect rate also dropped, issue is upstream',
      ],
    });
  }

  // ─── HOOK RATE ───
  if (current.hook_rate != null && current.hook_rate < 25) {
    advice.push({
      type: 'warning',
      title: 'Low Hook Rate — Creative Not Grabbing Attention',
      message: `Hook rate at ${fmtPctDirect(current.hook_rate)}. Most viewers scroll past before your message lands.`,
      actions: [
        'Test a new opening hook — lead with the most provocative or surprising claim in the first 2 seconds',
        'Try pattern interrupts: bold text overlays, sudden movement, direct-to-camera opening',
        'Test UGC-style creative vs polished — raw/authentic often hooks better in the feed',
        'Front-load the value proposition — don\'t build up to it',
      ],
    });
  }

  // ─── HOLD RATE DECLINING ───
  if (
    previous &&
    current.hold_rate != null && previous.hold_rate != null &&
    current.hold_rate < previous.hold_rate * 0.80
  ) {
    const drop = ((1 - current.hold_rate / previous.hold_rate) * 100).toFixed(0);
    advice.push({
      type: 'warning',
      title: 'Hold Rate Declining — Creative Fatigue Signal',
      message: `Hold rate dropped ${drop}% (${fmtPctDirect(previous.hold_rate)} → ${fmtPctDirect(current.hold_rate)}). People are recognizing your ad and scrolling past.`,
      actions: [
        'Launch new creative variations ASAP — don\'t wait for performance to crater',
        'Test new angles and hooks while keeping the same offer/CTA',
        'If using the same video for 2+ weeks, it\'s likely fatiguing — rotate in fresh creative',
        'Consider testing a completely different ad format (carousel, static image, different video style)',
      ],
    });
  }

  // ─── FREQUENCY ───
  if (current.frequency != null && current.frequency > 3.0) {
    advice.push({
      type: 'warning',
      title: 'High Frequency — Audience Oversaturation',
      message: `Frequency at ${current.frequency.toFixed(1)}x — you're showing the same ad to the same people too many times.`,
      actions: [
        'Expand your audience targeting to reach new people',
        'Rotate in fresh creative — even good ads annoy people after too many views',
        'Exclude recent converters and website visitors from targeting',
        'Consider lookalike audience expansion or interest-based broadening',
      ],
    });
  }

  // ─── CPL SPIKE ───
  if (prevCpl && cpl > prevCpl * 1.15) {
    const pctIncrease = ((cpl / prevCpl - 1) * 100).toFixed(0);
    advice.push({
      type: 'warning',
      title: 'CPL Spiking',
      message: `Cost per lead jumped ${pctIncrease}% (${fmt$(prevCpl)} → ${fmt$(cpl)}).`,
      actions: [
        current.ctr && previous?.ctr && current.ctr >= previous.ctr
          ? 'CTR is stable/rising, so this is a conversion problem — check landing page CVR and connect rate'
          : 'CTR is also declining — creative may be fatiguing. Check hook rate and hold rate trends.',
        'Check if you recently increased budget — rapid increases cause CPL spikes during re-learning',
        fourWeekAvg?.cost_per_lead
          ? `Your 4-week average CPL is ${fmt$(fourWeekAvg.cost_per_lead)}. If this week is an outlier, wait before making changes.`
          : 'Compare against your last 4 weeks to determine if this is a trend or outlier',
      ],
    });
  }

  // ─── ATTENDANCE RATE ───
  if (current.attendee_pct != null && current.attendee_pct < 0.20) {
    advice.push({
      type: 'warning',
      title: 'Low Webinar Attendance',
      message: `Only ${fmtPct(current.attendee_pct)} of registrants attended. You're paying for leads that never see your presentation.`,
      actions: [
        'Add/strengthen email reminder sequence: day before + 1 hour before + "starting now"',
        'Add SMS reminders via GHL — text messages have higher open rates than email',
        'Consider webinar timing — test different days/times if attendance is consistently low',
        'Check if ad creative is setting proper expectations about what the webinar covers',
      ],
    });
  }

  // ─── CLOSE RATE ───
  if (current.close_rate != null && current.close_rate < 0.20) {
    advice.push({
      type: 'warning',
      title: 'Close Rate Below Threshold',
      message: `Close rate at ${fmtPct(current.close_rate)}${previous?.close_rate != null ? ` (was ${fmtPct(previous.close_rate)} last week)` : ''}.`,
      actions: [
        'Review call recordings for common objection patterns — spouse objection, "I already have Medicare"',
        'Check if lead quality degraded upstream (rising CPL + falling connect rate = lower-intent leads)',
        'Evaluate appointment-to-live-call rate — if prospects aren\'t showing up, issue is pre-call nurturing',
        'Consider refreshing sales script or running team training on the two-call close process',
      ],
    });
  }

  // ─── HIGH NO-SHOW RATE ───
  if (current.appt_to_live_rate != null && current.appt_to_live_rate < 0.50) {
    advice.push({
      type: 'warning',
      title: 'High No-Show Rate',
      message: `Only ${fmtPct(current.appt_to_live_rate)} of scheduled appointments became live calls.`,
      actions: [
        'Implement confirmation call/text 24 hours before appointment (GHL automation)',
        'Send a "looking forward to our call" text 1 hour before',
        'Pre-qualify harder during the appointment booking step',
        'Book same-day or next-day when possible — longer gaps increase no-shows',
      ],
    });
  }

  // ─── ROAS ───
  if (current.roas != null && current.roas < 1.0) {
    const breakEvenCPA = current.avg_fyc ?? 0;
    advice.push({
      type: 'critical',
      title: 'Negative ROAS — Losing Money',
      message: `ROAS at ${current.roas.toFixed(2)}x. Current CPA is ${current.cpa ? fmt$(current.cpa) : 'N/A'}.`,
      actions: [
        breakEvenCPA > 0
          ? `To break even, CPA needs to be below ${fmt$(breakEvenCPA)}. Improve close rate — even 5% improvement dramatically reduces CPA.`
          : 'Calculate your break-even CPA based on average first-year commission.',
        current.total_sales_proj && current.proj_cpa
          ? `Including ${current.future_sales ?? 0} pipeline deals at 65% close, projected CPA improves to ${fmt$(current.proj_cpa)}. Work those pipeline deals.`
          : 'Factor in pipeline deals — projected numbers may be healthier than current actuals.',
        'If negative ROAS for 2+ consecutive weeks, reduce ad spend and focus on closing existing pipeline',
      ],
    });
  }

  // ─── CPM RISING BUT PERFORMANCE HOLDS ───
  if (
    previous &&
    current.cpm && previous.cpm &&
    current.cpm > previous.cpm * 1.15 &&
    current.close_rate != null &&
    (previous.close_rate == null || current.close_rate >= previous.close_rate * 0.9)
  ) {
    const cpmChange = ((current.cpm / previous.cpm - 1) * 100).toFixed(0);
    advice.push({
      type: 'info',
      title: 'CPM Rising — Auction Competition',
      message: `CPM up ${cpmChange}% ($${previous.cpm.toFixed(2)} → $${current.cpm.toFixed(2)}). Downstream metrics are holding — this is auction-driven, not a creative/funnel problem.`,
      actions: [
        'Don\'t change creative — the algorithm is still finding quality traffic',
        'If elevated for 2+ weeks, consider testing broader audiences for cheaper inventory',
        'Check if this is seasonal — Medicare advertiser competition fluctuates around enrollment periods',
      ],
    });
  }

  // ─── EVERYTHING GOING WELL ───
  if (advice.length === 0 && current.roas != null && current.roas >= 1.0) {
    advice.push({
      type: 'positive',
      title: 'Strong Performance — Consider Scaling',
      message: `Good week. CPL at ${fmt$(cpl)}, ROAS at ${current.roas.toFixed(2)}x.${current.close_rate != null ? ` Close rate at ${fmtPct(current.close_rate)}.` : ''}`,
      actions: [
        'Consider gradually increasing budget by 10-15% to capture more volume at this efficiency',
        'Test new ad creative while your current winner is performing — build the next winner before it fatigues',
        'Document what\'s working this week (audience, creative, placements) as your baseline benchmark',
      ],
    });
  }

  // Sort by severity and return max 4
  const order = { critical: 0, warning: 1, info: 2, positive: 3 };
  advice.sort((a, b) => order[a.type] - order[b.type]);
  return advice.slice(0, 4);
}
