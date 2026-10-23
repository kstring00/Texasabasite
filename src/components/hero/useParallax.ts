'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Pointer parallax for three depth layers: rings least, cap mid, confetti and milestones most.
 * Same multipliers and easing as the reference prototype. Desktop pointers only; a touch
 * device never attaches the listeners. Starts after the opening choreography has landed.
 */
export function useParallax(
  heroRef: RefObject<HTMLElement | null>,
  layers: [RefObject<SVGGElement | null>, RefObject<SVGGElement | null>, RefObject<SVGGElement | null>],
  { enabled = true, readyAfterMs = 2600 }: { enabled?: boolean; readyAfterMs?: number } = {},
) {
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !enabled) return;
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;
    let raf: number | null = null;
    let ready = false;
    const readyTimer = window.setTimeout(() => (ready = true), readyAfterMs);

    function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      const [d1, d2, d3] = layers.map((l) => l.current);
      if (d1) d1.style.transform = `translate(${cx * -6}px,${cy * -4}px)`;
      if (d2) d2.style.transform = `translate(${cx * 10}px,${cy * 6}px)`;
      if (d3) d3.style.transform = `translate(${cx * 18}px,${cy * 8}px)`;
      raf = Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : null;
    }
    function onMove(e: PointerEvent) {
      if (!ready || !hero) return;
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function onLeave() {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    }
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    return () => {
      window.clearTimeout(readyTimer);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [heroRef, layers, enabled, readyAfterMs]);
}
