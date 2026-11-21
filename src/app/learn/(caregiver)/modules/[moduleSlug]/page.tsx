import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, Clock, Layers, ShieldCheck } from 'lucide-react';
import { LcDemoChip } from '@/components/learn/LcDemo';
import { LcIconTile } from '@/components/learn/LcIcon';
import { LcModuleStart } from '@/components/learn/LcModuleStart';
import { LcBack } from '@/components/learn/LcPageHead';
import { LcTrainingCard } from '@/components/learn/LcTraining';
import { getLcCategoryById } from '@/data/learn/categories';
import { getLcContent, getModuleBySlug, getTrainingById } from '@/lib/learn/content';
import { formatCtDate } from '@/lib/learn/time';
import { trainingView } from '@/lib/learn/trainings';

type Params = { params: Promise<{ moduleSlug: string }> };

export function generateStaticParams() {
  return getLcContent().listModules().map((m) => ({ moduleSlug: m.manifest.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const m = getModuleBySlug((await params).moduleSlug);
  return m ? { title: m.manifest.title, description: m.manifest.summary, alternates: { canonical: `/learn/modules/${m.manifest.slug}` } } : {};
}

export default async function LearnModulePage({ params }: Params) {
  // Only published versions are ever looked up here. Anything else is simply not found.
  const found = getModuleBySlug((await params).moduleSlug);
  if (!found) notFound();
  const { manifest: m, isDemo, origin } = found;
  const category = getLcCategoryById(m.categoryId);
  if (!category) notFound();
  const now = new Date();
  const trainings = m.relatedTrainingIds
    .map(getTrainingById)
    .filter((t) => t !== null)
    .map((training) => ({ training, view: trainingView(training, now) }))
    .filter((t) => t.view !== 'completed' && t.view !== 'cancelled');

  return (
    <div data-cast={category.cast} data-lc-scene="reading">
      <LcBack href="/learn/library" label="Learning Library" />
      <header className="lc-surface lc-pagehead lc-pagehead-topic">
        <LcIconTile name={category.icon} />
        <div>
          <p className="lc-pagehead-cat">
            <Link href={`/learn/topics/${category.slug}`}>{category.name}</Link>
          </p>
          <h1 className="lc-h1">{m.title}</h1>
          {isDemo ? (
            <p className="lc-chips">
              <LcDemoChip />
            </p>
          ) : null}
          <p className="lc-lead lc-pagehead-lead">{m.summary}</p>
          <p className="lc-meta">
            <span>
              <Clock width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
              About {m.estimatedMinutes} minutes
            </span>
            <span>
              <Layers width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
              {m.lessons.length} {m.lessons.length === 1 ? 'lesson' : 'lessons'}
            </span>
          </p>
        </div>
      </header>

      <div className="lc-module-layout">
        <div className="lc-module-main">
          <LcModuleStart moduleId={m.id} slug={m.slug} version={m.version} lessons={m.lessons.map((l) => ({ id: l.id, title: l.title, summary: l.summary, stepCount: l.steps.length }))} />
        </div>
        <aside className="lc-module-side" aria-label="About this module">
          <section aria-labelledby="lc-objectives-title" className="lc-surface lc-panel">
            <h2 id="lc-objectives-title" className="lc-h3">
              What you will learn
            </h2>
            <ul className="lc-takeaways">
              {m.objectives.map((o, i) => (
                <li key={i}>
                  <Check width={20} height={20} strokeWidth={2} aria-hidden="true" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="lc-review-title" className="lc-surface lc-panel">
            <h2 id="lc-review-title" className="lc-h3">
              Clinical review
            </h2>
            {m.review.status === 'final_approved' && m.review.reviewerLabel && m.review.reviewedOn ? (
              <p className="lc-review-line">
                <ShieldCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                <span>
                  Reviewed by {m.review.reviewerLabel} on {formatCtDate(`${m.review.reviewedOn}T18:00:00Z`)}.
                </span>
              </p>
            ) : (
              <p className="lc-muted">
                {origin === 'demo_workflow'
                  ? 'Demo sample — pending clinical approval. This module was published through the staff demo by fictional reviewers. It has not been reviewed by a clinician.'
                  : 'Demo sample — pending clinical approval. This module has not been reviewed by a clinician and is here only to show how lessons work.'}
              </p>
            )}
          </section>
        </aside>
      </div>

      {trainings.length > 0 ? (
        <section aria-labelledby="lc-module-training" className="lc-section">
          <h2 id="lc-module-training" className="lc-h2">
            Live training on this topic
          </h2>
          <ul className="lc-training-list">
            {trainings.map(({ training, view }) => (
              <li key={training.id}>
                <LcTrainingCard training={training} view={view} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
