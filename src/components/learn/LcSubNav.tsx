'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/learn', label: 'Home', short: 'Home' },
  { href: '/learn/library', label: 'Learning Library', short: 'Library' },
  { href: '/learn/trainings', label: 'Live Trainings', short: 'Trainings' },
  { href: '/learn/help', label: 'Help & FAQ', short: 'Help' },
];

/**
 * The Learning Center's only navigation chrome: a bar under the site header that follows it
 * as it hides and returns (it sticks at the site's own --nav-offset).
 */
export function LcSubNav() {
  const pathname = usePathname();
  const isCurrent = (href: string) => (href === '/learn' ? pathname === '/learn' : pathname === href || pathname.startsWith(href + '/'));
  // Module and topic pages belong to the library.
  const inLibrary = pathname.startsWith('/learn/modules') || pathname.startsWith('/learn/topics');
  return (
    <nav className="lc-subnav" aria-label="Caregiver Learning Center">
      <div className="wrap lc-subnav-inner">
        <Link href="/learn" className="lc-subnav-name">
          Caregiver Learning Center
        </Link>
        <div className="lc-subnav-links">
          {LINKS.map((l) => {
            const current = isCurrent(l.href) || (l.href === '/learn/library' && inLibrary);
            return (
              <Link key={l.href} href={l.href} aria-current={current ? 'page' : undefined}>
                <span className="lc-only-wide">{l.label}</span>
                <span className="lc-only-narrow">{l.short}</span>
              </Link>
            );
          })}
        </div>
        <Link href="/learn/staff" className="lc-subnav-staff">
          Staff sign-in
        </Link>
      </div>
    </nav>
  );
}
