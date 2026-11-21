import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { learnFlags } from '@/lib/learn/flags';
import './learn.css';

export const metadata: Metadata = {
  title: { default: 'Caregiver Learning Center', template: '%s · Caregiver Learning Center | Texas ABA Centers' },
  description: 'General caregiver education from the Texas ABA Centers Sugar Land pilot: short self-paced lessons and listings for live group trainings.',
  // Nothing under /learn is indexed while sample content is showing.
  robots: learnFlags.demoContent || learnFlags.demoStaff ? { index: false, follow: false } : undefined,
};

/**
 * The Learning Center zone. Off by default: with NEXT_PUBLIC_LEARN_ENABLED unset, every /learn
 * route is a 404. Inside the zone the look changes (learn.css); outside it nothing does.
 */
export default function LearnZoneLayout({ children }: { children: React.ReactNode }) {
  if (!learnFlags.enabled) notFound();
  return (
    <div data-zone="learn" className="lc-zone">
      <div className="lc-atmosphere" aria-hidden="true" />
      {children}
    </div>
  );
}
