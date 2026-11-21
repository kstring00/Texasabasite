'use client';

import { useSyncExternalStore } from 'react';
import { Pause, Play } from 'lucide-react';
import styles from './Ticker.module.css';

/**
 * One switch for every ticker on the page: pausing one pauses them all.
 * Kept outside React so two tickers in different sections stay in step.
 */
let paused = false;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const setPaused = (next: boolean) => {
  paused = next;
  listeners.forEach((fn) => fn());
};

function Star() {
  return (
    <svg className={styles.star} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.8 7 5 11.2 12 12-7 .8-11.2 5-12 12-.8-7-5-11.2-12-12 7-.8 11.2-5 12-12Z" fill="currentColor" />
    </svg>
  );
}

/**
 * A single line of phrases that glides sideways in a seamless loop.
 *
 * - Screen readers get the phrases once, as ordinary hidden text. The moving copy is hidden from them.
 * - Under reduced motion it does not move.
 * - The moving line is clipped, so it can never make the page scroll sideways.
 * - `control` adds a pause button, so anyone can stop the movement.
 */
export function Ticker({
  phrases,
  tone,
  seconds = 40,
  direction = 'left',
  size = 'line',
  srText = true,
  control = false,
}: {
  phrases: string[];
  tone: 'cobalt' | 'ink' | 'outline';
  /** How long one pass of the phrase list takes. */
  seconds?: number;
  direction?: 'left' | 'right';
  size?: 'line' | 'giant';
  /** Set false only when the same words are already on the page right beside the ticker. */
  srText?: boolean;
  control?: boolean;
}) {
  const isPaused = useSyncExternalStore(subscribe, () => paused, () => false);
  // Enough copies that one group is wider than a very wide screen; two groups make the loop seamless.
  const repeats = size === 'giant' ? 4 : 3;
  const group = Array.from({ length: repeats }, () => phrases).flat();
  return (
    <div className={`${styles.ticker} ${styles[tone]} ${styles[size]}`} data-paused={isPaused ? '' : undefined}>
      {srText ? <p className="sr-only">{phrases.join('. ')}.</p> : null}
      <div className={styles.viewport} aria-hidden="true">
        <div className={styles.track} style={{ animationDuration: `${seconds * repeats}s`, animationDirection: direction === 'right' ? 'reverse' : 'normal' }}>
          {[0, 1].map((copy) => (
            <div className={styles.group} key={copy}>
              {group.map((phrase, i) => (
                <span className={styles.item} key={i}>
                  <span className={styles.phrase}>{phrase}</span>
                  <Star />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      {control ? (
        <button type="button" className={styles.control} aria-pressed={isPaused} onClick={() => setPaused(!isPaused)}>
          {isPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          <span className="sr-only">Pause moving text</span>
        </button>
      ) : null}
    </div>
  );
}
