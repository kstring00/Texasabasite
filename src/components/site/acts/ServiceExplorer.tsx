'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { services } from '@/data/services';
import { cn } from '@/lib/site/utils';

const TONES = ['bg-butter', 'bg-sage', 'bg-cobalt text-paper', 'bg-persimmon', 'bg-lavender', 'bg-ink text-paper'];

/**
 * Act Five: What care looks like.
 * Desktop: an index on the left (tabs), one big composed panel on the right.
 * Mobile: the same six, stacked, nothing hidden.
 */
export function ServiceExplorer() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const s = services[i];
  const dark = TONES[i].includes('text-paper');

  return (
    <>
      {/* Desktop explorer */}
      <div className="hidden grid-cols-12 gap-x-6 lg:grid">
        <div className="col-span-5" role="tablist" aria-label="Services" aria-orientation="vertical">
          {services.map((x, k) => (
            <button
              key={x.slug}
              role="tab"
              id={`svc-tab-${x.slug}`}
              aria-selected={k === i}
              aria-controls="svc-panel"
              tabIndex={k === i ? 0 : -1}
              onClick={() => setI(k)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setI((i + 1) % services.length); }
                if (e.key === 'ArrowUp') { e.preventDefault(); setI((i - 1 + services.length) % services.length); }
                if (e.key === 'Home') { e.preventDefault(); setI(0); }
                if (e.key === 'End') { e.preventDefault(); setI(services.length - 1); }
              }}
              className={cn('group flex w-full items-baseline gap-5 border-t border-ink/15 py-5 text-left transition last:border-b', k === i ? 'text-ink' : 'text-ink/70 hover:text-ink')}
            >
              <span className="num w-10 shrink-0 text-[length:var(--t-lg)]">{String(k + 1).padStart(2, '0')}</span>
              <span className="flex-1">
                <span className="block font-display text-[length:var(--t-xl)] leading-tight">{x.name}</span>
                <span className="mt-1 block font-sans text-[length:var(--t-sm)] text-soft">{x.ages}</span>
              </span>
              <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full bg-cobalt transition-opacity', k === i ? 'opacity-100' : 'opacity-0 group-hover:opacity-40')} />
            </button>
          ))}
        </div>
        <div className="col-span-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={s.slug}
              id="svc-panel"
              role="tabpanel"
              aria-labelledby={`svc-tab-${s.slug}`}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={cn('arch flex min-h-[34rem] flex-col justify-between p-10 pt-14', TONES[i])}
            >
              <div>
                <p className={cn('font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em]', dark ? 'text-paper/90' : 'text-ink/75')}>{s.where}</p>
                <h3 className={cn('mt-3 font-display text-[length:var(--t-2xl)] leading-none', dark ? 'text-paper' : 'text-ink')}>{s.name}</h3>
                <p className={cn('mt-6 max-w-xl font-sans text-[length:var(--t-lg)] leading-snug', dark ? 'text-paper/90' : 'text-ink/85')}>{s.intro}</p>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className={cn('font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.16em]', dark ? 'text-paper/90' : 'text-ink/75')}>Who you meet</p>
                  <p className={cn('mt-1 font-sans text-[length:var(--t-sm)]', dark ? 'text-paper/85' : 'text-ink/80')}>{s.whoYouMeet.join(' · ')}</p>
                </div>
                <Link href={`/services/${s.slug}`} className={cn('btn', dark ? 'bg-paper text-ink hover:bg-butter' : 'bg-ink text-paper hover:bg-cobalt')}>
                  Learn more <ArrowUpRight className="h-5 w-5" aria-hidden />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: stacked */}
      <ol className="flex flex-col gap-4 lg:hidden">
        {services.map((x, k) => {
          const d = TONES[k].includes('text-paper');
          return (
            <li key={x.slug} className={cn('arch p-6 pt-10', TONES[k])}>
              <p className={cn('num text-[length:var(--t-lg)]', d ? 'text-paper' : 'text-ink')}>{String(k + 1).padStart(2, '0')}</p>
              <h3 className={cn('mt-2 font-display text-[length:var(--t-xl)] leading-tight', d ? 'text-paper' : 'text-ink')}>{x.name}</h3>
              <p className={cn('mt-1 font-sans text-[length:var(--t-sm)]', d ? 'text-paper/90' : 'text-ink')}>{x.ages} · {x.where}</p>
              <p className={cn('mt-4 font-sans text-[length:var(--t-base)]', d ? 'text-paper/90' : 'text-ink/85')}>{x.short}</p>
              <Link href={`/services/${x.slug}`} className={cn('mt-5 inline-flex items-center gap-1 font-sans text-[length:var(--t-sm)] font-bold uppercase tracking-[0.14em]', d ? 'text-paper' : 'text-ink')}>
                Learn more <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
