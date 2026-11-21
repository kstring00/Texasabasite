import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircleCheck, Layers, Presentation } from 'lucide-react';
import { LcStatusChip } from '@/components/learn/staff/LcStatusChip';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { getLcCategoryById } from '@/data/learn/categories';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { reviewQueue } from '@/lib/learn/staff/pipeline';
import { can } from '@/lib/learn/staff/roles';
import { getStaffStore } from '@/lib/learn/staff/store';
import { formatCtShortDate } from '@/lib/learn/time';

export const metadata: Metadata = { title: 'Reviews' };

const DONE: Record<string, string> = { approved: 'Approval recorded.', changes_requested: 'Your request for changes was sent.', declined: 'Your decision was recorded.' };

export default async function LearnStaffReviewsPage({ searchParams }: { searchParams: Promise<{ gate?: string; done?: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  if (!can(actor, 'review.source') && !can(actor, 'review.final')) notFound();
  const { gate, done } = await searchParams;
  const tab = gate === 'module' ? 'module' : 'source';
  const q = reviewQueue(getStaffStore(), actor);
  const name = (id: string) => getDemoStaff(id)?.displayName ?? 'Staff member';

  return (
    <>
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">Reviews</p>
          <h1 className="lc-h1">Items needing review</h1>
          <p className="lc-muted">Two separate approvals. Approving a PowerPoint does not approve the module made from it.</p>
        </div>
      </header>
      {done && DONE[done] ? (
        <p className="lc-note" data-cast="teal" role="status">
          <CircleCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          <span>{DONE[done]}</span>
        </p>
      ) : null}

      <nav aria-label="Which approval" className="lc-gate-tabs">
        <ul>
          <li data-cast="blue">
            <Link href="/learn/staff/reviews?gate=source" aria-current={tab === 'source' ? 'page' : undefined}>
              <Presentation width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
              Gate 1 · PPTX sources <span className="lc-tabs-count">{q.sources.length}</span>
            </Link>
          </li>
          <li data-cast="iris">
            <Link href="/learn/staff/reviews?gate=module" aria-current={tab === 'module' ? 'page' : undefined}>
              <Layers width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
              Gate 2 · Final modules <span className="lc-tabs-count">{q.modules.length}</span>
            </Link>
          </li>
        </ul>
      </nav>

      {tab === 'source' ? (
        <section aria-labelledby="lc-q-source" data-cast="blue" className="lc-queue">
          <div className="lc-gate-strip">
            <h2 id="lc-q-source" className="lc-gate-strip-title">
              <Presentation width={20} height={20} strokeWidth={1.75} aria-hidden="true" /> Gate 1 · Source PowerPoint
            </h2>
            <p className="lc-muted">Is this PowerPoint accurate, general and free of client information? Approving it lets a producer start building the module.</p>
          </div>
          {q.sources.length > 0 ? (
            <ul className="lc-queue-list">
              {q.sources.map(({ submission: s, version, blocked }) => (
                <li key={s.id} className="lc-solid">
                  <div>
                    <p className="lc-todo-title">{s.title}</p>
                    <p className="lc-muted">
                      {getLcCategoryById(s.categoryId)?.name} · Version {version.versionNumber} · from {name(s.createdBy)} · waiting since {version.frozenAt ? formatCtShortDate(version.frozenAt) : 'today'}
                    </p>
                    <p className="lc-chips">
                      <LcStatusChip status={s.status} />
                    </p>
                    {blocked ? <p className="lc-muted">{blocked}</p> : null}
                  </div>
                  <Link href={`/learn/staff/reviews/source/${s.id}`} className="lc-btn lc-btn-secondary">
                    Open review<span className="lc-sr-only">: {s.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lc-solid lc-empty lc-muted">You’re all caught up on assigned reviews.</p>
          )}
        </section>
      ) : (
        <section aria-labelledby="lc-q-module" data-cast="iris" className="lc-queue">
          <div className="lc-gate-strip">
            <h2 id="lc-q-module" className="lc-gate-strip-title">
              <Layers width={20} height={20} strokeWidth={1.75} aria-hidden="true" /> Gate 2 · Final module
            </h2>
            <p className="lc-muted">Is the finished module, exactly as a caregiver will see it, accurate and safe to publish? This is its own approval, by a second person.</p>
          </div>
          {q.modules.length > 0 ? (
            <ul className="lc-queue-list">
              {q.modules.map(({ module: m, submission: s, blocked }) => (
                <li key={m.id} className="lc-solid">
                  <div>
                    <p className="lc-todo-title">{m.manifest.title}</p>
                    <p className="lc-muted">
                      Module version {m.versionNumber} · made from “{s.title}” · imported by {name(m.importedBy)} · waiting since {m.submittedForReviewAt ? formatCtShortDate(m.submittedForReviewAt) : 'today'}
                    </p>
                    {blocked ? <p className="lc-muted">{blocked}</p> : null}
                  </div>
                  <Link href={`/learn/staff/reviews/module/${m.id}`} className="lc-btn lc-btn-secondary">
                    Open review<span className="lc-sr-only">: {m.manifest.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lc-solid lc-empty lc-muted">You’re all caught up on assigned reviews.</p>
          )}
        </section>
      )}
    </>
  );
}
