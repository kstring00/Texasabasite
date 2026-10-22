import type { Metadata } from 'next';
import { locations } from '@/data/locations';
import { Section } from '@/components/site/Section';
import { CenterFinder } from '@/components/site/CenterFinder';
import { LocationCard } from '@/components/site/LocationCard';
import { FinalCta } from '@/components/site/FinalCta';
import { TexasMap } from '@/components/site/TexasMap';

export const metadata: Metadata = {
  title: 'ABA Therapy Centers in Texas: Houston, Dallas–Fort Worth, Austin',
  description: 'Six Texas ABA Centers locations: Austin, Cedar Hill, Katy, Pearland, Plano and Sugar Land. Addresses, directions, phone, and a tour request for each center.',
  alternates: { canonical: '/locations' },
};

export default function LocationsPage() {
  const regions = ['Houston', 'Dallas–Fort Worth', 'Austin'] as const;
  return (
    <>
      <Section titleAs="h1" eyebrow="Locations" title="Six centers across Texas." lede="Type your ZIP or city and we will point you to the closest one. Every center does evaluations and therapy.">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <CenterFinder />
          <TexasMap />
        </div>
      </Section>
      {regions.map((r) => {
        const list = locations.filter((l) => l.region === r);
        return (
          <Section key={r} tone={r === 'Dallas–Fort Worth' ? 'tint' : 'paper'} title={`${r} area`} className="py-10 sm:py-12 lg:py-14">
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {list.map((l) => (
                <li key={l.slug}>
                  <LocationCard location={l} index={locations.indexOf(l)} />
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
      <FinalCta />
    </>
  );
}
