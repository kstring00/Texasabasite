'use client';

/**
 * Parent Pulse: demo UI only.
 * Wraps the existing Common Ground Bandwidth Check (three sliders, saved to this device)
 * and shows the last result. Nothing is sent anywhere. Sharing with the care team is a
 * post-demo decision for the clinical and compliance teams.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import BandwidthCheck from '@/components/BandwidthCheck';
import PulseCard from '@/components/PulseCard';
import { loadBandwidth, type BandwidthResult } from '@/lib/bandwidth';

export function ParentPulse() {
  const [last, setLast] = useState<BandwidthResult | null>(null);
  const [editing, setEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLast(loadBandwidth());
    setHydrated(true);
  }, []);

  const showForm = hydrated && (editing || !last);

  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow flex items-center gap-2">
          <Activity className="h-4 w-4" aria-hidden /> Parent Pulse
        </p>
        <h1 className="h2">How are you doing this week?</h1>
        <p className="page-description text-base">
          One minute, three sliders. Not about your child. About you. Your answers stay on this device and are never a score.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <section className="card">
          {showForm ? (
            <BandwidthCheck
              hideHeader
              initialInputs={last?.inputs}
              submitLabel="Save this week's pulse"
              onComplete={(r) => {
                setLast(r);
                setEditing(false);
              }}
            />
          ) : (
            <div>
              <PulseCard />
              <button type="button" className="btn-secondary mt-4 min-h-11" onClick={() => setEditing(true)}>
                Update this week
              </button>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="card">
            <p className="flex items-center gap-2 font-sans text-lg font-bold text-ink">
              <ShieldCheck className="h-5 w-5 text-plum" aria-hidden /> What this is, and is not
            </p>
            <ul className="mt-3 space-y-2 text-base text-body">
              <li>A pattern you can see over a few weeks, so a heavy stretch is noticed before it becomes a crisis.</li>
              <li>Not a clinical score. Not benchmarked against other parents. No streaks.</li>
              <li>Saved on this device only. In the demo, nothing is sent to your care team.</li>
            </ul>
          </div>
          <div className="card">
            <p className="font-sans text-lg font-bold text-ink">Heavier week?</p>
            <p className="mt-1 text-base text-body">Two things that help right away.</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/families/hard-days" className="inline-flex items-center gap-1 font-semibold text-ink underline-offset-4 hover:underline">
                  Grounding for hard days <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
              <li>
                <Link href="/families/connect" className="inline-flex items-center gap-1 font-semibold text-ink underline-offset-4 hover:underline">
                  Parents who get it <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
