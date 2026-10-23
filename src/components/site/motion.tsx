'use client';

/**
 * Calm, one-directional reveals that can never hide content.
 *
 * Server HTML is fully visible. On the client, an element that is still below the fold
 * at mount is hidden, observed, and revealed when it enters the viewport. Anything already
 * on screen never animates (no flash), reduced-motion users never animate, and a timeout
 * reveals everything regardless, so a missed observation can't leave a section blank.
 */
import { createContext, createElement, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';

type Tag = 'div' | 'section' | 'li' | 'article' | 'header' | 'ul' | 'ol';

const GroupCtx = createContext<{ stagger: number; next: () => number } | null>(null);

function useReveal(delay: number) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.classList.add('rv-hidden');
    const raf = requestAnimationFrame(() => el.classList.add('rv-anim'));
    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      el.style.transitionDelay = `${delay}s`;
      el.classList.remove('rv-hidden');
      io.disconnect();
    };
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && show(), { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
    io.observe(el);
    const t = window.setTimeout(show, 3500);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      io.disconnect();
    };
  }, [reduce, delay]);
  return ref;
}

export function Reveal({ children, className, delay = 0, as = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: Tag }) {
  const ref = useReveal(delay);
  return createElement(as, { ref, className, 'data-reveal': '' }, children);
}

/** Staggers its <RevealItem> children. */
export function RevealGroup({ children, className, as = 'div', stagger = 0.08 }: { children: ReactNode; className?: string; as?: Tag; stagger?: number }) {
  const counter = useRef(0);
  const value = useRef({ stagger, next: () => counter.current++ });
  return createElement(GroupCtx.Provider, { value: value.current }, createElement(as, { className }, children));
}

export function RevealItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: Tag }) {
  const group = useContext(GroupCtx);
  const index = useRef<number | null>(null);
  if (index.current === null) index.current = group ? group.next() : 0;
  const ref = useReveal(group ? index.current * group.stagger : 0);
  return createElement(as, { ref, className, 'data-reveal': '' }, children);
}
