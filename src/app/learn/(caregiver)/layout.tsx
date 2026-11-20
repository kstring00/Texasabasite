import { LcDemoBar } from '@/components/learn/LcDemo';
import { LcEducationBand } from '@/components/learn/LcEducationBand';
import { LcSubNav } from '@/components/learn/LcSubNav';
import { connection } from 'next/server';
import { learnFlags } from '@/lib/learn/flags';

/** Caregiver pages: the site header above, the Learning Center sub-nav, then the page, then the education band. */
export default async function LearnCaregiverLayout({ children }: { children: React.ReactNode }) {
  // With the local staff demo on, modules can be published and withdrawn at any moment, so pages are not frozen at build time.
  if (learnFlags.demoStaff) await connection();
  return (
    <>
      <LcSubNav />
      {learnFlags.demoContent || learnFlags.demoStaff ? <LcDemoBar /> : null}
      <div className="wrap lc-page">{children}</div>
      <LcEducationBand />
    </>
  );
}
