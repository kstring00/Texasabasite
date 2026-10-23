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

  // Scroll drives the panel. The active step is the card whose top has most recently crossed the
  // reading line (40% down the viewport), so a card switches only once the eye is on it, and
  // never switches early just because the next card has entered the middle of the screen.
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      if (Date.now() < lockUntil.current) return;
      const line = window.innerHeight * 0.4;
      let next = 0;
      stepEls.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) next = i;
      });
      setActiveIndex((cur) => (cur === next ? cur : next));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
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
