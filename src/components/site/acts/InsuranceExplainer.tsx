'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { insurance } from '@/data/insurance';
import { CoverageButton } from '../Buttons';
import { cn } from '@/lib/site/utils';

/**
 * Act Seven: Insurance without intimidation.
 * One illustrative year, drawn as a bar. Pick a word, the bar shows where it lives.
 * Numbers are a made-up example and say so. Nothing here estimates your cost.
 */
const EXAMPLE = { deductible: 1500, oop: 6000, coinsurance: 20 };

const TERMS = [
  { key: 'deductible', term: 'Deductible', plain: 'What you pay first each year before the plan starts paying its share.', where: 'The first stretch of the year. In the example, the first $1,500.' },
  { key: 'copay', term: 'Copay', plain: 'A flat amount per visit, like $30. Some plans use this instead of coinsurance.', where: 'A small, fixed piece of each visit after the deductible.' },
  { key: 'coinsurance', term: 'Coinsurance', plain: 'A percentage of each visit you pay after the deductible, like 20%.', where: 'The middle stretch. You pay a slice, the plan pays the rest.' },
  { key: 'oop', term: 'Out-of-pocket max', plain: 'The most you pay in a year. After this, the plan pays 100%.', where: 'The line where your share stops. In the example, $6,000.' },
  { key: 'auth', term: 'Prior authorization', plain: 'The plan’s approval for therapy hours. We request it for you before care starts.', where: 'Not a cost. A gate at the start, handled by our benefits team.' },
] as const;

type Key = (typeof TERMS)[number]['key'];

/** `repeatNote={false}` leaves out the free-verification line under the bar, for pages that already show it as their introduction. */
export function InsuranceExplainer({ center, repeatNote = true }: { center?: string; repeatNote?: boolean }) {
  const [k, setK] = useState<Key>('deductible');
  const reduce = useReducedMotion();
  const t = TERMS.find((x) => x.key === k)!;

  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-6">
      <div className="col-span-12 lg:col-span-5">
        <ul className="flex flex-col" aria-label="Insurance terms">
          {TERMS.map((x) => (
            <li key={x.key}>
              <button
                type="button"
                onClick={() => setK(x.key)}
                aria-pressed={k === x.key}
                className={cn('flex min-h-11 w-full items-center justify-between border-t border-ink/15 py-2.5 text-left transition last:border-b lg:py-3', k === x.key ? 'text-ink' : 'text-ink/70 hover:text-ink')}
              >
                <span className="font-display text-[length:var(--t-lg)] leading-tight lg:text-[length:var(--t-xl)]">{x.term}</span>
                <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full bg-cobalt transition-opacity', k === x.key ? 'opacity-100' : 'opacity-0')} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <CoverageButton place="insurance-explainer" center={center} className="btn-primary" />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <div className="rounded-[2rem] border border-ink/10 bg-card p-6 sm:p-8 lg:rounded-t-[4.5rem] lg:px-10 lg:pb-7 lg:pt-9" aria-live="polite">
          <p className="eyebrow">In plain words</p>
          <h3 className="h2 mt-2">{t.term}</h3>
          <p className="lede mt-3 lg:min-h-[3.4em]">{t.plain}</p>
          <p className="mt-2 font-sans text-[length:var(--t-base)] leading-snug text-body lg:min-h-[2.8em]">
            <span className="font-semibold text-ink">Where it lives in a year: </span>
            {t.where}
          </p>

          {/* The illustrative year */}
          <div className="mt-6">
            <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.18em] text-soft">One illustrative year · example numbers, not yours</p>
            <div className="relative mt-3 flex h-14 w-full overflow-hidden rounded-full border border-ink/15" role="img" aria-label={`Illustrative year: you pay the first $${EXAMPLE.deductible} (deductible), then ${EXAMPLE.coinsurance}% of each visit (coinsurance) until your share reaches $${EXAMPLE.oop} (out-of-pocket max), then the plan pays 100%.`}>
              <Seg w={20} label="You pay" sub={`$${EXAMPLE.deductible.toLocaleString()}`} on={k === 'deductible'} className="bg-persimmon text-ink" />
              <Seg w={45} label="Shared" sub={`${EXAMPLE.coinsurance}% / ${100 - EXAMPLE.coinsurance}%`} on={k === 'coinsurance' || k === 'copay'} className="bg-butter text-ink" />
              <Seg w={35} label="Plan pays" sub="100%" on={k === 'oop'} className="bg-sage text-ink" />
              <motion.span
                aria-hidden
                className="absolute inset-y-0 left-0 w-full"
                style={{ background: 'linear-gradient(to right, rgb(var(--ink)) 0, rgb(var(--ink)) 4px, transparent 4px)' }}
                animate={{ x: k === 'oop' ? '65%' : k === 'deductible' ? '20%' : k === 'auth' ? '0%' : '42%' }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 22 }}
              />
            </div>
            <div className="mt-2 flex justify-between font-sans text-[length:var(--t-xs)] font-semibold text-soft">
              <span>Jan 1</span>
              <span>Deductible met</span>
              <span>Out-of-pocket max</span>
              <span>Dec 31</span>
            </div>
          </div>

          {repeatNote && <p className="mt-5 font-sans text-[length:var(--t-sm)] text-body">{insurance.freeVerification}</p>}
        </div>
      </div>
    </div>
  );
}

function Seg({ w, label, sub, on, className }: { w: number; label: string; sub: string; on: boolean; className: string }) {
  return (
    <div className="relative flex flex-col justify-center px-3 text-ink" style={{ width: `${w}%` }}>
      <span aria-hidden className={cn('absolute inset-0 transition-opacity duration-300', className, on ? 'opacity-100' : 'opacity-45')} />
      <span className="relative font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.12em]">{label}</span>
      <span className="relative font-display text-[length:var(--t-base)] leading-none">{sub}</span>
    </div>
  );
}
