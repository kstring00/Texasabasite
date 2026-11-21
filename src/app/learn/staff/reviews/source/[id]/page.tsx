import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Download, Info, Presentation } from 'lucide-react';
import { LcBack } from '@/components/learn/LcPageHead';
import { LcDecisionForm } from '@/components/learn/staff/LcDecisionForm';
import { LcStartReviewButton } from '@/components/learn/staff/LcProductionControls';
import { LcStatusChip } from '@/components/learn/staff/LcStatusChip';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { getLcCategoryById } from '@/data/learn/categories';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { LC_SOURCE_CHECKLIST, sourceReviewBlock } from '@/lib/learn/staff/pipeline';
import { formatBytes } from '@/lib/learn/staff/pptx';
import { LC_ROLE_LABEL, can } from '@/lib/learn/staff/roles';
import { getStaffStore } from '@/lib/learn/staff/store';
import { LC_CHECKLIST, viewSubmission } from '@/lib/learn/staff/submissions';
import { formatCtDateTime } from '@/lib/learn/time';

export const metadata: Metadata = { title: 'Source review' };

export default async function LearnStaffSourceReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  // Without the review permission this address does not exist.
  if (!can(actor, 'review.source')) notFound();
  const view = viewSubmission(getStaffStore(), actor, (await params).id);
  if (!view) notFound();
  const { submission: s, versions, reviews } = view;
  const version = [...versions].reverse().find((v) => v.frozenAt);
  if (!version) notFound();
  const waiting = s.status === 'submitted' || s.status === 'in_review';
  const blocked = sourceReviewBlock(actor, s);
  const author = getDemoStaff(s.createdBy);
  const snap = version.snapshot ?? s;
  const earlier = reviews.filter((r) => r.targetType === 'source_pptx');

  return (
    <div data-cast="blue" className="lc-review">
      <LcBack href="/learn/staff/reviews?gate=source" label="Reviews" />
      <div className="lc-gate-strip">
        <p className="lc-gate-strip-title">
          <Presentation width={20} height={20} strokeWidth={1.75} aria-hidden="true" /> Gate 1 · Source PowerPoint
        </p>
        <p className="lc-muted">You are reviewing the PowerPoint only. The module made from it gets its own review later, by a second person.</p>
      </div>
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">{getLcCategoryById(snap.categoryId)?.name ?? 'Topic'}</p>
          <h1 className="lc-h1">{snap.title}</h1>
          <p className="lc-chips">
            <LcStatusChip status={s.status} />
          </p>
        </div>
      </header>

      <div className="lc-staff-cols">
        <div className="lc-staff-main-col">
          <section aria-labelledby="lc-rv-file" className="lc-solid lc-panel">
            <h2 id="lc-rv-file" className="lc-h2">
              The file to review: version {version.versionNumber}
            </h2>
            {version.asset ? (
              <div className="lc-file-row">
                <span className="lc-icon-tile" data-size="sm" aria-hidden="true">
                  <Presentation width={20} height={20} strokeWidth={1.75} />
                </span>
                <span className="lc-file-text">
                  <span className="lc-file-name">{version.asset.fileName}</span>
                  <span className="lc-muted">
                    {formatBytes(version.asset.byteSize)} · submitted {version.frozenAt ? formatCtDateTime(version.frozenAt) : ''}
                    {version.asset.synthetic ? ' · Synthetic demo file, not a real presentation' : ''} · Not scanned for malware in the demo
                  </span>
                </span>
                <a href={`/learn/staff/api/uploads/${version.asset.id}`} className="lc-btn lc-btn-secondary" download>
                  <Download width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                  Download
                </a>
              </div>
            ) : null}
            <p className="lc-muted">There is no slide preview in the demo. Download the file and open it in PowerPoint, including hidden slides, notes and comments.</p>
            {version.revisionNotes ? <p className="lc-feedback-text">What the contributor changed in this version: {version.revisionNotes}</p> : null}
          </section>

          <section aria-labelledby="lc-rv-decide" className="lc-solid lc-panel">
            <h2 id="lc-rv-decide" className="lc-h2">
              Your decision
            </h2>
            {!waiting ? (
              <p className="lc-note" data-cast="slate">
                <Info width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                <span>This version is not waiting for a source review. Its status is “{s.status.replace(/_/g, ' ')}”.</span>
              </p>
            ) : blocked ? (
              <p className="lc-note" data-cast="amber" role="note">
                <Info width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                <span>{blocked}</span>
              </p>
            ) : (
              <>
                {s.status === 'submitted' ? <LcStartReviewButton submissionId={s.id} rev={s.rev} /> : <p className="lc-muted">In review by {getDemoStaff(s.reviewerId)?.displayName ?? 'a reviewer'}.</p>}
                <LcDecisionForm target={{ gate: 'source', submissionId: s.id, versionId: version.id }} rev={s.rev} checklist={LC_SOURCE_CHECKLIST.map((c) => ({ ...c }))} what={`version ${version.versionNumber} of “${snap.title}” as a source`} declineLabel="Decline" />
              </>
            )}
          </section>

          {earlier.length > 0 ? (
            <section aria-labelledby="lc-rv-earlier" className="lc-solid lc-panel">
              <h2 id="lc-rv-earlier" className="lc-h2">
                Earlier source reviews
              </h2>
              <ul className="lc-versions">
                {earlier.map((r) => (
                  <li key={r.id}>
                    <div>
                      <p className="lc-versions-title">
                        {r.decision === 'approved' ? 'Approved' : r.decision === 'declined' ? 'Declined' : 'Changes requested'}, version {versions.find((v) => v.id === r.targetVersionId)?.versionNumber ?? '?'}
                      </p>
                      <p className="lc-muted">
                        {getDemoStaff(r.reviewerId)?.displayName ?? 'Reviewer'} · {formatCtDateTime(r.decidedAt)}
                      </p>
                      {r.comments ? <p className="lc-feedback-text">{r.comments}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="lc-staff-side-col" aria-label="Submission details">
          <section aria-labelledby="lc-rv-details" className="lc-solid lc-panel">
            <h2 id="lc-rv-details" className="lc-h3">
              What was submitted
            </h2>
            <dl className="lc-summary">
              <div><dt>Contributor</dt><dd>{author ? `${author.displayName}, ${LC_ROLE_LABEL[author.role]}` : 'Staff member'}</dd></div>
              <div><dt>Summary</dt><dd>{snap.summary}</dd></div>
              <div><dt>Objectives</dt><dd><ul>{snap.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul></dd></div>
              <div><dt>Audience</dt><dd>{snap.audience}</dd></div>
              <div><dt>Tags</dt><dd>{snap.tags.length ? snap.tags.join(', ') : 'None'}</dd></div>
              <div><dt>Contributor’s checklist</dt><dd>{version.snapshot ? `${LC_CHECKLIST.filter((c) => version.snapshot!.checklist[c.key]).length} of ${LC_CHECKLIST.length} confirmed when submitted` : 'Not recorded'}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
