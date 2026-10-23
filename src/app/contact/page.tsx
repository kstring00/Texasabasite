import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { site } from '@/data/site';
import { locations, formatAddress } from '@/data/locations';
import { Section } from '@/components/site/Section';
import { TourForm } from '@/components/site/TourForm';
import { WhoToContact } from '@/components/people/WhoToContact';

export const metadata: Metadata = {
  title: 'Contact Texas ABA Centers',
  description: `Call ${site.phone.display}, ${site.phoneHours.toLowerCase()}, tell us what you need and we point you to the right person, or send a message. Six Texas centers.`,
  alternates: { canonical: '/contact' },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ contact?: string; center?: string }> }) {
  const sp = await searchParams;
  return (
    <>
      <Section titleAs="h1" eyebrow="Contact" title="Talk to a real person." lede={`One number, answered by a person who works here. ${site.phoneHours}.`}>
        <div className="flex flex-wrap items-center gap-4">
          <a href={`tel:${site.phone.tel}`} className="btn-primary">
            <Phone className="h-4 w-4" aria-hidden /> {site.phone.display}
          </a>
          <p className="font-sans text-[length:var(--t-sm)] text-soft">{site.phoneHours}</p>
        </div>
      </Section>
      <Section id="who" size="sm" className="scroll-mt-[calc(var(--header-h)+1rem)]">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <WhoToContact place="contact" />
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <TourForm compact about="message" contact={sp.contact} defaultCenter={sp.center} />
          </div>
        </div>
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
