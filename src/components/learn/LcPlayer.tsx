'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Check, CircleCheck, CircleHelp, Info, Lightbulb, ListChecks, MessageSquareText, Presentation, Video } from 'lucide-react';
import type { LcCast } from '@/data/learn/categories';
import type { LcStep } from '@/lib/learn/manifest';
import { readStore, saveModuleProgress, storageAvailable, type LcModuleProgress } from '@/lib/learn/progress';
import { LcDemoChip, LcDemoStrip } from './LcDemo';
import { LcKnowledgeCheck } from './LcKnowledgeCheck';
import { LcOrb } from './LcOrb';

export type LcPlayerProps = {
  module: { id: string; slug: string; version: string; title: string; cast: LcCast; isDemo: boolean; takeaways: string[] };
  lesson: { id: string; title: string; steps: LcStep[] };
  lessonIndex: number;
  outline: { id: string; title: string }[];
  /** Trainings linked to this module that are really listed. Empty when there are none. */
  relatedTrainings: { slug: string; title: string; isExample: boolean }[];
  relatedModules: { slug: string; title: string }[];
};

const STEP_LABEL: Record<LcStep['type'], { word: string; icon: typeof Info }> = {
  intro: { word: 'Introduction', icon: BookOpen },
  slide: { word: 'Slide', icon: Presentation },
  explanation: { word: 'In plain words', icon: MessageSquareText },
  scenario: { word: 'Scenario', icon: Lightbulb },
  knowledge_check: { word: 'Knowledge check', icon: CircleHelp },
  takeaways: { word: 'Takeaways', icon: ListChecks },
  related_training: { word: 'Live training', icon: Video },
};

const clamp = (n: number, max: number) => Math.max(0, Math.min(max, n));

