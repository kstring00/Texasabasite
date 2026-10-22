'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';
import { site } from '@/data/site';
import { track } from '@/lib/site/analytics';

/** Sticky bottom bar on mobile: Call + Request a tour, thumb-sized. Hidden on the tour page itself. */
export function MobileBar() {
  const pathname = usePathname();
  if (pathname.startsWith('/request-a-tour') || pathname.startsWith('/families')) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden" role="region" aria-label="Quick actions">
      <div className="grid grid-cols-[1fr_1.6fr] gap-2">
        <a href={`tel:${site.phone.tel}`} className="btn-secondary min-h-12" onClick={() => track({ name: 'call_tap', center: 'main', place: 'mobile-bar' })}>
          <Phone className="h-5 w-5" aria-hidden /> Call
        </a>
        <Link href="/request-a-tour" className="btn-primary min-h-12">
          Request a tour
        </Link>
      </div>
    </div>
  );
}
