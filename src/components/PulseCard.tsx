'use client';

/**
 * PulseCard — Home Base widget that surfaces the parent's most recent
 * Quick Bandwidth Check result and a low-friction way to update it.
 *
 * Previously this card surfaced the qualitative weekly check-in score. As of
 * the bandwidth-consolidation pass, the check-in concept is unified around
 * the Quick Bandwidth Check (stress, sleep, support → tier), so this card
 * now reads from `loadBandwidth()` instead. The visual contract is unchanged:
 * a calm tile on Home Base that anchors the parent to their last check-in.
 *
 * Design rules (locked):
 *   • Not a clinical score. Disclaimer is on the card.
 *   • No streaks, no benchmarking, no shaming.
 *   • Empty state is warm, not pushy.
 *   • Local-only — surfaces a localStorage value, sends nothing.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Gauge, Sparkles } from 'lucide-react';
import {
  freshnessLabel,
  loadBandwidth,
  TIER_LABEL,
  TIER_RESULT_COPY,
  type BandwidthResult,
} from '@/lib/bandwidth';

export default function PulseCard() {
  // Client-only — localStorage is not available during SSR.
  const [bandwidth, setBandwidth] = useState<BandwidthResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBandwidth(loadBandwidth());
    setHydrated(true);
  }, []);

  // Pre-hydration placeholder keeps layout stable and avoids SSR mismatch.
  if (!hydrated) {
    return (
      <section className="callout" aria-hidden>
        <div className="h-24" />
      </section>
    );
  }

  // Empty state: the parent has not done a bandwidth check yet.
  if (!bandwidth) {
    return (
      <section aria-label="Quick bandwidth check" className="callout">
        <p className="callout-eyebrow inline-flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" strokeWidth={1.8} aria-hidden /> Quick Bandwidth Check
        </p>
        <h2 className="h3 mt-3">Before we send you anywhere, how is today?</h2>
        <p className="mt-2 font-sans text-[length:var(--t-base)] text-ink">A 30-second check so the rest of the site sizes itself to the kind of day you&rsquo;re actually having. No score is shared. No streaks.</p>
        <Link href="/families/intake" className="btn-primary mt-5">
          Start the check-in <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>
    );
  }

  return (
    <section aria-label={`Today's bandwidth: ${TIER_LABEL[bandwidth.tier]}`} className="callout">
      <p className="callout-eyebrow inline-flex items-center gap-1.5">
        <Gauge className="h-4 w-4" strokeWidth={1.8} aria-hidden /> Today&rsquo;s bandwidth
      </p>
      <div className="mt-3 flex flex-wrap items-baseline gap-3">
        <span className="font-display text-[length:var(--t-xl)] text-ink">{TIER_LABEL[bandwidth.tier]}</span>
        <span className="range-value">{bandwidth.bandwidth}/100</span>
      </div>
      <p className="mt-2 font-sans text-[length:var(--t-base)] text-ink">{TIER_RESULT_COPY[bandwidth.tier]}</p>
      <p className="mt-2 font-sans text-[14px] text-soft">
        {freshnessLabel(bandwidth)} &middot; this isn&rsquo;t a diagnosis, just a check-in.
      </p>
    </section>
  );
}
