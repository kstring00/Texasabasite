import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircleAlert, CircleCheck, ClipboardCheck, Download, FilePlus2, Layers, PencilLine, Presentation, Trash2 } from 'lucide-react';
import { LcBack } from '@/components/learn/LcPageHead';
import { LcConfirm } from '@/components/learn/staff/LcConfirm';
import { LcStatusChip } from '@/components/learn/staff/LcStatusChip';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { getLcCategoryById } from '@/data/learn/categories';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { formatBytes } from '@/lib/learn/staff/pptx';
import { canOpenProduction, modulesOf } from '@/lib/learn/staff/pipeline';
import { LC_ROLE_LABEL, can } from '@/lib/learn/staff/roles';
import { getStaffStore } from '@/lib/learn/staff/store';
import { LC_AFTER_SOURCE_APPROVAL, LC_AUDIT_LABEL, LC_STATUS, viewSubmission } from '@/lib/learn/staff/submissions';
import { formatCtDateTime } from '@/lib/learn/time';
import { deleteDraftAction, startRevisionAction } from '../../actions';

export const metadata: Metadata = { title: 'Submission' };

const PROBLEMS: Record<string, string> = {
  stale: 'This submission changed since you opened it. The page below is up to date. Please try again.',
  state: 'That is not possible for this submission in its current status.',
  forbidden: 'Your role does not allow that.',
  not_found: 'That submission was not found.',
};

