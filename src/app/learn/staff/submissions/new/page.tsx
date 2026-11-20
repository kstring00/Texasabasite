import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LcBack } from '@/components/learn/LcPageHead';
import { LcSubmissionWizard } from '@/components/learn/staff/LcSubmissionWizard';
import { lcCategories } from '@/data/learn/categories';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { can } from '@/lib/learn/staff/roles';

export const metadata: Metadata = { title: 'Submit a PowerPoint' };

export default async function LearnStaffNewSubmissionPage() {
  const actor = await getStaffActor();
  if (!actor) return null;
  if (!can(actor, 'submission.create')) notFound();
  return (
    <>
      <LcBack href="/learn/staff/submissions" label="My submissions" />
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">New submission</p>
          <h1 className="lc-h1">Submit a PowerPoint</h1>
          <p className="lc-muted">Six short steps. You can save a draft at any point and come back to it.</p>
        </div>
      </header>
      <LcSubmissionWizard initial={null} categories={lcCategories.map((c) => ({ id: c.id, name: c.name }))} feedback={null} />
    </>
  );
}
