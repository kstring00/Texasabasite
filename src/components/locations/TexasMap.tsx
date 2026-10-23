'use client';

import { centers, pillGeometry } from './data/centers';
import styles from './Locations.module.css';

/** Texas, projected from real coordinates. Do not redraw. */
const TEXAS =
  'M162.4 20 L283.4 20 L283.4 110.1 L295.3 111.9 L307.3 117.5 L319.2 118.4 L331.1 126.8 L341.1 133.7 L355 137 L364.9 143 L378.9 140.7 L388.8 149.1 L400.7 144.4 L410.7 140.7 L426.6 147.7 L442.5 143 L458.4 146.3 L474.4 140.7 L490.3 152.8 L503 152.8 L520.5 152.8 L520.5 205.7 L520.5 229.4 L532 252.1 L540 270.7 L536 293.9 L534 314.8 L528.1 332 L520.1 335.7 L506.2 342.7 L492.3 354.3 L472.4 368.2 L450.5 382.1 L430.6 396 L416.7 407.6 L400.7 421.6 L390.8 440.1 L386.8 461 L390.8 484.2 L396.8 507.5 L384.8 509.8 L366.9 505.1 L347 495.9 L321.2 486.6 L311.2 468 L304.1 447.1 L301.3 428.5 L279.4 405.3 L261.5 382.1 L251.6 358.9 L241.6 347.3 L227.7 332 L205.8 328.7 L187.9 335.7 L176 347.3 L168 358.9 L156.1 351.9 L146.1 340.3 L130.2 324.1 L108.3 307.8 L94.4 289.3 L86.4 270.7 L64.6 254.4 L24.8 239.1 L20 228.9 L161.6 228.9 Z';

type Props = {
  selectedId: string;
  peekId: string | null;
  onSelect: (id: string) => void;
  onPeek: (id: string | null) => void;
};

export function TexasMap({ selectedId, peekId, onSelect, onPeek }: Props) {
  return (
    <div className={styles.map}>
      {/* The map itself: an image. */}
      <svg viewBox="0 0 670 530" role="img" aria-label="Map of Texas showing six Texas ABA Centers locations">
        <defs>
          <pattern id="tx-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="1.7" className={styles.dot} />
          </pattern>
        </defs>
        <path className={styles.landBase} d={TEXAS} />
        <path className={styles.land} d={TEXAS} fill="url(#tx-dots)" />

        {/* metro halos */}
        <circle className={styles.halo} cx="460" cy="337" r="30" />
        <circle className={styles.halo} cx="410" cy="192" r="24" />
        <circle className={styles.halo} cx="373" cy="309" r="16" />

        {/* leader lines sit under the pins */}
        {centers.map((c) => {
          const g = pillGeometry(c);
          const on = c.id === selectedId;
          const peek = c.id === peekId;
          return <line key={`l-${c.id}`} className={`${styles.leader} ${on ? styles.on : ''} ${peek ? styles.peek : ''}`} x1={c.x} y1={c.y} x2={g.ex} y2={g.ey} />;
        })}
        <text className={styles.compass} x="40" y="500">
          N ↑
        </text>
      </svg>

      {/* The pins: a group of buttons laid over the image, same viewBox, so they stay real controls. */}
      <svg viewBox="0 0 670 530" className={styles.pins} role="group" aria-label="Centers on the map">
        {centers.map((c) => {
          const g = pillGeometry(c);
          const on = c.id === selectedId;
          const peek = c.id === peekId;
          return (
            <g
              key={c.id}
              className={`${styles.pin} ${on ? styles.on : ''} ${peek ? styles.peek : ''}`}
              tabIndex={0}
              role="button"
              aria-label={`${c.name} center`}
              aria-pressed={on}
              onClick={() => onSelect(c.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(c.id);
                }
              }}
              onMouseEnter={() => onPeek(c.id)}
              onMouseLeave={() => onPeek(null)}
              onFocus={() => onPeek(c.id)}
              onBlur={() => onPeek(null)}
            >
              <circle className={styles.ring} cx={c.x} cy={c.y} r="9" />
              <circle className={styles.pinDot} cx={c.x} cy={c.y} r="5.5" />
              <rect x={g.rx} y={g.ry} width={g.w} height={g.h} rx="13" />
              <text x={g.tx} y={g.ty} textAnchor="middle">
                {c.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
