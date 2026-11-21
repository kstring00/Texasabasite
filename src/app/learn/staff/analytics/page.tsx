import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircleAlert, CircleCheck, Download, Filter } from 'lucide-react';
import { LcParticipationChart, type LcChartPoint } from '@/components/learn/staff/LcParticipationChart';
import { LcPrintButton } from '@/components/learn/staff/LcPrintButton';
import { getLcCategoryById, lcCategories } from '@/data/learn/categories';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { LC_GLOSSARY, LC_NOT_AVAILABLE, LC_REPORT_BANNER, LC_ROW_STATE, buildDashboard, canViewAnalytics, readReportQuery, reportTargets, type LcBreakdown, type LcDashboardRow, type LcSum } from '@/lib/learn/staff/reports';
import { getStaffStore } from '@/lib/learn/staff/store';
import { formatCtShortDate } from '@/lib/learn/time';

export const metadata: Metadata = { title: 'Reporting' };

const num = (n: number) => n.toLocaleString('en-US');
const day = (d: string) => formatCtShortDate(`${d}T18:00:00Z`);
const sumText = (s: LcSum) => (s.value === null ? LC_NOT_AVAILABLE : num(s.value));
/** Every total says how many trainings went into it, so a partial total is never mistaken for a full one. */
function coverage(s: LcSum): string {
  if (s.of === 0) return 'No finished trainings in this period.';
  if (s.counted === 0) return `Not entered yet for any of the ${s.of} finished trainings.`;
  if (s.counted < s.of) return `From ${s.counted} of ${s.of} finished trainings. ${s.of - s.counted} not yet available.`;
  return s.of === 1 ? 'From the 1 finished training.' : `From all ${s.of} finished trainings.`;
}
const bucketText = (s: LcSum) => (s.of === 0 ? 'No trainings' : s.value === null ? LC_NOT_AVAILABLE : s.counted < s.of ? `${num(s.value)} (from ${s.counted} of ${s.of})` : num(s.value));

function cellText(row: LcDashboardRow, which: 'registrationsTotal' | 'registrationsApproved' | 'attendancesTotal'): string {
  if (row.state === 'upcoming') return 'Not due yet';
  if (which === 'attendancesTotal' && (row.state === 'not_held' || row.state === 'cancelled')) return 'Not held';
  const n = row[which];
  return n === null ? LC_NOT_AVAILABLE : num(n);
}

function Breakdown({ id, title, what, b, minimum }: { id: string; title: string; what: string; b: LcBreakdown | null; minimum: number }) {
  return (
    <section aria-labelledby={id} className="lc-solid lc-panel">
      <h2 id={id} className="lc-h2">
        {title}
      </h2>
      {b ? (
        <>
          <div className="lc-table-wrap">
            <table className="lc-table lc-table-numbers lc-table-plain">
              <thead>
                <tr>
                  <th scope="col">{what}</th>
                  <th scope="col">Registrations submitted</th>
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r) => (
                  <tr key={r.key}>
                    <th scope="row">{r.label}</th>
                    <td>{r.count === null ? 'None, or too few to show' : num(r.count)}</td>
                  </tr>
                ))}
                {b.other > 0 ? (
                  <tr>
                    <th scope="row">Other / not displayed</th>
                    <td>{num(b.other)}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <p className="lc-muted">
            {num(b.total)} registrations from {b.counted} of {b.of} trainings with numbers entered. A count under {minimum} for one training is never shown on its own. It is added to “Other / not displayed” together with at least one other count, so it cannot be worked out by subtracting.
          </p>
        </>
      ) : (
        <p className="lc-muted">{LC_NOT_AVAILABLE}. No training in this period has this split entered.</p>
      )}
    </section>
  );
}

