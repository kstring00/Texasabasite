'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { steps, tourHref, type Step } from './data/gettingStarted';
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
  return (
    <ol className={styles.steps}>
      {steps.map((s, i) => (
        <li key={s.title} ref={(el) => register(i, el)} className={`${styles.step} ${i === activeIndex ? styles.on : ''} ${i < activeIndex ? styles.done : ''}`}>
          <span className={styles.num} aria-hidden="true">
            {i + 1}
          </span>
          <div className={styles.col}>
            <StepCard step={s} index={i} onSelect={onSelect} />
            {i === 0 && (
              <p className={styles.alt}>
                Prefer a form?{' '}
                <Link href={tourHref}>
                  <b>Request a tour →</b>
                </Link>
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function StepCard({ step, index, onSelect }: { step: Step; index: number; onSelect: (i: number) => void }) {
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
    <div className={styles.card} role="button" tabIndex={0} aria-label={`Step ${index + 1}: ${step.title}. Show what this looks like.`} onClick={() => onSelect(index)} onKeyDown={onKey}>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
      <div className={styles.meet}>
        <b>WHO YOU MEET</b>
        <span>{step.meet}</span>
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
