'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/site/utils';

/**
 * Calm, one-directional reveals. Nothing loops, flashes, or autoplays.
 * Respects prefers-reduced-motion by rendering static.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function Reveal({ children, className, delay = 0, as = 'div' }: { children: React.ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'li' | 'article' | 'header' }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10% 0px -5% 0px' }} variants={{ hidden: fadeUp.hidden, show: { ...(fadeUp.show as object), transition: { duration: 0.6, ease: EASE, delay } } }}>
      {children}
    </Tag>
  );
}

/** Staggers direct children that are <RevealItem>. */
export function RevealGroup({ children, className, as = 'div', stagger = 0.08 }: { children: React.ReactNode; className?: string; as?: 'div' | 'ul' | 'ol' | 'section'; stagger?: number }) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }
  const Tag = motion[as];
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10% 0px -5% 0px' }} variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}>
      {children}
    </Tag>
  );
}

export function RevealItem({ children, className, as = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'li' | 'article' }) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }
  const Tag = motion[as];
  return (
    <Tag className={cn(className)} variants={fadeUp}>
      {children}
    </Tag>
  );
}
