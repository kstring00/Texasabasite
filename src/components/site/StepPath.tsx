'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { steps } from '@/data/steps';
import { RevealGroup, RevealItem } from './motion';

/** The 5-step path. On desktop the connecting line draws itself as you scroll. */
export function StepPath({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <RevealGroup as="div">
      <ol ref={ref} className="relative grid gap-6 md:grid-cols-5 md:gap-4" aria-label="Your path from first worry to first day">
        <span aria-hidden className="absolute left-5 top-5 hidden h-0.5 w-[calc(100%-2.5rem)] bg-line md:block" />
        <motion.span aria-hidden className="absolute left-5 top-5 hidden h-0.5 w-[calc(100%-2.5rem)] origin-left bg-sun md:block" style={{ scaleX: reduce ? 1 : scaleX }} />
        {steps.map((s) => (
          <RevealItem key={s.slug} as="li" className="relative flex gap-4 md:flex-col md:gap-3">
            <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-lg font-semibold text-paper ring-4 ring-paper">{s.n}</span>
            <div className="min-w-0">
              <h3 className="font-sans text-lg font-bold text-ink">
                <Link href={`/getting-started#${s.slug}`} className="underline-offset-4 hover:underline">
                  {s.title}
                </Link>
              </h3>
              <p className="mt-1 text-base text-body">{s.short}</p>
              {!compact && (
                <dl className="mt-2 space-y-1 text-sm text-soft">
                  <div>
                    <dt className="inline font-semibold text-ink">Who: </dt>
                    <dd className="inline">{s.whoYouMeet}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-ink">How long: </dt>
                    <dd className="inline">{s.howLong}</dd>
                  </div>
                </dl>
              )}
            </div>
          </RevealItem>
        ))}
      </ol>
    </RevealGroup>
  );
}
