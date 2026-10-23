/**
 * Real people only. One source of truth for "who do I contact".
 * No personal emails or direct numbers: every contact action uses the main line and the form.
 * Center ids match components/locations/data/centers.ts (pearland, sugarland, katy, plano, cedarhill, austin).
 */
export type Topic = 'start' | 'tour' | 'insurance' | 'clinical' | 'scheduling' | 'escalation';

export type Person = {
  id: string;
  /** Exact spelling, including accents. */
  name: string;
  /** Official title. */
  title: string;
  /** One line, parent language: what to come to them for. */
  plainRole: string;
  /** Center ids, or ['all']. */
  centers: string[];
  /** What the contact router sends to them. */
  bestFor: Topic[];
  /** /team/*.jpg if the file exists, else initials. */
  photo?: string;
  /** Legacy fields still read by older cards. */
  credentials?: string;
  note?: string;
  email?: string;
  phone?: { display: string; tel: string };
};

export const MAIN_LINE = { display: '(877) 771-5725', tel: '+18777715725' };

/** Center id ↔ location slug (data/locations.ts). */
export const CENTER_SLUG: Record<string, string> = { pearland: 'pearland', sugarland: 'sugar-land', katy: 'katy', plano: 'plano', cedarhill: 'cedar-hill', austin: 'austin' };
export const CENTER_NAME: Record<string, string> = { pearland: 'Pearland', sugarland: 'Sugar Land', katy: 'Katy', plano: 'Plano', cedarhill: 'Cedar Hill', austin: 'Austin' };
export const HOUSTON_CENTERS = ['pearland', 'sugarland', 'katy'];
export function centerIdFromSlug(slug: string): string | null {
  const hit = Object.entries(CENTER_SLUG).find(([, s]) => s === slug);
  return hit ? hit[0] : null;
}

export const people: Person[] = [
  // TODO: confirm wording
  {
    id: 'marcie',
    name: 'Marcie Peña',
    title: 'Business Development Lead',
    plainRole: 'Your first call. Tours, getting started, insurance questions and anything you’re not sure about.',
    centers: ['all'],
    bestFor: ['start', 'tour', 'insurance'],
  },
  // TODO: confirm wording
  {
    id: 'remi',
    name: 'Remi Ojo',
    title: 'Clinical Director',
    plainRole: 'Leads clinical care at Sugar Land and Pearland: your child’s program, goals and BCBA team.',
    centers: ['sugarland', 'pearland'],
    bestFor: ['clinical'],
  },
  // TODO: confirm wording
  {
    id: 'victoria',
    name: 'Victoria Nwachukwu',
    title: 'Clinical Director',
    plainRole: 'Leads clinical care at Katy: your child’s program, goals and BCBA team.',
    centers: ['katy'],
    bestFor: ['clinical'],
  },
  // TODO: confirm wording
  {
    id: 'jaden',
    name: 'Jaden Beckles',
    title: 'Director of Operations',
    plainRole: 'Keeps the Houston-area centers running: schedules, sessions and day-to-day logistics.',
    centers: ['pearland', 'katy', 'sugarland'],
    bestFor: ['scheduling'],
  },
  // TODO: confirm wording
  {
    id: 'dom',
    name: 'Dom Crocco Jr.',
    title: 'Regional Executive Director',
    plainRole: 'Oversees the Houston-area centers. Reach out if something isn’t resolved or you want to share feedback.',
    centers: ['sugarland', 'katy', 'pearland'],
    bestFor: ['escalation'],
  },
];

const ORDER: Record<string, number> = { 'Business Development Lead': 0, 'Clinical Director': 1, 'Director of Operations': 2, 'Regional Executive Director': 3 };

export const visiblePeople = people.filter((p) => p.name.trim().length > 0);

export function firstName(p: Person) {
  return p.name.split(' ')[0];
}
export function initials(p: Person) {
  return p.name
    .split(' ')
    .filter((w) => /^[A-Za-zÀ-ÿ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/** Everyone for a center, Marcie → Clinical Director → Operations → Regional. */
export function getPeopleForCenter(centerId: string | null | undefined): Person[] {
  const list = visiblePeople.filter((p) => p.centers.includes('all') || (centerId ? p.centers.includes(centerId) : false));
  return list.sort((a, b) => (ORDER[a.title] ?? 9) - (ORDER[b.title] ?? 9));
}

/** The best match for a topic at a center, falling back to Marcie. */
export function getBestContact(topic: Topic, centerId: string | null | undefined): Person {
  const pool = getPeopleForCenter(centerId);
  return pool.find((p) => p.bestFor.includes(topic) && !p.centers.includes('all')) ?? pool.find((p) => p.bestFor.includes(topic)) ?? visiblePeople[0];
}

/** Centers with no named leaders yet show Marcie only plus a line about the center team. */
export function hasNamedTeam(centerId: string | null | undefined) {
  return getPeopleForCenter(centerId).some((p) => !p.centers.includes('all'));
}

export const marcie = visiblePeople.find((p) => p.id === 'marcie')!;

/* ---- Legacy helpers kept for existing callers ---- */
type Region = 'Houston' | 'Dallas–Fort Worth' | 'Austin' | 'all';
const REGION_CENTERS: Record<Region, string[]> = { Houston: HOUSTON_CENTERS, 'Dallas–Fort Worth': ['plano', 'cedarhill'], Austin: ['austin'], all: [] };

export function peopleForRegion(region: Region) {
  if (region === 'all') return visiblePeople.filter((p) => p.centers.includes('all'));
  const ids = REGION_CENTERS[region];
  return visiblePeople.filter((p) => p.centers.includes('all') || p.centers.some((c) => ids.includes(c))).sort((a, b) => (ORDER[a.title] ?? 9) - (ORDER[b.title] ?? 9));
}

export function clinicalDirectorFor(locationSlug: string) {
  const id = centerIdFromSlug(locationSlug);
  return visiblePeople.find((p) => p.title === 'Clinical Director' && id !== null && p.centers.includes(id)) ?? null;
}

/** Who replies to tour requests. */
export function tourResponder() {
  return marcie ?? null;
}

/** Link to the existing form, prefilled with "Ask for {first name}" and the center. */
export function messageHref(p: Person, centerId?: string | null) {
  const q = new URLSearchParams({ about: 'message', contact: p.id });
  if (centerId && CENTER_SLUG[centerId]) q.set('center', CENTER_SLUG[centerId]);
  return `/request-a-tour?${q.toString()}`;
}
