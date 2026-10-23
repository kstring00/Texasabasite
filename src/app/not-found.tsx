import Link from 'next/link';
import { Section } from '@/components/site/Section';
import { TourButton, CallButton } from '@/components/site/Buttons';
import { CenterFinder } from '@/components/site/CenterFinder';

export default function NotFound() {
  return (
    <Section titleAs="h1" eyebrow="404" title="That page moved, but we are still here." lede="Find your nearest center, or go to the page most families are looking for.">
      <CenterFinder compact />
      <div className="mt-8 flex flex-wrap gap-3">
        <TourButton />
        <CallButton place="404" />
        <Link href="/" className="btn-ghost">
          Home
        </Link>
      </div>
    </Section>
  );
}
