import { LcDemoBar } from '@/components/learn/LcDemo';
import { LcEducationBand } from '@/components/learn/LcEducationBand';
import { LcSubNav } from '@/components/learn/LcSubNav';
import { learnFlags } from '@/lib/learn/flags';

/** Caregiver pages: the site header above, the Learning Center sub-nav, then the page, then the education band. */
export default function LearnCaregiverLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LcSubNav />
      {learnFlags.demoContent ? <LcDemoBar /> : null}
      <div className="wrap lc-page">{children}</div>
      <LcEducationBand />
    </>
  );
}
