import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, MapPin, Phone, ArrowUpRight, Star } from 'lucide-react';
import { locations, getLocation, formatAddress, mapsSearchUrl } from '@/data/locations';
import { services } from '@/data/services';
import { steps } from '@/data/steps';
import { peopleForRegion, clinicalDirectorFor } from '@/data/people';
import { circles, whileYouWait } from '@/data/circles';
import { upcomingEvents } from '@/data/events';
import { Section } from '@/components/site/Section';
import { Doorway } from '@/components/site/OpenWorld';
import { AvailabilityBadge } from '@/components/site/AvailabilityBadge';
import { CallButton, DirectionsButton, TourButton } from '@/components/site/Buttons';
import { PeopleCards } from '@/components/site/PeopleCards';
import { TourForm } from '@/components/site/TourForm';
import { EventCard } from '@/components/site/EventCard';
import { CircleLink } from '@/components/site/CircleLink';
import { Closing } from '@/components/site/acts/Closing';
import { Reveal, RevealGroup, RevealItem } from '@/components/site/motion';

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

const TONES = ['bg-butter', 'bg-sage', 'bg-lavender', 'bg-persimmon', 'bg-cobalt text-paper', 'bg-ink text-paper'];

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

      {/* Local hero: the center's own color, its own doorway. */}
      <section className="wrap-wide grid grid-cols-12 gap-x-6 gap-y-10 pb-[var(--s-4)] pt-[var(--s-3)] lg:items-end">
        <Reveal className="col-span-12 lg:col-span-7">
          <p className="eyebrow">
            <Link href="/locations" className="hover:underline">
              Locations
            </Link>{' '}
            · {l.region}
          </p>
          <h1 className="display mt-5">{l.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="lede">ABA therapy and autism evaluations in {l.city}, with no long waitlist.</p>
            <AvailabilityBadge location={l} />
          </div>
          <dl className="mt-8 grid gap-4 font-sans text-[length:var(--t-base)] sm:grid-cols-2">
            <div className="flex gap-3">
              <dt className="sr-only">Address</dt>
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-cobalt" aria-hidden />
              <dd>
                <a href={mapsSearchUrl(l)} target="_blank" rel="noopener noreferrer" className="text-ink underline-offset-4 hover:underline">
                  {line1}
                  <br />
                  {line2}
                </a>
                {!l.addressVerified && <span className="mt-1 block text-[length:var(--t-sm)] text-soft">Call ahead to confirm the entrance.</span>}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="sr-only">Phone</dt>
              <Phone className="mt-1 h-5 w-5 shrink-0 text-cobalt" aria-hidden />
              <dd>
                <a href={`tel:${l.phone.tel}`} className="text-ink underline-offset-4 hover:underline">
                  {l.phone.display}
                </a>
                {l.hours && (
                  <span className="mt-1 flex items-center gap-1 text-[length:var(--t-sm)] text-soft">
                    <Clock className="h-4 w-4" aria-hidden /> {l.hours}
                  </span>
                )}
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <TourButton center={l.slug} size="lg" />
            <CallButton location={l} place="location-hero" />
            <DirectionsButton location={l} />
          </div>
          {l.googleReviewUrl && (
            <a href={l.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 font-sans text-[length:var(--t-sm)] font-semibold text-ink underline-offset-4 hover:underline">
              <Star className="h-4 w-4" aria-hidden /> Read Google reviews
            </a>
          )}
        </Reveal>
        <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9" delay={0.1}>
          {l.photos[0] ? (
            <div className="photo portal relative aspect-[4/5]">
              <Image src={l.photos[0].src} alt={l.photos[0].alt} fill priority sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
            </div>
          ) : (
            <Doorway seed={idx} label={`${l.name} center`} />
          )}
        </Reveal>
      </section>

      {lead && (
        <Section tone="tint" size="sm" eyebrow="Clinical lead" title={`Who will be with your child in ${l.name}`}>
          <PeopleCards people={[{ id: 'lead', name: lead.name, title: lead.title, credentials: lead.credentials, photo: lead.photo, regions: [l.region], role: 'clinical-director' }]} compact />
        </Section>
      )}

      <Section eyebrow="At this center" title={<>Services in <span className="editorial text-cobalt">{l.city}.</span></>}>
        <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {centerServices.map((s, i) => {
            const dark = TONES[i % TONES.length].includes('text-paper');
            return (
              <RevealItem as="li" key={s.slug}>
                <Link href={`/services/${s.slug}`} className={`group flex h-full min-h-[14rem] flex-col justify-between arch p-6 pt-10 transition hover:-translate-y-1 ${TONES[i % TONES.length]}`}>
                  <span>
                    <span className={`font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.18em] ${dark ? 'text-paper/90' : 'text-ink/75'}`}>{s.ages}</span>
                    <span className={`mt-2 block font-display text-[length:var(--t-xl)] leading-tight ${dark ? 'text-paper' : 'text-ink'}`}>{s.name}</span>
                  </span>
                  <span className={`mt-4 font-sans text-[length:var(--t-sm)] ${dark ? 'text-paper/85' : 'text-ink/80'}`}>{s.short}</span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      {l.photos.length > 1 && (
        <Section tone="card" eyebrow="Walk through" title="The rooms your child will know.">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {l.photos.slice(1, 5).map((p, i) => (
              <li key={p.src} className={`photo relative aspect-[4/5] ${i % 2 ? 'lg:translate-y-8' : ''}`}>
                <Image src={p.src} alt={p.alt} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tone="ink" eyebrow="What a tour here looks like" title={`A tour of ${l.name}, step by step.`} lede={`${tour.howLong} ${tour.whatToBring}`}>
        <RevealGroup as="ol" className="grid gap-4 md:grid-cols-3">
          {tour.whatHappens.map((t, i) => (
            <RevealItem as="li" key={t} className="rounded-[var(--radius)] border border-paper/15 p-6">
              <span className="num text-[length:var(--t-3xl)] leading-none text-butter">{i + 1}</span>
              <p className="mt-3 font-sans text-[length:var(--t-base)] text-paper/85">{t}</p>
            </RevealItem>
          ))}
        </RevealGroup>
        <p className="mt-6 font-sans text-[length:var(--t-sm)] text-paper/70">
          <span className="font-semibold text-paper">After: </span>
          {tour.whatsNext}
        </p>
        {l.arrivalNote && <p className="mt-4 font-sans text-[length:var(--t-base)] text-paper/85">{l.arrivalNote}</p>}
      </Section>

      <Section tone="lavender" eyebrow="Before day one" title="You can join before you start.">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[var(--radius)] bg-paper/70 p-6">
            <p className="eyebrow">Parent circles</p>
            <ul className="mt-3 space-y-3">
              {localCircles.map((c) => (
                <li key={c.id}>
                  <CircleLink circle={c} />
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--radius)] bg-paper/70 p-6">
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
                    <Link href={w.href === '/families/while-you-wait' ? `/families/while-you-wait?center=${l.slug}` : w.href} className="group flex items-start justify-between gap-3 rounded-2xl border border-ink/15 p-4 transition hover:border-ink">
                      <span>
                        <span className="block font-display text-[length:var(--t-lg)] text-ink">{w.title}</span>
                        <span className="block font-sans text-[length:var(--t-sm)] text-body">{w.text}</span>
                      </span>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink/50 transition group-hover:text-ink" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      {people.length > 0 && (
        <Section tone="card" size="sm" eyebrow="Who answers" title={`Your people in ${l.region}.`}>
          <PeopleCards people={people} />
        </Section>
      )}

      <Section id="tour" eyebrow="Request a tour" title={`See the ${l.name} center.`} lede="About 30 to 45 minutes. Bring every question. Kids and siblings welcome.">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <TourForm defaultCenter={l.slug} />
          <aside className="arch self-start bg-butter p-7 pt-12">
            <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.18em] text-ink/70">On the tour</p>
            <p className="mt-2 font-display text-[length:var(--t-xl)] leading-tight text-ink">{tour.whoYouMeet}</p>
            <p className="mt-4 font-sans text-[length:var(--t-sm)] text-ink/80">Prefer to talk first? Call {l.phone.display}.</p>
          </aside>
        </div>
      </Section>

      <Closing location={l} />
    </>
  );
}
