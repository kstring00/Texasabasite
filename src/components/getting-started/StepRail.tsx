'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { steps, tourHref, type Step } from './data/gettingStarted';
import { useMyCenter } from '@/lib/site/myCenter';
import { CENTER_NAME, getBestContact } from '@/data/people';
import { getCenterModel, insideHref } from '@/data/centerModels';
import { Scene } from './scenes/Scene';
import styles from './GettingStarted.module.css';

type Props = {
  activeIndex: number;
  onSelect: (i: number) => void;
  /** Receives each step's <li> so the parent can observe scroll position. */
  register: (i: number, el: HTMLLIElement | null) => void;
};

/** The numbered rail and the step cards. Below 981px each card also carries its own scene. */
export function StepRail({ activeIndex, onSelect, register }: Props) {
  const { centerId } = useMyCenter();
  // Steps 2 and 4: name the Clinical Director when the parent's center has one.
  const director = centerId ? getBestContact('clinical', centerId) : null;
  const directorLine = director && director.title === 'Clinical Director' && centerId ? `${director.name}, Clinical Director at ${CENTER_NAME[centerId]}` : null;
  // Step 1: the virtual walkthrough exists for Sugar Land only.
  const walkModel = getCenterModel('sugarland');
  const showWalk = walkModel && (!centerId || centerId === 'sugarland');
  return (
    <ol className={styles.steps}>
      {steps.map((s, i) => (
        <li key={s.title} ref={(el) => register(i, el)} className={`${styles.step} ${i === activeIndex ? styles.on : ''} ${i < activeIndex ? styles.done : ''}`}>
          <span className={styles.num} aria-hidden="true">
            {i + 1}
          </span>
          <div className={styles.col}>
            <StepCard step={s} index={i} onSelect={onSelect} meetExtra={(i === 1 || i === 3) && directorLine ? directorLine : null} />
            {i === 0 && showWalk && (
              <p className={styles.alt}>
                Want to look around first?{' '}
                <Link href={insideHref(walkModel)}>
                  <b>Take the virtual walkthrough{centerId ? '' : ' (Sugar Land)'} →</b>
                </Link>
              </p>
            )}
            {i === 0 && (
              <p className={styles.alt}>
                Prefer a form?{' '}
                <Link href={tourHref}>
                  <b>Request a tour →</b>
                </Link>
              </p>
            )}
            {s.link && (
              <p className={styles.alt}>
                <Link href={s.link.href}>
                  <b>{s.link.text} →</b>
                </Link>
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function StepCard({ step, index, onSelect, meetExtra }: { step: Step; index: number; onSelect: (i: number) => void; meetExtra?: string | null }) {
  const stageRef = useRef<HTMLDivElement>(null);
  // Bumping the key remounts the inline scene, which restarts its CSS animations.
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setPlayKey((k) => k + 1)),
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(index);
    }
  };

  return (
    <div className={styles.card} role="button" tabIndex={0} onClick={() => onSelect(index)} onKeyDown={onKey}>
      {/* The accessible name is the card's own text, so it always matches what is visible. */}
      <h3>
        <span className="sr-only">Step {index + 1}: </span>
        {step.title}
      </h3>
      <span className="sr-only">Show what this looks like.</span>
      <p>{step.body}</p>
      <div className={styles.meet}>
        <b>WHO YOU MEET</b>
        <span>
          {step.meet}
          {meetExtra && (
            <>
              {' '}
              <strong>{meetExtra}</strong>.
            </>
          )}
        </span>
      </div>
      <div className={styles.inline}>
        <div ref={stageRef} className={styles.stage} aria-hidden="true">
          <Scene key={playKey} kind={step.scene} play={playKey > 0} />
        </div>
        <div className={styles.split}>
          <div className={styles.you}>
            <b>YOU</b>
            <p>{step.you}</p>
          </div>
          <div className={styles.we}>
            <b>WE</b>
            <p>{step.we}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
