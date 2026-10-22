import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/data/site';
import { locations, formatAddress } from '@/data/locations';
import { peopleForRegion } from '@/data/people';
import { Section } from '@/components/site/Section';
import { CallButton, TourButton } from '@/components/site/Buttons';
import { PeopleCards } from '@/components/site/PeopleCards';

export const metadata: Metadata = {
  title: 'Contact Texas ABA Centers',
  description: `Call ${site.phone.display}, ${site.phoneHours.toLowerCase()}, or request a tour at any of six Texas centers. Addresses for Austin, Cedar Hill, Katy, Pearland, Plano and Sugar Land.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const people = peopleForRegion('all');
  return (
    <>
      <Section eyebrow="Contact" title="Talk to a person." lede={`Call ${site.phone.display}, ${site.phoneHours.toLowerCase()}. Or request a tour and we text you back within one business day.`}>
        <div className="flex flex-wrap gap-3">
          <TourButton size="lg" />
          <CallButton place="contact" />
          <a href={`tel:${site.phoneAlt.tel}`} className="btn-ghost">
            Or {site.phoneAlt.display}
          </a>
        </div>
        {people.length > 0 && (
          <div className="mt-10">
            <PeopleCards people={people} />
          </div>
        )}
      </Section>
      <Section tone="tint" title="Centers">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((l) => (
            <li key={l.slug} className="card">
              <h3 className="h3">
                <Link href={`/locations/${l.slug}`} className="underline-offset-4 hover:underline">
                  {l.name}
                </Link>
              </h3>
              <p className="mt-1 text-base text-body">{formatAddress(l)}</p>
              <a href={`tel:${l.phone.tel}`} className="mt-2 inline-block font-semibold text-ink underline-offset-4 hover:underline">
                {l.phone.display}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-base text-body">
          Pediatrician or therapist?{' '}
          <Link href="/providers" className="font-semibold text-ink underline underline-offset-4">
            Refer a family here.
          </Link>{' '}
          Looking for work?{' '}
          <a href={site.careersUrl} className="font-semibold text-ink underline underline-offset-4" target="_blank" rel="noopener noreferrer">
            Careers are on our corporate site.
          </a>
        </p>
      </Section>
    </>
  );
}
