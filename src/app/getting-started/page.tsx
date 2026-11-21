import type { Metadata } from 'next';
import { StepStage } from '@/components/site/acts/StepStage';
import { CommonGroundStrip } from '@/components/site/acts/CommonGroundStrip';
import { Closing } from '@/components/site/acts/Closing';

export const metadata: Metadata = {
  title: 'Getting Started with ABA Therapy in Texas: The 5 Steps',
  description: 'From first worry to first day in five steps: talk to a person, evaluation if needed, free benefits check, tour, first day. Who you meet, what to bring, how long each takes.',
  alternates: { canonical: '/getting-started' },
};

export default function GettingStartedPage() {
  return (
    <>
      <StepStage />
      <CommonGroundStrip />
      <Closing title={<>Ready for <span className="editorial text-butter">step one?</span></>} />
    </>
  );
}
