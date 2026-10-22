import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight } from 'lucide-react';
import { formatAddress, type Location } from '@/data/locations';
import { clinicalDirectorFor } from '@/data/people';
import { CenterArt } from './CenterArt';
import { AvailabilityBadge } from './AvailabilityBadge';
import { CallButton, TourButton } from './Buttons';
import { cn } from '@/lib/site/utils';

export function LocationCard({ location, index = 0, className }: { location: Location; index?: number; className?: string }) {
  const lead = location.clinicalLead ?? clinicalDirectorFor(location.slug);
  const [line1, line2] = formatAddress(location, false) as string[];
  return (
    <article className={cn('card card-hover flex flex-col gap-4 p-4 sm:p-5', className)}>
      <Link href={`/locations/${location.slug}`} className="block rounded-3xl focus-visible:ring-4 focus-visible:ring-sun/60">
        {location.photos[0] ? (
          <div className="photo aspect-[16/10] relative">
            <Image src={location.photos[0].src} alt={location.photos[0].alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
          </div>
        ) : (
          <CenterArt seed={index} label={`${location.name} center`} />
        )}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="h3">
          <Link href={`/locations/${location.slug}`} className="hover:underline underline-offset-4">
            {location.name}
          </Link>
        </h3>
        <AvailabilityBadge location={location} />
      </div>
      <p className="flex items-start gap-2 text-base text-body">
        <MapPin className="mt-1 h-4 w-4 shrink-0 text-soft" aria-hidden />
        <span>
          {line1}
          <br />
          {line2}
        </span>
      </p>
      {lead && (
        <p className="text-sm text-soft">
          Clinical lead: <span className="font-semibold text-ink">{lead.name}</span>
          {lead.credentials ? `, ${lead.credentials}` : ''}
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <TourButton center={location.slug} className="min-h-11 px-5 text-base" />
        <CallButton location={location} place="location-card" className="min-h-11 px-4 text-base" />
      </div>
      <Link href={`/locations/${location.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-ink underline-offset-4 hover:underline">
        See this center <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </article>
  );
}
