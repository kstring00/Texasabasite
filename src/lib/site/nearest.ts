import { locations, type Location } from '@/data/locations';

/**
 * Suggest the nearest center from a Texas ZIP or a city name.
 * This is a lookup table, not geocoding: good enough to suggest, never to promise.
 */
export function nearestCenter(query: string): { center: Location; how: 'zip' | 'city' | 'region' } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const zip = q.match(/^\d{5}/)?.[0];
  if (zip) {
    const p3 = zip.slice(0, 3);
    // Houston metro: split the shared prefixes by the full zip where we can.
    const houstonSouth = ['77581', '77584', '77588', '77546', '77573', '77578', '77511', '77598', '77062', '77059', '77089', '77058'];
    const houstonWest = ['77449', '77450', '77493', '77494', '77441', '77433', '77429', '77084', '77094', '77079', '77077', '77042', '77082'];
    const houstonSW = ['77479', '77478', '77498', '77459', '77469', '77471', '77477', '77489', '77053', '77031', '77099', '77036', '77072', '77401', '77096'];
    if (houstonSouth.includes(zip)) return { center: byslug('pearland'), how: 'zip' };
    if (houstonWest.includes(zip)) return { center: byslug('katy'), how: 'zip' };
    if (houstonSW.includes(zip)) return { center: byslug('sugar-land'), how: 'zip' };
    if (p3 === '775') return { center: byslug('pearland'), how: 'zip' };
    if (p3 === '774') return { center: byslug('sugar-land'), how: 'zip' };
    if (p3 === '770' || p3 === '773') return { center: byslug('katy'), how: 'zip' };
    if (['750', '752'].includes(p3)) return { center: byslug('plano'), how: 'zip' };
    if (['751', '760', '761', '765'].includes(p3)) return { center: byslug('cedar-hill'), how: 'zip' };
    if (['786', '787', '785', '788', '789', '766'].includes(p3)) return { center: byslug('austin'), how: 'zip' };
    if (zip.startsWith('7')) return null; // Texas, but not near a center. Say so honestly.
    return null;
  }

  for (const l of locations) {
    if (l.city.toLowerCase() === q || l.slug === q) return { center: l, how: 'city' };
  }
  for (const l of locations) {
    if (l.nearby.some((n) => n.toLowerCase() === q)) return { center: l, how: 'city' };
  }
  for (const l of locations) {
    if (l.city.toLowerCase().startsWith(q) || l.nearby.some((n) => n.toLowerCase().startsWith(q))) return { center: l, how: 'city' };
  }
  if (q.includes('houston')) return { center: byslug('sugar-land'), how: 'region' };
  if (q.includes('dallas') || q.includes('fort worth')) return { center: byslug('plano'), how: 'region' };
  if (q.includes('austin')) return { center: byslug('austin'), how: 'region' };
  return null;
}

function byslug(slug: string): Location {
  const l = locations.find((x) => x.slug === slug);
  if (!l) throw new Error(`Unknown center ${slug}`);
  return l;
}
