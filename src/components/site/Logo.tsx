import { cn } from '@/lib/site/utils';

/**
 * The Texas ABA Centers mark: five hearts, red to purple, around a white star.
 * Drawn as SVG so it scales, animates on the loading screen, and matches the header.
 * Heart colors follow the live logo: red, burgundy, plum, purple, navy.
 */
const HEART_COLORS = ['#e2283a', '#8b2442', '#703068', '#32175a', '#1a2e52'];

export function FlowerMark({ className, id = 'mark', title = 'Texas ABA Centers flower mark' }: { className?: string; id?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn('h-10 w-10', className)} role="img" aria-labelledby={`${id}-t`}>
      <title id={`${id}-t`}>{title}</title>
      <g transform="translate(50 50)">
        {HEART_COLORS.map((c, i) => (
          <path
            key={c}
            d="M0 -44 C 6 -56, 24 -54, 22 -38 C 21 -27, 8 -18, 0 -12 C -8 -18, -21 -27, -22 -38 C -24 -54, -6 -56, 0 -44 Z"
            fill={c}
            transform={`rotate(${i * 72})`}
          />
        ))}
        <path
          d="M0 -17 L5 -6 L17 -5 L8 3 L10.5 15 L0 9 L-10.5 15 L-8 3 L-17 -5 L-5 -6 Z"
          fill="#ffffff"
        />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex flex-col leading-none', className)}>
      <span className="font-sans text-[1.35rem] font-extrabold tracking-[0.04em] text-ink">TEXAS</span>
      <span className="mt-0.5 flex items-center gap-1.5 text-[0.58rem] font-bold tracking-[0.22em] text-soft">
        <span className="h-px w-3 bg-soft" aria-hidden />
        ABA CENTERS
        <span className="h-px w-3 bg-soft" aria-hidden />
      </span>
    </span>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <FlowerMark className={cn('h-11 w-11', markClassName)} id="header-mark" title="" />
      <Wordmark />
    </span>
  );
}
