'use client';

/**
 * First-visit loading screen.
 *
 * Rules (from the brief):
 *  - The flower mark draws in as a line, fills with color from the bottom up, then settles
 *    into the header logo position.
 *  - Max 1.2 seconds. Skippable on tap. Plays once per session (sessionStorage).
 *  - Fully skipped when prefers-reduced-motion is set.
 *  - The page is interactive the instant it ends. It is interactive underneath the whole time;
 *    the overlay only catches the skip tap.
 *
 * The overlay is in the server HTML but hidden unless <html data-intro> is set by the inline
 * script in the root layout, which runs before first paint. That avoids a flash either way.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const HEART =
  'M0 -44 C 6 -56, 24 -54, 22 -38 C 21 -27, 8 -18, 0 -12 C -8 -18, -21 -27, -22 -38 C -24 -54, -6 -56, 0 -44 Z';
const COLORS = ['#e2283a', '#8b2442', '#703068', '#32175a', '#1a2e52'];
const STAR = 'M0 -17 L5 -6 L17 -5 L8 3 L10.5 15 L0 9 L-10.5 15 L-8 3 L-17 -5 L-5 -6 Z';
const KEY = 'tac_intro_seen';

export function FirstVisitIntro() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<'idle' | 'draw' | 'fill' | 'settle' | 'done'>('idle');
  const [target, setTarget] = useState<{ x: number; y: number; scale: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.hasAttribute('data-intro') || reduce) {
      html.removeAttribute('data-intro');
      return;
    }
    try {
      window.sessionStorage.setItem(KEY, '1');
    } catch {}
    // Budget: the whole thing ends 1.2s after navigation start, hydration included.
    const elapsed = typeof performance !== 'undefined' ? performance.now() : 0;
    const remaining = 1200 - elapsed;
    if (remaining < 500) {
      html.removeAttribute('data-intro');
      return;
    }
    setPhase('draw');
    const t = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    t(() => setPhase('fill'), remaining * 0.3);
    t(() => {
      // Shared-element settle: measure where the header mark lives.
      const header = document.querySelector<SVGSVGElement>('#header-mark-anchor');
      const wrap = wrapRef.current;
      if (header && wrap) {
        const h = header.getBoundingClientRect();
        const w = wrap.getBoundingClientRect();
        setTarget({ x: h.left + h.width / 2 - (w.left + w.width / 2), y: h.top + h.height / 2 - (w.top + w.height / 2), scale: h.width / w.width });
      }
      setPhase('settle');
    }, remaining * 0.68);
    t(() => finish(), remaining - 20);
    return () => timers.current.forEach((x) => window.clearTimeout(x));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  function finish() {
    timers.current.forEach((x) => window.clearTimeout(x));
    setPhase('done');
    document.documentElement.removeAttribute('data-intro');
  }

  if (phase === 'idle' || phase === 'done') return null;

  const drawn = phase !== 'draw';
  const filled = phase === 'fill' || phase === 'settle';

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-paper"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'settle' ? 0 : 1 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: phase === 'settle' ? 0.08 : 0 }}
      onClick={finish}
      role="presentation"
      aria-hidden
    >
      <button type="button" className="sr-only" onClick={finish}>
        Skip intro
      </button>
      <motion.div
        ref={wrapRef}
        className="h-40 w-40"
        animate={phase === 'settle' && target ? { x: target.x, y: target.y, scale: target.scale } : { x: 0, y: 0, scale: 1 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'center' }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
          <defs>
            <clipPath id="intro-fill" clipPathUnits="userSpaceOnUse">
              <motion.rect x="-60" width="120" height="120" initial={{ y: 60 }} animate={{ y: filled ? -60 : 60 }} transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }} />
            </clipPath>
          </defs>
          <g transform="translate(50 50)">
            {COLORS.map((c, i) => (
              <motion.path key={`s${c}`} d={HEART} transform={`rotate(${i * 72})`} fill="none" stroke={c} strokeWidth={1.6} initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: drawn ? 1 : 1, opacity: filled ? 0 : 1 }} transition={{ pathLength: { duration: 0.3, ease: 'easeInOut', delay: i * 0.02 }, opacity: { duration: 0.2 } }} />
            ))}
            <g clipPath="url(#intro-fill)">
              {COLORS.map((c, i) => (
                <path key={`f${c}`} d={HEART} transform={`rotate(${i * 72})`} fill={c} />
              ))}
              <path d={STAR} fill="#ffffff" />
            </g>
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
}

/** Inline script. Runs before paint; decides whether the intro should show at all. */
export const introScript = `(function(){try{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(sessionStorage.getItem('${KEY}'))return;document.documentElement.setAttribute('data-intro','');}catch(e){}})();`;
