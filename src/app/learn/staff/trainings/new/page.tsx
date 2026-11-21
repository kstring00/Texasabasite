import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LcBack } from '@/components/learn/LcPageHead';
import { LcListingForm } from '@/components/learn/staff/LcListingForm';
import { lcCategories } from '@/data/learn/categories';
import { listModuleSummaries } from '@/lib/learn/content';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { canManageTrainings, type LcListingInput } from '@/lib/learn/staff/listings';

export const metadata: Metadata = { title: 'New training listing' };

const EMPTY: LcListingInput = { title: '', summary: '', description: '', objectives: '', date: '', startTime: '', endTime: '', categoryId: '', relatedModuleIds: [], presenterLabel: '', presenterApproved: false, registrationUrl: '' };

export default async function LearnStaffNewTrainingPage() {
  const actor = await getStaffActor();
  if (!actor) return null;
  if (!canManageTrainings(actor)) notFound();
  return (
    <>
      <LcBack href="/learn/staff/trainings" label="Trainings" />
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">Trainings</p>
          <h1 className="lc-h1">New training listing</h1>
          <p className="lc-muted">Create the event in Microsoft Teams first. This saves a draft that only staff can see. You can add the rest later and publish when it is ready.</p>
        </div>
      </header>
      <section className="lc-solid lc-panel" aria-label="Listing details">
        <LcListingForm listing={null} initial={EMPTY} categories={lcCategories.map((c) => ({ id: c.id, label: c.name }))} modules={listModuleSummaries().map((m) => ({ id: m.id, label: m.title }))} isPublic={false} />
      </section>
    </>
  );
}
