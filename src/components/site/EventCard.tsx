'use client';

import { CalendarDays, MapPin } from 'lucide-react';
import { type SiteEvent } from '@/data/events';
import { getLocation } from '@/data/locations';
import { track } from '@/lib/site/analytics';

export function EventCard({ event }: { event: SiteEvent }) {
  const center = event.location === 'online' ? null : getLocation(event.location);
  const d = new Date(event.startsAt);
  return (
    <article className="card card-hover flex h-full flex-col">
      <p className="flex items-center gap-2 text-sm font-semibold text-plum">
        <CalendarDays className="h-4 w-4" aria-hidden />
        {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </p>
      <h3 className="h3 mt-2">{event.title}</h3>
      <p className="mt-1 flex items-center gap-1 text-sm text-soft">
        <MapPin className="h-4 w-4" aria-hidden /> {center ? `${center.name} center` : event.venue ?? 'Online'}
      </p>
      {event.summary && <p className="mt-2 flex-1 text-base text-body">{event.summary}</p>}
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary mt-4 min-h-11 self-start px-5"
        onClick={() => track({ name: 'event_rsvp_click', event: event.id, center: center?.slug })}
      >
        RSVP
      </a>
    </article>
  );
}
