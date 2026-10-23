'use client';

import { useRef } from 'react';
import { centers, groupByMetro } from './data/centers';
import styles from './Locations.module.css';

type Props = {
  selectedId: string;
  peekId: string | null;
  onSelect: (id: string) => void;
  onPeek: (id: string | null) => void;
};

/** One block per metro, one row per center. Up/Down arrows move focus and selection, wrapping. */
export function CenterIndex({ selectedId, peekId, onSelect, onPeek }: Props) {
  const ref = useRef<HTMLElement>(null);
  const groups = groupByMetro(centers);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const btns = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button[data-id]') ?? []);
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    const n = btns[(i + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length];
    n.focus();
    onSelect(n.dataset.id!);
  }

  return (
    <nav ref={ref} className={styles.index} aria-label="Choose a center" onKeyDown={onKeyDown}>
      {groups.map((g) => (
        <div key={g.key} className={styles.block}>
          <div className={styles.blockHead}>
            <b>{g.key.toUpperCase()}</b>
            <span>
              {g.centers.length} {g.centers.length > 1 ? 'centers' : 'center'}
            </span>
          </div>
          <ul className={styles.rowsList}>
            {g.centers.map((c) => {
              const on = c.id === selectedId;
              const peek = c.id === peekId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    data-id={c.id}
                    className={`${styles.rowBtn} ${on ? styles.on : ''} ${peek ? styles.peek : ''}`}
                    aria-current={on ? 'true' : 'false'}
                    onClick={() => onSelect(c.id)}
                    onMouseEnter={() => onPeek(c.id)}
                    onMouseLeave={() => onPeek(null)}
                    onFocus={() => onPeek(c.id)}
                    onBlur={() => onPeek(null)}
                  >
                    <span className={styles.pip} aria-hidden="true" />
                    <span className={styles.nm}>{c.name}</span>
                    <span className={styles.go}>
                      <em>VIEWING</em>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
