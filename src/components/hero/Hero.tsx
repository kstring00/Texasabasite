'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { heroContent as c } from './hero.content';
import { HeroCollage, makeConfetti } from './HeroCollage';
import { useParallax, type ParallaxLayer } from './useParallax';
import { track } from '@/lib/site/analytics';
import styles from './Hero.module.css';

const PhoneIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);

/**
 * The final homepage hero: copy left, photo collage with the graduation cap right.
 * CSS keyframes for the choreography; one rAF loop for parallax; no animation library.
 */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const far = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const cap = useRef<HTMLDivElement>(null);
  const near = useRef<HTMLDivElement>(null);
  const layersRef = useRef<ParallaxLayer[]>([
    { ref: far, px: 6 },
    { ref: a, px: 10 },
    { ref: b, px: 12 },
    { ref: cap, px: 16 },
    { ref: near, px: 20 },
  ]);

  const [confetti, setConfetti] = useState<ReturnType<typeof makeConfetti>>([]);
  const [state, setState] = useState({ turn: false, turned: false, burst: false, idle: false, reduce: false, mounted: false });
  const firing = useRef(false);
  const timers = useRef<number[]>([]);

  const celebrate = useCallback(() => {
    if (firing.current) return;
    firing.current = true;
    setConfetti(makeConfetti());
    setState((s) => ({ ...s, burst: false, turned: false }));
    requestAnimationFrame(() => setState((s) => ({ ...s, burst: true, turn: true })));
    timers.current.push(window.setTimeout(() => setState((s) => ({ ...s, turn: false, turned: true })), 1600));
    timers.current.push(
      window.setTimeout(() => {
        setState((s) => ({ ...s, burst: false }));
        firing.current = false;
      }, 2000),
    );
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setState({ turn: false, turned: true, burst: false, idle: false, reduce: true, mounted: true });
      return;
    }
    setState((s) => ({ ...s, mounted: true }));
    const pending = timers.current;
    pending.push(window.setTimeout(celebrate, 1450));
    pending.push(window.setTimeout(() => setState((s) => ({ ...s, idle: true })), 2600));
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, [celebrate]);

  useParallax(heroRef, layersRef.current, { enabled: state.mounted && !state.reduce });

  const cls = [styles.hero, state.mounted && styles.mounted, state.turn && styles.turn, state.turned && styles.turned, state.burst && styles.burst, state.idle && styles.idle, state.reduce && styles.still].filter(Boolean).join(' ');

  return (
    <section ref={heroRef} className={cls} id="hero" aria-labelledby="hero-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <i aria-hidden="true" />
          <span>{c.eyebrow}</span>
        </p>
        <h1 className={styles.h1} id="hero-title">
          <span className={styles.ln}>
            <span className={styles.w}>{c.headline.line1}</span>
          </span>
          <span className={styles.ln}>
            <span className={styles.w}>
              of <span className={styles.wLife}>life</span>
            </span>
          </span>
          <span className={styles.ln}>
            <span className={styles.w}>{c.headline.line3}</span>{' '}
            <button type="button" className={styles.wNext} onMouseEnter={celebrate} onClick={celebrate} aria-label={`${c.headline.word} See the graduation moment again`}>
              {c.headline.word}
              <svg viewBox="0 0 220 24" preserveAspectRatio="none" aria-hidden="true">
                <path d="M4 18 C 50 10, 120 22, 216 4" pathLength={1} />
              </svg>
            </button>
          </span>
        </h1>
        <p className={styles.lede}>
          {c.lede.before}
          <strong>{c.lede.strong}</strong>
          {c.lede.after}
        </p>
        <p className="sr-only">
          {c.milestonesIntro} {c.milestones.join(', ')}.
        </p>
        <div className={styles.cta}>
          <a className={`${styles.btn} ${styles.solid}`} href={c.primaryCta.href}>
            {c.primaryCta.label}
            <span className={styles.arrow} aria-hidden="true">
              →
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

      <HeroCollage layers={{ far, a, b, cap, near }} confetti={confetti} onCapClick={celebrate} />
    </section>
  );
}