export default async function LearnStaffSubmissionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ submitted?: string; problem?: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  const { id } = await params;
  // Not yours and not readable by your role looks exactly like "does not exist".
  const view = viewSubmission(getStaffStore(), actor, id);
  if (!view) notFound();
  const { submitted, problem } = await searchParams;
  const { submission: s, versions, reviews, audit } = view;
  const author = getDemoStaff(s.createdBy);
  const modules = modulesOf(getStaffStore(), id);
  const canReviewThis = can(actor, 'review.source') && (s.status === 'submitted' || s.status === 'in_review');
  const canProduce = canOpenProduction(actor) && LC_AFTER_SOURCE_APPROVAL.includes(s.status);
  const name = (personId: string) => getDemoStaff(personId)?.displayName ?? 'Staff member';

  return (
    <>
      <LcBack href={view.isOwner ? '/learn/staff/submissions' : '/learn/staff/submissions/all'} label={view.isOwner ? 'My submissions' : 'All submissions'} />
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">{getLcCategoryById(s.categoryId)?.name ?? 'Topic not chosen yet'}</p>
          <h1 className="lc-h1">{s.title}</h1>
          <p className="lc-chips">
            <LcStatusChip status={s.status} />
          </p>
        </div>
      </header>

      {submitted ? (
        <p className="lc-note" data-cast="teal" role="status">
          <CircleCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          <span>Submitted for clinical review. This version is now locked.</span>
        </p>
      ) : null}
      {problem && PROBLEMS[problem] ? (
        <p className="lc-note" data-cast="coral" role="alert">
          <CircleAlert width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          <span>{PROBLEMS[problem]}</span>
        </p>
      ) : null}

      <div className="lc-staff-cols">
        <div className="lc-staff-main-col">
          <section aria-labelledby="lc-next-title" className="lc-solid lc-panel">
            <h2 id="lc-next-title" className="lc-h2">
              What happens next
            </h2>
            <p>{LC_STATUS[s.status].next}</p>
            {canReviewThis || canProduce ? (
              <div className="lc-action-row">
                {canReviewThis ? (
                  <Link href={`/learn/staff/reviews/source/${s.id}`} className="lc-btn lc-btn-primary">
                    <ClipboardCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                    Open the source review
                  </Link>
                ) : null}
                {canProduce ? (
                  <Link href={`/learn/staff/modules/${s.id}`} className="lc-btn lc-btn-secondary">
                    <Layers width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                    Open the module workspace
                  </Link>
                ) : null}
              </div>
            ) : null}
            {view.canEdit || view.canStartRevision || view.canDelete ? (
              <div className="lc-action-row">
                {view.canEdit ? (
                  <Link href={`/learn/staff/submissions/${s.id}/edit`} className="lc-btn lc-btn-primary">
                    <PencilLine width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                    {versions.some((v) => v.frozenAt) ? 'Continue the new version' : 'Continue this draft'}
                  </Link>
                ) : null}
                {view.canStartRevision ? (
                  <form action={startRevisionAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="rev" value={s.rev} />
                    <button type="submit" className="lc-btn lc-btn-primary">
                      <FilePlus2 width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                      Start a new version
                    </button>
                  </form>
                ) : null}
                {view.canDelete ? (
                  <form action={deleteDraftAction}>
                    <LcConfirm label="Delete this draft" question="Delete this draft and its uploaded file? This cannot be undone." confirmLabel="Yes, delete the draft" cancelLabel="Keep it" icon={<Trash2 width={20} height={20} strokeWidth={1.75} aria-hidden="true" />}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="rev" value={s.rev} />
                    </LcConfirm>
                  </form>
                ) : null}
              </div>
            ) : null}
          </section>

          {reviews.length > 0 ? (
            <section aria-labelledby="lc-feedback-title" className="lc-solid lc-panel">
              <h2 id="lc-feedback-title" className="lc-h2">
                Reviewer feedback
              </h2>
              {reviews.map((r) => {
                const isFinal = r.targetType === 'derived_module';
                const verb = r.decision === 'approved' ? (isFinal ? 'Final module approved' : 'Approved as a source') : r.decision === 'declined' ? (isFinal ? 'Module rejected' : 'Declined') : 'Changes requested';
                const which = isFinal ? `module version ${modules.find((m) => m.id === r.targetVersionId)?.versionNumber ?? '?'}` : `version ${versions.find((v) => v.id === r.targetVersionId)?.versionNumber ?? '?'}`;
                return (
                  <div key={r.id} className="lc-review-record">
                    <div className="lc-gate-strip" data-cast={isFinal ? 'iris' : 'blue'}>
                      <p className="lc-gate-strip-title">
                        {isFinal ? <Layers width={20} height={20} strokeWidth={1.75} aria-hidden="true" /> : <Presentation width={20} height={20} strokeWidth={1.75} aria-hidden="true" />}
                        {isFinal ? 'Gate 2 · Final module' : 'Gate 1 · Source PowerPoint'}
                      </p>
                      <p className="lc-muted">
                        {verb} by {name(r.reviewerId)} on {formatCtDateTime(r.decidedAt)}, for {which}.
                      </p>
                    </div>
                    {r.comments ? <p className="lc-feedback-text">{r.comments}</p> : null}
                  </div>
                );
              })}
            </section>
          ) : null}

          <section aria-labelledby="lc-versions-title" className="lc-solid lc-panel">
            <h2 id="lc-versions-title" className="lc-h2">
              Versions
            </h2>
            <ul className="lc-versions">
              {[...versions].reverse().map((v) => (
                <li key={v.id}>
                  <div>
                    <p className="lc-versions-title">
                      Version {v.versionNumber}
                      <span className="lc-chip" data-cast={v.frozenAt ? 'slate' : 'iris'}>{v.frozenAt ? 'Locked' : 'Not submitted yet'}</span>
                    </p>
                    <p className="lc-muted">{v.frozenAt ? `Submitted ${formatCtDateTime(v.frozenAt)}. It cannot be changed.` : 'You can still edit this version.'}</p>
                    {v.asset ? (
                      <p className="lc-muted">
                        {v.asset.fileName} · {formatBytes(v.asset.byteSize)}
                        {v.asset.synthetic ? ' · Synthetic demo file, not a real presentation' : ''} · Not scanned for malware in the demo
                      </p>
                    ) : (
                      <p className="lc-muted">No file uploaded yet.</p>
                    )}
                    {v.revisionNotes ? <p className="lc-feedback-text">What changed: {v.revisionNotes}</p> : null}
                  </div>
                  {v.asset ? (
                    <a href={`/learn/staff/api/uploads/${v.asset.id}`} className="lc-btn lc-btn-secondary" download>
                      <Download width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                      Download<span className="lc-sr-only"> version {v.versionNumber}</span>
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lc-staff-side-col" aria-label="Details and history">
          <section aria-labelledby="lc-details-title" className="lc-solid lc-panel">
            <h2 id="lc-details-title" className="lc-h3">
              Details
            </h2>
            <dl className="lc-summary">
              <div><dt>Submitted by</dt><dd>{author ? `${author.displayName}, ${LC_ROLE_LABEL[author.role]}` : 'Staff member'}</dd></div>
              <div><dt>Summary</dt><dd>{s.summary || 'Not added yet'}</dd></div>
              <div><dt>Objectives</dt><dd>{s.objectives.length ? <ul>{s.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul> : 'Not added yet'}</dd></div>
              <div><dt>Audience</dt><dd>{s.audience || 'Not chosen yet'}</dd></div>
              <div><dt>Tags</dt><dd>{s.tags.length ? s.tags.join(', ') : 'None'}</dd></div>
            </dl>
          </section>
          <section aria-labelledby="lc-history-title" className="lc-solid lc-panel">
            <h2 id="lc-history-title" className="lc-h3">
              History
            </h2>
            <ol className="lc-history">
              {audit.map((e) => (
                <li key={e.id}>
                  <p className="lc-history-what">{LC_AUDIT_LABEL[e.action] ?? e.action}</p>
                  <p className="lc-muted">
                    {name(e.actorId)} · {formatCtDateTime(e.at)}
                    {e.note ? ` · ${e.note}` : ''}
                  </p>
                </li>
              ))}
            </ol>
            <p className="lc-muted">This record is read-only.</p>
          </section>
        </aside>
      </div>
    </>
  );
}
