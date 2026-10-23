import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { getLocation, locations } from '@/data/locations';
import { getPeopleForCenter, centerIdFromSlug, hasNamedTeam } from '@/data/people';
import { PeopleCards } from '@/components/site/PeopleCards';
import { WhoToContact } from '@/components/people/WhoToContact';
import { CareTeamPeople } from '@/components/people/CareTeamPeople';
import { CallButton } from '@/components/site/Buttons';

export const metadata: Metadata = {
  title: 'Your Care Team',
  description: 'Who is on your child\'s team at Texas ABA Centers, what a BCBA and an RBT do, and how to reach a real person at your center.',
};

export default async function CareTeamPage({ searchParams }: { searchParams: Promise<{ center?: string }> }) {
  const { center: slug } = await searchParams;
  const center = slug ? getLocation(slug) : null;
  const centerId = center ? centerIdFromSlug(center.slug) : null;
  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Your care team</p>
        <h1 className="h2">{center ? `Your team at ${center.name}.` : 'The people on your child\'s team.'}</h1>
        <p className="page-description text-base">
          You should know every name. Here is who does what, and who to reach when you have a question.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="font-sans text-lg font-bold text-ink">Your child&rsquo;s BCBA</p>
          <p className="mt-1 text-base text-body">Board Certified Behavior Analyst. Writes the plan with you, reviews progress with you, and supervises every session.</p>
        </div>
        <div className="card">
          <p className="font-sans text-lg font-bold text-ink">Your child&rsquo;s RBT</p>
          <p className="mt-1 text-base text-body">Registered Behavior Technician. In the room with your child during sessions. The person your child knows best.</p>
        </div>
        <div className="card">
          <p className="font-sans text-lg font-bold text-ink">Your family contact</p>
          <p className="mt-1 text-base text-body">The person who answers the phone and texts you back. Scheduling, insurance, and anything you are not sure who to ask.</p>
        </div>
      </section>

      <section aria-label="Who to contact">
        <WhoToContact centerId={centerId} place="care-team" />
      </section>

      <CareTeamPeople centerId={centerId} />

      <section className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-sans text-lg font-bold text-ink">Already enrolled?</p>
          <p className="text-base text-body">Your care plan, progress and messages live in the family portal.</p>
        </div>
        <Link href="/families/client" className="btn-secondary">
          <Lock className="h-4 w-4" aria-hidden /> Family sign-in
        </Link>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <CallButton location={center} place="care-team" />
        {!center && (
          <p className="text-sm text-soft">
            Pick your center:{' '}
            {locations.map((l, i) => (
              <span key={l.slug}>
                <Link href={`/families/care-team?center=${l.slug}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                  {l.name}
                </Link>
                {i < locations.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        )}
        {center && (
          <Link href={`/locations/${center.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-ink underline-offset-4 hover:underline">
            The {center.name} center <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
