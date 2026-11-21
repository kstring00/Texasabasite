import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { LcBack } from '@/components/learn/LcPageHead';
import { LcReportForm } from '@/components/learn/staff/LcReportForm';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { LC_NOT_AVAILABLE, LC_REFERRAL_SOURCES, LC_REPORT_BANNER, LC_REPORT_CENTERS, LC_REPORT_SOURCES, LC_REPORT_SPLITS, canViewAnalytics, reportHistory, reportState, type LcAggregateReport, type LcReportInput } from '@/lib/learn/staff/reports';
import { getStaffStore } from '@/lib/learn/staff/store';
import { ctDay, formatCtDate, formatCtDateTime, formatCtShortDate } from '@/lib/learn/time';

export const metadata: Metadata = { title: 'Training numbers' };

const blank = (keys: readonly { id: string }[]) => Object.fromEntries(keys.map((k) => [k.id, '']));
const text = (n: number | null) => (n === null ? '' : String(n));

export default async function LearnStaffReportEntryPage({ params }: { params: Promise<{ trainingId: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  if (!canViewAnalytics(actor)) notFound();
  const { trainingId } = await params;
  const store = getStaffStore();
  const listing = store.listings.find((l) => l.id === trainingId);
  const now = new Date();
  // A draft, or a training that has not finished, has no numbers page.
  if (!listing || reportState(listing, now) !== 'ready') notFound();
  const t = listing.training;
  const history = reportHistory(store, actor, listing.id);
  const latest: LcAggregateReport | null = history[0] ?? null;
  const cancelled = t.listingStatus === 'cancelled';
  const today = ctDay(now.toISOString());
  const initial: LcReportInput = latest
    ? {
        trainingId: listing.id, reportReviewedOn: today, sourceLabel: latest.sourceLabel, trainingHeld: latest.trainingHeld,
        registrationsTotal: text(latest.registrationsTotal), registrationsApproved: text(latest.registrationsApproved), attendancesTotal: text(latest.attendancesTotal),
        // The split is never sent back to the page. It is kept as entered unless staff choose to type it in again.
        centerCounts: blank(LC_REPORT_CENTERS), sourceCounts: blank(LC_REFERRAL_SOURCES), centerKeep: latest.centerCounts !== null, sourceKeep: latest.sourceCounts !== null, reason: '', baseRevision: latest.revision,
      }
    : {
        trainingId: listing.id, reportReviewedOn: today, sourceLabel: LC_REPORT_SOURCES[0], trainingHeld: !cancelled, registrationsTotal: '', registrationsApproved: '', attendancesTotal: '',
        centerCounts: blank(LC_REPORT_CENTERS), sourceCounts: blank(LC_REFERRAL_SOURCES), centerKeep: false, sourceKeep: false, reason: '', baseRevision: 0,
      };
  const show = (n: number | null) => (n === null ? LC_NOT_AVAILABLE : n.toLocaleString('en-US'));
  // The history says whether a split was entered. It does not repeat the figures, because some are small.
  const splitText = (counts: Record<string, number> | null) => (counts ? 'entered' : 'not collected');

  return (
    <>
      <LcBack href="/learn/staff/analytics" label="Reporting" />
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">{latest ? 'Correct the numbers' : 'Enter the numbers'}</p>
          <h1 className="lc-h1">{t.title}</h1>
          <p className="lc-muted">{t.startAtUtc ? formatCtDate(t.startAtUtc) : 'No date'}{cancelled ? ' · Cancelled' : ''}</p>
        </div>
      </header>

      <p className="lc-report-banner" role="note">{LC_REPORT_BANNER}</p>

      <p className="lc-note" data-cast="blue">
        <ShieldCheck width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
        <span>
          These are totals only. Read them from the Microsoft Teams organizer report and type them in. Do not paste names, email addresses, attendance spreadsheets, or anything about a child or family. This page has nowhere to keep them.
        </span>
      </p>

      <section aria-labelledby="lc-rep-form" className="lc-solid lc-panel">
        <h2 id="lc-rep-form" className="lc-h2">
          {latest ? `Correction to revision ${latest.revision}` : 'Totals for this training'}
        </h2>
        <LcReportForm initial={initial} isCorrection={!!latest} hadCenter={!!latest?.centerCounts} hadSource={!!latest?.sourceCounts} splits={LC_REPORT_SPLITS} cancelled={cancelled} sources={[...LC_REPORT_SOURCES]} centers={LC_REPORT_CENTERS} referrals={[...LC_REFERRAL_SOURCES]} today={today} />
      </section>

      {history.length > 0 ? (
        <section aria-labelledby="lc-rep-history" className="lc-solid lc-panel">
          <h2 id="lc-rep-history" className="lc-h2">
            Every entry for this training
          </h2>
          <p className="lc-muted">Reporting uses the newest entry. Earlier entries are kept and never edited.</p>
          <ol className="lc-history">
            {history.map((r, i) => (
              <li key={r.id}>
                <span className="lc-history-what">
                  Revision {r.revision}
                  {i === 0 ? ' · in use' : ''}
                </span>
                <span className="lc-muted">
                  Entered by {getDemoStaff(r.enteredBy)?.displayName ?? 'Staff member'} on {formatCtDateTime(r.enteredAt)}. Source: {r.sourceLabel}, read on {formatCtShortDate(`${r.reportReviewedOn}T18:00:00Z`)}.
                </span>
                <span>
                  {r.trainingHeld ? 'Held.' : 'Not held.'} Registrations submitted: {show(r.registrationsTotal)}. Approved registrations: {show(r.registrationsApproved)}.{r.trainingHeld ? ` Attendances: ${show(r.attendancesTotal)}.` : ''}
                </span>
                <span className="lc-muted">Split by center: {splitText(r.centerCounts)}. Split by how families heard: {splitText(r.sourceCounts)}.</span>
                {r.reason ? <span>Reason for the change: {r.reason}</span> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </>
  );
}
