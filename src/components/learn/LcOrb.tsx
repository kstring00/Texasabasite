/** Decoration only: one light source, six colors. Never a logo, a button or a spinner. */
export function LcOrb({ className = '' }: { className?: string }) {
  return <div className={`lc-orb ${className}`} aria-hidden="true" />;
}
