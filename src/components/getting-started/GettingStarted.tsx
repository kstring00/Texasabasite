'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { header, steps } from './data/gettingStarted';
import { CompanionPanel } from './CompanionPanel';
import { StepRail } from './StepRail';
import { ContactRow } from './ContactRow';
import styles from './GettingStarted.module.css';

/**
 * Getting Started. Ported from design/getting-started-reference.html.
 * Desktop: scrolling the step cards drives the sticky companion panel on the left.
 * Mobile: the panel hides, each card shows its own scene, and the contact bar sticks to the bottom.
 */
export function GettingStarted() {
  const [activeIndex, setActiveIndex] = useState(0);
  const lockUntil = useRef(0);
  const stepEls = useRef<(HTMLLIElement | null)[]>([]);

  const register = useCallback((i: number, el: HTMLLIElement | null) => {
    stepEls.current[i] = el;
  }, []);

  const select = useCallback((i: number) => {
    lockUntil.current = Date.now() + 900; // the click wins over the observer for 900ms
    setActiveIndex(i);
  }, []);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntil.current) return;
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveIndex(stepEls.current.indexOf(e.target as HTMLLIElement));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    stepEls.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.wrap} id="getting-started" aria-labelledby="getting-started-title">
      <header className={styles.head}>
        <div className={styles.eyebrow}>{header.eyebrow}</div>
        <h2 id="getting-started-title" className={styles.h2}>
          {header.title}
        </h2>
        <p>{header.lede}</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.panelCol}>
          <CompanionPanel index={Math.min(activeIndex, steps.length - 1)} />
        </div>
        <div>
          <StepRail activeIndex={activeIndex} onSelect={select} register={register} />
          <div className={styles.contactStrip}>
            <ContactRow place="strip" />
          </div>
        </div>
      </div>
    </section>
  );
}
