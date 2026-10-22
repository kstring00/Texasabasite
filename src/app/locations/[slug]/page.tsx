import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, MapPin, Phone, ArrowRight, Users, Star } from 'lucide-react';
import { locations, getLocation, formatAddress, mapsSearchUrl } from '@/data/locations';
import { services } from '@/data/services';
import { steps } from '@/data/steps';
import { peopleForRegion, clinicalDirectorFor } from '@/data/people';
import { circles, whileYouWait } from '@/data/circles';
import { upcomingEvents } from '@/data/events';
import { Section } from '@/components/site/Section';
import { CenterArt } from '@/components/site/CenterArt';
import { AvailabilityBadge } from '@/components/site/AvailabilityBadge';
import { CallButton, DirectionsButton, TourButton } from '@/components/site/Buttons';
import { PeopleCards } from '@/components/site/PeopleCards';
import { TourForm } from '@/components/site/TourForm';
import { EventCard } from '@/components/site/EventCard';
import { CircleLink } from '@/components/site/CircleLink';

export function generateStaticParams() {
  return locations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = getLocation(slug);
  if (!l) return {};
  return {
    title: `ABA Therapy & Autism Evaluations in ${l.city}, TX`,
    description: `Texas ABA Centers ${l.name}: ABA therapy and in-house autism evaluations at ${formatAddress(l)}. No long waitlist. Call ${l.phone.display} or request a tour.`,
    alternates: { canonical: `/locations/${l.slug}` },
  };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = getLocation(slug);
  if (!l) notFound();
  const idx = locations.indexOf(l);
  const lead = l.clinicalLead ?? clinicalDirectorFor(l.slug);
  const people = peopleForRegion(l.region);
  const [line1, line2] = formatAddress(l, false) as string[];
  const centerServices = services.filter((s) => l.services.includes(s.slug));
  const tour = steps.find((s) => s.slug === 'tour')!;
  const nextEvents = upcomingEvents(l.slug).slice(0, 2);
  const localCircles = circles.filter((c) => c.regions.includes('all') || c.regions.includes(l.region));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: `Texas ABA Centers ${l.name}`,
    telephone: l.phone.tel,
    address: { '@type': 'PostalAddress', streetAddress: line1, addressLocality: l.address.city, addressRegion: 'TX', postalCode: l.address.zip, addressCountry: 'US' },
    url: `/locations/${l.slug}`,
    medicalSpecialty: 'Applied Behavior Analysis',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="wrap grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="eyebrow">
            <Link href="/locations" className="hover:underline">
              Locations
            </Link>{' '}
            · {l.region}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="h1">{l.name}</h1>
            <AvailabilityBadge location={l} />
          </div>
          <p className="lede mt-4">ABA therapy and autism evaluations in {l.city}, with no long waitlist.</p>
          <dl className="mt-6 space-y-3 text-base">
            <div className="flex gap-3">
              <dt className="sr-only">Address</dt>
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-soft" aria-hidden />
              <dd>
                <a href={mapsSearchUrl(l)} target="_blank" rel="noopener noreferrer" className="text-ink underline-offset-4 hover:underline">
                  {line1}
                  <br />
                  {line2}
                </a>
                {!l.addressVerified && <span className="mt-1 block text-sm text-soft">Call ahead to confirm the entrance.</span>}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="sr-only">Phone</dt>
              <Phone className="mt-1 h-5 w-5 shrink-0 text-soft" aria-hidden />
              <dd>
                <a href={`tel:${l.phone.tel}`} className="text-ink underline-offset-4 hover:underline">
                  {l.phone.display}
                </a>
              </dd>
            </div>
            {l.hours && (
              <div className="flex gap-3">
                <dt className="sr-only">Hours</dt>
                <Clock className="mt-1 h-5 w-5 shrink-0 text-soft" aria-hidden />
                <dd>{l.hours}</dd>
              </div>
            )}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <TourButton center={l.slug} size="lg" />
            <CallButton location={l} place="location-hero" />
            <DirectionsButton location={l} />
          </div>
          {l.googleReviewUrl && (
            <a href={l.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink underline-offset-4 hover:underline">
              <Star className="h-4 w-4" aria-hidden /> Read Google reviews
            </a>
          )}
        </div>
        {l.photos[0] ? (
          <div className="photo relative aspect-[16/11]">
            <Image src={l.photos[0].src} alt={l.photos[0].alt} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          </div>
        ) : (
          <CenterArt seed={idx} label={`${l.name} center`} />
        )}
      </section>

      {lead && (
        <Section tone="tint" className="py-10 sm:py-12" title="Who will be with your child">
          <PeopleCards people={[{ id: 'lead', name: lead.name, title: lead.title, credentials: lead.credentials, photo: lead.photo, regions: [l.region], role: 'clinical-director' }]} compact />
        </Section>
      )}

      <Section eyebrow="At this center" title={`Services in ${l.city}`}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {centerServices.map((s) => (
            <li key={s.slug}>
              <Link href={`/services/${s.slug}`} className="card card-hover block h-full">
                <p className="eyebrow">{s.ages}</p>
                <h3 className="h3 mt-2">{s.name}</h3>
                <p className="mt-2 text-base text-body">{s.short}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {l.photos.length > 1 && (
        <Section tone="card" eyebrow="Walk through" title="The rooms your child will know.">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {l.photos.slice(1, 5).map((p) => (
              <li key={p.src} className="photo relative aspect-[4/3]">
                <Image src={p.src} alt={p.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tone="tint" eyebrow="What a tour here looks like" title={`A tour of ${l.name}, step by step.`} lede={`${tour.howLong} ${tour.whatToBring}`}>
        <ol className="grid gap-4 md:grid-cols-3">
          {tour.whatHappens.map((t, i) => (
            <li key={t} className="card">
              <span className="font-serif text-3xl text-plum">{i + 1}</span>
              <p className="mt-2 text-base text-body">{t}</p>
            </li>
          ))}
        </ol>
        {l.arrivalNote && <p className="mt-6 text-base text-body">{l.arrivalNote}</p>}
      </Section>

      <Section eyebrow="Before day one" title="You can join before you start.">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="card">
            <p className="eyebrow">Parent circles</p>
            <ul className="mt-3 space-y-3">
              {localCircles.map((c) => (
                <li key={c.id}>
                  <CircleLink circle={c} />
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <p className="eyebrow">{nextEvents.length > 0 ? `Next in ${l.name}` : 'While you wait'}</p>
            {nextEvents.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {nextEvents.map((e) => (
                  <li key={e.id}>
                    <EventCard event={e} />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-3 space-y-3">
                {whileYouWait.slice(0, 3).map((w) => (
                  <li key={w.href}>
                    <Link href={w.href} className="group flex items-start justify-between gap-3 rounded-2xl border border-line p-4 transition hover:border-ink/40">
                      <span>
                        <span className="block font-semibold text-ink">{w.title}</span>
                        <span className="block text-sm text-body">{w.text}</span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-soft transition group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      {people.length > 0 && (
        <Section tone="card" eyebrow="Who answers" title={`Your people in ${l.region}.`}>
          <PeopleCards people={people} />
        </Section>
      )}

      <Section id="tour" eyebrow="Request a tour" title={`See the ${l.name} center.`} lede="About 30 to 45 minutes. Bring every question. Kids and siblings welcome.">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <TourForm defaultCenter={l.slug} />
          <aside className="card space-y-4 self-start">
            <p className="eyebrow flex items-center gap-2">
              <Users className="h-4 w-4" aria-hidden /> On the tour
            </p>
            <p className="text-base text-body">{tour.whoYouMeet}</p>
            <p className="text-base text-body">
              <span className="font-semibold text-ink">After: </span>
              {tour.whatsNext}
            </p>
            <p className="text-sm text-soft">Prefer to talk first? Call {l.phone.display}.</p>
          </aside>
        </div>
      </Section>
    </>
  );
}
