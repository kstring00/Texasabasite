import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { LcBack } from '@/components/learn/LcPageHead';
import { LcSubmissionWizard } from '@/components/learn/staff/LcSubmissionWizard';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { lcCategories } from '@/data/learn/categories';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { getStaffStore } from '@/lib/learn/staff/store';
import { viewSubmission } from '@/lib/learn/staff/submissions';

export const metadata: Metadata = { title: 'Edit submission' };

export default async function LearnStaffEditSubmissionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ step?: string; saved?: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  const { id } = await params;
  const view = viewSubmission(getStaffStore(), actor, id);
  if (!view) notFound();
  // A submitted version is frozen. Its edit address just leads back to the read-only page.
  if (!view.canEdit) redirect(`/learn/staff/submissions/${id}`);
  const { submission: s } = view;
  const working = view.versions.find((v) => !v.frozenAt)!;
  const review = view.reviews[0] ?? null;
  const { step, saved } = await searchParams;
  return (
    <>
      <LcBack href={`/learn/staff/submissions/${id}`} label="Back to this submission" />
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">{working.versionNumber > 1 ? `Version ${working.versionNumber}` : 'Draft'}</p>
          <h1 className="lc-h1">{s.title}</h1>
          <p className="lc-muted">Save a draft at any point. Nothing is sent for review until you submit on the last step.</p>
        </div>
      </header>
      <LcSubmissionWizard
        initial={{
          id: s.id,
          rev: s.rev,
          details: { title: s.title, summary: s.summary, categoryId: s.categoryId, tags: s.tags, objectives: s.objectives, audience: s.audience },
          checklist: s.checklist,
          revisionNotes: working.revisionNotes,
          versionNumber: working.versionNumber,
          file: working.asset ? { name: working.asset.fileName, size: working.asset.byteSize } : null,
        }}
        categories={lcCategories.map((c) => ({ id: c.id, name: c.name }))}
        startStep={/^[1-6]$/.test(step ?? '') ? Number(step) - 1 : 0}
        justSaved={saved === '1'}
        feedback={working.versionNumber > 1 && review ? { reviewer: getDemoStaff(review.reviewerId)?.displayName ?? 'the reviewer', comments: review.comments } : null}
      />
    </>
  );
}
