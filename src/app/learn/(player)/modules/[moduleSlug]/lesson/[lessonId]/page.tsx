import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LcPlayer } from '@/components/learn/LcPlayer';
import { getLcCategoryById } from '@/data/learn/categories';
import { getLcContent, getModuleById, getModuleBySlug, getTrainingById } from '@/lib/learn/content';
import { trainingView } from '@/lib/learn/trainings';

type Params = { params: Promise<{ moduleSlug: string; lessonId: string }> };

export function generateStaticParams() {
  return getLcContent().listModules().flatMap((m) => m.manifest.lessons.map((l) => ({ moduleSlug: m.manifest.slug, lessonId: l.id })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { moduleSlug, lessonId } = await params;
  const m = getModuleBySlug(moduleSlug);
  const lesson = m?.manifest.lessons.find((l) => l.id === lessonId);
  return m && lesson ? { title: `${lesson.title} · ${m.manifest.title}`, robots: { index: false, follow: false } } : {};
}

export default async function LearnLessonPage({ params }: Params) {
  const { moduleSlug, lessonId } = await params;
  const found = getModuleBySlug(moduleSlug);
  if (!found) notFound();
  const { manifest: m, isDemo } = found;
  const lessonIndex = m.lessons.findIndex((l) => l.id === lessonId);
  const category = getLcCategoryById(m.categoryId);
  if (lessonIndex < 0 || !category) notFound();
  const now = new Date();
  // A related training shows only when it is a real public listing that is still ahead.
  const relatedTrainings = m.relatedTrainingIds
    .map(getTrainingById)
    .filter((t) => t !== null)
    .filter((t) => !['completed', 'cancelled'].includes(trainingView(t, now)))
    .map((t) => ({ slug: t.slug, title: t.title, isExample: t.isExample }));
  const relatedModules = m.relatedModuleIds
    .map(getModuleById)
    .filter((x) => x !== null)
    .map((x) => ({ slug: x.manifest.slug, title: x.manifest.title }));
  // Steps that point at a training that is not listed are left out, so nothing dangles.
  const lesson = m.lessons[lessonIndex];
  const steps = lesson.steps.filter((s) => s.type !== 'related_training' || relatedTrainings.length > 0);

  return (
    <LcPlayer
      module={{ id: m.id, slug: m.slug, version: m.version, title: m.title, cast: category.cast, isDemo, takeaways: m.takeaways }}
      lesson={{ id: lesson.id, title: lesson.title, steps }}
      lessonIndex={lessonIndex}
      outline={m.lessons.map((l) => ({ id: l.id, title: l.title }))}
      relatedTrainings={relatedTrainings}
      relatedModules={relatedModules}
    />
  );
}
