/**
 * Events. For the demo, the Eventbrite public organizer id drives the feed.
 * Leave `eventbriteOrganizerId` null and `manual` empty to show the "coming soon" state.
 * Recaps are real photos from real past events. Empty hides the section.
 */
export type SiteEvent = {
  id: string;
  title: string;
  startsAt: string; // ISO
  location: string; // center slug or 'online'
  venue?: string;
  url: string; // Eventbrite RSVP link
  summary?: string;
};

export const events = {
  eventbriteOrganizerId: process.env.NEXT_PUBLIC_EVENTBRITE_ORGANIZER_ID || null,
  manual: [] as SiteEvent[],
  recaps: [] as { src: string; alt: string; caption: string; location: string }[],
};

export function upcomingEvents(locationSlug?: string) {
  const now = Date.now();
  return events.manual
    .filter((e) => new Date(e.startsAt).getTime() >= now)
    .filter((e) => !locationSlug || e.location === locationSlug || e.location === 'online')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
