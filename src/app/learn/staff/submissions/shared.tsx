import Link from 'next/link';
import { LcSubmissionList, type LcSubmissionRow } from '@/components/learn/staff/LcSubmissionList';
import type { LcStaffActor } from '@/lib/learn/staff/roles';
import { getStaffStore } from '@/lib/learn/staff/store';
import { LC_STATUS_FILTERS, listSubmissions, type LcStatusFilter } from '@/lib/learn/staff/submissions';

/** The filter tabs and table shared by "My submissions" and "All submissions". */
export function SubmissionsView({ actor, scope, status, basePath, emptyText }: { actor: LcStaffActor; scope: 'mine' | 'all'; status: string | undefined; basePath: string; emptyText: string }) {
  const store = getStaffStore();
  const all = listSubmissions(store, actor, scope);
  const active = (LC_STATUS_FILTERS.find((f) => f.id === status)?.id ?? 'all') as LcStatusFilter;
  const filter = LC_STATUS_FILTERS.find((f) => f.id === active)!;
  const shown = active === 'all' ? all : all.filter((s) => filter.statuses.includes(s.status));
  const rows: LcSubmissionRow[] = shown.map((submission) => ({
    submission,
    latest: store.versions.filter((v) => v.submissionId === submission.id).sort((a, b) => b.versionNumber - a.versionNumber)[0] ?? null,
    review: store.reviews.filter((r) => r.submissionId === submission.id).sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))[0] ?? null,
  }));
  return (
    <>
      <nav aria-label="Filter by status" className="lc-tabs">
        <ul>
          {LC_STATUS_FILTERS.map((f) => {
            const n = f.id === 'all' ? all.length : all.filter((s) => f.statuses.includes(s.status)).length;
            return (
              <li key={f.id}>
                <Link href={f.id === 'all' ? basePath : `${basePath}?status=${f.id}`} aria-current={f.id === active ? 'page' : undefined}>
                  {f.label} <span className="lc-tabs-count">{n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {rows.length > 0 ? (
        <LcSubmissionList rows={rows} showAuthor={scope === 'all'} />
      ) : (
        <div className="lc-solid lc-empty">
          <p className="lc-empty-title">{all.length === 0 ? 'Nothing here yet' : `Nothing with the status “${filter.label}”`}</p>
          <p className="lc-muted">{all.length === 0 ? emptyText : 'Choose another status above to see the rest.'}</p>
        </div>
      )}
    </>
  );
}
