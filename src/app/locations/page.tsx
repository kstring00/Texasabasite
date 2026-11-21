import type { Metadata } from 'next';
import { locations } from '@/data/locations';
import { Section } from '@/components/site/Section';
import { CenterFinder } from '@/components/site/CenterFinder';
import { LocationCard } from '@/components/site/LocationCard';
import { Locations } from '@/components/locations/Locations';
import { Closing } from '@/components/site/acts/Closing';

export const metadata: Metadata = {
  title: 'ABA Therapy Centers in Texas: Houston, Dallas–Fort Worth, Austin',
  description: 'Six Texas ABA Centers locations: Austin, Cedar Hill, Katy, Pearland, Plano and Sugar Land. Addresses, directions, phone, and a tour request for each center.',
  alternates: { canonical: '/locations' },
};

export default function LocationsPage() {
  const regions = ['Houston', 'Dallas–Fort Worth', 'Austin'] as const;
  return (
    <>
      <Section titleAs="h1" eyebrow="Locations" title={<>Six centers. One <span className="editorial text-cobalt">front door.</span></>} lede="Type your ZIP or city and we point you to the closest one. Every center does evaluations and therapy." size="sm">
        <CenterFinder />
      </Section>
      <Locations eyebrow="THE MAP" title="Pick a center." lede="Tap a pin or a name to see the address, who you will meet, and how to book a tour." />
      {/* All six on one screen, grouped by area. On phones the cards are a row to swipe. */}
      <Section id="all-centers" eyebrow={regions.map((r) => `${r} area ${locations.filter((l) => l.region === r).length}`).join(' · ')} title="All six centers" size="sm">
        <ul className="grid gap-4 max-md:snap-row md:grid-cols-2 lg:grid-cols-3" aria-label="All six centers, grouped by area. Swipe on a phone to see them all.">
          {regions.flatMap((r) =>
            locations
              .filter((l) => l.region === r)
              .map((l, i) => (
                <li key={l.slug} id={i === 0 ? r.toLowerCase().replace(/[^a-z]+/g, '-') : undefined} className="scroll-mt-28">
                  <LocationCard location={l} index={locations.indexOf(l)} />
                </li>
              )),
          )}
        </ul>
      </Section>
      <Closing />
    </>
  );
}
