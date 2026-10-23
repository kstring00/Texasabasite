import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { visiblePeople } from '@/data/people';
import { PeopleCards } from '../PeopleCards';
import { Reveal } from '../motion';
import { OpenWorldMark } from '../OpenWorld';

/**
 * Act Eight: The Humans.
 * Real names only. Roles explained in plain English. The call is the trust signal.
 */
export function Humans() {
  const people = visiblePeople;
  return (
    <section className="section-pad bg-card" aria-labelledby="humans-title">
      <div className="wrap grid grid-cols-12 gap-x-6 gap-y-10">
        <Reveal className="relative col-span-12 lg:col-span-5">
          <OpenWorldMark className="mb-8 h-14 w-16" />
          <p className="eyebrow mb-5">The humans</p>
          <h2 id="humans-title" className="h1">
            A name, <span className="editorial text-cobalt">not</span> a call center.
          </h2>
          <p className="lede mt-5">When you reach out, you reach a person who works here, knows the centers, and texts back.</p>
          <Link href="/team" className="mt-6 inline-flex items-center gap-1 font-sans text-[length:var(--t-sm)] font-bold uppercase tracking-[0.14em] text-cobalt underline-offset-4 hover:underline">
            Meet the team <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </Reveal>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          {people.length > 0 && (
            <Reveal>
              <PeopleCards people={people} compact />
            </Reveal>
          )}
          <Reveal delay={0.1}>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius)] border border-ink/15 p-5">
                <dt className="font-display text-[length:var(--t-lg)] text-ink">BCBA</dt>
                <dd className="mt-1 font-sans text-[length:var(--t-sm)] text-body">Board Certified Behavior Analyst. The clinician who writes your child’s plan with you and supervises every session.</dd>
              </div>
              <div className="rounded-[var(--radius)] border border-ink/15 p-5">
                <dt className="font-display text-[length:var(--t-lg)] text-ink">RBT</dt>
                <dd className="mt-1 font-sans text-[length:var(--t-sm)] text-body">Registered Behavior Technician. In the room with your child during sessions. The person your child knows best.</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
