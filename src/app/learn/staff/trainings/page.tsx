import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Link2Off, Plus } from 'lucide-react';
import { LcListingChip } from '@/components/learn/staff/LcListingChip';
import { checkRegistrationUrl } from '@/lib/learn/registration';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { canManageTrainings, listListings, type LcListing } from '@/lib/learn/staff/listings';
import { getStaffStore } from '@/lib/learn/staff/store';
import { formatCtDate, formatCtTimeRange } from '@/lib/learn/time';

export const metadata: Metadata = { title: 'Trainings' };

export default async function LearnStaffTrainingsPage() {
  const actor = await getStaffActor();
  if (!actor) return null;
  if (!canManageTrainings(actor)) notFound();
  const now = Date.now();
  const all = listListings(getStaffStore(), actor);
  const over = (l: LcListing) => (l.training.endAtUtc ? new Date(l.training.endAtUtc).getTime() < now : false);
  const live = (l: LcListing) => l.training.listingStatus === 'scheduled' || l.training.listingStatus === 'registration_closed';
  const newestFirst = (list: LcListing[]) => [...list].reverse();
  const groups = [
    { id: 'public', title: 'Public and upcoming', list: all.filter((l) => live(l) && !over(l)), empty: 'No upcoming training is listed.' },
    { id: 'finished', title: 'Finished, not yet marked completed', list: newestFirst(all.filter((l) => live(l) && over(l))), empty: '' },
    { id: 'drafts', title: 'Drafts', list: all.filter((l) => l.training.listingStatus === 'draft'), empty: 'No drafts.' },
    { id: 'completed', title: 'Completed', list: newestFirst(all.filter((l) => l.training.listingStatus === 'completed')), empty: '' },
    { id: 'cancelled', title: 'Cancelled', list: newestFirst(all.filter((l) => l.training.listingStatus === 'cancelled')), empty: '' },
    { id: 'archived', title: 'Archived', list: newestFirst(all.filter((l) => l.training.listingStatus === 'archived')), empty: '' },
  ];
  return (
    <>
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">Trainings</p>
          <h1 className="lc-h1">Website listings for live trainings</h1>
          <p className="lc-muted">The training, its registration and its attendance all live in Microsoft Teams. A listing here is only the public notice. It never holds a link for joining a meeting.</p>
        </div>
        <Link href="/learn/staff/trainings/new" className="lc-btn lc-btn-primary">
          <Plus width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          New listing
        </Link>
      </header>
      {groups.map((g) => {
        if (g.list.length === 0 && !g.empty) return null;
        return (
          <section key={g.id} aria-labelledby={`lc-tr-${g.id}`} className="lc-queue">
            <h2 id={`lc-tr-${g.id}`} className="lc-h2 lc-queue-title">
              {g.title} <span className="lc-tabs-count">{g.list.length}</span>
            </h2>
            {g.list.length > 0 ? (
              <ul className="lc-queue-list">
                {g.list.map((l) => {
                  const t = l.training;
                  return (
                    <li key={l.id} className="lc-solid">
                      <div>
                        <p className="lc-todo-title">{t.title}</p>
                        <p className="lc-muted">{t.startAtUtc && t.endAtUtc ? `${formatCtDate(t.startAtUtc)} · ${formatCtTimeRange(t.startAtUtc, t.endAtUtc)}` : 'No date yet'}</p>
                        <p className="lc-chips">
                          <LcListingChip status={t.listingStatus} />
                          {live(l) && !over(l) && !checkRegistrationUrl(t.registrationUrl).ok ? (
                            <span className="lc-chip" data-cast="amber">
                              <Link2Off width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
                              No registration link
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <Link href={`/learn/staff/trainings/${l.id}`} className="lc-btn lc-btn-secondary">
                        Open<span className="lc-sr-only">: {t.title}</span>
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
