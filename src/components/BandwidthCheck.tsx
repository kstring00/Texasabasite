'use client';

/**
 * <BandwidthCheck> — the one canonical bandwidth check used across the site.
 *
 * Used in two places:
 *   1. /support/check-in — the standalone page (entered from "Update check-in"
 *      on the care plan).
 *   2. Inside the intake flow as the step before plan generation.
 *
 * The component is intentionally framework-light. No animation libs, no chart
 * libs, no third-party slider — native <input type="range"> styled with the
 * brand palette. Submitting persists the result via saveBandwidth() and calls
 * onComplete with the BandwidthResult.
 *
 * Visual contract (per CCO direction):
 *   • Calm, soft, parent-friendly.
 *   • Frames the purpose first ("we ask this so we don't give you a plan
 *     that's too heavy for the day you're actually having").
 *   • Three sliders only.
 *   • Result is shown as a tier + a short forward-looking line — never a
 *     diagnosis, never a numeric badge by itself.
 */

import { useMemo, useState } from 'react';
import { ArrowRight, Gauge, Lock, ShieldCheck } from 'lucide-react';
import {
  BANDWIDTH_DEFAULTS,
  BANDWIDTH_SLIDERS,
  recordBandwidth,
  scoreBandwidth,
  TIER_LABEL,
  TIER_RESULT_COPY,
  type BandwidthInputs,
  type BandwidthResult,
} from '@/lib/bandwidth';
import { cn } from '@/lib/utils';

type Props = {
  /** Pre-fill the sliders (e.g. when the parent is updating an earlier check-in). */
  initialInputs?: BandwidthInputs;
  /** Called when the parent submits. Result is already persisted. */
  onComplete: (result: BandwidthResult) => void;
  /** Label for the submit button. Defaults to "See my result". */
  submitLabel?: string;
  /** If true, hides the eyebrow + title block (used when host page provides its own header). */
  hideHeader?: boolean;
};

export default function BandwidthCheck({
  initialInputs,
  onComplete,
  submitLabel = 'See my result',
  hideHeader = false,
}: Props) {
  const [inputs, setInputs] = useState<BandwidthInputs>(initialInputs ?? BANDWIDTH_DEFAULTS);

  // Preview of the tier as the parent moves the sliders. This is purely for
  // feedback — it's not what we save. We save on submit.
  const previewResult = useMemo(() => scoreBandwidth(inputs), [inputs]);

  function update<K extends keyof BandwidthInputs>(key: K, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    const result = recordBandwidth(inputs);
    onComplete(result);
  }

  return (
    <section aria-label="Quick Bandwidth Check" className={hideHeader ? '' : 'card'}>
      {!hideHeader && (
        <header>
          <p className="eyebrow inline-flex items-center gap-1.5">
            <Gauge className="h-4 w-4" strokeWidth={1.8} aria-hidden /> Quick Bandwidth Check
          </p>
          <h2 className="h3 mt-3">Before we build your plan, let&rsquo;s match the kind of day you&rsquo;re actually having.</h2>
          <p className="mt-3 font-sans text-[length:var(--t-base)] text-body">If today already feels heavy, we&rsquo;ll keep your next steps smaller. This takes about 30 seconds.</p>
        </header>
      )}

      {/* Sliders */}
      <div className={cn('space-y-8', !hideHeader && 'mt-8')}>
        {BANDWIDTH_SLIDERS.map((slider) => {
          const value = inputs[slider.key];
          const id = `bandwidth-${slider.key}`;
          return (
            <div key={slider.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label htmlFor={id} className="font-sans text-[length:var(--t-base)] font-semibold text-ink">
                  {slider.label}
                </label>
                <output htmlFor={id} className="range-value" aria-hidden>
                  {value}
                </output>
              </div>
              <p className="mt-1 font-sans text-[length:var(--t-sm)] text-soft">{slider.question}</p>
              <input
                id={id}
                type="range"
                min={0}
                max={100}
                step={1}
                value={value}
                onChange={(e) => update(slider.key, Number(e.target.value))}
                aria-label={slider.question}
                aria-valuetext={`${value} of 100, from ${slider.lowLabel} to ${slider.highLabel}`}
                className="range mt-3"
                style={{ '--p': `${value}%` } as React.CSSProperties}
              />
              <div className="range-ends">
                <span>{slider.lowLabel}</span>
                <span>{slider.highLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live preview of where they're landing: soft, not alarming. */}
      <div className="callout mt-8" role="status">
        <p className="callout-eyebrow">How it looks right now: {TIER_LABEL[previewResult.tier]}</p>
        <p className="mt-2 font-sans text-[length:var(--t-base)] text-ink">{TIER_RESULT_COPY[previewResult.tier]}</p>
      </div>

      <p className="note mt-5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
        <span>
          This isn&rsquo;t a diagnosis or a crisis tool. It&rsquo;s a simple check-in to help us adjust your next steps. If you feel unsafe or in crisis, contact emergency services or a crisis support line right away.
        </span>
      </p>
      <p className="note mt-2">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
        <span>Saved privately on this device.</span>
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <button type="button" onClick={submit} className="btn-primary">
          {submitLabel} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  );
}
