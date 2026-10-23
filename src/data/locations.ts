/**
 * The six Texas centers. One entry per center.
 *
 * Rules:
 *  - `address` came from texasabacenters.com (contact page / homepage). `addressVerified: false`
 *    means two pages on the current site disagreed; confirm before launch.
 *  - `availability` is null until a real person at the center sets it. Null hides the badge.
 *    Never put a number here that nobody confirmed.
 *  - `clinicalLead` is null until a real name is supplied. Null hides the card.
 *  - `photos` is empty until real center photos exist. Empty uses the illustrated treatment.
 *  - `phone` falls back to the main line in site.ts when a center has no direct line.
 */
import { site } from './site';

export type Availability = 'open' | 'limited' | 'waitlist';

export type Location = {
  slug: string;
  name: string;
  city: string;
  region: 'Houston' | 'Dallas–Fort Worth' | 'Austin';
  address: { street: string; suite?: string; city: string; state: 'TX'; zip: string };
  addressVerified: boolean;
  phone: { display: string; tel: string };
  /** Center hours. Null hides the row (the current site only lists phone-line hours). */
  hours: string | null;
  availability: Availability | null;
  /** Typical time from first call to first day. Null hides it. Unverified for the demo. */
  typicalStart: string | null;
  clinicalLead: { name: string; credentials: string; title: string; photo?: string } | null;
  services: string[]; // slugs from services.ts
  photos: { src: string; alt: string }[];
  /** Short note parents find useful: parking, entrance, nearby landmarks. Null hides it. */
  arrivalNote: string | null;
  googleReviewUrl: string | null;
  /** Approximate map position for the Texas map illustration (not a geocode). */
  map: { x: number; y: number };
  /** Names of nearby cities for the finder. */
  nearby: string[];
  zipPrefixes: string[]; // 3-digit ZIP prefixes this center usually serves
};

