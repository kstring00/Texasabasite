import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircleCheck, ExternalLink, Hash, TriangleAlert } from 'lucide-react';
import { LcBack } from '@/components/learn/LcPageHead';
import { LcTrainingCard } from '@/components/learn/LcTraining';
import { LcListingChip } from '@/components/learn/staff/LcListingChip';
import { LcListingControls } from '@/components/learn/staff/LcListingControls';
import { LcListingForm } from '@/components/learn/staff/LcListingForm';
import { lcCategories } from '@/data/learn/categories';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { listModuleSummaries } from '@/lib/learn/content';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { LC_LISTING_AUDIT_LABEL, LC_LISTING_STATUS, canManageTrainings, getListing, listingAudit, listingPublishProblems, listingToInput, listingWarnings, type LcListingAction } from '@/lib/learn/staff/listings';
import { LC_NOT_AVAILABLE, canViewAnalytics, currentReport, reportState } from '@/lib/learn/staff/reports';
import { LC_ROLE_LABEL } from '@/lib/learn/staff/roles';
import { getStaffStore } from '@/lib/learn/staff/store';
import { formatCtDateTime, formatCtShortDate } from '@/lib/learn/time';
import { isPubliclyListed, trainingView, type LcTrainingView } from '@/lib/learn/trainings';

export const metadata: Metadata = { title: 'Training listing' };

type Control = { action: LcListingAction; label: string; primary?: boolean; confirm?: { question: string; yes: string; destructive?: boolean } };

const SEES: Record<LcTrainingView, string> = {
  open: 'Caregivers see a “Request registration” button. It opens the Microsoft Teams registration page in a new tab.',
  details_soon: 'Caregivers see “Registration details coming soon” and no registration button.',
  closed: 'Caregivers see “Registration closed” and no registration button.',
  completed: 'Caregivers see this training as completed, with no registration button.',
  cancelled: 'Caregivers see this training as cancelled, with no registration button.',
};

