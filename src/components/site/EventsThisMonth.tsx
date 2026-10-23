import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { events, upcomingEvents } from '@/data/events';
import { getLocation } from '@/data/locations';
import { Section } from './Section';
import { EventCard } from './EventCard';

/** Hides itself when nothing is scheduled and no recaps exist. Never shows invented events. */
export function EventsThisMonth({ locationSlug }: { locationSlug?: string }) {
  const upcoming = upcomingEvents(locationSlug).slice(0, 3);
  const recaps = events.recaps.filter((r) => !locationSlug || r.location === locationSlug).slice(0, 2);
  const hasFeed = Boolean(events.eventbriteOrganizerId);
  if (upcoming.length === 0 && recaps.length === 0 && !hasFeed) return null;
  const center = locationSlug ? getLocation(locationSlug) : null;
  return (
    <Section eyebrow="This month" title={center ? `This month in ${center.name}.` : 'This month across Texas.'} lede="Parent nights, trainings, and family days at the centers. Open to families whether or not you are enrolled.">
      {upcoming.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-3">
          {upcoming.map((e) => (
            <li key={e.id}>
              <EventCard event={e} />
            </li>
          ))}
        </ul>
      )}
      {upcoming.length === 0 && hasFeed && (
        <p className="text-base text-body">
          <CalendarDays className="mr-2 inline h-5 w-5 text-soft" aria-hidden />
          Upcoming events are listed on our{' '}
          <Link href="/events" className="font-semibold text-ink underline underline-offset-4">
            events page
          </Link>
          .
        </p>
      )}
      {recaps.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {recaps.map((r) => (
            <li key={r.src} className="photo relative aspect-[16/10]">
              <Image src={r.src} alt={r.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
              <p className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 text-sm text-ink">{r.caption}</p>
            </li>
          ))}
        </ul>
      )}
      <Link href="/events" className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-ink underline-offset-4 hover:underline">
        All events <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </Section>
  );
}
