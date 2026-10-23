import type { Metadata } from 'next';
import { Section } from '@/components/site/Section';
import { Journey } from '@/components/site/acts/Journey';
import { CommonGroundFeature } from '@/components/site/acts/CommonGroundFeature';
import { Closing } from '@/components/site/acts/Closing';

export const metadata: Metadata = {
  title: 'Getting Started with ABA Therapy in Texas: The 5 Steps',
  description: 'From first worry to first day in five steps: talk to a person, evaluation if needed, free benefits check, tour, first day. Who you meet, what to bring, how long each takes.',
  alternates: { canonical: '/getting-started' },
};

export default function GettingStartedPage() {
  return (
    <>
      <Section titleAs="h1" eyebrow="Getting started" title={<>From first worry to <span className="editorial text-cobalt">first day.</span></>} lede="Nobody should have to guess what happens next. Here is every step, who you meet, what to bring, and how long it usually takes.">
        <Journey />
      </Section>
      <CommonGroundFeature />
      <Closing title={<>Ready for <span className="editorial text-butter">step one?</span></>} text="Request a tour or call. Either way a real person replies, and you can stop at any step." />
    </>
  );
}
