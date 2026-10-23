/**
 * The single source of truth for the locations section: map, card and index all read this.
 *
 * `x`, `y` and `label` are SVG coordinates projected from real latitude/longitude in
 * design/locations-map-reference.html. Do not adjust them by eye.
 *
 * Addresses, phone and slugs come from the site-wide data file so the homepage, the
 * /locations index and each center page always agree. Only Pearland's address and
 * "serves" line have been confirmed; the rest came from the current texasabacenters.com.
 */
import { getLocation, formatAddress } from '@/data/locations';

export type Center = {
  id: string;
  name: string;
  /** Display label on the card, e.g. HOUSTON */
  metro: string;
  /** Grouping key for the index, e.g. Houston */
  metroKey: string;
  x: number;
  y: number;
  label: [number, number, 'start' | 'middle' | 'end'];
  address: string;
  phone: { display: string; tel: string };
  serves: string;
  slug: string;
};

const PHONE = { display: '(877) 771-5725', tel: '+18777715725' };

function address(slug: string) {
  const l = getLocation(slug);
  return l ? (formatAddress(l) as string) : '';
}

export const centers: Center[] = [
  {
    id: 'pearland',
    name: 'Pearland',
    metro: 'HOUSTON',
    metroKey: 'Houston',
    x: 470.8,
    y: 342.2,
    label: [556, 326, 'start'],
    address: address('pearland'),
    phone: PHONE,
    serves: 'Friendswood, League City, Manvel, Alvin and nearby.',
    slug: 'pearland',
  },
  {
    id: 'sugarland',
    name: 'Sugar Land',
    metro: 'HOUSTON',
    metroKey: 'Houston',
    x: 457.2,
    y: 339.4,
    label: [462, 404, 'middle'],
    address: address('sugar-land'), // TODO: confirm
    phone: PHONE,
    serves: 'Missouri City, Stafford, Richmond, Rosenberg and nearby.', // TODO: confirm
    slug: 'sugar-land',
  },
  {
    id: 'katy',
    name: 'Katy',
    metro: 'HOUSTON',
    metroKey: 'Houston',
    x: 449.7,
    y: 331.5,
    label: [430, 372, 'end'],
    address: address('katy'), // TODO: confirm (the current site lists two Katy addresses)
    phone: PHONE,
    serves: 'Cypress, Fulshear, Brookshire, Richmond and nearby.', // TODO: confirm
    slug: 'katy',
  },
  {
    id: 'plano',
    name: 'Plano',
    metro: 'DALLAS–FORT WORTH',
    metroKey: 'Dallas–Fort Worth',
    x: 414.7,
    y: 181.6,
    label: [470, 176, 'start'],
    address: address('plano'), // TODO: confirm
    phone: PHONE,
    serves: 'Frisco, Allen, McKinney, Richardson and nearby.', // TODO: confirm
    slug: 'plano',
  },
  {
    id: 'cedarhill',
    name: 'Cedar Hill',
    metro: 'DALLAS–FORT WORTH',
    metroKey: 'Dallas–Fort Worth',
    x: 404.3,
    y: 201.5,
    label: [470, 214, 'start'],
    address: address('cedar-hill'), // TODO: confirm
    phone: PHONE,
    serves: 'DeSoto, Duncanville, Midlothian, Mansfield and nearby.', // TODO: confirm
    slug: 'cedar-hill',
  },
  {
    id: 'austin',
    name: 'Austin',
    metro: 'AUSTIN',
    metroKey: 'Austin',
    x: 373.3,
    y: 309.2,
    label: [338, 318, 'end'],
    address: address('austin'), // TODO: confirm
    phone: PHONE,
    serves: 'Round Rock, Cedar Park, Pflugerville, Kyle and nearby.', // TODO: confirm
    slug: 'austin',
  },
];

export const DEFAULT_CENTER_ID = 'pearland';

/** Label pill geometry, identical to the reference so leader lines meet the pill edge. */
export function pillGeometry(c: Center) {
  const [lx, ly, anchor] = c.label;
  const w = c.name.length * 8.6 + 28;
  const h = 26;
  const rx = anchor === 'end' ? lx - w : anchor === 'middle' ? lx - w / 2 : lx;
  const tx = rx + w / 2;
  let ex = anchor === 'end' ? rx + w : anchor === 'middle' ? tx : rx;
  const ey = anchor === 'middle' ? (ly < c.y ? ly + h / 2 : ly - h / 2) : ly;
  if (anchor === 'middle') ex = tx;
  return { w, h, rx, ry: ly - h / 2, tx, ty: ly + 4, ex, ey };
}

export function groupByMetro(list: Center[]) {
  const order: string[] = [];
  const groups: Record<string, Center[]> = {};
  for (const c of list) {
    if (!groups[c.metroKey]) {
      groups[c.metroKey] = [];
      order.push(c.metroKey);
    }
    groups[c.metroKey].push(c);
  }
  return order.map((key) => ({ key, centers: groups[key] }));
}
