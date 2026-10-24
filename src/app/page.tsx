import type { Metadata } from 'next';
import { VideoHero } from '@/components/hero/VideoHero';
import { OneNextStep } from '@/components/site/acts/OneNextStep';
import { GettingStarted } from '@/components/getting-started/GettingStarted';
import { Locations } from '@/components/locations/Locations';
import { ServiceExplorer } from '@/components/site/acts/ServiceExplorer';
import { CommonGroundSection } from '@/components/site/acts/CommonGroundSection';
import { InsuranceExplainer } from '@/components/site/acts/InsuranceExplainer';
import { CareMap } from '@/components/site/acts/CareMap';
import { Closing } from '@/components/site/acts/Closing';
import { Section } from '@/components/site/Section';
import { EventsThisMonth } from '@/components/site/EventsThisMonth';
import { FromTheBlog } from '@/components/site/FromTheBlog';

export const metadata: Metadata = {
  title: { absolute: 'Texas ABA Centers | ABA Therapy for Children with Autism in Texas' },
  description:
    'ABA therapy for children with autism at six Texas centers: Austin, Cedar Hill, Katy, Pearland, Plano and Sugar Land. In-house evaluations, free benefits checks, and a real person who texts you back. Request a tour.',
  alternates: { canonical: '/' },
};

/** The homepage as a story in nine acts. */
export default function HomePage() {
  return (
    <>
      <VideoHero />
      <OneNextStep />

      <GettingStarted />
      <CommonGroundSection />

      <Locations />

      <Section id="services" eyebrow="What care looks like" title={<>Six services. <span className="editorial text-cobalt">One</span> plan, with you in it.</>} lede="ABA stands for Applied Behavior Analysis. A trained therapist helps your child learn the skills they want and need, in small steps, with lots of encouragement. Here it is play-based, neurodiversity-affirming, and built with you in the room.">
        <ServiceExplorer />
      </Section>

      <Section id="insurance" eyebrow="Insurance & cost" title={<>Know the cost <span className="editorial text-cobalt">before</span> you commit.</>} lede="Five words decide what therapy costs you. Here they are, one illustrative year at a time. We verify your real benefits for free.">
        <InsuranceExplainer />
      </Section>

      <CareMap />
      <EventsThisMonth />
      <FromTheBlog />
      <Closing />
    </>
  );
}
