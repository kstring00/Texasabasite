'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * The calm fade when a new page arrives.
 *
 * This replaces the browser View Transition the site used before. That transition froze the
 * page while it ran: for about half a second after arriving, clicks and taps were ignored,
 * including Menu and the phone's "Request a tour" bar. This fade only changes the opacity of
 * the page content, so everything is clickable from the first frame.
 *
 * With reduced motion switched on there is no fade at all. Common Ground pages are skipped
 * because they bring their own entrance.
 */
export function PageEnter() {
  const pathname = usePathname();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return; // first load, or only the query changed
    previous.current = pathname;
    if (pathname.startsWith('/families')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const main = document.getElementById('main');
    // Opacity only: a transform here would briefly re-anchor any fixed-position element inside the page.
    main?.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
  }, [pathname]);

  return null;
}
