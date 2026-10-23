import type { Metadata } from 'next';
import '@/content/carePlanReleaseOverrides';
import HomeBaseActivityTracker from '@/components/homeBase/HomeBaseActivityTracker';
import { CgSubNav } from '@/components/common-ground/CgSubNav';
import { Breadcrumb } from '@/components/common-ground/Breadcrumb';

export const metadata: Metadata = {
  title: {
    default: 'Common Ground, for families',
    template: '%s · Common Ground | Texas ABA Centers',
  },
  description:
    'Common Ground is the parent side of Texas ABA Centers: resources for the waiting weeks, parent circles, a weekly check-in on you, and your care team. Free for every family.',
};

/**
 * Common Ground pages use the normal site header and footer. The only section-specific chrome is
 * the slim sub-nav under the header. Content takes the same container as the homepage.
 */
export default function FamiliesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-zone="families" className="[--sub-nav-h:56px]">
      <CgSubNav />
      <HomeBaseActivityTracker />
      <div className="wrap pb-[var(--s-5)] pt-6">
        <Breadcrumb />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
