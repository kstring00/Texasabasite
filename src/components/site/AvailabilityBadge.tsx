import { availabilityLabel, type Location } from '@/data/locations';
import { cn } from '@/lib/site/utils';

/** Renders nothing when a center has not set its availability. Honest by default. */
export function AvailabilityBadge({ location, className }: { location: Location; className?: string }) {
  if (!location.availability) return null;
  const tone = {
    open: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
    limited: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-800',
    waitlist: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  }[location.availability];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold', tone, className)}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
      {availabilityLabel[location.availability]}
    </span>
  );
}
