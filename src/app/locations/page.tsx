import type { Metadata } from 'next';
import { locations } from '@/data/locations';
import { Section } from '@/components/site/Section';
import { CenterFinder } from '@/components/site/CenterFinder';
import { LocationCard } from '@/components/site/LocationCard';
import { Locations } from '@/components/locations/Locations';
import { Closing } from '@/components/site/acts/Closing';
import { RevealGroup, RevealItem } from '@/components/site/motion';

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
      {regions.map((r) => {
        const list = locations.filter((l) => l.region === r);
        return (
          <Section key={r} id={r.toLowerCase().replace(/[^a-z]+/g, '-')} eyebrow={`${list.length} center${list.length > 1 ? 's' : ''}`} title={`${r} area`} size="sm">
            <RevealGroup as="ul" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {list.map((l) => (
                <RevealItem as="li" key={l.slug}>
                  <LocationCard location={l} index={locations.indexOf(l)} />
                </RevealItem>
              ))}
            </RevealGroup>
          </Section>
        );
      })}
      <Closing />
    </>
  );
}
