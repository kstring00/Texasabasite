import { Info } from 'lucide-react';

/** Amber means sample or demo, everywhere in the zone. Always an icon and words, never colour alone. */
export function LcDemoChip({ label = 'Demo · not clinically approved' }: { label?: string }) {
  return (
    <span className="lc-chip" data-cast="amber">
      <Info width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </span>
  );
}

/** The strip that sits on every screen of sample educational content. */
export function LcDemoStrip({ children }: { children?: React.ReactNode }) {
  return (
    <p className="lc-demo-strip" data-cast="amber">
      <Info width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
      <span>{children ?? 'Demo sample — pending clinical approval'}</span>
    </p>
  );
}

/** Shown across the top of every caregiver page while sample content is on. */
export function LcDemoBar() {
  return (
    <div className="lc-demo-bar" data-cast="amber" role="note">
      <div className="wrap lc-demo-bar-inner">
        <Info width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
        <p>
          Demo mode. <span className="lc-only-wide">The module and training shown here are samples. Nothing on these pages has been clinically approved.</span>
          <span className="lc-only-narrow">Samples only. Nothing here is clinically approved.</span>
        </p>
      </div>
    </div>
  );
}
