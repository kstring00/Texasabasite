import Image from 'next/image';
import { MessageSquareText, Phone } from 'lucide-react';
import { type Person } from '@/data/people';
import { site } from '@/data/site';
import { FlowerMark } from './Logo';

/** Renders nothing if no real people exist. */
export function PeopleCards({ people, compact }: { people: Person[]; compact?: boolean }) {
  if (people.length === 0) return null;
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((p) => {
        const phone = p.phone ?? site.phone;
        return (
          <li key={p.id} className="card flex gap-4">
            {p.photo ? (
              <div className="photo h-20 w-20 shrink-0 rounded-2xl">
                <Image src={p.photo} alt={`${p.name}, ${p.title}`} width={80} height={80} className="h-20 w-20 object-cover" />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-ink/5" aria-hidden>
                <FlowerMark className="h-10 w-10 opacity-60" id={`p-${p.id}`} title="" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-sans text-lg font-bold text-ink">{p.name}</p>
              <p className="text-sm text-soft">
                {p.title}
                {p.credentials ? `, ${p.credentials}` : ''}
              </p>
              {!compact && p.note && <p className="mt-2 text-sm text-body">“{p.note}”</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <a href={`tel:${phone.tel}`} className="inline-flex items-center gap-1 font-semibold text-ink underline-offset-4 hover:underline">
                  <Phone className="h-4 w-4" aria-hidden /> {phone.display}
                </a>
                {p.email && (
                  <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1 font-semibold text-ink underline-offset-4 hover:underline">
                    <MessageSquareText className="h-4 w-4" aria-hidden /> Email
                  </a>
                )}
              </div>
              <p className="mt-2 text-xs text-soft">Replies within one business day.</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
