import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LC_MODULE_STATUS, LcModuleChip } from '@/components/learn/staff/LcModuleChip';
import { LcStatusChip } from '@/components/learn/staff/LcStatusChip';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { canOpenProduction, productionList } from '@/lib/learn/staff/pipeline';
import { getStaffStore } from '@/lib/learn/staff/store';
import { LC_STATUS } from '@/lib/learn/staff/submissions';
import { formatCtShortDate } from '@/lib/learn/time';

export const metadata: Metadata = { title: 'Modules' };

const GROUPS = [
  { id: 'ready', title: 'Approved sources, ready for production', statuses: ['source_approved'], empty: 'No approved sources are waiting.' },
  { id: 'production', title: 'In production', statuses: ['in_production', 'awaiting_production'], empty: 'Nothing is in production.' },
  { id: 'review', title: 'In final review', statuses: ['final_review'], empty: 'No module is in final review.' },
  { id: 'approved', title: 'Final approved, ready to publish', statuses: ['final_approved'], empty: 'No module is waiting to be published.' },
  { id: 'published', title: 'Published', statuses: ['published'], empty: 'Nothing has been published yet.' },
  { id: 'withdrawn', title: 'Withdrawn', statuses: ['withdrawn'], empty: '' },
] as const;

export default async function LearnStaffModulesPage() {
  const actor = await getStaffActor();
  if (!actor) return null;
  if (!canOpenProduction(actor)) notFound();
  const rows = productionList(getStaffStore(), actor);
  return (
    <>
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">Modules</p>
          <h1 className="lc-h1">From approved source to published module</h1>
          <p className="lc-muted">Only a source with a clinical approval appears here. A module is published only after its own, second approval.</p>
        </div>
      </header>
      {GROUPS.map((g) => {
        const list = rows.filter((r) => (g.statuses as readonly string[]).includes(r.submission.status));
        if (list.length === 0 && !g.empty) return null;
        return (
          <section key={g.id} aria-labelledby={`lc-mod-${g.id}`} className="lc-queue">
            <h2 id={`lc-mod-${g.id}`} className="lc-h2 lc-queue-title">
              {g.title} <span className="lc-tabs-count">{list.length}</span>
            </h2>
            {list.length > 0 ? (
              <ul className="lc-queue-list">
                {list.map(({ submission: s, modules }) => {
                  const latest = modules.at(-1);
                  return (
                    <li key={s.id} className="lc-solid">
                      <div>
                        <p className="lc-todo-title">{latest ? latest.manifest.title : s.title}</p>
                        <p className="lc-muted">
                          Source: “{s.title}” by {getDemoStaff(s.createdBy)?.displayName ?? 'Staff member'} · updated {formatCtShortDate(s.updatedAt)}
                          {latest ? ` · module version ${latest.versionNumber}` : ''}
                        </p>
                        <p className="lc-chips">
                          <LcStatusChip status={s.status} />
                          {latest && LC_MODULE_STATUS[latest.status].label !== LC_STATUS[s.status].label ? <LcModuleChip status={latest.status} /> : null}
                        </p>
                      </div>
                      <Link href={`/learn/staff/modules/${s.id}`} className="lc-btn lc-btn-secondary">
                        Open<span className="lc-sr-only">: {s.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="lc-muted">{g.empty}</p>
            )}
          </section>
        );
      })}
    </>
  );
}
