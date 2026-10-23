import type { Metadata } from 'next';
import { Section } from '@/components/site/Section';
import { ServiceExplorer } from '@/components/site/acts/ServiceExplorer';
import { Closing } from '@/components/site/acts/Closing';

export const metadata: Metadata = {
  title: 'ABA Therapy Services in Texas: Diagnosis, Early Intervention, Child, Teen, In-Home, In-School',
  description: 'Autism evaluations, early intervention, child and teen ABA therapy, in-home and in-school ABA across Houston, Dallas–Fort Worth and Austin. Neurodiversity-affirming, play-based, parents included.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <>
      <Section titleAs="h1" eyebrow="Services" title={<>What ABA is here, in <span className="editorial text-cobalt">plain words.</span></>} lede="ABA stands for Applied Behavior Analysis. A trained therapist helps your child learn the skills they want and need, in small steps, with lots of encouragement, and keeps track of what works. Here it is play-based, neurodiversity-affirming, and built with you in the room.">
        <dl className="grid gap-4 sm:grid-cols-3">
          {[
            ['BCBA', 'Board Certified Behavior Analyst. The clinician who designs your child’s plan and oversees every session.'],
            ['RBT', 'Registered Behavior Technician. The person who is with your child during sessions, supervised by the BCBA.'],
            ['Parent training', 'Part of every plan. You learn what works so it keeps working at home.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-[var(--radius)] border border-ink/15 p-5">
              <dt className="font-display text-[length:var(--t-lg)] text-ink">{t}</dt>
              <dd className="mt-1 font-sans text-[length:var(--t-sm)] text-body">{d}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section tone="tint" eyebrow="Six services" title={<>One plan, <span className="editorial text-cobalt">you</span> in it.</>} lede="Every center does all six. You never get sent somewhere else to start.">
        <ServiceExplorer />
      </Section>
      <Closing />
    </>
  );
}
