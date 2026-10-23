'use client';

import Image from 'next/image';
import { forwardRef, useEffect, useState, type RefObject } from 'react';
import { heroContent as c } from './hero.content';
import { TexasOutline } from './TexasOutline';
import { GradCap } from './GradCap';
import { MilestonePath } from './MilestonePath';
import styles from './Hero.module.css';

/** Sunburst: 44 thin rays around the cap. Generated after mount so the server renders none. */
const CENTER = { x: 446, y: 532 };
const R1 = 273, R2 = 419;

type Confetti = { kind: number; color: string; dx: number; dy: number; r: number; delay: number; dur: number };
const CONFETTI_COLORS = ['var(--hero-blue)', 'var(--hero-yellow)', '#E0665C', 'var(--hero-frame)'];

export function makeConfetti(): Confetti[] {
  return Array.from({ length: 40 }, (_, j) => {
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
    const dist = 110 + Math.random() * 190;
    return { kind: j % 3, color: CONFETTI_COLORS[j % CONFETTI_COLORS.length], dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist + 150, r: (Math.random() - 0.5) * 720, delay: Math.random() * 0.15, dur: 1.2 + Math.random() * 0.4 };
  });
}

type Layers = { far: RefObject<HTMLDivElement | null>; a: RefObject<HTMLDivElement | null>; b: RefObject<HTMLDivElement | null>; cap: RefObject<HTMLDivElement | null>; near: RefObject<HTMLDivElement | null> };

type Props = { layers: Layers; confetti: Confetti[]; onCapClick: () => void };

export const HeroCollage = forwardRef<HTMLDivElement, Props>(function HeroCollage({ layers, confetti, onCapClick }, ref) {
  const [rays, setRays] = useState<number[]>([]);
  useEffect(() => setRays(Array.from({ length: 44 }, (_, i) => i)), []);

  return (
    <div ref={ref} className={styles.collage}>
      {/* far: Texas and the sunburst */}
      <div ref={layers.far} className={styles.layer} aria-hidden="true">
        <TexasOutline className={styles.texasBox} />
        <svg className={styles.sunburst} viewBox="0 0 910 760" aria-hidden="true" focusable="false">
          <circle cx={CENTER.x} cy={CENTER.y} r={R1} className={styles.burstRing} />
          {rays.map((i) => {
            const a = (i / 44) * Math.PI * 2;
            return <line key={i} className={styles.ray} x1={CENTER.x + Math.cos(a) * R1} y1={CENTER.y + Math.sin(a) * R1} x2={CENTER.x + Math.cos(a) * R2} y2={CENTER.y + Math.sin(a) * R2} pathLength={1} style={{ animationDelay: `${0.3 + i * 0.008}s` }} />;
          })}
        </svg>
      </div>

      {/* photo A: the LCP element */}
      <div ref={layers.a} className={`${styles.layer} ${styles.photoA}`}>
        <figure className={`${styles.frame} ${styles.frameA}`}>
          <Image src={c.photos.a.src} alt={c.photos.a.alt} fill priority sizes="(min-width: 1100px) 34vw, 90vw" quality={82} placeholder="blur" blurDataURL={BLUR_A} className={styles.img} style={{ objectPosition: '50% 38%' }} />
        </figure>
      </div>

      {/* photo B */}
      <div ref={layers.b} className={`${styles.layer} ${styles.photoB}`}>
        <figure className={`${styles.frame} ${styles.frameB}`}>
          <Image src={c.photos.b.src} alt={c.photos.b.alt} fill sizes="(min-width: 1100px) 20vw, 50vw" quality={82} placeholder="blur" blurDataURL={BLUR_B} className={styles.img} style={{ objectPosition: '50% 40%' }} />
        </figure>
      </div>

      {/* the cap */}
      <div ref={layers.cap} className={`${styles.layer} ${styles.capLayer}`} aria-hidden="true">
        <div className={styles.capDrop} onClick={onCapClick}>
          <GradCap className={styles.cap} />
          <svg className={styles.confettiBox} viewBox="0 0 440 400" aria-hidden="true" focusable="false">
            {confetti.map((p, j) => {
              const style = { ['--dx' as string]: `${p.dx}px`, ['--dy' as string]: `${p.dy}px`, ['--r' as string]: `${p.r}deg`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` } as React.CSSProperties;
              if (p.kind === 0) return <rect key={j} className={styles.confetti} x="215" y="114" width="10" height="5" rx="1" fill={p.color} style={style} />;
              if (p.kind === 1) return <circle key={j} className={styles.confetti} cx="220" cy="118" r="4" fill={p.color} style={style} />;
              return <path key={j} className={styles.confetti} d="M216 114 l8 0 l-4 7 z" fill={p.color} style={style} />;
            })}
          </svg>
        </div>
      </div>

      {/* near: accents and the milestone road */}
      <div ref={layers.near} className={styles.layer} aria-hidden="true">
        <svg className={styles.spark} viewBox="0 0 40 40" aria-hidden="true">
          <path d="M8 34 L14 14" stroke="#E8C35A" strokeWidth="5" strokeLinecap="round" />
          <path d="M22 30 L30 10" stroke="#E8C35A" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <svg className={styles.star} viewBox="0 0 50 50" aria-hidden="true">
          <path d="M25 4 L30.5 18.5 L46 19 L33.5 28.5 L38 44 L25 35 L12 44 L16.5 28.5 L4 19 L19.5 18.5 Z" fill="none" stroke="#E8C35A" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <svg className={styles.sparkle} viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20 2 C 21 14, 26 19, 38 20 C 26 21, 21 26, 20 38 C 19 26, 14 21, 2 20 C 14 19, 19 14, 20 2 Z" fill="#E8C35A" />
        </svg>
        <MilestonePath labels={c.milestones} />
      </div>
    </div>
  );
});

/* Tiny blur placeholders (8 px wide), generated from the two photos. */
const BLUR_A = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAAFAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAbEAACAgMBAAAAAAAAAAAAAAABAwACBBESMf/EABUBAQEAAAAAAAAAAAAAAAAAAAID/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECAxESIf/aAAwDAQACEQMRAD8AmcZk5mNjnJSQ1Sx8AIO9ekRKpdH/2Q==';
const BLUR_B = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAAIAAgDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAHBAAAQQDAQAAAAAAAAAAAAAAAQACAwQFERIh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBEh/9oADAMBAAIRAxEAPwCnw/I72aXMtOK0MbC1xdH4iuA3o+pxFTjtHuSo9f/Z';
