'use client';

import { useEnter } from '../motion';
import styles from './DrawnRow.module.css';

/**
 * A short numbered sequence on one row. The line draws once when the row comes into view and
 * the numbers appear along it in order. On phones the same thing runs top to bottom.
 */
export function DrawnRow({ items, label }: { items: string[]; label: string }) {
  const [ref, enter] = useEnter<HTMLDivElement>(0.4);
  return (
    <div ref={ref} data-enter={enter} className={styles.wrapper} style={{ ['--count' as string]: items.length }}>
      <span className={styles.line} aria-hidden="true" />
      <ol className={styles.row} aria-label={label}>
      {items.map((text, i) => (
        <li key={text} className={styles.item} style={{ ['--i' as string]: i }}>
          <span className={styles.n} aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className={styles.text}>{text}</span>
        </li>
      ))}
      </ol>
    </div>
  );
}