export const locations: Location[] = [
  {
    slug: 'pearland',
    name: 'Pearland',
    city: 'Pearland',
    region: 'Houston',
    address: { street: '8524 Broadway St.', suite: 'Suite 100', city: 'Pearland', state: 'TX', zip: '77584' },
    addressVerified: true,
    phone: site.phone,
    hours: null,
    availability: null,
    typicalStart: null,
    clinicalLead: null,
    services: ['autism-diagnosis', 'early-intervention', 'child-aba', 'teen-aba', 'in-home-aba', 'in-school-aba'],
    photos: [],
    arrivalNote: null,
    googleReviewUrl: null,
    map: { x: 79, y: 76 },
    nearby: ['Friendswood', 'League City', 'Manvel', 'Alvin', 'Webster', 'Clear Lake', 'South Houston'],
    zipPrefixes: ['775', '774'],
  },
  {
    slug: 'sugar-land',
    name: 'Sugar Land',
    city: 'Sugar Land',
    region: 'Houston',
    address: { street: '7619 Branford Pl.', suite: 'Suite 120', city: 'Sugar Land', state: 'TX', zip: '77479' },
    addressVerified: true,
    phone: site.phone,
    hours: null,
    availability: null,
    typicalStart: null,
    clinicalLead: null,
    services: ['autism-diagnosis', 'early-intervention', 'child-aba', 'teen-aba', 'in-home-aba', 'in-school-aba'],
    photos: [],
    arrivalNote: null,
    googleReviewUrl: null,
    map: { x: 73, y: 74 },
    nearby: ['Missouri City', 'Richmond', 'Rosenberg', 'Stafford', 'Bellaire', 'Meyerland', 'Fresno'],
    zipPrefixes: ['774', '770'],
  },
  {
    slug: 'katy',
    name: 'Katy',
    city: 'Katy',
    region: 'Houston',
    address: { street: '3349 W Grand Parkway', city: 'Katy', state: 'TX', zip: '77449' },
    // The contact page lists W Grand Parkway; an older services page lists 20718 Park Row Dr. Confirm.
    addressVerified: false,
    phone: site.phone,
    hours: null,
    availability: null,
    typicalStart: null,
    clinicalLead: null,
    services: ['autism-diagnosis', 'early-intervention', 'child-aba', 'teen-aba', 'in-home-aba', 'in-school-aba'],
    photos: [],
    arrivalNote: null,
    googleReviewUrl: null,
    map: { x: 70, y: 69 },
    nearby: ['Cinco Ranch', 'Fulshear', 'Cypress', 'Memorial', 'Energy Corridor', 'Brookshire'],
    zipPrefixes: ['774', '770', '773'],
  },
  {
    slug: 'plano',
    name: 'Plano',
    city: 'Plano',
    region: 'Dallas–Fort Worth',
    address: { street: '5085 W Park Blvd', suite: 'Suite 500', city: 'Plano', state: 'TX', zip: '75093' },
    addressVerified: true,
    phone: site.phone,
    hours: null,
    availability: null,
    typicalStart: null,
    clinicalLead: null,
    services: ['autism-diagnosis', 'early-intervention', 'child-aba', 'teen-aba', 'in-home-aba', 'in-school-aba'],
    photos: [],
    arrivalNote: null,
    googleReviewUrl: null,
    map: { x: 68, y: 31 },
    nearby: ['Frisco', 'Allen', 'McKinney', 'Richardson', 'Carrollton', 'The Colony', 'North Dallas'],
    zipPrefixes: ['750', '752', '751'],
  },
  {
    slug: 'cedar-hill',
    name: 'Cedar Hill',
    city: 'Cedar Hill',
    region: 'Dallas–Fort Worth',
    address: { street: '950 E Beltline Rd.', suite: 'Suite 100', city: 'Cedar Hill', state: 'TX', zip: '75104' },
    addressVerified: true,
    phone: site.phone,
    hours: null,
    availability: null,
    typicalStart: null,
    clinicalLead: null,
    services: ['autism-diagnosis', 'early-intervention', 'child-aba', 'teen-aba', 'in-home-aba', 'in-school-aba'],
    photos: [],
    arrivalNote: null,
    googleReviewUrl: null,
    map: { x: 65, y: 36 },
    nearby: ['DeSoto', 'Duncanville', 'Midlothian', 'Grand Prairie', 'Mansfield', 'Lancaster', 'Red Oak', 'Arlington'],
    zipPrefixes: ['751', '760', '761', '765'],
  },
  {
    slug: 'austin',
    name: 'Austin',
    city: 'Austin',
    region: 'Austin',
    address: { street: '3724 Executive Center Dr', suite: 'Suite G10', city: 'Austin', state: 'TX', zip: '78731' },
    addressVerified: true,
    phone: site.phone,
    hours: null,
    availability: null,
    typicalStart: null,
    clinicalLead: null,
    services: ['autism-diagnosis', 'early-intervention', 'child-aba', 'teen-aba', 'in-home-aba', 'in-school-aba'],
    photos: [],
    arrivalNote: null,
    googleReviewUrl: null,
    map: { x: 56, y: 62 },
    nearby: ['Round Rock', 'Cedar Park', 'Pflugerville', 'Leander', 'Georgetown', 'Kyle', 'Buda', 'San Marcos'],
    zipPrefixes: ['786', '787', '785', '788', '789', '765'],
  },
];

export const availabilityLabel: Record<Availability, string> = {
  open: 'Spots available',
  limited: 'A few spots left',
  waitlist: 'Short waitlist',
};

export function getLocation(slug: string) {
  return locations.find((l) => l.slug === slug) ?? null;
}

export function formatAddress(l: Location, oneLine = true) {
  const a = l.address;
  const line1 = a.suite ? `${a.street}, ${a.suite}` : a.street;
  const line2 = `${a.city}, ${a.state} ${a.zip}`;
  return oneLine ? `${line1}, ${line2}` : [line1, line2];
}

export function directionsUrl(l: Location) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formatAddress(l) as string)}`;
}

export function mapsSearchUrl(l: Location) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Texas ABA Centers ${formatAddress(l)}`)}`;
}
