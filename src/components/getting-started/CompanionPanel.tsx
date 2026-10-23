'use client';

import { steps } from './data/gettingStarted';
import { Scene } from './scenes/Scene';
import { ContactRow } from './ContactRow';
import styles from './GettingStarted.module.css';

/**
 * The sticky dark panel. Acts out the active step; the contact row at the bottom never changes.
 * Fixed stage height and min-heights on the title and You/We boxes keep the panel's height stable.
 */
export function CompanionPanel({ index }: { index: number }) {
  const step = steps[index];
  return (
    <aside className={styles.panel} aria-live="polite" aria-label="What this step looks like">
      <div className={styles.pTop}>
        <span className={styles.pStep}>
          STEP {index + 1} OF {steps.length}
        </span>
        <div className={styles.pBar}>
          <i style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
      <h3 className={styles.pTitle}>{step.title}</h3>
      <div className={styles.stage} aria-hidden="true">
        <Scene key={index} kind={step.scene} play />
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
      <ContactRow place="panel" />
    </aside>
  );
}