export default async function LearnStaffAnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  if (!canViewAnalytics(actor)) notFound();
  const store = getStaffStore();
  const now = new Date();
  const raw = await searchParams;
  const q = readReportQuery(raw, now);
  const everPublic = store.listings.filter((l) => l.publishedAt && l.training.startAtUtc).sort((a, b) => (b.training.startAtUtc ?? '').localeCompare(a.training.startAtUtc ?? ''));
  const trainingId = q.trainingId && everPublic.some((l) => l.id === q.trainingId) ? q.trainingId : undefined;
  const d = buildDashboard(store, actor, { from: q.range.from, to: q.range.to, categoryId: q.categoryId, trainingId }, now);
  if (!d) notFound();
  const waiting = reportTargets(store, actor, now).filter((x) => x.report === null);
  const saved = Array.isArray(raw.saved) ? raw.saved[0] : raw.saved;

  const weekly = d.buckets[0]?.kind !== 'month';
  const points: LcChartPoint[] = d.buckets.map((b) => ({
    label: weekly ? day(b.key).replace(/, \d{4}$/, '') : new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${b.key}-15T12:00:00Z`)),
    held: b.held, registrations: b.registrations.value, attendances: b.attendances.value, registrationsText: bucketText(b.registrations), attendancesText: bucketText(b.attendances),
  }));
  const peak = [...d.buckets].filter((b) => b.attendances.value !== null).sort((a, b) => (b.attendances.value ?? 0) - (a.attendances.value ?? 0))[0];
  const chartSummary = peak
    ? `Line chart of attendances and registrations submitted by ${weekly ? 'week' : 'month'}, ${day(q.range.from)} to ${day(q.range.to)}. Attendances total ${sumText(d.attendances)}. The same figures are in the table view.`
    : 'No attendances have been entered for this period.';

  const tiles = [
    { label: 'Trainings held', value: num(d.held), note: [d.awaiting ? `${d.awaiting} more finished, numbers not entered yet.` : '', d.notHeld ? `${d.notHeld} cancelled or not held.` : ''].filter(Boolean).join(' ') || 'Recorded by staff as having taken place.', cast: 'teal' },
    { label: 'Registrations submitted', value: sumText(d.registrations), note: coverage(d.registrations), cast: 'blue' },
    { label: 'Approved registrations', value: sumText(d.approved), note: coverage(d.approved), cast: 'blue' },
    { label: 'Attendances', value: sumText(d.attendances), note: `${coverage(d.attendances)} One caregiver at three trainings counts three times.`, cast: 'iris' },
    {
      label: 'Attendance rate', cast: 'iris',
      value: d.rate.value === null ? LC_NOT_AVAILABLE : `${Math.round(d.rate.value * 100)}%`,
      note: d.rate.value === null ? (d.held === 0 ? 'No trainings held in this period.' : 'Needs attendances and approved registrations for the same training.') : `${num(d.rate.attended)} attendances out of ${num(d.rate.approved)} approved registrations, from ${d.rate.counted} of ${d.rate.of} trainings held.`,
    },
  ];

  return (
    <>
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">Reporting</p>
          <h1 className="lc-h1">Caregiver participation</h1>
          <p className="lc-muted">Totals only, typed in by staff from the Microsoft Teams report after each training. This page cannot show who registered or attended, and nothing here is connected to Teams.</p>
        </div>
        <div className="lc-action-row lc-print-hide">
          <a href={`/learn/staff/api/reports/export?${q.search}`} className="lc-btn lc-btn-secondary" download>
            <Download width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            Download totals (CSV)
          </a>
          <LcPrintButton />
        </div>
      </header>

      <p className="lc-report-banner" role="note">{LC_REPORT_BANNER}</p>

      {saved ? (
        <p className="lc-saved lc-print-hide" role="status">
          <CircleCheck width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
          {saved === 'correction' ? 'Correction saved. The earlier entry is kept in the history.' : 'Numbers saved.'}
        </p>
      ) : null}

      <form method="get" action="/learn/staff/analytics" className="lc-solid lc-panel lc-report-filter lc-print-hide" aria-label="Choose what to show">
        <div className="lc-field">
          <label htmlFor="lc-f-range" className="lc-label">Period</label>
          <select id="lc-f-range" name="range" className="lc-input lc-select" defaultValue={q.range.preset}>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="ytd">Year to date</option>
            <option value="custom">Custom dates</option>
          </select>
        </div>
        <div className="lc-field">
          <label htmlFor="lc-f-from" className="lc-label">From <span className="lc-optional">custom dates only</span></label>
          <input id="lc-f-from" name="from" type="date" className="lc-input" defaultValue={q.range.preset === 'custom' ? q.range.from : ''} />
        </div>
        <div className="lc-field">
          <label htmlFor="lc-f-to" className="lc-label">To <span className="lc-optional">custom dates only</span></label>
          <input id="lc-f-to" name="to" type="date" className="lc-input" defaultValue={q.range.preset === 'custom' ? q.range.to : ''} />
        </div>
        <div className="lc-field">
          <label htmlFor="lc-f-topic" className="lc-label">Topic</label>
          <select id="lc-f-topic" name="topic" className="lc-input lc-select" defaultValue={q.categoryId ?? ''}>
            <option value="">All topics</option>
            {lcCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="lc-field">
          <label htmlFor="lc-f-training" className="lc-label">Training</label>
          <select id="lc-f-training" name="training" className="lc-input lc-select" defaultValue={trainingId ?? ''}>
            <option value="">All trainings</option>
            {everPublic.map((l) => (
              <option key={l.id} value={l.id}>{`${l.training.title} (${formatCtShortDate(l.training.startAtUtc!)})`}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="lc-btn lc-btn-primary">
          <Filter width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          Show
        </button>
      </form>

      {q.range.error ? (
        <p className="lc-field-error" role="alert">
          <CircleAlert width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
          {q.range.error}
        </p>
      ) : null}
      <p className="lc-report-period" aria-live="polite">
        <strong>{q.range.label}:</strong> {day(q.range.from)} to {day(q.range.to)}, Central Time{q.categoryId ? ` · ${getLcCategoryById(q.categoryId)?.name}` : ''}{trainingId ? ' · one training' : ''}
      </p>

      <ul className="lc-metrics lc-metrics-report" aria-label="Summary for this period">
        {tiles.map((t) => (
          <li key={t.label} data-cast={t.cast}>
            <div className="lc-metric" data-lc-tile={t.label}>
              <span className="lc-metric-label">{t.label}</span>
              <span className={t.value === LC_NOT_AVAILABLE ? 'lc-metric-value lc-metric-na' : 'lc-metric-value'}>{t.value}</span>
              <span className="lc-metric-note">{t.note}</span>
            </div>
          </li>
        ))}
      </ul>

      {waiting.length > 0 ? (
        <section aria-labelledby="lc-rep-waiting" className="lc-solid lc-panel lc-print-hide" data-cast="amber">
          <h2 id="lc-rep-waiting" className="lc-h2">
            Numbers waiting to be entered
          </h2>
          <ul className="lc-todo">
            {waiting.map(({ listing: l }) => (
              <li key={l.id}>
                <div>
                  <p className="lc-todo-title">{l.training.title}</p>
                  <p className="lc-muted">{l.training.startAtUtc ? formatCtShortDate(l.training.startAtUtc) : 'No date'}{l.training.listingStatus === 'cancelled' ? ' · Cancelled' : ''}</p>
                </div>
                <Link href={`/learn/staff/analytics/reports/${l.id}`} className="lc-btn lc-btn-secondary">
                  Enter numbers<span className="lc-sr-only">: {l.training.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="lc-rep-time" className="lc-solid lc-panel">
        <h2 id="lc-rep-time" className="lc-h2">
          Participation over time
        </h2>
        <p className="lc-muted">By {weekly ? 'week' : 'month'}. A {weekly ? 'week' : 'month'} with no number entered has no point on the chart. It is not drawn as zero.</p>
        <LcParticipationChart points={points} unit={weekly ? 'week' : 'month'} summary={chartSummary} />
      </section>

      <section aria-labelledby="lc-rep-topics" className="lc-solid lc-panel">
        <h2 id="lc-rep-topics" className="lc-h2">
          Most-attended topics
        </h2>
        {d.topics.length > 0 ? (
          <div className="lc-numbers-box">
          <div className="lc-table-wrap">
            <table className="lc-table lc-table-numbers lc-table-plain">
              <thead>
                <tr>
                  <th scope="col">Topic</th>
                  <th scope="col">Trainings held</th>
                  <th scope="col">Registrations submitted</th>
                  <th scope="col">Attendances</th>
                </tr>
              </thead>
              <tbody>
                {d.topics.map((t) => (
                  <tr key={t.categoryId}>
                    <th scope="row">{t.title}</th>
                    <td data-label="Trainings held">{num(t.held)}</td>
                    <td data-label="Registrations">{bucketText(t.registrations)}</td>
                    <td data-label="Attendances">{bucketText(t.attendances)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        ) : (
          <p className="lc-muted">No training was held in this period.</p>
        )}
      </section>

      <section aria-labelledby="lc-rep-rows" className="lc-solid lc-panel">
        <h2 id="lc-rep-rows" className="lc-h2">
          By training
        </h2>
        {d.rows.length > 0 ? (
          <div className="lc-numbers-box">
            <div className="lc-table-wrap">
              <table className="lc-table lc-table-numbers">
                <thead>
                  <tr>
                    <th scope="col">Training</th>
                    <th scope="col">Status</th>
                    <th scope="col">Registrations</th>
                    <th scope="col">Approved</th>
                    <th scope="col">Attendances</th>
                    <th scope="col" className="lc-print-hide">
                      <span className="lc-sr-only">Numbers</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {d.rows.map((r) => (
                    <tr key={r.trainingId} data-lc-row={r.trainingId}>
                      <th scope="row">
                        <span className="lc-table-title">{r.title}</span>
                        <span className="lc-table-sub">
                          {day(r.day)} · {getLcCategoryById(r.categoryId)?.name}
                          {r.revision ? ` · revision ${r.revision}, read on ${day(r.reportReviewedOn!)}` : ''}
                        </span>
                      </th>
                      <td data-label="Status">{LC_ROW_STATE[r.state]}</td>
                      <td data-label="Registrations">{cellText(r, 'registrationsTotal')}</td>
                      <td data-label="Approved">{cellText(r, 'registrationsApproved')}</td>
                      <td data-label="Attendances">{cellText(r, 'attendancesTotal')}</td>
                      <td className="lc-table-action lc-print-hide">
                        {r.state !== 'upcoming' ? (
                          <Link href={`/learn/staff/analytics/reports/${r.trainingId}`} className="lc-btn lc-btn-secondary">
                            {r.revision ? 'Correct' : 'Enter numbers'}
                            <span className="lc-sr-only">: {r.title}</span>
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="lc-muted">No training falls in this period. Try a longer period or a different topic.</p>
        )}
      </section>

      <div className="lc-report-two">
        <Breakdown id="lc-rep-centers" title="Registrations by center" what="Center" b={d.byCenter} minimum={d.minimum} />
        <Breakdown id="lc-rep-sources" title="How families heard about it" what="Answer" b={d.bySource} minimum={d.minimum} />
      </div>

      <section aria-labelledby="lc-rep-glossary" className="lc-solid lc-panel">
        <h2 id="lc-rep-glossary" className="lc-h2">
          What the numbers mean
        </h2>
        <dl className="lc-glossary">
          {LC_GLOSSARY.map((g) => (
            <div key={g.term}>
              <dt>{g.term}</dt>
              <dd>{g.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
