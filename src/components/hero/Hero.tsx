'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { heroContent as c } from './hero.content';
import { GraduationScene } from './GraduationScene';
import { useParallax } from './useParallax';
import { track } from '@/lib/site/analytics';
import styles from './Hero.module.css';

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);

/**
 * The graduation hero. Copy left, scene right. "next." fires the moment; "life" wakes the milestones.
 * CSS keyframes and one small requestAnimationFrame loop, no animation library.
 */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const d1 = useRef<SVGGElement>(null);
  const d2 = useRef<SVGGElement>(null);
  const d3 = useRef<SVGGElement>(null);
  const [phase, setPhase] = useState<{ turn: boolean; turned: boolean; burst: boolean; idle: boolean }>({ turn: false, turned: false, burst: false, idle: false });
  const firing = useRef(false);
  const timers = useRef<number[]>([]);
  const [reduce, setReduce] = useState(false);

  const celebrate = useCallback(() => {
    if (firing.current) return;
    firing.current = true;
    setPhase((p) => ({ ...p, burst: false, turned: false }));
    // next frame: start the turn and the burst (the reference forces a reflow between the two)
    requestAnimationFrame(() => setPhase((p) => ({ ...p, burst: true, turn: true })));
    timers.current.push(window.setTimeout(() => setPhase((p) => ({ ...p, turn: false, turned: true })), 1600));
    timers.current.push(
      window.setTimeout(() => {
        setPhase((p) => ({ ...p, burst: false }));
        firing.current = false;
      }, 2300),
    );
  }, []);

  useEffect(() => {
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduce(prefersReduce);
    if (prefersReduce) {
      setPhase({ turn: false, turned: true, burst: false, idle: false });
      return;
    }
    const pending = timers.current;
    pending.push(window.setTimeout(celebrate, 1500));
    pending.push(window.setTimeout(() => setPhase((p) => ({ ...p, idle: true })), 3400));
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, [celebrate]);

  useParallax(heroRef, [d1, d2, d3], { enabled: !reduce });

  const cls = [styles.hero, phase.turn && styles.turn, phase.turned && styles.turned, phase.burst && styles.burst, phase.idle && styles.idle].filter(Boolean).join(' ');

  return (
    <section ref={heroRef} className={cls} id="hero" aria-labelledby="hero-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <i aria-hidden="true" />
          {c.eyebrow}
        </p>
        <h1 className={styles.h1} id="hero-title">
          <span className={styles.ln}>
            <span className={styles.w}>{c.headline.line1}</span>
          </span>
          <span className={styles.ln}>
            <span className={styles.w}>
              {c.headline.line2Prefix}
              <span className={styles.wLife}>{c.headline.line2Word}</span>
            </span>
          </span>
          <span className={styles.ln}>
            <span className={styles.w}>{c.headline.line3Prefix}</span>{' '}
            <button type="button" className={`${styles.w} ${styles.wNext}`} onMouseEnter={celebrate} onClick={celebrate} title="See it again" aria-label={`${c.headline.line3Word} See the graduation moment again`}>
              {c.headline.line3Word}
              <svg viewBox="0 0 220 24" preserveAspectRatio="none" aria-hidden="true">
                <path d="M4 16 C 50 4, 120 22, 216 8" />
              </svg>
            </button>
          </span>
        </h1>
        <p className={styles.lede}>
          {c.lede.before}
          <strong>{c.lede.strong}</strong>
          {c.lede.after}
        </p>
        <div className={styles.cta}>
          <a className={`${styles.btn} ${styles.solid}`} href={c.primaryCta.href}>
            {c.primaryCta.label}{' '}
            <span className={styles.arrow} aria-hidden="true">
              ↓
            </span>
          </a>
          <a className={`${styles.btn} ${styles.ghost}`} href={c.secondaryCta.href} onClick={() => track({ name: 'call_tap', center: 'main', place: 'hero' })}>
            <PhoneIcon />
            {c.secondaryCta.label}
          </a>
        </div>
        <p className={styles.promise}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 9.5 12 5l10 4.5L12 14 2 9.5Z" />
            <path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" />
            <path d="M22 9.5V15" />
          </svg>
          <span>
            <b>{c.promise.strong}</b>
            {c.promise.rest}
          </span>
        </p>
      </div>

      <div className={styles.stage} aria-hidden="true">
        <GraduationScene milestones={c.milestones} layers={[d1, d2, d3]} onCapClick={celebrate} />
        <div className={styles.caption}>{c.caption}</div>
      </div>
    </section>
  );
}
