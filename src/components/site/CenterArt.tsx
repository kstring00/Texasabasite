import { FlowerMark } from './Logo';
import { cn } from '@/lib/site/utils';

/**
 * Used when a center has no real photos yet.
 * An illustrated, abstract cover that is clearly not pretending to be a photo.
 */
const PALETTES = [
  ['#f7e6c9', '#f2b54c'],
  ['#e9d9e6', '#bf8db4'],
  ['#d4dbeb', '#7d8fb8'],
  ['#fcd4d7', '#f57c87'],
  ['#d7eee6', '#7cc6a8'],
  ['#ecd3da', '#c67d94'],
];

export function CenterArt({ seed = 0, label, className, compact }: { seed?: number; label: string; className?: string; compact?: boolean }) {
  const [a, b] = PALETTES[seed % PALETTES.length];
  return (
    <div
      className={cn('relative flex items-end overflow-hidden rounded-3xl', compact ? 'aspect-[4/3]' : 'aspect-[16/10]', className)}
      style={{ background: `radial-gradient(120% 90% at 10% 10%, ${a} 0%, transparent 60%), radial-gradient(90% 90% at 90% 90%, ${b} 0%, transparent 55%), rgb(var(--card))` }}
      role="img"
      aria-label={`${label}: illustrated placeholder until center photos are added`}
    >
      <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 400 250" preserveAspectRatio="none" aria-hidden>
        <path d="M0 200 C 80 150, 160 250, 240 190 S 380 150, 400 190 L 400 250 L 0 250 Z" fill={b} opacity="0.35" />
        <path d="M0 225 C 100 190, 200 260, 300 215 S 380 200, 400 225 L 400 250 L 0 250 Z" fill={a} opacity="0.6" />
      </svg>
      <FlowerMark className="absolute right-5 top-5 h-12 w-12 opacity-80" id={`art-${seed}`} title="" />
      <span className="relative m-4 rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-soft backdrop-blur">
        Center photos coming
      </span>
    </div>
  );
}
