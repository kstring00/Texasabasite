import styles from './Hero.module.css';

/**
 * The mortarboard, seen from an elevated three-quarter view. All gradients, no raster.
 * Coordinates live in a 440 × 400 box; the tassel pivots at the button (220, 118).
 */
export function GradCap({ className }: { className?: string }) {
  const strands = Array.from({ length: 14 }, (_, i) => i);
  return (
    <svg viewBox="0 0 440 400" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="cap-board" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--cap-hi)" />
          <stop offset="0.55" stopColor="var(--cap-mid)" />
          <stop offset="1" stopColor="var(--cap-lo)" />
        </linearGradient>
        <radialGradient id="cap-dome" cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="var(--cap-dome-hi)" />
          <stop offset="1" stopColor="var(--cap-dome-lo)" />
        </radialGradient>
        <radialGradient id="cap-button" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#F3D58A" />
          <stop offset="1" stopColor="#C99A2E" />
        </radialGradient>
        <linearGradient id="cap-cord" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3D58A" />
          <stop offset="1" stopColor="#C99A2E" />
        </linearGradient>
        <filter id="cap-blur" x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      {/* shadow on the floor */}
      <ellipse className={styles.capShadow} cx="220" cy="300" rx="150" ry="22" filter="url(#cap-blur)" />

      <g className={styles.capBody}>
        {/* skull cap (dome) */}
        <path d="M118 176 C 118 262, 322 262, 322 176 Z" fill="url(#cap-dome)" />
        <ellipse cx="170" cy="200" rx="34" ry="12" fill="#fff" opacity="0.12" />

        {/* board thickness: front-left and front-right faces */}
        <polygon points="22,150 220,228 220,246 22,168" fill="var(--cap-lo)" />
        <polygon points="220,228 418,150 418,168 220,246" fill="var(--cap-lo)" />
        <polyline points="22,150 220,228 418,150" fill="none" stroke="#3A4766" strokeOpacity="0.6" strokeWidth="2" />

        {/* board top: a rhombus, left corner longer than the right */}
        <polygon points="220,56 418,150 220,228 22,150" fill="url(#cap-board)" />
        {/* bevel along the two front edges */}
        <polyline points="22,150 220,228 418,150" fill="none" stroke="#3A4766" strokeOpacity="0.6" strokeWidth="2.5" strokeLinejoin="round" />
        {/* subtle sheen */}
        <polygon points="220,56 418,150 360,166 220,86" fill="#fff" opacity="0.05" />

        {/* button */}
        <circle cx="220" cy="118" r="9" fill="url(#cap-button)" stroke="#5A4410" strokeWidth="1" />

        {/* tassel: pivots at the button; resting at −8° (hanging left) */}
        <g className={styles.tassel}>
          <path d="M220 118 C 212 150, 198 190, 190 236" fill="none" stroke="url(#cap-cord)" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="181" y="232" width="18" height="12" rx="4" fill="url(#cap-cord)" />
          <g>
            {strands.map((i) => {
              const dx = (i - 6.5) * 1.25;
              return <path key={i} d={`M${190 + dx * 0.5} 243 L${190 + dx * 1.6} 300`} stroke={i % 2 ? '#C99A2E' : '#E8C35A'} strokeWidth="1.8" strokeLinecap="round" fill="none" />;
            })}
          </g>
        </g>
      </g>
    </svg>
  );
}
