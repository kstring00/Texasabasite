'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { locations, formatAddress, type Location } from '@/data/locations';
import { TEXAS_PATH, texasDots } from '@/lib/site/texas';
import { AvailabilityBadge } from '../AvailabilityBadge';
import { TourButton, CallButton, DirectionsButton } from '../Buttons';
import { cn } from '@/lib/site/utils';

const DOTS = texasDots(3.2);

/**
 * Act Four: The Places.
 * A dot-field Texas with six lit arches. Pick a center, read it on the right, go.
 * The list is the accessible truth; the map is the same list, drawn.
 */
export function Places({ initial = 'pearland', showAll = true }: { initial?: string; showAll?: boolean }) {
  const [slug, setSlug] = useState(initial);
  const current = locations.find((l) => l.slug === slug) ?? locations[0];
  const reduce = useReducedMotion();

  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-10">
      <div className="col-span-12 lg:col-span-7">
        <div className="relative mx-auto w-full max-w-[40rem]">
          <svg viewBox="0 0 100 104" className="h-auto w-full" role="img" aria-labelledby="txmap-t">
            <title id="txmap-t">Map of Texas with six Texas ABA Centers: Plano and Cedar Hill near Dallas, Austin, and Katy, Sugar Land and Pearland near Houston</title>
            <defs>
              <clipPath id="tx-clip">
                <path d={TEXAS_PATH} />
              </clipPath>
            </defs>
            <g clipPath="url(#tx-clip)">
              {DOTS.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="0.55" fill="rgb(var(--ink))" opacity="0.28" />
              ))}
            </g>
            <path d={TEXAS_PATH} fill="none" stroke="rgb(var(--ink))" strokeOpacity="0.25" strokeWidth="0.4" strokeLinejoin="round" />
            {locations.map((l) => {
              const on = l.slug === slug;
              return (
                <g key={l.slug} transform={`translate(${l.map.x} ${l.map.y})`}>
                  <motion.path d="M-2.6 0 V-2.2 a2.6 2.6 0 0 1 5.2 0 V0 Z" fill={on ? 'rgb(var(--cobalt))' : 'rgb(var(--ink))'} animate={reduce ? undefined : { scale: on ? 1.5 : 1 }} style={{ transformOrigin: '0px 0px' }} />
                  {on && <circle r="5" fill="none" stroke="rgb(var(--cobalt))" strokeWidth="0.4" />}
                </g>
              );
            })}
          </svg>
          <ul className="absolute inset-0" aria-label="Centers on the map">
            {locations.map((l) => (
              <li key={l.slug} className="absolute" style={{ left: `${l.map.x}%`, top: `${(l.map.y / 104) * 100}%` }}>
                <button
                  type="button"
                  onClick={() => setSlug(l.slug)}
                  aria-pressed={l.slug === slug}
                  className={cn(
                    'absolute -translate-x-1/2 translate-y-2 min-h-6 min-w-6 whitespace-nowrap rounded-full px-2.5 py-1 font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] transition sm:text-[0.78rem]',
                    l.slug === slug ? 'bg-cobalt text-paper' : 'bg-paper/90 text-ink ring-1 ring-ink/15 hover:ring-ink/40',
                    l.slug === 'pearland' && 'translate-y-8',
                    l.slug === 'katy' && '-translate-y-7',
                    l.slug === 'cedar-hill' && 'translate-y-6',
                    l.slug === 'sugar-land' && '-translate-y-1',
                  )}
                >
                  {l.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5">
        <motion.article key={current.slug} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="arch bg-ink p-7 pt-12 text-paper sm:p-9 sm:pt-14" aria-live="polite">
          <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter">{current.region}</p>
          <h3 className="mt-2 font-display text-[length:var(--t-3xl)] leading-none text-paper">{current.name}</h3>
          <div className="mt-3">
            <AvailabilityBadge location={current} />
          </div>
          <p className="mt-6 flex items-start gap-2 font-sans text-[length:var(--t-base)] text-paper/85">
            <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden />
            <span>{formatAddress(current)}</span>
          </p>
          <p className="mt-2 flex items-center gap-2 font-sans text-[length:var(--t-base)] text-paper/85">
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            <a href={`tel:${current.phone.tel}`} className="underline-offset-4 hover:underline">
              {current.phone.display}
            </a>
          </p>
          <p className="mt-4 font-sans text-[length:var(--t-sm)] text-paper/70">Serves {current.nearby.slice(0, 4).join(', ')} and nearby.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <TourButton center={current.slug} className="bg-butter text-ink hover:bg-paper" />
            <CallButton location={current} place="places" className="border-paper/30 text-paper hover:bg-paper hover:text-ink" />
            <DirectionsButton location={current} className="text-paper hover:bg-paper/10" />
          </div>
          <Link href={`/locations/${current.slug}`} className="mt-6 inline-flex items-center gap-1 font-sans text-[length:var(--t-sm)] font-bold uppercase tracking-[0.14em] text-butter underline-offset-4 hover:underline">
            Visit the {current.name} page <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </motion.article>
        {showAll && (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="All centers">
            {locations.map((l) => (
              <li key={l.slug}>
                <button type="button" onClick={() => setSlug(l.slug)} aria-pressed={l.slug === slug} className={cn('chip min-h-10', l.slug === slug && 'border-cobalt bg-cobalt text-paper')}>
                  {l.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function LocationQuickList({ items }: { items: Location[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((l) => (
        <li key={l.slug}>
          <Link href={`/locations/${l.slug}`} className="group flex items-center justify-between rounded-2xl border border-ink/15 px-5 py-4 transition hover:border-ink">
            <span>
              <span className="block font-display text-[length:var(--t-lg)] text-ink">{l.name}</span>
              <span className="block font-sans text-[length:var(--t-sm)] text-soft">{l.address.city}, TX</span>
            </span>
            <ArrowUpRight className="h-5 w-5 text-ink/50 transition group-hover:text-ink" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
