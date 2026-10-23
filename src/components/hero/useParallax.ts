'use client';

import { useEffect, type RefObject } from 'react';

export type ParallaxLayer = { ref: RefObject<HTMLElement | SVGElement | null>; px: number };

/**
 * Pointer parallax across depth layers. One rAF loop, lerp 0.08, stops when settled.
 * Fine pointers only; never attaches on touch. Disabled until the intro has finished.
 */
export function useParallax(heroRef: RefObject<HTMLElement | null>, layers: ParallaxLayer[], { enabled = true, readyAfterMs = 2600 } = {}) {
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !enabled) return;
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf: number | null = null, ready = false;
    const readyTimer = window.setTimeout(() => (ready = true), readyAfterMs);
    function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      for (const l of layers) {
        const el = l.ref.current as HTMLElement | null;
        if (el) el.style.transform = `translate(${(cx * l.px).toFixed(2)}px,${(cy * l.px * 0.6).toFixed(2)}px)`;
      }
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
