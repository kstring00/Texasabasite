import { cn } from '@/lib/site/utils';

/**
 * The Open World system.
 * One family of shapes, used everywhere: an architectural portal (an arch),
 * a threshold (two arches facing each other), and a horizon (the line you walk toward).
 * They frame photography, headlines and data. They are the identity even with the logo removed.
 */

/** An arch-shaped container. Masks whatever you put inside. */
export function Portal({ children, className, flip = false, as: Tag = 'div' }: { children?: React.ReactNode; className?: string; flip?: boolean; as?: 'div' | 'figure' | 'span' }) {
  return <Tag className={cn(flip ? 'portal-down' : 'portal', 'relative', className)}>{children}</Tag>;
}

/**
 * The signature mark: a pair of arches, one open, one filled, sharing a horizon.
 * Reads as a doorway without being a door icon.
 */
export function OpenWorldMark({ className, tone = 'cobalt', id = 'ow' }: { className?: string; tone?: 'cobalt' | 'ink' | 'paper' | 'persimmon' | 'butter' | 'sage' | 'lavender'; id?: string }) {
  const c = `rgb(var(--${tone}))`;
  return (
    <svg viewBox="0 0 120 100" className={cn('h-20 w-24', className)} aria-hidden>
      <path d="M8 96 V40 a28 28 0 0 1 56 0 V96 Z" fill="none" stroke={c} strokeWidth="3" />
      <path d="M56 96 V40 a28 28 0 0 1 56 0 V96 Z" fill={c} />
      <line x1="0" y1="96" x2="120" y2="96" stroke={c} strokeWidth="3" />
    </svg>
  );
}

/** Row of arches, used as a section divider / threshold between acts. */
export function Threshold({ className, from = 'paper', to = 'ink' }: { className?: string; from?: string; to?: string }) {
  return (
    <div className={cn('relative h-16 w-full overflow-hidden sm:h-24', className)} style={{ background: `rgb(var(--${from}))` }} aria-hidden>
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 100 V60 a40 40 0 0 1 80 0 V100 Z M160 100 V40 a60 60 0 0 1 120 0 V100 Z M400 100 V70 a30 30 0 0 1 60 0 V100 Z M620 100 V30 a70 70 0 0 1 140 0 V100 Z M860 100 V60 a40 40 0 0 1 80 0 V100 Z M1040 100 V45 a55 55 0 0 1 110 0 V100 Z" fill={`rgb(var(--${to}))`} />
      </svg>
    </div>
  );
}

/** Large decorative arch outline that frames headlines. */
export function ArchFrame({ className, tone = 'cobalt', strokeWidth = 2 }: { className?: string; tone?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 100 140" className={cn('h-full w-auto', className)} preserveAspectRatio="xMidYMax meet" aria-hidden>
      <path d="M2 138 V50 a48 48 0 0 1 96 0 V138" fill="none" stroke={`rgb(var(--${tone}))`} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Abstract "room" art for a center with no photos yet: a lit doorway, clearly not a photo. */
export function Doorway({ seed = 0, label, className }: { seed?: number; label: string; className?: string }) {
  const tones = ['cobalt', 'persimmon', 'sage', 'butter', 'lavender', 'ink'];
  const t = tones[seed % tones.length];
  return (
    <div className={cn('portal relative aspect-[4/5] w-full bg-ink', className)} role="img" aria-label={`${label}: illustrated placeholder until center photos are added`}>
      <div className="absolute inset-x-[18%] bottom-0 top-[14%] portal" style={{ background: `rgb(var(--${t}))` }} />
      <div className="absolute inset-x-[30%] bottom-0 top-[34%] portal bg-paper/90" />
      <div className="absolute inset-x-0 bottom-[12%] h-px bg-paper/40" />
      <span className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-3 py-1 font-sans text-xs font-semibold text-ink">Center photos coming</span>
    </div>
  );
}
