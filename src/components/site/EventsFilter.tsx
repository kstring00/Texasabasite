import Link from 'next/link';
import { locations } from '@/data/locations';
import { cn } from '@/lib/site/utils';

export function EventsFilter({ current }: { current?: string }) {
  const items = [{ slug: '', name: 'All centers' }, ...locations.map((l) => ({ slug: l.slug, name: l.name }))];
  return (
    <nav aria-label="Filter events by center" className="flex flex-wrap gap-2">
      {items.map((i) => {
        const active = (current ?? '') === i.slug;
        return (
          <Link
            key={i.slug}
            href={i.slug ? `/events?center=${i.slug}` : '/events'}
            aria-current={active ? 'true' : undefined}
            className={cn('chip min-h-11 px-4 hover:border-ink/40', active && 'border-ink bg-ink text-paper')}
          >
            {i.name}
          </Link>
        );
      })}
    </nav>
  );
}
