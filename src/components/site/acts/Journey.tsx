'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { steps } from '@/data/steps';
import { cn } from '@/lib/site/utils';

/**
 * Act Three: The Journey.
 * Desktop: a sticky portal on the left that opens a little more at each step while the steps scroll past;
 * a central line draws as you go. Mobile: one calm vertical stack.
 * Everything is readable with no scrolling effects at all.
 */
export function Journey({ compact = false }: { compact?: boolean }) {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 70%', 'end 70%'] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const els = listRef.current?.querySelectorAll<HTMLElement>('[data-step]');
    if (!els || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.getAttribute('data-step')));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const open = 0.3 + active * 0.14;

  return (
    <div className="grid grid-cols-12 gap-x-6">
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-[calc(var(--header-h)+2rem)]">
          <div className="relative aspect-[4/5] w-full max-w-md" aria-hidden>
            <div className="portal absolute inset-0 bg-ink" />
            <motion.div className="portal absolute inset-x-[14%] bottom-[26%] bg-cobalt" animate={{ top: `${(1 - open) * 100}%` }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 80, damping: 20 }} />
            <motion.div className="portal absolute inset-x-[30%] bottom-[26%] bg-paper" animate={{ top: `${Math.min(70, (1 - open) * 100 + 24)}%` }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 80, damping: 22 }} />
            <div className="absolute left-[12%] top-[16%] text-paper">
              <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter">Step</p>
              <p className="num text-[8rem] leading-none">{String(steps[active]?.n ?? 1).padStart(2, '0')}</p>
            </div>
            <div className="absolute bottom-[6%] left-[8%] right-[8%] rounded-2xl bg-paper/95 p-4 text-ink">
              <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.16em] text-cobalt">Who you meet</p>
              <p className="mt-1 font-sans text-[length:var(--t-sm)]">{steps[active]?.whoYouMeet}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative col-span-12 lg:col-span-7">
        <span aria-hidden className="absolute left-[1.35rem] top-0 hidden h-full w-0.5 bg-ink/15 lg:block" />
        <motion.span aria-hidden className="absolute left-[1.35rem] top-0 hidden w-0.5 origin-top bg-cobalt lg:block" style={{ scaleY: reduce ? 1 : line, height: '100%' }} />
        <ol ref={listRef} className="relative flex flex-col gap-[var(--s-3)]" aria-label="The five steps from first worry to first day">
          {steps.map((s, i) => {
            const on = i === active;
            return (
              <li key={s.slug} data-step={i} id={s.slug} className="relative scroll-mt-32 lg:pl-20">
                <button
                  type="button"
                  onClick={() => {
                    setActive(i);
                    document.getElementById(s.slug)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
                  }}
                  aria-current={on ? 'step' : undefined}
                  className={cn('absolute left-0 top-0 hidden h-11 w-11 items-center justify-center rounded-full border-2 font-display text-lg font-bold transition lg:flex', on ? 'border-cobalt bg-cobalt text-paper' : 'border-ink/30 bg-paper text-ink')}
                  aria-label={`Go to step ${s.n}: ${s.title}`}
                >
                  {s.n}
                </button>
                <article className={cn('rounded-[var(--radius)] border p-6 transition-colors duration-500 sm:p-8', on ? 'border-cobalt/40 bg-card' : 'border-ink/10 bg-transparent')}>
                  <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-cobalt lg:hidden">Step {s.n}</p>
                  <h3 className="h2 mt-2 lg:mt-0">{s.title}</h3>
                  <p className="lede mt-3">{s.short}</p>
                  {!compact && (
                    <>
                      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                        <Fact k="Who you meet" v={s.whoYouMeet} />
                        <Fact k="How long" v={s.howLong} note={!s.howLongVerified ? 'typical, to confirm' : undefined} />
                        <Fact k="What to bring" v={s.whatToBring} />
                        <Fact k="What happens next" v={s.whatsNext} />
                      </dl>
                      <ul className="mt-6 space-y-2 border-t border-ink/10 pt-5">
                        {s.whatHappens.map((w) => (
                          <li key={w} className="flex gap-3 font-sans text-[length:var(--t-base)] text-body">
                            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" aria-hidden />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {compact && (
                    <Link href={`/getting-started#${s.slug}`} className="mt-4 inline-block font-sans text-[length:var(--t-sm)] font-bold text-cobalt underline-offset-4 hover:underline">
                      Who you meet and what to bring
                    </Link>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Fact({ k, v, note }: { k: string; v: string; note?: string }) {
  return (
    <div className="rounded-2xl bg-ink/[0.04] p-4">
      <dt className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.16em] text-cobalt">
        {k}
        {note && <span className="ml-2 normal-case tracking-normal text-soft">({note})</span>}
      </dt>
      <dd className="mt-1 font-sans text-[length:var(--t-base)] text-body">{v}</dd>
    </div>
  );
}
