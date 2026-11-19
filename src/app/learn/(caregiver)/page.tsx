import type { Metadata } from 'next';
import { LcFeaturedModules, LcHero, LcHowItWorks, LcNeedHelp, LcTopicGrid, LcUpcomingTrainings } from '@/components/learn/LcHome';
import { listModuleSummaries, listTrainings } from '@/lib/learn/content';
import { sortTrainings, trainingView } from '@/lib/learn/trainings';

export const metadata: Metadata = {
  title: { absolute: 'Caregiver Learning Center | Texas ABA Centers' },
  alternates: { canonical: '/learn' },
};
// Listings depend on today's date, so this page is refreshed regularly instead of frozen at build time.
export const revalidate = 300;

export default function LearnHomePage() {
  const now = new Date();
  const upcoming = sortTrainings(listTrainings(), now)
    .map((training) => ({ training, view: trainingView(training, now) }))
    .filter((t) => t.view !== 'completed' && t.view !== 'cancelled')
    .slice(0, 2);
  return (
    <>
      <LcHero />
      <LcTopicGrid />
      <LcFeaturedModules modules={listModuleSummaries().slice(0, 3)} />
      <LcUpcomingTrainings trainings={upcoming} />
      <LcHowItWorks />
      <LcNeedHelp />
    </>
  );
}
