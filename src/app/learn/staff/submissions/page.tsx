import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircleCheck, Plus } from 'lucide-react';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { can } from '@/lib/learn/staff/roles';
import { SubmissionsView } from './shared';

export const metadata: Metadata = { title: 'My submissions' };

export default async function LearnStaffSubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string; deleted?: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  if (!can(actor, 'submission.create')) notFound();
  const { status, deleted } = await searchParams;
  return (
    <>
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">Submissions</p>
          <h1 className="lc-h1">My submissions</h1>
          <p className="lc-muted">Every PowerPoint you have started or submitted, and exactly where each one stands.</p>
        </div>
        <Link href="/learn/staff/submissions/new" className="lc-btn lc-btn-primary">
          <Plus width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          Submit a PowerPoint
        </Link>
      </header>
      {deleted ? (
        <p className="lc-note" data-cast="teal" role="status">
          <CircleCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          <span>The draft was deleted.</span>
        </p>
      ) : null}
      <SubmissionsView actor={actor} scope="mine" status={status} basePath="/learn/staff/submissions" emptyText="You haven’t submitted a presentation yet. Start with a PowerPoint you created." />
    </>
  );
}
