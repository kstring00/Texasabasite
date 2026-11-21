'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './BlogHero.module.css';

const HEART_COLORS = ['#e2283a', '#8b2442', '#703068', '#32175a', '#1a2e52'];
const HEART = 'M0 -44 C 6 -56, 24 -54, 22 -38 C 21 -27, 8 -18, 0 -12 C -8 -18, -21 -27, -22 -38 C -24 -54, -6 -56, 0 -44 Z';

/** A constellation: fixed points and the lines between them, so it draws the same on server and browser. */
const STARS: [number, number][] = [[20, 78], [52, 40], [88, 66], [118, 22], [150, 58], [182, 30], [214, 70], [244, 44], [132, 92], [70, 104], [196, 104], [104, 60], [168, 84]];
const LINKS: [number, number][] = [[0, 1], [1, 2], [1, 3], [2, 11], [11, 3], [3, 4], [4, 5], [5, 6], [6, 7], [4, 12], [12, 6], [2, 8], [8, 12], [0, 9], [9, 8], [12, 10], [10, 6], [11, 4], [2, 9]];

function ArchArt() {
  return (
    <svg viewBox="0 0 260 150" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <path key={i} className="edge" d={`M ${40 + i * 22} 150 V ${92 - i * 4} a ${90 - i * 22} ${90 - i * 22} 0 0 1 ${180 - i * 44} 0 V 150`} fill={i === 3 ? 'rgb(242 207 104 / 0.55)' : 'none'} stroke={i === 0 ? 'rgb(51 73 232)' : 'rgb(23 38 56 / 0.3)'} strokeWidth={i === 0 ? 2 : 1.25} />
      ))}
    </svg>
  );
}
function ConstellationArt() {
  return (
    <svg viewBox="0 0 264 126" aria-hidden="true">
      <g className="edge" stroke="rgb(247 243 235 / 0.4)" strokeWidth="1">
        {LINKS.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={STARS[a][0]} y1={STARS[a][1]} x2={STARS[b][0]} y2={STARS[b][1]} />
        ))}
      </g>
      {STARS.map(([x, y], i) => (
        <circle key={i} className="node" style={{ ['--i' as string]: i }} cx={x} cy={y} r={i % 4 === 0 ? 4 : 2.6} fill={i % 3 === 0 ? 'rgb(242 207 104)' : 'rgb(247 243 235)'} />
      ))}
    </svg>
  );
}
function PetalArt() {
  return (
    <svg viewBox="-70 -70 140 110" aria-hidden="true">
      {HEART_COLORS.map((c, i) => (
        <g key={c} transform={`rotate(${i * 72})`}>
          <path className="node" style={{ ['--i' as string]: i * 2 }} d={HEART} fill={c} fillOpacity="0.9" />
        </g>
      ))}
      <path className="node" style={{ ['--i' as string]: 11 }} d="M0 -17 L5 -6 L17 -5 L8 3 L10.5 15 L0 9 L-10.5 15 L-8 3 L-17 -5 L-5 -6 Z" fill="#fff" />
    </svg>
  );
}

export type BlogPanel = { eyebrow: string; headline: string; description: string; cta: string; href: string };

/** Each headline slides in along its arrow: [trail x, trail y] is where it comes from, in rem. */
const LOOK = [
  { tone: styles.cream, px: '-2.6rem', py: '1.8rem', rot: '-38deg', origin: 'left center', arrow: { left: '58%', top: '2.9rem' }, Art: ArchArt },
  { tone: styles.light, px: '3.6rem', py: '0rem', rot: '180deg', origin: 'center', arrow: { right: '1%', top: '1.5rem' }, Art: ConstellationArt },
  { tone: styles.tint, px: '-2.6rem', py: '1.8rem', rot: '-38deg', origin: 'left center', arrow: { left: '70%', top: '2.9rem' }, Art: PetalArt },
];

/**
 * The blog's opening: three diagonal panels across the full width, one screen tall at most.
 * The first headline is the page title. On phones the panels stack as three bands.
 */
export function BlogHero({ panels }: { panels: [BlogPanel, BlogPanel, BlogPanel] }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section className={styles.hero} data-hover={hover ?? undefined} aria-label="Blog">
      <span className={styles.bgRight} aria-hidden="true" />
      <span className={styles.mid} aria-hidden="true">
        <span className={styles.midFill} />
      </span>
      <div className={styles.panels}>
        {panels.map((p, i) => {
          const look = LOOK[i];
          const Head = i === 0 ? 'h1' : 'h2';
          return (
            <div key={p.eyebrow} className={`${styles.panel} ${look.tone}`} style={{ ['--px' as string]: look.px, ['--py' as string]: look.py }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
              <div className={styles.copy}>
                <p className={styles.eyebrow}>{p.eyebrow}</p>
                <div className={styles.headWrap}>
                  <span className={`${styles.ghost} ${styles.ghost2}`} aria-hidden="true">
                    {p.headline}
                  </span>
                  <span className={`${styles.ghost} ${styles.ghost1}`} aria-hidden="true">
                    {p.headline}
                  </span>
                  <Head className={styles.head}>{p.headline}</Head>
                  <span className={styles.arrow} style={{ ['--rot' as string]: look.rot, transformOrigin: look.origin, ...look.arrow }} aria-hidden="true">
                    <i />
                    <b />
                  </span>
                </div>
                <p className={styles.desc}>{p.description}</p>
                <Link href={p.href} className={styles.btn}>
                  {p.cta} <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              <span className={styles.art} aria-hidden="true">
                <look.Art />
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
