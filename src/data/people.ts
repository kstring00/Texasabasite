/**
 * Real people only. A card with no real name is hidden everywhere.
 * Kyle supplies names, titles, photos. Do not invent any.
 */
export type Person = {
  id: string;
  name: string;
  title: string;
  /** Where this person is the named contact. "all" covers the whole state. */
  regions: ('Houston' | 'Dallas–Fort Worth' | 'Austin' | 'all')[];
  role: 'business-development' | 'regional-executive-director' | 'clinical-director';
  /** Center slug when a clinical director belongs to one center. */
  location?: string;
  phone?: { display: string; tel: string };
  email?: string;
  photo?: string;
  credentials?: string;
  /** One line in their own words. Only if supplied. */
  note?: string;
};

export const people: Person[] = [
  {
    id: 'marcie-pena',
    name: 'Marcie Pena',
    title: 'Business Development',
    regions: ['all'],
    role: 'business-development',
    // phone/email/photo: pending from Kyle. Contact falls back to the main line.
  },
  // Regional Executive Directors: pending full names from Kyle. Add here; cards appear automatically.
  // { id: 'red-houston', name: '', title: 'Regional Executive Director', regions: ['Houston'], role: 'regional-executive-director' },
  // Clinical directors by center: pending. Set `location` to the center slug.
];

/** Only people with a real name are ever shown. */
export const visiblePeople = people.filter((p) => p.name.trim().length > 0);

export function peopleForRegion(region: Person['regions'][number]) {
  return visiblePeople.filter((p) => p.regions.includes('all') || p.regions.includes(region));
}

export function clinicalDirectorFor(locationSlug: string) {
  return visiblePeople.find((p) => p.role === 'clinical-director' && p.location === locationSlug) ?? null;
}

/** Who replies to tour requests. Falls back to the center when nobody is named. */
export function tourResponder() {
  return visiblePeople.find((p) => p.role === 'business-development') ?? null;
}
