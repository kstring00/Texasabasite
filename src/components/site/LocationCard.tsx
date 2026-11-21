import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { formatAddress, type Location } from '@/data/locations';
import { clinicalDirectorFor } from '@/data/people';
import { Doorway } from './OpenWorld';
import { AvailabilityBadge } from './AvailabilityBadge';
import { CallButton, TourButton } from './Buttons';
import { cn } from '@/lib/site/utils';

export function LocationCard({ location, index = 0, className }: { location: Location; index?: number; className?: string }) {
  const lead = clinicalDirectorFor(location.slug);
  const [line1, line2] = formatAddress(location, false) as string[];
  return (
    <article className={cn('group grid h-full grid-cols-[5.5rem_minmax(0,1fr)] gap-x-5 gap-y-3 rounded-[var(--radius)] border border-line bg-card p-5', className)}>
      <Link href={`/locations/${location.slug}`} className="block self-start rounded-[var(--radius)] focus-visible:ring-4 focus-visible:ring-cobalt/40" aria-label={`${location.name} center page`}>
        {location.photos[0] ? (
          <div className="photo portal relative aspect-[4/5]">
            <Image src={location.photos[0].src} alt={location.photos[0].alt} fill sizes="88px" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          </div>
        ) : (
          <>
            <Doorway small seed={index} label={`${location.name} center`} className="transition-transform duration-500 group-hover:-translate-y-1" />
            <span className="mt-1.5 block text-center font-sans text-[11px] font-semibold leading-tight text-soft">Center photos coming</span>
          </>
        )}
      </Link>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.18em] text-cobalt">{location.region}</p>
            <h3 className="mt-1 font-display text-[length:var(--t-xl)] leading-none text-ink">
              <Link href={`/locations/${location.slug}`} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                {location.name}
                <ArrowUpRight className="h-5 w-5 opacity-0 transition group-hover:opacity-100" aria-hidden />
              </Link>
            </h3>
          </div>
          <AvailabilityBadge location={location} />
        </div>
        <p className="mt-2 flex items-start gap-2 font-sans text-[length:var(--t-sm)] leading-snug text-body">
          <MapPin className="mt-1 h-4 w-4 shrink-0 text-soft" aria-hidden />
          <span>
            {line1}
            <br />
            {line2}
          </span>
        </p>
        {lead && (
          <p className="mt-1.5 font-sans text-[length:var(--t-sm)] text-soft">
            Clinical Director: <span className="font-semibold text-ink">{lead.name}</span>
          </p>
        )}
      </div>
      <div className="col-span-2 mt-auto flex flex-wrap gap-2">
        <TourButton center={location.slug} className="min-h-11 flex-1 px-4" />
        <CallButton location={location} place="location-card" className="min-h-11 flex-1 px-4" />
      </div>
    </article>
  );
}
