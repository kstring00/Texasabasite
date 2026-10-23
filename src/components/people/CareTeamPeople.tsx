'use client';

import { getPeopleForCenter, hasNamedTeam, CENTER_NAME } from '@/data/people';
import { useMyCenter } from '@/lib/site/myCenter';
import { PeopleCards } from '@/components/site/PeopleCards';
import { CenterPill } from './CenterPill';

/** The center's people, from the page's center or the remembered one. */
export function CareTeamPeople({ centerId: preset }: { centerId: string | null }) {
  const { centerId: mine, setCenter } = useMyCenter();
  const centerId = preset ?? mine;
  const people = getPeopleForCenter(centerId);
  return (
    <section aria-labelledby="care-team-people">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="care-team-people" className="section-title">{centerId ? `Your team at ${CENTER_NAME[centerId]}` : 'Who to call'}</h2>
        {centerId && !preset && <CenterPill centerId={centerId} onChange={() => setCenter(null)} />}
      </div>
      <PeopleCards people={people} centerId={centerId} place="care-team" />
      {centerId && !hasNamedTeam(centerId) && <p className="mt-3 font-sans text-[14px] text-soft">Your center team will introduce themselves at your tour.</p>}
    </section>
  );
}
