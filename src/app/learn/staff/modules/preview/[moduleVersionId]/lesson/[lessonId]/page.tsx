import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LcPlayer } from '@/components/learn/LcPlayer';
import { getLcCategoryById } from '@/data/learn/categories';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { canOpenProduction } from '@/lib/learn/staff/pipeline';
import { can } from '@/lib/learn/staff/roles';
import { getStaffStore } from '@/lib/learn/staff/store';
import { canSee } from '@/lib/learn/staff/submissions';

export const metadata: Metadata = { title: 'Module preview' };

/**
 * The real caregiver lesson player, showing an unpublished module to staff who are allowed to
 * see it. Nothing is saved, every step carries a watermark, and this address is never public.
 */
export default async function LearnStaffPreviewLessonPage({ params }: { params: Promise<{ moduleVersionId: string; lessonId: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  const { moduleVersionId, lessonId } = await params;
  const store = getStaffStore();
  const m = store.modules.find((x) => x.id === moduleVersionId);
  const s = m ? store.submissions.find((x) => x.id === m.submissionId) : undefined;
  if (!m || !s || !canOpenProduction(actor) || !canSee(actor, s)) notFound();
  const lessonIndex = m.manifest.lessons.findIndex((l) => l.id === lessonId);
  const category = getLcCategoryById(m.manifest.categoryId);
  if (lessonIndex < 0 || !category) notFound();
  const lesson = m.manifest.lessons[lessonIndex];
  const base = `/learn/staff/modules/preview/${m.id}`;
  const exitHref = can(actor, 'review.final') && m.status === 'final_review' ? `/learn/staff/reviews/module/${m.id}` : `/learn/staff/modules/${s.id}`;
  const watermark = m.status === 'published' ? 'Staff preview of a published module' : m.status === 'final_approved' ? 'Staff preview · final approved, not yet published' : 'Pending final clinical approval';
  return (
    <div className="lc-preview" data-lc-scene="reading">
      <LcPlayer
        module={{ id: m.manifest.id, slug: m.manifest.slug, version: m.manifest.version, title: m.manifest.title, cast: category.cast, isDemo: true, takeaways: m.manifest.takeaways }}
        lesson={{ id: lesson.id, title: lesson.title, steps: lesson.steps.filter((x) => x.type !== 'related_training') }}
        lessonIndex={lessonIndex}
        outline={m.manifest.lessons.map((l) => ({ id: l.id, title: l.title }))}
        relatedTrainings={[]}
        relatedModules={[]}
        preview={{ basePath: base, exitHref, watermark }}
      />
    </div>
  );
}
