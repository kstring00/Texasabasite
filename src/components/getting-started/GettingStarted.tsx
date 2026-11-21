'use client';

import { useCallback, useState } from 'react';
import { header, steps } from './data/gettingStarted';
import { CompanionPanel } from './CompanionPanel';
import { StepRail } from './StepRail';
import { ContactRow } from './ContactRow';
import styles from './GettingStarted.module.css';

/**
 * Getting Started. Ported from design/getting-started-reference.html.
 * Desktop: the four steps swap in place. Choosing a step opens it and changes the companion panel
 * on the left, so the whole section stays on one screen.
 * Mobile: the panel hides and the steps are snap cards to swipe, each with its own scene.
 */
export function GettingStarted() {
  const [activeIndex, setActiveIndex] = useState(0);
  const register = useCallback(() => {}, []);
  const select = useCallback((i: number) => setActiveIndex(i), []);

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
