'use client';

import { useEffect, useRef, useState } from 'react';

const TOP = 80; // px: below this the nav is transparent and never hides
const DEAD_ZONE = 6; // px: ignore smaller moves (trackpad jitter, iOS rubber-banding)

export type NavScroll = { hidden: boolean; atTop: boolean };

/**
 * Hide-on-scroll-down, reveal-on-scroll-up. One passive scroll listener, rAF-throttled.
 * Scroll positions are clamped to [0, max] so Safari's overscroll bounce never flips direction.
 */
export function useNavScroll(): NavScroll {
  const [state, setState] = useState<NavScroll>({ hidden: false, atTop: true });
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const read = () => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      return Math.min(Math.max(window.scrollY, 0), max);
    };
    lastY.current = read();
    const update = () => {
      ticking.current = false;
      const y = read();
      const atTop = y < TOP;
      setState((prev) => {
        let hidden = prev.hidden;
        const dy = y - lastY.current;
        if (Math.abs(dy) > DEAD_ZONE) {
          if (dy > 0 && y > TOP) hidden = true;
          else if (dy < 0) hidden = false;
          lastY.current = y;
        }
        if (atTop) hidden = false;
        return hidden === prev.hidden && atTop === prev.atTop ? prev : { hidden, atTop };
      });
    };
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return state;
}
