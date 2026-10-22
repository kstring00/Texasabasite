import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { locations } from '@/data/locations';
import { peopleForRegion } from '@/data/people';
import { site } from '@/data/site';
import { Section } from '@/components/site/Section';
import { CenterFinder } from '@/components/site/CenterFinder';
import { TourButton, CallButton } from '@/components/site/Buttons';
import { StepPath } from '@/components/site/StepPath';
import { LocationCard } from '@/components/site/LocationCard';
import { PeopleCards } from '@/components/site/PeopleCards';
import { FinalCta } from '@/components/site/FinalCta';
import { ServicesStrip, InsuranceStrip, CommonGroundBridge } from '@/components/site/HomeSections';
import { EventsThisMonth } from '@/components/site/EventsThisMonth';
import { FromTheBlog } from '@/components/site/FromTheBlog';
import { Hero } from '@/components/site/Hero';

export const metadata: Metadata = {
  title: 'ABA Therapy & Autism Evaluations in Texas, No Long Waitlist | Texas ABA Centers',
  description:
    'Six centers in Austin, Cedar Hill, Katy, Pearland, Plano and Sugar Land. In-house autism evaluations, free benefits checks, and a real person who texts you back. Request a tour.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const people = peopleForRegion('all');
  return (
    <>
      <Hero>
        <p className="eyebrow">Texas ABA Centers</p>
        <h1 className="h1 mt-3">{site.tagline}</h1>
        <p className="lede mt-5 max-w-2xl">
          See your nearest center, meet the people who will be with your child, and know what the first visit looks like before you ever walk in.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <TourButton size="lg" />
          <CallButton place="hero" variant="ghost" />
        </div>
        <CenterFinder className="mt-8" compact />
      </Hero>

      <Section eyebrow="How it works" title="Your path from first worry to first day." lede="Five steps. Each one says who you meet and how long it takes. No step is a surprise.">
        <StepPath />
        <Link href="/getting-started" className="mt-10 inline-flex items-center gap-2 text-base font-semibold text-ink underline-offset-4 hover:underline">
          Every step in detail <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Section>

      <Section id="centers" tone="tint" eyebrow="Six centers" title="Centers across Texas." lede="Houston, Dallas–Fort Worth, and Austin. Every center does evaluations and therapy, so there is one front door.">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((l, i) => (
            <li key={l.slug}>
              <LocationCard location={l} index={i} />
            </li>
          ))}
        </ul>
      </Section>

      <CommonGroundBridge />

      <ServicesStrip />

      <InsuranceStrip />

      <EventsThisMonth />

      <FromTheBlog />

      {people.length > 0 && (
        <Section id="people" eyebrow="Your people" title="A name, not a call center." lede="These are the people who answer when you reach out. They text back.">
          <PeopleCards people={people} />
        </Section>
      )}

      <FinalCta />
    </>
  );
}