/** The guided player: one step at a time, Back and Next always in the same place, nothing timed. */
export function LcPlayer({ module: mod, lesson, lessonIndex, outline, relatedTrainings, relatedModules }: LcPlayerProps) {
  const router = useRouter();
  const last = lesson.steps.length - 1;
  const lessonCount = outline.length;
  const base = `/learn/modules/${mod.slug}`;
  const prevLesson = lessonIndex > 0 ? outline[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < lessonCount - 1 ? outline[lessonIndex + 1] : null;

  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [canSave, setCanSave] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [doneLessons, setDoneLessons] = useState<string[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const save = useCallback(
    (patch: Partial<LcModuleProgress>) => {
      const prev = readStore().modules[mod.id];
      const sameVersion = prev && prev.version === mod.version ? prev : undefined;
      const next: LcModuleProgress = {
        version: mod.version,
        lessonId: lesson.id,
        step: 0,
        doneLessons: sameVersion?.doneLessons ?? [],
        completed: sameVersion?.completed ?? false,
        answers: sameVersion?.answers ?? {},
        ...patch,
        at: new Date().toISOString(),
      };
      setCanSave(saveModuleProgress(mod.id, next));
    },
    [mod.id, mod.version, lesson.id],
  );

  // Work out where to open: the address (?step=2), else this browser's saved place, else the start.
  useEffect(() => {
    const fromUrl = () => {
      const q = new URLSearchParams(window.location.search).get('step');
      if (q === 'last') return last;
      if (q && /^\d+$/.test(q)) return clamp(Number(q) - 1, last);
      return null;
    };
    const saved = readStore().modules[mod.id];
    const mine = saved && saved.version === mod.version ? saved : undefined;
    const start = fromUrl() ?? (mine && mine.lessonId === lesson.id ? clamp(mine.step, last) : 0);
    setAnswers(mine?.answers ?? {});
    setDoneLessons(mine?.doneLessons ?? []);
    setCanSave(storageAvailable());
    setStep(start);
    setReady(true);
    window.history.replaceState(null, '', `?step=${start + 1}`);
    save({ step: start });
    // The browser's own Back and Forward buttons move between steps.
    const onPop = () => {
      const s = fromUrl();
      if (s !== null) {
        setFinished(false);
        setDirection('back');
        setStep(s);
        moved.current = true;
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [mod.id, mod.version, lesson.id, last, save]);

  // After a step change, put the reader at the top of the new step and tell screen readers.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [step, finished]);

  const go = (to: number, dir: 'forward' | 'back') => {
    moved.current = true;
    setDirection(dir);
    setStep(to);
    window.history.pushState(null, '', `?step=${to + 1}`);
    save({ step: to });
  };

  const next = () => {
    if (step < last) return go(step + 1, 'forward');
    const done = Array.from(new Set([...doneLessons, lesson.id]));
    setDoneLessons(done);
    if (nextLesson) {
      save({ lessonId: nextLesson.id, step: 0, doneLessons: done });
      router.push(`${base}/lesson/${nextLesson.id}?step=1`);
    } else {
      save({ step: last, doneLessons: done, completed: true });
      moved.current = true;
      setFinished(true);
    }
  };

  const back = () => {
    if (finished) {
      moved.current = true;
      setFinished(false);
      return;
    }
    if (step > 0) return go(step - 1, 'back');
    if (prevLesson) router.push(`${base}/lesson/${prevLesson.id}?step=last`);
    else router.push(base);
  };

  const current = lesson.steps[step];
  const label = STEP_LABEL[current.type];
  const LabelIcon = label.icon;
  const nextLabel = step < last ? 'Next' : nextLesson ? 'Next lesson' : 'Finish module';
  const backLabel = finished || step > 0 ? 'Back' : prevLesson ? 'Previous lesson' : 'Module overview';

  return (
    <div className="lc-player" data-cast={mod.cast}>
      <article className="lc-solid lc-player-card" aria-labelledby="lc-step-title">
        <div className="lc-player-top">
          <button type="button" className="lc-btn lc-btn-secondary lc-player-back" onClick={back}>
            <ArrowLeft width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            Back
          </button>
          <p className="lc-player-where">
            Lesson {lessonIndex + 1} of {lessonCount}
          </p>
          <Link href={base} className="lc-btn lc-btn-quiet">
            Save and exit
          </Link>
        </div>

        <div className="lc-segments" role="img" aria-label={finished ? 'Lesson complete' : `Step ${step + 1} of ${lesson.steps.length}`}>
          {lesson.steps.map((s, i) => (
            <span key={s.id} data-state={finished || i < step ? 'done' : i === step ? 'current' : 'todo'} />
          ))}
        </div>

        {mod.isDemo ? <LcDemoStrip /> : null}
        {ready && !canSave ? (
          <p className="lc-note" data-cast="blue">
            <Info width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            <span>This browser is not saving progress right now. You can still finish the lesson.</span>
          </p>
        ) : null}

        <p className="lc-player-lesson">
          {mod.title} · {lesson.title}
        </p>

        {finished ? (
          <Completion mod={mod} headingRef={headingRef} relatedTrainings={relatedTrainings} relatedModules={relatedModules} />
        ) : (
          <div key={current.id} className="lc-step" data-direction={direction} data-ready={ready ? '' : undefined}>
            <p className="lc-step-label">
              <LabelIcon width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
              {label.word}
              <span className="lc-sr-only">
                , step {step + 1} of {lesson.steps.length}
              </span>
            </p>
            <h1 id="lc-step-title" ref={headingRef} tabIndex={-1} className="lc-h1 lc-step-title">
              {current.title}
            </h1>
            <StepBody
              step={current}
              saved={answers[current.id] ?? []}
              onAnswer={(ids) => {
                const a = { ...answers, [current.id]: ids };
                setAnswers(a);
                save({ step, answers: a });
              }}
              relatedTrainings={relatedTrainings}
              nextLessonTitle={step === last ? nextLesson?.title ?? null : null}
            />
          </div>
        )}

        <details className="lc-outline">
          <summary>Lesson outline</summary>
          <ol>
            {outline.map((l, i) => (
              <li key={l.id}>
                {l.id === lesson.id ? (
                  <>
                    <span className="lc-outline-current" aria-current="true">
                      Lesson {i + 1}: {l.title}
                    </span>
                    <ol className="lc-outline-steps">
                      {lesson.steps.map((s, j) => (
                        <li key={s.id}>
                          <button type="button" onClick={() => { setFinished(false); go(j, j < step ? 'back' : 'forward'); }} aria-current={!finished && j === step ? 'step' : undefined}>
                            {STEP_LABEL[s.type].word}: {s.title}
                          </button>
                        </li>
                      ))}
                    </ol>
                  </>
                ) : (
                  <Link href={`${base}/lesson/${l.id}?step=1`}>
                    Lesson {i + 1}: {l.title}
                    {doneLessons.includes(l.id) ? <span className="lc-outline-done"> (done)</span> : null}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </details>

        <div className="lc-player-bottom">
          <button type="button" className="lc-btn lc-btn-secondary" onClick={back}>
            <ArrowLeft width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            {backLabel}
          </button>
          {finished ? (
            <Link href="/learn/library" className="lc-btn lc-btn-primary">
              Return to library
            </Link>
          ) : (
            <button type="button" className="lc-btn lc-btn-primary" onClick={next}>
              {nextLabel}
              <ArrowRight width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      </article>
      <p className="lc-player-foot">You can always come back to this lesson. Your progress is saved on this device.</p>
    </div>
  );
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

function StepBody({ step, saved, onAnswer, relatedTrainings, nextLessonTitle }: { step: LcStep; saved: string[]; onAnswer: (ids: string[]) => void; relatedTrainings: LcPlayerProps['relatedTrainings']; nextLessonTitle: string | null }) {
  switch (step.type) {
    case 'intro':
      return (
        <div className="lc-prose">
          <Paragraphs items={step.body} />
          {step.whyItMatters ? (
            <p className="lc-why">
              <strong>Why it matters. </strong>
              {step.whyItMatters}
            </p>
          ) : null}
        </div>
      );
    case 'slide':
      return (
        <>
          <figure className="lc-slide">
            {step.layout === 'sequence' ? (
              <ol className="lc-slide-seq">
                {step.items.map((it, i) => (
                  <li key={i}>
                    {it.label ? <span className="lc-slide-letter" aria-hidden="true">{it.label}</span> : null}
                    <span className="lc-slide-title">{it.title}</span>
                    {it.text ? <span className="lc-slide-text">{it.text}</span> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="lc-slide-list">
                {step.items.map((it, i) => (
                  <li key={i}>
                    <span className="lc-slide-title">{it.title}</span>
                    {it.text ? <span className="lc-slide-text">{it.text}</span> : null}
                  </li>
                ))}
              </ul>
            )}
            <figcaption className="lc-sr-only">{step.description}</figcaption>
          </figure>
          <div className="lc-prose">
            <Paragraphs items={step.narration} />
          </div>
        </>
      );
    case 'explanation':
      return (
        <div className="lc-prose">
          <Paragraphs items={step.body} />
        </div>
      );
    case 'scenario':
      return (
        <>
          <div className="lc-scenario">
            <p className="lc-scenario-flag">Example story, not a real family.</p>
            <div className="lc-prose">
              <Paragraphs items={step.story} />
            </div>
          </div>
          {step.afterword ? (
            <div className="lc-prose">
              <Paragraphs items={step.afterword} />
            </div>
          ) : null}
        </>
      );
    case 'knowledge_check':
      return <LcKnowledgeCheck step={step} saved={saved} onAnswer={onAnswer} />;
    case 'takeaways':
      return (
        <>
          <ul className="lc-takeaways">
            {step.points.map((p, i) => (
              <li key={i}>
                <Check width={20} height={20} strokeWidth={2} aria-hidden="true" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          {nextLessonTitle ? <p className="lc-muted">Next lesson: {nextLessonTitle}.</p> : null}
        </>
      );
    case 'related_training': {
      const t = relatedTrainings[0];
      return t ? (
        <div className="lc-prose">
          <p>There is a live caregiver training on this topic for currently enrolled families.</p>
          <p>
            <Link href={`/learn/trainings/${t.slug}`} className="lc-link">
              {t.title}
            </Link>
          </p>
        </div>
      ) : (
        <div className="lc-prose">
          <p>There is no live training listed for this topic right now.</p>
        </div>
      );
    }
  }
}

function Completion({ mod, headingRef, relatedTrainings, relatedModules }: { mod: LcPlayerProps['module']; headingRef: React.RefObject<HTMLHeadingElement | null>; relatedTrainings: LcPlayerProps['relatedTrainings']; relatedModules: LcPlayerProps['relatedModules'] }) {
  return (
    <div className="lc-done">
      <div className="lc-done-badge" aria-hidden="true">
        <LcOrb />
        <span>
          <CircleCheck width={36} height={36} strokeWidth={1.75} />
        </span>
      </div>
      <h1 id="lc-step-title" ref={headingRef} tabIndex={-1} className="lc-h1 lc-step-title">
        You finished <span className="lc-text-light">this module.</span>
      </h1>
      <p className="lc-lead">Well done for making the time. Here is what to keep from {mod.title}.</p>
      <ul className="lc-takeaways">
        {mod.takeaways.map((p, i) => (
          <li key={i}>
            <Check width={20} height={20} strokeWidth={2} aria-hidden="true" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {relatedModules.length > 0 ? (
        <div className="lc-done-more">
          <h2 className="lc-h3">Related modules</h2>
          <ul className="lc-inline-links">
            {relatedModules.map((m) => (
              <li key={m.slug}>
                <Link href={`/learn/modules/${m.slug}`}>{m.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {relatedTrainings.length > 0 ? (
        <div className="lc-done-more">
          <h2 className="lc-h3">Live training on this topic</h2>
          <p className="lc-muted">For currently enrolled families. You’ll complete registration through Microsoft Teams.</p>
          <ul className="lc-done-trainings">
            {relatedTrainings.map((t) => (
              <li key={t.slug}>
                <Link href={`/learn/trainings/${t.slug}`} className="lc-link">
                  {t.title}
                </Link>
                {t.isExample ? <LcDemoChip label="Example listing" /> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="lc-done-scope">
        These educational resources support general learning. Your child’s supervising <abbr title="Board Certified Behavior Analyst">BCBA</abbr> is responsible for individualized recommendations and treatment planning.
      </p>
    </div>
  );
}
