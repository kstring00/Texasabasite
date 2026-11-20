import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eye, Info, Layers } from 'lucide-react';
import { LcBack } from '@/components/learn/LcPageHead';
import { LcDecisionForm } from '@/components/learn/staff/LcDecisionForm';
import { LcModuleChip } from '@/components/learn/staff/LcModuleChip';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { getLcCategoryById } from '@/data/learn/categories';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { LC_FINAL_CHECKLIST, finalReviewBlock } from '@/lib/learn/staff/pipeline';
import { can } from '@/lib/learn/staff/roles';
import { getStaffStore } from '@/lib/learn/staff/store';
import { formatCtDateTime, formatCtShortDate } from '@/lib/learn/time';

export const metadata: Metadata = { title: 'Final module review' };

const METHOD: Record<string, string> = { external_ai_assisted: 'Made outside this website with an AI assistant, from the approved PowerPoint', written_by_hand: 'Written by hand from the approved PowerPoint' };

export default async function LearnStaffModuleReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  if (!can(actor, 'review.final')) notFound();
  const { id } = await params;
  const store = getStaffStore();
  const m = store.modules.find((x) => x.id === id);
  const s = m ? store.submissions.find((x) => x.id === m.submissionId) : undefined;
  if (!m || !s) notFound();
  const sourceVersion = store.versions.find((v) => v.id === m.sourceVersionId);
  const sourceReview = store.reviews.find((r) => r.targetType === 'source_pptx' && r.targetVersionId === m.sourceVersionId && r.decision === 'approved');
  const blocked = finalReviewBlock(store, actor, m, s);
  const waiting = m.status === 'final_review';
  const name = (id: string | null | undefined) => getDemoStaff(id)?.displayName ?? 'Staff member';
  const steps = m.manifest.lessons.flatMap((l) => l.steps);
  const count = (type: string) => steps.filter((x) => x.type === type).length;
  const earlier = store.reviews.filter((r) => r.targetType === 'derived_module' && r.submissionId === s.id).sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));

  return (
    <div data-cast="iris" className="lc-review">
      <LcBack href="/learn/staff/reviews?gate=module" label="Reviews" />
      <div className="lc-gate-strip">
        <p className="lc-gate-strip-title">
          <Layers width={20} height={20} strokeWidth={1.75} aria-hidden="true" /> Gate 2 · Final module
        </p>
        <p className="lc-muted">You are reviewing the finished module itself, exactly as a caregiver will see it. The earlier approval of the PowerPoint does not cover it.</p>
      </div>
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">{getLcCategoryById(m.manifest.categoryId)?.name ?? 'Topic'}</p>
          <h1 className="lc-h1">{m.manifest.title}</h1>
          <p className="lc-chips">
            <LcModuleChip status={m.status} />
          </p>
        </div>
        <Link href={`/learn/staff/modules/preview/${m.id}`} className="lc-btn lc-btn-primary">
          <Eye width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          Preview in the lesson player
        </Link>
      </header>

      <div className="lc-staff-cols">
        <div className="lc-staff-main-col">
          <section aria-labelledby="lc-mr-new" className="lc-solid lc-panel">
            <h2 id="lc-mr-new" className="lc-h2">
              What is new compared with the PowerPoint
            </h2>
            <p className="lc-feedback-text">{m.newContentNotes}</p>
            <p className="lc-muted">This is what the producer declared. New explanations, examples and questions were not part of the first approval, so check them closely.</p>
          </section>

          <section aria-labelledby="lc-mr-contents" className="lc-solid lc-panel">
            <h2 id="lc-mr-contents" className="lc-h2">
              What is in this module
            </h2>
            <p>{m.manifest.summary}</p>
            <ol className="lc-steps-list">
              {m.manifest.lessons.map((l) => (
                <li key={l.id}>
                  <strong>{l.title}.</strong> {l.steps.length} steps. {l.summary}
                </li>
              ))}
            </ol>
            <p className="lc-muted">
              {count('knowledge_check')} knowledge checks, {count('slide')} slides, {count('scenario')} scenarios. About {m.manifest.estimatedMinutes} minutes.
            </p>
          </section>

          <section aria-labelledby="lc-mr-decide" className="lc-solid lc-panel">
            <h2 id="lc-mr-decide" className="lc-h2">
              Your decision
            </h2>
            {!waiting ? (
              <p className="lc-note" data-cast="slate">
                <Info width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                <span>This module version is not waiting for a final review.</span>
              </p>
            ) : blocked ? (
              <p className="lc-note" data-cast="amber" role="note">
                <Info width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                <span>{blocked}</span>
              </p>
            ) : (
              <LcDecisionForm target={{ gate: 'final', moduleVersionId: m.id }} rev={s.rev} checklist={LC_FINAL_CHECKLIST.map((c) => ({ ...c }))} what={`module version ${m.versionNumber} of “${m.manifest.title}”, exactly as it is now,`} declineLabel="Reject" />
            )}
          </section>

          {earlier.length > 0 ? (
            <section aria-labelledby="lc-mr-earlier" className="lc-solid lc-panel">
              <h2 id="lc-mr-earlier" className="lc-h2">
                Earlier final reviews
              </h2>
              <ul className="lc-versions">
                {earlier.map((r) => (
                  <li key={r.id}>
                    <div>
                      <p className="lc-versions-title">
                        {r.decision === 'approved' ? 'Approved' : r.decision === 'declined' ? 'Rejected' : 'Changes requested'}, module version {store.modules.find((x) => x.id === r.targetVersionId)?.versionNumber ?? '?'}
                      </p>
                      <p className="lc-muted">
                        {name(r.reviewerId)} · {formatCtDateTime(r.decidedAt)}
                      </p>
                      {r.comments ? <p className="lc-feedback-text">{r.comments}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="lc-staff-side-col" aria-label="Where this module came from">
          <section aria-labelledby="lc-mr-source" className="lc-solid lc-panel">
            <h2 id="lc-mr-source" className="lc-h3">
              Where it came from
            </h2>
            <dl className="lc-summary">
              <div><dt>Source presentation</dt><dd>“{s.title}”, version {sourceVersion?.versionNumber ?? '?'}</dd></div>
              <div><dt>Gate 1 approval</dt><dd>{sourceReview ? `${name(sourceReview.reviewerId)}, ${formatCtShortDate(sourceReview.decidedAt)}` : 'None on record'}</dd></div>
              <div><dt>Written by</dt><dd>{name(s.createdBy)}</dd></div>
              <div><dt>Imported by</dt><dd>{name(m.importedBy)}, {formatCtShortDate(m.importedAt)}</dd></div>
              <div><dt>How it was made</dt><dd>{METHOD[m.generationMethod]}, {m.conversionDate}</dd></div>
              <div><dt>Module version</dt><dd>{m.versionNumber}</dd></div>
              <div><dt>Content fingerprint</dt><dd className="lc-mono">{m.contentHash.slice(0, 16)}</dd></div>
              <div><dt>Package check</dt><dd>No problems found when imported</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
