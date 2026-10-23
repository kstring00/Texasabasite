import type { Metadata } from 'next';
import '@/content/carePlanReleaseOverrides';
import HomeBaseActivityTracker from '@/components/homeBase/HomeBaseActivityTracker';
import { SupportShell } from '@/components/layout/SupportShell';

export const metadata: Metadata = {
  title: {
    default: 'Common Ground, for families',
    template: '%s · Common Ground | Texas ABA Centers',
  },
  description:
    'Common Ground is the parent side of Texas ABA Centers: resources for the waiting weeks, parent circles, a weekly check-in on you, and your care team. Free for every family.',
};

export default function FamiliesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-zone="families">
      <SupportShell>
        <HomeBaseActivityTracker />
        {children}
      </SupportShell>
    </div>
  );
}
