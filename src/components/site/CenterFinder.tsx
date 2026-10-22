'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';
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
    <div className={cn('rounded-3xl border border-line bg-card/80 p-4 shadow-card backdrop-blur sm:p-5', className)}>
      <form onSubmit={find} role="search" aria-label="Find your nearest center" className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="finder">
          Your ZIP code or city
        </label>
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-soft" aria-hidden />
          <input
            id="finder"
            className="input-field pl-11"
            placeholder="Your ZIP or city, like 77584 or Katy"
            inputMode="text"
            autoComplete="postal-code"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-secondary">
          <Search className="h-5 w-5" aria-hidden /> Find my center
        </button>
      </form>

      <div aria-live="polite" className="mt-3">
        {result === 'none' && (
          <p className="text-base text-body">
            We do not have a center close to that yet. In-home therapy may still be an option.{' '}
            <Link href="/locations" className="font-semibold text-ink underline underline-offset-4">
              See all six centers
            </Link>{' '}
            or call us and we will tell you honestly.
          </p>
        )}
        {result && result !== 'none' && (
          <div className="flex flex-col gap-3 rounded-2xl bg-ink/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-plum">Closest center</p>
              <p className="font-serif text-2xl text-ink">
                <Link href={`/locations/${result.center.slug}`} className="underline-offset-4 hover:underline">
                  {result.center.name}
                </Link>
              </p>
              <p className="text-sm text-soft">{formatAddress(result.center)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <TourButton center={result.center.slug} className={cn(compact && 'min-h-11 px-5')} />
              <CallButton location={result.center} place="finder" className={cn(compact && 'min-h-11 px-4')} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
