import type { Metadata } from 'next';
import { LcHero, LcHowItWorks, LcTopicGrid } from '@/components/learn/LcHome';

export const metadata: Metadata = {
  title: { absolute: 'Caregiver Learning Center | Texas ABA Centers' },
  alternates: { canonical: '/learn' },
};

export default function LearnHomePage() {
  return (
    <>
      <LcHero />
      <LcTopicGrid />
      <LcHowItWorks />
    </>
  );
}
