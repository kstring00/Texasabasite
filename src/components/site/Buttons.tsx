'use client';

import Link from 'next/link';
import { Phone, Navigation, ArrowRight } from 'lucide-react';
import { track } from '@/lib/site/analytics';
import { cn } from '@/lib/site/utils';
import type { Location } from '@/data/locations';
import { directionsUrl } from '@/data/locations';
import { site } from '@/data/site';

export function TourButton({ center, className, children, size = 'md' }: { center?: string; className?: string; children?: React.ReactNode; size?: 'md' | 'lg' }) {
  const href = center ? `/request-a-tour?center=${center}` : '/request-a-tour';
  return (
    <Link href={href} className={cn('btn-primary', size === 'lg' && 'min-h-14 px-8 text-lg', className)}>
      {children ?? 'Request a tour'}
      <ArrowRight className="h-5 w-5" aria-hidden />
    </Link>
  );
}

export function CallButton({ location, place, className, variant = 'secondary', label }: { location?: Location | null; place: string; className?: string; variant?: 'secondary' | 'ghost' | 'primary'; label?: string }) {
  const phone = location?.phone ?? site.phone;
  const center = location?.slug ?? 'main';
  const cls = variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'btn-secondary';
  return (
    <a
      href={`tel:${phone.tel}`}
      className={cn(cls, className)}
      onClick={() => track({ name: 'call_tap', center, place })}
      aria-label={`Call ${location ? `the ${location.name} center` : 'Texas ABA Centers'} at ${phone.display}`}
    >
      <Phone className="h-5 w-5" aria-hidden />
      {label ?? (location ? `Call ${location.name}` : `Call ${phone.display}`)}
    </a>
  );
}

export function DirectionsButton({ location, className, variant = 'ghost' }: { location: Location; className?: string; variant?: 'secondary' | 'ghost' }) {
  return (
    <a
      href={directionsUrl(location)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(variant === 'ghost' ? 'btn-ghost' : 'btn-secondary', className)}
      onClick={() => track({ name: 'directions_tap', center: location.slug })}
    >
      <Navigation className="h-5 w-5" aria-hidden />
      Get directions
    </a>
  );
}

export function CoverageButton({ place, className, center }: { place: string; className?: string; center?: string }) {
  const href = center ? `/request-a-tour?center=${center}&about=coverage` : '/request-a-tour?about=coverage';
  return (
    <Link href={href} className={cn('btn-secondary', className)} onClick={() => track({ name: 'coverage_check_click', place })}>
      Check my coverage
      <ArrowRight className="h-5 w-5" aria-hidden />
    </Link>
  );
}
