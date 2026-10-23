import type { Metadata } from 'next';
import { visiblePeople, CENTER_NAME } from '@/data/people';
import { Section } from '@/components/site/Section';
import { PeopleCards } from '@/components/site/PeopleCards';
import { Closing as FinalCta } from '@/components/site/acts/Closing';

export const metadata: Metadata = {
  title: 'Your Team: The People at Texas ABA Centers',
  description: 'The named people who answer when you reach out, the Regional Executive Directors, and the clinical directors at each Texas center.',
  alternates: { canonical: '/team' },
};

export default function TeamPage() {
  const bd = visiblePeople.filter((p) => p.title === 'Business Development Lead');
  const reds = visiblePeople.filter((p) => p.title === 'Regional Executive Director' || p.title === 'Director of Operations');
  const cds = visiblePeople.filter((p) => p.title === 'Clinical Director');
  return (
    <>
      <Section titleAs="h1" eyebrow="Your team" title="Real names. Real faces. Direct lines." lede="When you call, you reach a person who works here and knows the centers. These are the people you will hear back from.">
        {bd.length > 0 && <PeopleCards people={bd} />}
      </Section>
      {reds.length > 0 && (
        <Section tone="tint" title="Regional leadership">
          <PeopleCards people={reds} />
        </Section>
      )}
      {cds.length > 0 && (
        <Section title="Clinical directors by center">
          {cds.map((p) => (
            <div key={p.id} className="mb-8">
              <h3 className="h3 mb-3">{p.centers.map((c) => CENTER_NAME[c]).join(' & ')}</h3>
              <PeopleCards people={[p]} />
            </div>
          ))}
        </Section>
      )}
      <Section tone="card" title="Who is in the room with your child">
        <dl className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <dt className="font-semibold text-ink">BCBA, Board Certified Behavior Analyst</dt>
            <dd className="text-base text-body">A master&rsquo;s-level clinician certified by the Behavior Analyst Certification Board. Writes your child&rsquo;s plan with you and supervises every session.</dd>
          </div>
          <div className="card">
            <dt className="font-semibold text-ink">RBT, Registered Behavior Technician</dt>
            <dd className="text-base text-body">Trained and certified to work one-on-one with your child under the BCBA&rsquo;s supervision. The person your child will know best.</dd>
          </div>
        </dl>
      </Section>
      <FinalCta />
    </>
  );
}
