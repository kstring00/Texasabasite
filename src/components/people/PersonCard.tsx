'use client';

import Link from 'next/link';
import { MessageSquareText, Phone } from 'lucide-react';
import { CENTER_NAME, firstName, MAIN_LINE, messageHref, type Person } from '@/data/people';
import { track } from '@/lib/site/analytics';
import { Avatar } from './Avatar';
import { cn } from '@/lib/site/utils';

/** One person: avatar, name, title, plain role, center pill, Call and Send a message. */
export function PersonCard({ person, centerId, place, headingTag: H = 'h3', className, compact }: { person: Person; centerId?: string | null; place: string; headingTag?: 'h2' | 'h3' | 'p'; className?: string; compact?: boolean }) {
  const first = firstName(person);
  const centerName = centerId ? CENTER_NAME[centerId] : null;
  return (
    <article className={cn('card flex flex-col gap-4 rounded-[28px] bg-transparent', className)}>
      <div className="flex items-start gap-4">
        <Avatar person={person} size={compact ? 48 : 64} />
        <div className="min-w-0">
          <H className="font-display text-[length:var(--t-lg)] font-medium leading-tight text-ink">{person.name}</H>
          <p className="mt-0.5 font-sans text-[14px] text-soft">{person.title}</p>
        </div>
      </div>
      <p className="font-sans text-[length:var(--t-base)] text-body">{person.plainRole}</p>
      {centerName && !person.centers.includes('all') && <p className="chip self-start">{centerName}</p>}
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <a href={`tel:${MAIN_LINE.tel}`} className="btn-primary min-h-11 px-4 py-2 text-[14px]" onClick={() => track({ name: 'call_tap', center: centerId ?? 'main', place: `${place}-${person.id}` })}>
          <Phone className="h-4 w-4" aria-hidden /> Call {MAIN_LINE.display} · ask for {first}
        </a>
        <Link href={messageHref(person, centerId)} className="btn-secondary min-h-11 px-4 py-2 text-[14px]">
          <MessageSquareText className="h-4 w-4" aria-hidden /> Send a message
        </Link>
      </div>
    </article>
  );
}
