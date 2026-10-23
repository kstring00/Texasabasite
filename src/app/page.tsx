import type { Metadata } from 'next';
import { Hero } from '@/components/hero/Hero';
import { Paths } from '@/components/site/acts/Paths';
import { Journey } from '@/components/site/acts/Journey';
import { Locations } from '@/components/locations/Locations';
import { ServiceExplorer } from '@/components/site/acts/ServiceExplorer';
import { CommonGroundFeature } from '@/components/site/acts/CommonGroundFeature';
import { InsuranceExplainer } from '@/components/site/acts/InsuranceExplainer';
import { Humans } from '@/components/site/acts/Humans';
import { Closing } from '@/components/site/acts/Closing';
import { Section } from '@/components/site/Section';
import { Threshold } from '@/components/site/OpenWorld';
import { EventsThisMonth } from '@/components/site/EventsThisMonth';
import { FromTheBlog } from '@/components/site/FromTheBlog';

export const metadata: Metadata = {
  title: { absolute: 'Autism Evaluations & ABA Therapy in Texas | Texas ABA Centers' },
  description:
    'Autism evaluations and ABA therapy across Texas: six centers in Austin, Cedar Hill, Katy, Pearland, Plano and Sugar Land, free benefits checks, and a real person who texts you back. Request a tour.',
  alternates: { canonical: '/' },
};

/** The homepage as a story in nine acts. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Paths />
      <Threshold from="paper" to="paper" className="hidden" />

      <Section id="journey" eyebrow="The journey" title={<>From first worry to first day, in <span className="editorial text-cobalt">five</span> steps.</>} lede="Each step says who you meet, how long it usually takes, and what to bring. No step is a surprise.">
        <Journey compact />
      </Section>

      <Locations />

      <Section id="services" eyebrow="What care looks like" title={<>Six services. <span className="editorial text-cobalt">One</span> plan, with you in it.</>} lede="ABA stands for Applied Behavior Analysis. A trained therapist helps your child learn the skills they want and need, in small steps, with lots of encouragement. Here it is play-based, neurodiversity-affirming, and built with you in the room.">
        <ServiceExplorer />
      </Section>

      <CommonGroundFeature />

      <Section id="insurance" eyebrow="Insurance & cost" title={<>Know the cost <span className="editorial text-cobalt">before</span> you commit.</>} lede="Five words decide what therapy costs you. Here they are, one illustrative year at a time. We verify your real benefits for free.">
        <InsuranceExplainer />
      </Section>

      <Humans />
      <EventsThisMonth />
      <FromTheBlog />
      <Closing />
    </>
  );
}
