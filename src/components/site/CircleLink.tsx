'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { type Circle } from '@/data/circles';
import { track } from '@/lib/site/analytics';

export function CircleLink({ circle }: { circle: Circle }) {
  return (
    <Link href={circle.href} onClick={() => track({ name: 'circle_join_click', circle: circle.id })} className="group flex items-start justify-between gap-3 rounded-2xl border border-line p-4 transition hover:border-ink/40">
      <span>
        <span className="flex flex-wrap items-center gap-2 font-semibold text-ink">
          {circle.name}
          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-semibold text-soft">{circle.status === 'open' ? 'Meeting now' : 'Pilot forming'}</span>
        </span>
        <span className="block text-sm text-body">{circle.who}</span>
      </span>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-soft transition group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}
