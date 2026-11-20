import Link from 'next/link';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { getLcCategoryById } from '@/data/learn/categories';
import { formatCtShortDate } from '@/lib/learn/time';
import type { LcReview, LcSubmission, LcSubmissionVersion } from '@/lib/learn/staff/submissions';
import { LcStatusChip } from './LcStatusChip';

export type LcSubmissionRow = { submission: LcSubmission; latest: LcSubmissionVersion | null; review: LcReview | null };

/** Submissions as a table that becomes a stack of cards on a phone. */
export function LcSubmissionList({ rows, showAuthor }: { rows: LcSubmissionRow[]; showAuthor: boolean }) {
  return (
    <div className="lc-solid lc-table-wrap">
      <table className="lc-table">
        <thead>
          <tr>
            <th scope="col">Presentation</th>
            {showAuthor ? <th scope="col">Submitted by</th> : null}
            <th scope="col">Version</th>
            <th scope="col">Updated</th>
            <th scope="col">Reviewer</th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="lc-sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ submission: s, latest, review }) => {
            const reviewer = review ? getDemoStaff(review.reviewerId)?.displayName ?? 'Reviewer' : null;
            return (
              <tr key={s.id}>
                <th scope="row" data-label="Presentation">
                  <span className="lc-table-title">{s.title}</span>
                  <span className="lc-table-sub">{getLcCategoryById(s.categoryId)?.name ?? 'Topic not chosen yet'}</span>
                  {review && s.status === 'changes_requested' ? <span className="lc-table-feedback">Feedback: {review.comments.split('\n')[0]}</span> : null}
                </th>
                {showAuthor ? <td data-label="Submitted by">{getDemoStaff(s.createdBy)?.displayName ?? 'Staff member'}</td> : null}
                <td data-label="Version">{latest ? `Version ${latest.versionNumber}${latest.frozenAt ? '' : ' (not submitted)'}` : 'None'}</td>
                <td data-label="Updated">{formatCtShortDate(s.updatedAt)}</td>
                <td data-label="Reviewer">{reviewer ?? 'Not assigned yet'}</td>
                <td data-label="Status">
                  <LcStatusChip status={s.status} />
                </td>
                <td className="lc-table-action">
                  <Link href={`/learn/staff/submissions/${s.id}`} className="lc-btn lc-btn-secondary">
                    Open
                    <span className="lc-sr-only">: {s.title}</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
