import { checkRegistrationUrl } from './registration';
import { LC_TIME_ZONE } from './time';

/**
 * A website listing for a live training. The event itself, its registration, approval of
 * registrants and attendance all live in Microsoft Teams. This record never holds a join link,
 * a registrant, or anything about a family.
 */
export type LcListingStatus = 'draft' | 'scheduled' | 'registration_closed' | 'completed' | 'cancelled' | 'archived';

export type LcTraining = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string[];
  objectives: string[];
  /** Null until a real event is scheduled. A date is never invented. */
  startAtUtc: string | null;
  endAtUtc: string | null;
  timeZone: typeof LC_TIME_ZONE;
  /** Shown only when the presenter has approved being named. */
  presenterLabel: string | null;
  categoryId: string;
  relatedModuleIds: string[];
  /** The official Teams registration page. Never a join link. */
  registrationUrl: string | null;
  listingStatus: LcListingStatus;
  /** True for the labelled example listing in demo mode. */
  isExample: boolean;
  lastUpdated: string | null;
};

/** What a caregiver sees. Draft and archived listings are never public. */
export type LcTrainingView = 'open' | 'details_soon' | 'closed' | 'completed' | 'cancelled';

export function isPubliclyListed(t: LcTraining): boolean {
  return t.listingStatus !== 'draft' && t.listingStatus !== 'archived';
}

export function trainingView(t: LcTraining, now: Date): LcTrainingView {
  if (t.listingStatus === 'cancelled') return 'cancelled';
  const over = t.endAtUtc ? new Date(t.endAtUtc).getTime() < now.getTime() : false;
  if (t.listingStatus === 'completed' || over) return 'completed';
  if (t.listingStatus === 'registration_closed') return 'closed';
  return checkRegistrationUrl(t.registrationUrl).ok ? 'open' : 'details_soon';
}

/** Behind us: finished, or cancelled with its date already gone. A cancelled training that is still ahead stays with the upcoming ones, so families see the change. */
export function isPastTraining(t: LcTraining, now: Date): boolean {
  const v = trainingView(t, now);
  if (v === 'completed') return true;
  return v === 'cancelled' && !!t.endAtUtc && new Date(t.endAtUtc).getTime() < now.getTime();
}

/** Upcoming first by date; listings with no date yet go last; cancelled after those; past trainings last, newest first. */
export function sortTrainings(list: LcTraining[], now: Date): LcTraining[] {
  const rank = (t: LcTraining) => (isPastTraining(t, now) ? 2 : trainingView(t, now) === 'cancelled' ? 1 : 0);
  const time = (t: LcTraining) => (t.startAtUtc ? new Date(t.startAtUtc).getTime() : Number.MAX_SAFE_INTEGER);
  return [...list].sort((a, b) => rank(a) - rank(b) || (rank(a) === 2 ? time(b) - time(a) : time(a) - time(b)));
}
