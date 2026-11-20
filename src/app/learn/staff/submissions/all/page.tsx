import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { can } from '@/lib/learn/staff/roles';
import { SubmissionsView } from '../shared';

export const metadata: Metadata = { title: 'All submissions' };

export default async function LearnStaffAllSubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  // A contributor who types this address gets "not found", the same as any page that does not exist.
  if (!can(actor, 'submission.read_all')) notFound();
  return (
    <>
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">Submissions</p>
          <h1 className="lc-h1">All submissions</h1>
          <p className="lc-muted">Every PowerPoint staff have started or submitted. To review one, use Reviews in the menu.</p>
        </div>
      </header>
      <SubmissionsView actor={actor} scope="all" status={(await searchParams).status} basePath="/learn/staff/submissions/all" emptyText="No one has submitted a presentation yet." />
    </>
  );
}
