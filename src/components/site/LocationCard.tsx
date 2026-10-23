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
  const lead = location.clinicalLead ?? clinicalDirectorFor(location.slug);
  const [line1, line2] = formatAddress(location, false) as string[];
  return (
    <article className={cn('group flex flex-col gap-5', className)}>
      <Link href={`/locations/${location.slug}`} className="block rounded-[var(--radius)] focus-visible:ring-4 focus-visible:ring-cobalt/40">
        {location.photos[0] ? (
          <div className="photo portal relative aspect-[4/5]">
            <Image src={location.photos[0].src} alt={location.photos[0].alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          </div>
        ) : (
          <Doorway seed={index} label={`${location.name} center`} className="transition-transform duration-500 group-hover:-translate-y-1" />
        )}
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.18em] text-cobalt">{location.region}</p>
          <h3 className="mt-1 font-display text-[length:var(--t-2xl)] leading-none text-ink">
            <Link href={`/locations/${location.slug}`} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
              {location.name}
              <ArrowUpRight className="h-6 w-6 opacity-0 transition group-hover:opacity-100" aria-hidden />
            </Link>
          </h3>
        </div>
        <AvailabilityBadge location={location} />
      </div>
      <p className="flex items-start gap-2 font-sans text-[length:var(--t-base)] text-body">
        <MapPin className="mt-1 h-4 w-4 shrink-0 text-soft" aria-hidden />
        <span>
          {line1}
          <br />
          {line2}
        </span>
      </p>
      {lead && (
        <p className="font-sans text-[length:var(--t-sm)] text-soft">
          Clinical lead: <span className="font-semibold text-ink">{lead.name}</span>
          {lead.credentials ? `, ${lead.credentials}` : ''}
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-2">
        <TourButton center={location.slug} className="min-h-11 px-5" />
        <CallButton location={location} place="location-card" className="min-h-11 px-4" />
      </div>
    </article>
  );
}
