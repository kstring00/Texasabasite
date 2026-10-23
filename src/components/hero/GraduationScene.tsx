'use client';

import { forwardRef, useEffect, useState, type RefObject } from 'react';
import styles from './Hero.module.css';

/**
 * The graduation scene, ported one to one from design/graduation-hero-reference.html.
 * Far layer: rings and a 36-ray sunburst. Mid layer: the mortarboard (dome, board, thickness,
 * shine, button, tassel pivoting at the button) and the diploma. Near layer: confetti, the dashed
 * road and the milestone chips. Decorative: the words carry the meaning.
 */
const CX = 280;
const CY = 215;
const RAYS = Array.from({ length: 36 }, (_, i) => {
  const a = (i / 36) * Math.PI * 2;
  return { x1: CX + Math.cos(a) * 120, y1: CY + Math.sin(a) * 120, x2: CX + Math.cos(a) * 196, y2: CY + Math.sin(a) * 196, delay: 0.5 + i * 0.012 };
});
const CONFETTI_COLORS = ['var(--hero-blue)', 'var(--hero-yellow)', 'var(--hero-red)', 'var(--hero-blue-deep)', 'var(--hero-paper)'];

type Confetti = { kind: 0 | 1 | 2; fill: string; stroke: boolean; dx: number; dy: number; r: number; delay: number; duration: number };

function makeConfetti(): Confetti[] {
  return Array.from({ length: 54 }, (_, j) => {
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;
    const dist = 120 + Math.random() * 190;
    return {
      kind: (j % 3) as 0 | 1 | 2,
      fill: CONFETTI_COLORS[j % CONFETTI_COLORS.length],
      stroke: j % 3 !== 1 && j % 5 === 4,
      dx: Math.cos(ang) * dist,
      dy: Math.sin(ang) * dist + 140,
      r: (Math.random() - 0.5) * 720,
      delay: Math.random() * 0.18,
      duration: 1.3 + Math.random() * 0.7,
    };
  });
}

/** Chips sit along the road, alternating rows, same rhythm as the reference's four. */
function layoutMilestones(labels: string[]) {
  let x = 40;
  return labels.map((label, i) => {
    const width = Math.round(34 + label.length * 7.1);
    const y = i % 2 === 0 ? 408 : 446;
    const chip = { label, x, y, width, last: i === labels.length - 1 };
    x += width - (i % 2 === 0 ? 36 : 6);
    return chip;
  });
}

type Props = {
  milestones: string[];
  layers: [RefObject<SVGGElement | null>, RefObject<SVGGElement | null>, RefObject<SVGGElement | null>];
  onCapClick: () => void;
};

export const GraduationScene = forwardRef<SVGSVGElement, Props>(function GraduationScene({ milestones, layers, onCapClick }, ref) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  useEffect(() => setConfetti(makeConfetti()), []);
  const chips = layoutMilestones(milestones);
  const [d1, d2, d3] = layers;

  return (
    <svg ref={ref} className={styles.scene} viewBox="0 0 560 520" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="hero-rayclip">
          <circle cx={CX} cy={CY} r="196" />
        </clipPath>
      </defs>

      {/* far: rings and rays */}
      <g ref={d1} className={styles.depth}>
        <g className={styles.rays} clipPath="url(#hero-rayclip)">
          {RAYS.map((r, i) => (
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} style={{ animationDelay: `${r.delay}s` }} />
          ))}
        </g>
        <g className={styles.rings}>
          <circle cx={CX} cy={CY} r="196" />
          <circle cx={CX} cy={CY} r="150" />
          <circle cx={CX} cy={CY} r="104" />
        </g>
        <circle className={styles.burstRing} cx={CX} cy={CY} r="120" />
      </g>

      {/* mid: the cap */}
      <g ref={d2} className={styles.depth}>
        <ellipse className={styles.capShadow} cx="280" cy="322" rx="92" ry="14" />
        <g className={styles.capwrap} onClick={onCapClick} style={{ cursor: 'pointer' }}>
          <path className={styles.dome} d="M212 236 C 212 300, 348 300, 348 236 Z" />
          <path className={styles.domeHi} d="M232 240 C 236 272, 262 284, 280 284 C 262 276, 244 262, 232 240 Z" />
          <polygon className={styles.boardSide} points="128,206 280,262 432,206 432,218 280,274 128,218" />
          <polygon className={styles.board} points="280,150 432,206 280,262 128,206" />
          <polygon className={styles.boardShine} points="280,150 432,206 390,222 280,170" />
          <circle className={styles.button} cx="280" cy="200" r="6.5" />
          <g className={styles.tassel}>
            <path className={styles.cord} d="M280 200 C 282 230, 286 262, 284 296" />
            <rect className={styles.tuft} x="276" y="292" width="17" height="40" rx="8.5" />
            <rect className={styles.band} x="276" y="292" width="17" height="7" rx="3.5" />
            <path className={styles.strand} d="M280 300 V 328 M284.5 300 V 330 M289 300 V 328" />
          </g>
        </g>
        <g className={styles.diploma}>
          <rect className={styles.roll} x="372" y="286" width="84" height="26" rx="13" transform="rotate(-18 414 299)" />
          <rect className={styles.ribbon} x="406" y="282" width="12" height="34" rx="3" transform="rotate(-18 414 299)" />
        </g>
      </g>

      {/* near: confetti and the milestone road */}
      <g ref={d3} className={styles.depth}>
        <g>
          {confetti.map((c, j) => {
            const style = { ['--dx' as string]: `${c.dx}px`, ['--dy' as string]: `${c.dy}px`, ['--r' as string]: `${c.r}deg`, animationDelay: `${c.delay}s`, animationDuration: `${c.duration}s` } as React.CSSProperties;
            const common = { className: styles.confetti, fill: c.fill, style, ...(c.stroke ? { stroke: 'var(--hero-ink)', strokeWidth: 1 } : {}) };
            if (c.kind === 0) return <rect key={j} width="10" height="5" x="275" y="200" rx="1" {...common} />;
            if (c.kind === 1) return <circle key={j} r="4" cx="280" cy="202" {...common} />;
            return <path key={j} d="M276 198 l8 0 l-4 7 z" {...common} />;
          })}
        </g>
        <path className={styles.road} d="M30 426 C 70 426, 140 464, 181 464 S 290 426, 320 426 S 440 464, 530 464" />
        <g className={styles.milestones}>
          {chips.map((c) => (
            <g key={c.label} className={`${styles.ms} ${c.last ? styles.msLast : ''}`}>
              <rect x={c.x} y={c.y} width={c.width} height="36" rx="18" />
              <circle cx={c.x + 20} cy={c.y + 18} r="4.5" />
              <text x={c.x + 32} y={c.y + 22.5}>{c.label}</text>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
});
