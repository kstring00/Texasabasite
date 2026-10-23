import styles from './Hero.module.css';

/** The dashed road plus four chips. Positions are percentages of the collage box. */
const POS = [
  { left: 9, top: 84 },
  { left: 26, top: 92 },
  { left: 49, top: 85 },
  { left: 75.5, top: 92.5 },
];

export function MilestonePath({ labels }: { labels: string[] }) {
  return (
    <>
      <svg className={styles.road} viewBox="0 0 910 760" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className={styles.roadPath} pathLength={1} d="M-10 672 C 90 664, 150 724, 260 726 S 430 664, 520 658 S 700 716, 800 718 S 880 702, 930 684" />
      </svg>
      <ul className={styles.chips} aria-hidden="true">
        {labels.map((label, i) => {
          const p = POS[i % POS.length];
          return (
            <li key={label} className={`${styles.chip} ${i === labels.length - 1 ? styles.chipLast : ''}`} style={{ '--cx-base': `${p.left}%`, '--cy-base': `${p.top}%`, animationDelay: `${1.55 + i * 0.22}s` } as React.CSSProperties}>
              <span className={styles.chipDot} />
              {label}
            </li>
          );
        })}
      </ul>
    </>
  );
}