export default async function LearnStaffTrainingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  if (!canManageTrainings(actor)) notFound();
  const store = getStaffStore();
  const listing = getListing(store, actor, (await params).id);
  if (!listing) notFound();
  const { saved } = await searchParams;
  const t = listing.training;
  const now = new Date();
  const view = trainingView(t, now);
  const status = t.listingStatus;
  const over = t.endAtUtc ? new Date(t.endAtUtc).getTime() < now.getTime() : false;
  const isPublic = isPubliclyListed(t);
  const editable = status === 'draft' || status === 'scheduled' || status === 'registration_closed';
  const problems = status === 'draft' ? listingPublishProblems(t, now) : [];
  const warnings = editable ? listingWarnings(t) : [];

  const cancel: Control = { action: 'cancel', label: 'Cancel training', confirm: { question: 'Cancel this training? The public page will say it was cancelled. This cannot be undone here.', yes: 'Yes, cancel it', destructive: true } };
  const controls: Control[] =
    status === 'draft'
      ? [
          { action: 'publish', label: 'Publish listing', primary: true, confirm: { question: 'Publish this listing? Caregivers will be able to see it straight away.', yes: 'Yes, publish' } },
          { action: 'archive', label: 'Archive draft', confirm: { question: 'Archive this draft? It was never public. It will move to the archived list.', yes: 'Yes, archive', destructive: true } },
        ]
      : (status === 'scheduled' || status === 'registration_closed') && over
        ? [{ action: 'complete', label: 'Mark completed', primary: true }]
        : status === 'scheduled'
          ? [{ action: 'close_registration', label: 'Close registration' }, cancel]
          : status === 'registration_closed'
            ? [{ action: 'reopen_registration', label: 'Reopen registration' }, cancel]
            : status === 'completed' || status === 'cancelled'
              ? [{ action: 'archive', label: 'Archive listing', confirm: { question: 'Archive this listing? It will be removed from the public pages. Any numbers entered for it stay in reporting.', yes: 'Yes, archive', destructive: true } }]
              : [];

  const numbers = canViewAnalytics(actor) && reportState(listing, now) === 'ready';
  const report = numbers ? currentReport(store, listing.id) : null;
  const show = (n: number | null) => (n === null ? LC_NOT_AVAILABLE : n.toLocaleString('en-US'));
  const history = listingAudit(store, actor, listing.id);

  return (
    <>
      <LcBack href="/learn/staff/trainings" label="Trainings" />
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">Training listing</p>
          <h1 className="lc-h1">{t.title}</h1>
          <p className="lc-chips">
            <LcListingChip status={status} />
          </p>
          <p className="lc-muted">{LC_LISTING_STATUS[status].note}</p>
        </div>
        {isPublic ? (
          <Link href={`/learn/trainings/${t.slug}`} className="lc-btn lc-btn-secondary">
            Open the public page
            <ExternalLink width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        ) : null}
      </header>

      {saved ? (
        <p className="lc-saved" role="status">
          <CircleCheck width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
          Draft created. Only staff can see it until you publish.
        </p>
      ) : null}

      <section aria-labelledby="lc-tr-preview" className="lc-solid lc-panel">
        <h2 id="lc-tr-preview" className="lc-h2">
          {isPublic ? 'How caregivers see it' : 'Preview'}
        </h2>
        {/* A picture of the public card. It cannot be clicked from here. */}
        <div className="lc-listing-preview" inert>
          <LcTrainingCard training={t} view={view} headingLevel={3} />
        </div>
        <p className="lc-muted">{SEES[view]}</p>
        {warnings.map((w) => (
          <p key={w} className="lc-note" data-cast="amber" role="status">
            <TriangleAlert width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
            <span>{w}</span>
          </p>
        ))}
      </section>

      {status !== 'archived' ? (
        <section aria-labelledby="lc-tr-status" className="lc-solid lc-panel">
          <h2 id="lc-tr-status" className="lc-h2">
            Status
          </h2>
          {problems.length > 0 ? (
            <div className="lc-note" data-cast="slate">
              <Hash width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <p>Before this can be published:</p>
                <ul className="lc-problems">
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
          {(status === 'scheduled' || status === 'registration_closed') && over ? <p className="lc-muted">This training’s end time has passed. Caregivers already see it as completed. Mark it completed to finish the listing.</p> : null}
          {controls.length > 0 ? <LcListingControls id={listing.id} rev={listing.rev} controls={controls} /> : null}
        </section>
      ) : null}

      {numbers ? (
        <section aria-labelledby="lc-tr-numbers" className="lc-solid lc-panel">
          <h2 id="lc-tr-numbers" className="lc-h2">
            Numbers
          </h2>
          {report ? (
            <p className="lc-muted">
              {report.trainingHeld ? 'Held.' : 'Not held.'} Registrations submitted: {show(report.registrationsTotal)}. Approved registrations: {show(report.registrationsApproved)}.{report.trainingHeld ? ` Attendances: ${show(report.attendancesTotal)}.` : ''} Revision {report.revision}, read on {formatCtShortDate(`${report.reportReviewedOn}T18:00:00Z`)}.
            </p>
          ) : (
            <p className="lc-muted">No totals have been entered for this training yet.</p>
          )}
          <Link href={`/learn/staff/analytics/reports/${listing.id}`} className="lc-btn lc-btn-secondary">
            {report ? 'Correct the numbers' : 'Enter the numbers'}
          </Link>
        </section>
      ) : null}

      {editable ? (
        <section aria-labelledby="lc-tr-details" className="lc-solid lc-panel">
          <h2 id="lc-tr-details" className="lc-h2">
            Details
          </h2>
          {isPublic ? <p className="lc-muted">This listing is public. A saved change shows to caregivers straight away, with today as the “last updated” date.</p> : null}
          <LcListingForm listing={{ id: listing.id, rev: listing.rev }} initial={listingToInput(listing)} categories={lcCategories.map((c) => ({ id: c.id, label: c.name }))} modules={listModuleSummaries().map((m) => ({ id: m.id, label: m.title }))} isPublic={isPublic} />
        </section>
      ) : (
        <section aria-labelledby="lc-tr-details" className="lc-solid lc-panel">
          <h2 id="lc-tr-details" className="lc-h2">
            Details
          </h2>
          <p className="lc-muted">A completed, cancelled or archived listing can no longer be edited.</p>
        </section>
      )}

      <section aria-labelledby="lc-tr-history" className="lc-solid lc-panel">
        <h2 id="lc-tr-history" className="lc-h2">
          History
        </h2>
        <ol className="lc-history">
          {history.map((a) => (
            <li key={a.id}>
              <span className="lc-history-what">{LC_LISTING_AUDIT_LABEL[a.action] ?? a.action}</span>
              <span className="lc-muted">
                {getDemoStaff(a.actorId)?.displayName ?? 'Staff member'}, {LC_ROLE_LABEL[a.actorRole]} · {formatCtDateTime(a.at)}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
