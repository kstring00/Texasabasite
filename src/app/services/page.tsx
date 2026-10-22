import type { Metadata } from 'next';
import { Section } from '@/components/site/Section';
import { ServicesStrip } from '@/components/site/HomeSections';
import { FinalCta } from '@/components/site/FinalCta';

export const metadata: Metadata = {
  title: 'ABA Therapy Services in Texas: Diagnosis, Early Intervention, Child, Teen, In-Home, In-School',
  description: 'Autism evaluations, early intervention, child and teen ABA therapy, in-home and in-school ABA across Houston, Dallas–Fort Worth and Austin. Neurodiversity-affirming, play-based, parents included.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <>
      <Section eyebrow="Services" title="What ABA is here, in plain words." lede="ABA stands for Applied Behavior Analysis. A trained therapist helps your child learn the skills they want and need, in small steps, with lots of encouragement, and keeps track of what works. Here it is play-based, neurodiversity-affirming, and built with you in the room.">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="card">
            <dt className="font-semibold text-ink">BCBA</dt>
            <dd className="text-base text-body">Board Certified Behavior Analyst. The clinician who designs your child&rsquo;s plan and oversees every session.</dd>
          </div>
          <div className="card">
            <dt className="font-semibold text-ink">RBT</dt>
            <dd className="text-base text-body">Registered Behavior Technician. The person who is with your child during sessions, supervised by the BCBA.</dd>
          </div>
          <div className="card">
            <dt className="font-semibold text-ink">Parent training</dt>
            <dd className="text-base text-body">Part of every plan. You learn what works so it keeps working at home.</dd>
          </div>
        </dl>
      </Section>
      <ServicesStrip title="Six services, one front door." lede="Every center does all six. You never get sent somewhere else to start." />
      <FinalCta />
    </>
  );
}
