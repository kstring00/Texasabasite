'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Circle, CircleCheck, CircleDot, Info, RotateCcw } from 'lucide-react';
import type { LcModuleShape } from '@/lib/learn/progress';
import { useLcProgress } from '@/lib/learn/useLcProgress';

type Lesson = { id: string; title: string; summary: string; stepCount: number };

/** The "Start module" or "Resume" button, the lesson list with this browser's place, and the reset control. */
export function LcModuleStart({ moduleId, slug, version, lessons }: { moduleId: string; slug: string; version: string; lessons: Lesson[] }) {
  const shape: LcModuleShape = { version, lessons: lessons.map((l) => ({ id: l.id, stepCount: l.stepCount })) };
  const { ready, available, progress, stale, reset } = useLcProgress(moduleId, shape);
  const [confirming, setConfirming] = useState(false);
  const [wasReset, setWasReset] = useState(false);
  const base = `/learn/modules/${slug}/lesson`;
  const current = progress && !progress.completed ? lessons.find((l) => l.id === progress.lessonId) : null;
  const done = new Set(progress?.completed ? lessons.map((l) => l.id) : progress?.doneLessons ?? []);
  const cta = !ready || !progress ? { href: `${base}/${lessons[0].id}`, label: 'Start module' }
    : progress.completed ? { href: `${base}/${lessons[0].id}?step=1`, label: 'Review from the start' }
    : { href: `${base}/${progress.lessonId}`, label: 'Resume' };

  return (
    <div className="lc-start">
      <div className="lc-start-cta">
        <Link href={cta.href} className="lc-btn lc-btn-primary">
          {cta.label}
          <ArrowRight width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
        </Link>
        <p className="lc-muted" role="status">
          {!ready ? '' : progress?.completed ? 'You finished this module on this device.' : current ? `You were on lesson ${lessons.indexOf(current) + 1}: ${current.title}.` : 'You can stop anywhere and come back.'}
        </p>
      </div>

      {ready && stale ? (
        <p className="lc-note" data-cast="blue">
          <Info width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          <span>This module has been updated since your last visit, so it starts from the beginning.</span>
        </p>
      ) : null}
      {ready && !available ? (
        <p className="lc-note" data-cast="blue">
          <Info width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          <span>This browser is not saving progress right now. You can still do every lesson. It will start from the beginning next time.</span>
        </p>
      ) : null}

      <section aria-labelledby="lc-lessons-title" className="lc-surface lc-panel">
        <h2 id="lc-lessons-title" className="lc-h2">
          Lessons
        </h2>
        <ol className="lc-lessons">
          {lessons.map((l, i) => {
            const isDone = done.has(l.id);
            const isCurrent = current?.id === l.id;
            return (
              <li key={l.id}>
                <Link href={`${base}/${l.id}${isCurrent ? '' : '?step=1'}`} className="lc-lesson-row">
                  <span className="lc-lesson-state" data-state={isDone ? 'done' : isCurrent ? 'current' : 'todo'}>
                    {isDone ? <CircleCheck width={24} height={24} strokeWidth={1.75} aria-hidden="true" /> : isCurrent ? <CircleDot width={24} height={24} strokeWidth={1.75} aria-hidden="true" /> : <Circle width={24} height={24} strokeWidth={1.75} aria-hidden="true" />}
                  </span>
                  <span className="lc-lesson-text">
                    <span className="lc-lesson-title">
                      Lesson {i + 1}: {l.title}
                    </span>
                    <span className="lc-muted">{l.summary}</span>
                    {isDone ? <span className="lc-lesson-tag">Done</span> : isCurrent ? <span className="lc-lesson-tag">You are here</span> : null}
                  </span>
                  <ArrowRight width={20} height={20} strokeWidth={1.75} aria-hidden="true" className="lc-lesson-arrow" />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="lc-saved-title" className="lc-surface lc-panel">
        <h2 id="lc-saved-title" className="lc-h3">
          Your progress is saved on this device
        </h2>
        <p className="lc-muted">
          Your place is kept only in this browser. There is no account and nothing is sent to us. If you clear your browser data or use a different phone or computer, it starts over.
        </p>
        {ready && progress && !confirming ? (
          <button type="button" className="lc-btn lc-btn-secondary" onClick={() => setConfirming(true)}>
            <RotateCcw width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            Reset progress
          </button>
        ) : null}
        {confirming ? (
          <div className="lc-confirm" role="group" aria-label="Confirm reset">
            <p>Clear your saved place in this module on this device?</p>
            <div className="lc-confirm-actions">
              <button
                type="button"
                className="lc-btn lc-btn-destructive"
                onClick={() => {
                  reset();
                  setConfirming(false);
                  setWasReset(true);
                }}
              >
                Yes, reset
              </button>
              <button type="button" className="lc-btn lc-btn-secondary" onClick={() => setConfirming(false)}>
                Keep my place
              </button>
            </div>
          </div>
        ) : null}
        <p role="status" className="lc-muted">
          {wasReset && !progress ? 'Your progress in this module was cleared.' : ''}
        </p>
      </section>
    </div>
  );
}
