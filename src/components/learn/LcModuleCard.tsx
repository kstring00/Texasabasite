'use client';

import Link from 'next/link';
import { ArrowRight, CircleCheck, Clock, Layers } from 'lucide-react';
import type { LcCast, LcIconName } from '@/data/learn/categories';
import type { LcModuleSummary } from '@/lib/learn/content';
import { lessonPosition } from '@/lib/learn/progress';
import { useLcProgress } from '@/lib/learn/useLcProgress';
import { LcDemoChip } from './LcDemo';
import { LcIconTile } from './LcIcon';

export type LcCardCategory = { name: string; cast: LcCast; icon: LcIconName };

/** One module in a list. The button reads "Continue learning" when this browser has a saved place. */
export function LcModuleCard({ module: m, category, headingLevel = 3 }: { module: LcModuleSummary; category: LcCardCategory; headingLevel?: 2 | 3 }) {
  const { ready, progress } = useLcProgress(m.id, { version: m.version, lessons: m.lessons });
  const lessonIds = m.lessons.map((l) => l.id);
  const overview = `/learn/modules/${m.slug}`;
  const inProgress = ready && progress && !progress.completed;
  const completed = ready && progress?.completed;
  const position = progress ? lessonPosition(progress, lessonIds) : 1;
  const href = inProgress && progress ? `${overview}/lesson/${progress.lessonId}` : overview;
  const label = completed ? 'Review module' : inProgress ? 'Continue learning' : 'Start learning';
  const H = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <article className="lc-surface lc-mcard lc-lift" data-cast={category.cast}>
      <p className="lc-mcard-top">
        <LcIconTile name={category.icon} size="sm" />
        <span className="lc-mcard-cat">{category.name}</span>
      </p>
      <H className="lc-h3">
        <Link href={overview} className="lc-mcard-title">
          {m.title}
        </Link>
      </H>
      {m.isDemo ? <LcDemoChip /> : null}
      <p className="lc-muted lc-clamp-2">{m.summary}</p>
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
      {inProgress ? (
        <div className="lc-mcard-progress">
          <span className="lc-bar" aria-hidden="true">
            <span style={{ width: `${Math.round(((position - 1) / lessonIds.length) * 100 + 100 / lessonIds.length / 2)}%` }} />
          </span>
          <span className="lc-mcard-progress-label">
            Lesson {position} of {lessonIds.length}
          </span>
        </div>
      ) : null}
      {completed ? (
        <p className="lc-mcard-done">
          <CircleCheck width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
          Completed on this device
        </p>
      ) : null}
      <Link href={href} className="lc-btn lc-btn-primary lc-mcard-cta">
        {label}
        <span className="lc-sr-only">: {m.title}</span>
        <ArrowRight width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </article>
  );
}
