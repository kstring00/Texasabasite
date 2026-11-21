import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, ChartColumn, Clock, MessageSquareWarning, PencilLine, CircleCheck, FileStack, Layers, Plus, Presentation } from 'lucide-react';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { LcStatusChip } from '@/components/learn/staff/LcStatusChip';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { listListings } from '@/lib/learn/staff/listings';
import { canOpenProduction, productionList, reviewQueue } from '@/lib/learn/staff/pipeline';
import { reportTargets } from '@/lib/learn/staff/reports';
import { can } from '@/lib/learn/staff/roles';
import { getStaffStore } from '@/lib/learn/staff/store';
import { LC_STATUS, listSubmissions } from '@/lib/learn/staff/submissions';
import { formatCtShortDate } from '@/lib/learn/time';

export const metadata: Metadata = { title: 'Overview' };

export default async function LearnStaffOverviewPage() {
  const actor = await getStaffActor();
  if (!actor) return null; // The layout shows the closed page or the role picker instead.
  const store = getStaffStore();
  const mine = listSubmissions(store, actor, 'mine');
  const contributes = can(actor, 'submission.create');
  const readsAll = can(actor, 'submission.read_all');
  const count = (...statuses: string[]) => mine.filter((s) => statuses.includes(s.status)).length;
  const tiles = [
    { label: 'Drafts you are working on', value: count('draft'), cast: 'iris', icon: PencilLine, href: '/learn/staff/submissions?status=draft' },
    { label: 'Your submissions awaiting review', value: count('submitted', 'in_review'), cast: 'blue', icon: Clock, href: '/learn/staff/submissions?status=awaiting_review' },
    { label: 'Your submissions with changes requested', value: count('changes_requested'), cast: 'coral', icon: MessageSquareWarning, href: '/learn/staff/submissions?status=changes_requested' },
    { label: 'Your approved sources', value: count('source_approved'), cast: 'teal', icon: CircleCheck, href: '/learn/staff/submissions?status=source_approved' },
  ] as const;
  const needsYou = mine.filter((s) => s.status === 'changes_requested');
  const allCount = readsAll ? listSubmissions(store, actor, 'all').length : 0;
  const reviews = can(actor, 'review.source') || can(actor, 'review.final');
  const queue = reviewQueue(store, actor);
  const production = canOpenProduction(actor);
  const producing = productionList(store, actor);
  const managesTrainings = can(actor, 'training.manage');
  const seesReporting = can(actor, 'analytics.view');
  const listings = listListings(store, actor);
  const nowMs = Date.now();
  const upcomingListings = listings.filter((l) => (l.training.listingStatus === 'scheduled' || l.training.listingStatus === 'registration_closed') && (!l.training.endAtUtc || new Date(l.training.endAtUtc).getTime() >= nowMs)).length;
  const draftListings = listings.filter((l) => l.training.listingStatus === 'draft').length;
  const numbersWaiting = reportTargets(store, actor, new Date(nowMs)).filter((x) => x.report === null).length;

  return (
    <>
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">Overview</p>
          <h1 className="lc-h1">Welcome</h1>
          <p className="lc-muted">You are looking around as {actor.displayName}, a fictional demo role.</p>
        </div>
        {contributes ? (
          <Link href="/learn/staff/submissions/new" className="lc-btn lc-btn-primary">
            <Plus width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            Submit a PowerPoint
          </Link>
        ) : null}
      </header>

      {contributes ? (
        <ul className="lc-metrics">
          {tiles.map((t) => (
            <li key={t.label} data-cast={t.cast}>
              <Link href={t.href} className="lc-metric">
                <span className="lc-icon-tile" data-size="sm" aria-hidden="true">
                  <t.icon width={20} height={20} strokeWidth={1.75} />
                </span>
                <span className="lc-metric-value">{t.value}</span>
                <span className="lc-metric-label">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {contributes ? (
        <section aria-labelledby="lc-needs-you" className="lc-solid lc-panel">
          <h2 id="lc-needs-you" className="lc-h2">
            Waiting on you
          </h2>
          {needsYou.length > 0 ? (
            <ul className="lc-todo">
              {needsYou.map((s) => {
                const review = store.reviews.filter((r) => r.submissionId === s.id).sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))[0];
                return (
                  <li key={s.id}>
                    <div>
                      <p className="lc-todo-title">{s.title}</p>
                      <p className="lc-muted">
                        {review ? `${getDemoStaff(review.reviewerId)?.displayName ?? 'A reviewer'} asked for changes on ${formatCtShortDate(review.decidedAt)}.` : LC_STATUS[s.status].next}
                      </p>
                      <LcStatusChip status={s.status} />
                    </div>
                    <Link href={`/learn/staff/submissions/${s.id}`} className="lc-btn lc-btn-secondary">
                      Read the feedback
                      <span className="lc-sr-only">: {s.title}</span>
                      <ArrowRight width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : mine.length === 0 ? (
            <p className="lc-muted">You haven’t submitted a presentation yet. Start with a PowerPoint you created.</p>
          ) : (
            <p className="lc-muted">Nothing needs your attention right now.</p>
          )}
        </section>
      ) : null}

      {reviews ? (
        <section aria-labelledby="lc-review-title" className="lc-solid lc-panel">
          <h2 id="lc-review-title" className="lc-h2">
            Items needing review
          </h2>
          <ul className="lc-metrics lc-metrics-two">
            <li data-cast="blue">
              <Link href="/learn/staff/reviews?gate=source" className="lc-metric">
                <span className="lc-icon-tile" data-size="sm" aria-hidden="true">
                  <Presentation width={20} height={20} strokeWidth={1.75} />
                </span>
                <span className="lc-metric-value">{queue.sources.filter((x) => !x.blocked).length}</span>
                <span className="lc-metric-label">Gate 1 · source PowerPoints you can review</span>
              </Link>
            </li>
            <li data-cast="iris">
              <Link href="/learn/staff/reviews?gate=module" className="lc-metric">
                <span className="lc-icon-tile" data-size="sm" aria-hidden="true">
                  <Layers width={20} height={20} strokeWidth={1.75} />
                </span>
                <span className="lc-metric-value">{queue.modules.filter((x) => !x.blocked).length}</span>
                <span className="lc-metric-label">Gate 2 · final modules you can review</span>
              </Link>
            </li>
          </ul>
          {queue.sources.length + queue.modules.length === 0 ? <p className="lc-muted">You’re all caught up on assigned reviews.</p> : null}
        </section>
      ) : null}

      {production ? (
        <section aria-labelledby="lc-prod-title" className="lc-solid lc-panel" data-cast="blue">
          <h2 id="lc-prod-title" className="lc-h2">
            Modules
          </h2>
          <p className="lc-muted">
            {producing.filter((r) => r.submission.status === 'source_approved').length} approved sources ready for production, {producing.filter((r) => r.submission.status === 'in_production').length} in production, {producing.filter((r) => r.submission.status === 'final_approved').length} ready to publish, {producing.filter((r) => r.submission.status === 'published').length} published.
          </p>
          <Link href="/learn/staff/modules" className="lc-btn lc-btn-secondary">
            <Layers width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            Open modules
          </Link>
        </section>
      ) : null}

      {managesTrainings || seesReporting ? (
        <section aria-labelledby="lc-trainings-title" className="lc-solid lc-panel" data-cast="coral">
          <h2 id="lc-trainings-title" className="lc-h2">
            Trainings and reporting
          </h2>
          <p className="lc-muted">
            {managesTrainings ? `${upcomingListings} upcoming public ${upcomingListings === 1 ? 'listing' : 'listings'}, ${draftListings} in draft. ` : ''}
            {seesReporting ? `${numbersWaiting} finished ${numbersWaiting === 1 ? 'training is' : 'trainings are'} waiting for numbers.` : ''}
          </p>
          <div className="lc-action-row">
            {managesTrainings ? (
              <Link href="/learn/staff/trainings" className="lc-btn lc-btn-secondary">
                <CalendarDays width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                Open trainings
              </Link>
            ) : null}
            {seesReporting ? (
              <Link href="/learn/staff/analytics" className="lc-btn lc-btn-secondary">
                <ChartColumn width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                Open reporting
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {readsAll ? (
        <section aria-labelledby="lc-all-title" className="lc-solid lc-panel" data-cast="blue">
          <h2 id="lc-all-title" className="lc-h2">
            All submissions
          </h2>
          <p className="lc-muted">Your role can read every submission, {allCount} in total.</p>
          <Link href="/learn/staff/submissions/all" className="lc-btn lc-btn-secondary">
            <FileStack width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            See all submissions
          </Link>
        </section>
      ) : null}

      <section aria-labelledby="lc-how-title" className="lc-solid lc-panel">
        <h2 id="lc-how-title" className="lc-h2">
          How a presentation becomes a module
        </h2>
        <ol className="lc-steps-list">
          <li><strong>You submit a PowerPoint.</strong> It must contain no client information of any kind.</li>
          <li><strong>A clinician reviews the PowerPoint.</strong> They approve it as a source, ask for changes, or decline it.</li>
          <li><strong>The approved source is turned into an interactive module.</strong> This happens outside this website.</li>
          <li><strong>A clinician reviews the finished module.</strong> This is a second, separate approval. Approving the PowerPoint does not approve the module.</li>
          <li><strong>The approved module is published</strong> to the Learning Library.</li>
        </ol>
      </section>
    </>
  );
}
