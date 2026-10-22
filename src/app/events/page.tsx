import type { Metadata } from 'next';
import Image from 'next/image';
import { events, upcomingEvents } from '@/data/events';
import { locations } from '@/data/locations';
import { site } from '@/data/site';
import { Section } from '@/components/site/Section';
import { EventCard } from '@/components/site/EventCard';
import { EventsFilter } from '@/components/site/EventsFilter';
import { FinalCta } from '@/components/site/FinalCta';

export const metadata: Metadata = {
  title: 'Family Events at Texas ABA Centers',
  description: 'Parent nights, trainings and family days at our Texas centers. Filter by center and RSVP on Eventbrite. Open to families whether or not you are enrolled.',
  alternates: { canonical: '/events' },
};

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ center?: string }> }) {
  const { center } = await searchParams;
  const upcoming = upcomingEvents(center);
  const organizer = events.eventbriteOrganizerId;
  return (
    <>
      <Section eyebrow="Events" title="This month across Texas." lede="Parent nights, trainings, and family days. Open to every family, enrolled or not. RSVP on Eventbrite so we know how many chairs to set out.">
        <EventsFilter current={center} />
        {upcoming.length > 0 ? (
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <li key={e.id}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        ) : organizer ? (
          <div className="mt-8 card p-0 overflow-hidden">
            <iframe
              title="Upcoming events on Eventbrite"
              src={`https://www.eventbrite.com/o/${organizer}`}
              className="h-[70vh] w-full"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="mt-8 card">
            <p className="text-base text-body">
              No events are listed yet{center ? ' for this center' : ''}. When a center schedules a parent night, it appears here and on that center&rsquo;s page. Until then, call {site.phone.display} and ask what is coming up.
            </p>
          </div>
        )}
      </Section>
      {events.recaps.length > 0 && (
        <Section tone="tint" eyebrow="Past events" title="What they looked like.">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.recaps.map((r) => (
              <li key={r.src} className="photo relative aspect-[4/3]">
                <Image src={r.src} alt={r.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                <p className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 text-sm text-ink">
                  {r.caption} · {locations.find((l) => l.slug === r.location)?.name ?? ''}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <FinalCta title="Want to see a center before an event?" text="A tour is the easiest first visit. Thirty to forty-five minutes, no commitment." />
    </>
  );
}
