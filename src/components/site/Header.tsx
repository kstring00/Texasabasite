'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Globe } from 'lucide-react';
import { Logo } from './Logo';
import { site } from '@/data/site';
import { track } from '@/lib/site/analytics';
import { cn } from '@/lib/site/utils';

const nav = [
  { href: '/locations', label: 'Locations' },
  { href: '/services', label: 'Services' },
  { href: '/getting-started', label: 'Getting started' },
  { href: '/insurance', label: 'Insurance & cost' },
  { href: '/families', label: 'For families' },
  { href: '/events', label: 'Events' },
  { href: '/blog', label: 'Blog' },
  { href: '/team', label: 'Your team' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isEs = pathname.startsWith('/es');

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md" style={{ height: 'var(--header-h)' }}>
      <div className="wrap flex h-full items-center justify-between gap-4">
        <Link href="/" className="rounded-xl" aria-label="Texas ABA Centers home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Main">
          {nav.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + '/');
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? 'page' : undefined}
                className={cn('whitespace-nowrap rounded-full px-3 py-2 text-[0.95rem] font-semibold text-body transition hover:bg-ink/5 hover:text-ink', active && 'bg-ink/5 text-ink')}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={isEs ? '/' : '/es'}
            className="hidden items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-body hover:bg-ink/5 md:inline-flex"
            lang={isEs ? 'en' : 'es'}
            aria-label={isEs ? 'Switch to English' : 'Cambiar a español'}
          >
            <Globe className="h-4 w-4" aria-hidden /> {isEs ? 'English' : 'Español'}
          </Link>
          <a
            href={`tel:${site.phone.tel}`}
            onClick={() => track({ name: 'call_tap', center: 'main', place: 'header' })}
            className="hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/5 md:inline-flex xl:hidden 2xl:inline-flex"
          >
            <Phone className="h-4 w-4" aria-hidden /> {site.phone.display}
          </a>
          <Link href="/request-a-tour" className="btn-primary hidden min-h-11 whitespace-nowrap px-5 text-base sm:inline-flex">
            Request a tour
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn('fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-paper px-4 pb-28 pt-4 xl:hidden', open ? 'block' : 'hidden')}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="border-b border-line py-4 font-serif text-2xl text-ink">
              {n.label}
            </Link>
          ))}
          <Link href="/contact" className="border-b border-line py-4 font-serif text-2xl text-ink">
            Contact
          </Link>
          <Link href={isEs ? '/' : '/es'} className="py-4 text-lg font-semibold text-body" lang={isEs ? 'en' : 'es'}>
            {isEs ? 'English' : 'Español'}
          </Link>
          <a href={`tel:${site.phone.tel}`} className="py-2 text-lg font-semibold text-ink" onClick={() => track({ name: 'call_tap', center: 'main', place: 'mobile-menu' })}>
            Call {site.phone.display}
          </a>
        </nav>
      </div>
    </header>
  );
}
