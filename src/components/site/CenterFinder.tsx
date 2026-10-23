'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, ArrowUpRight } from 'lucide-react';
import { nearestCenter } from '@/lib/site/nearest';
import { formatAddress, type Location } from '@/data/locations';
import { TourButton, CallButton } from './Buttons';
import { cn } from '@/lib/site/utils';

export function CenterFinder({ className, compact }: { className?: string; compact?: boolean }) {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<{ center: Location; how: string } | null | 'none'>(null);

  function find(e?: React.FormEvent) {
    e?.preventDefault();
    const r = nearestCenter(q);
    setResult(r ?? 'none');
  }

  return (
    <div className={cn('rounded-[var(--radius)] border border-ink/15 bg-card p-3 sm:p-4', className)}>
      <form onSubmit={find} role="search" aria-label="Find your nearest center" className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="finder">
          Your ZIP code or city
        </label>
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-soft" aria-hidden />
          <input id="finder" className="input-field border-transparent bg-paper pl-11" placeholder="Your ZIP or city, like 77584 or Katy" inputMode="text" autoComplete="postal-code" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary min-h-12 whitespace-nowrap">
          <Search className="h-5 w-5" aria-hidden /> Find my center
        </button>
      </form>

      <div aria-live="polite" className={cn(result && 'mt-3')}>
        {result === 'none' && (
          <p className="px-1 font-sans text-[length:var(--t-base)] text-body">
            We do not have a center close to that yet. In-home therapy may still be an option.{' '}
            <Link href="/locations" className="font-semibold text-cobalt underline underline-offset-4">
              See all six centers
            </Link>{' '}
            or call us and we will tell you honestly.
          </p>
        )}
        {result && result !== 'none' && (
          <div className="flex flex-col gap-4 rounded-[var(--radius)] bg-ink p-5 text-paper sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.18em] text-butter">Closest center</p>
              <p className="mt-1 font-display text-[length:var(--t-2xl)] leading-none">
                <Link href={`/locations/${result.center.slug}`} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                  {result.center.name} <ArrowUpRight className="h-6 w-6" aria-hidden />
                </Link>
              </p>
              <p className="mt-2 font-sans text-[length:var(--t-sm)] text-paper/75">{formatAddress(result.center)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <TourButton center={result.center.slug} className={cn('bg-butter text-ink hover:bg-paper', compact && 'min-h-11 px-5')} />
              <CallButton location={result.center} place="finder" className={cn('border-paper/30 text-paper hover:bg-paper hover:text-ink', compact && 'min-h-11 px-4')} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
