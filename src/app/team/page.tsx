import type { Metadata } from 'next';
import { visiblePeople } from '@/data/people';
import { locations } from '@/data/locations';
import { Section } from '@/components/site/Section';
import { PeopleCards } from '@/components/site/PeopleCards';
import { Closing as FinalCta } from '@/components/site/acts/Closing';

export const metadata: Metadata = {
  title: 'Your Team: The People at Texas ABA Centers',
  description: 'The named people who answer when you reach out, the Regional Executive Directors, and the clinical directors at each Texas center.',
  alternates: { canonical: '/team' },
};

export default function TeamPage() {
  const bd = visiblePeople.filter((p) => p.role === 'business-development');
  const reds = visiblePeople.filter((p) => p.role === 'regional-executive-director');
  const cds = visiblePeople.filter((p) => p.role === 'clinical-director');
  return (
    <>
      <Section titleAs="h1" eyebrow="Your team" title="Real names. Real faces. Direct lines." lede="When you call, you reach a person who works here and knows the centers. These are the people you will hear back from.">
        {bd.length > 0 && <PeopleCards people={bd} />}
      </Section>
      {reds.length > 0 && (
        <Section tone="tint" title="Regional Executive Directors">
          <PeopleCards people={reds} />
        </Section>
      )}
      {cds.length > 0 && (
        <Section title="Clinical directors by center">
          {locations.map((l) => {
            const list = cds.filter((p) => p.location === l.slug);
            if (list.length === 0) return null;
            return (
              <div key={l.slug} className="mb-8">
                <h3 className="h3 mb-3">{l.name}</h3>
                <PeopleCards people={list} />
              </div>
            );
          })}
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
