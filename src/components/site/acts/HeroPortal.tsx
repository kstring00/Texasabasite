/**
 * The sculptural Open World visual: a tall arch of cobalt, a second arch of canvas opening inside it,
 * a horizon line, and six marks for six centers. The outer arch paints immediately (it is the LCP
 * candidate); only the inner arches open, with CSS, so nothing waits for JavaScript.
 */
import { locations } from '@/data/locations';

export function HeroPortal() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[34rem]" aria-hidden>
      <div className="portal absolute inset-0 bg-cobalt" />
      <div className="portal absolute inset-x-[16%] bottom-0 top-[18%] origin-bottom bg-paper motion-safe:animate-[portal-open_0.9s_cubic-bezier(0.22,1,0.36,1)_0.2s_both]" />
      <div className="portal absolute inset-x-[32%] bottom-0 top-[40%] origin-bottom bg-butter motion-safe:animate-[portal-open_0.8s_cubic-bezier(0.22,1,0.36,1)_0.6s_both]" />
      <div className="absolute inset-x-0 bottom-[22%] h-px origin-left bg-ink/30 motion-safe:animate-[horizon_0.8s_ease-out_1s_both]" />
      <ul className="absolute inset-x-[8%] bottom-[22%] flex items-end justify-between">
        {locations.map((l, i) => (
          <li key={l.slug} className="portal origin-bottom bg-ink motion-safe:animate-[portal-open_0.5s_cubic-bezier(0.22,1,0.36,1)_both]" style={{ width: 10 + (i % 3) * 4, height: 22 + (i % 2) * 14, animationDelay: `${1.1 + i * 0.06}s` }} />
        ))}
      </ul>
      <p className="absolute bottom-[10%] left-[8%] font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-ink/70">Six centers · Texas</p>
    </div>
  );
}
