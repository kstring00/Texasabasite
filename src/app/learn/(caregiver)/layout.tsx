import { LcSubNav } from '@/components/learn/LcSubNav';
import { LcEducationBand } from '@/components/learn/LcEducationBand';

/** Caregiver pages: the site header above, the Learning Center sub-nav, then the page, then the education band. */
export default function LearnCaregiverLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LcSubNav />
      <div className="wrap lc-page">{children}</div>
      <LcEducationBand />
    </>
  );
}
