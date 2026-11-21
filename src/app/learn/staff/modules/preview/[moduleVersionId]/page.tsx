import { notFound, redirect } from 'next/navigation';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { canOpenProduction } from '@/lib/learn/staff/pipeline';
import { getStaffStore } from '@/lib/learn/staff/store';
import { canSee } from '@/lib/learn/staff/submissions';

export default async function LearnStaffPreviewIndexPage({ params }: { params: Promise<{ moduleVersionId: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  const { moduleVersionId } = await params;
  const store = getStaffStore();
  const m = store.modules.find((x) => x.id === moduleVersionId);
  const s = m ? store.submissions.find((x) => x.id === m.submissionId) : undefined;
  if (!m || !s || !canOpenProduction(actor) || !canSee(actor, s)) notFound();
  redirect(`/learn/staff/modules/preview/${m.id}/lesson/${m.manifest.lessons[0].id}?step=1`);
}
