'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Phone, X, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';
import { OpenWorldMark } from './OpenWorld';
import { site } from '@/data/site';
import { locations } from '@/data/locations';
import { track } from '@/lib/site/analytics';
import { cn } from '@/lib/site/utils';

const primary = [
  { href: '/locations', label: 'Locations' },
  { href: '/services', label: 'Services' },
  { href: '/getting-started', label: 'Getting started' },
  { href: '/insurance', label: 'Insurance' },
  { href: '/families', label: 'Common Ground' },
];
const more = [
  { href: '/team', label: 'Your team' },
  { href: '/events', label: 'Events' },
  { href: '/blog', label: 'Blog' },
  { href: '/providers', label: 'For providers' },
  { href: '/contact', label: 'Contact' },
  { href: '/es', label: 'Español' },
];

export function Header() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const isEs = pathname.startsWith('/es');
  const inFamilies = pathname.startsWith('/families');

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > lastY.current && y > 320 && !open);
      lastY.current = y;
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 transition-[transform,background-color,border-color,box-shadow] duration-300',
          scrolled ? 'border-b border-ink/10 bg-paper/90 backdrop-blur-md' : 'border-b border-transparent bg-transparent',
          hidden && '-translate-y-full',
        )}
        style={{ height: 'var(--header-h)' }}
      >
        <div className="wrap-wide flex h-full items-center justify-between gap-4">
          <Link href="/" className="rounded-xl" aria-label="Texas ABA Centers home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {primary.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + '/');
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative whitespace-nowrap px-3 py-2 font-sans text-[length:var(--t-sm)] font-semibold text-ink/80 transition hover:text-ink',
                    active && 'text-ink',
                  )}
                >
                  {n.label}
                  <span aria-hidden className={cn('absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-cobalt transition-transform duration-300 group-hover:scale-x-100', active && 'scale-x-100')} />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${site.phone.tel}`}
              onClick={() => track({ name: 'call_tap', center: 'main', place: 'header' })}
              className="hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 font-sans text-[length:var(--t-sm)] font-semibold text-ink hover:bg-ink/[0.06] md:inline-flex"
            >
              <Phone className="h-4 w-4" aria-hidden /> {site.phone.display}
            </a>
            <Link href="/request-a-tour" className="btn-primary hidden min-h-11 whitespace-nowrap px-5 sm:inline-flex">
              Request a tour
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/25 px-4 font-sans text-[length:var(--t-sm)] font-semibold text-ink transition hover:bg-ink hover:text-paper"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(true)}
            >
              <span className="flex flex-col gap-[5px]" aria-hidden>
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
              </span>
              Menu
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-50 flex flex-col bg-ink text-paper"
            initial={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 100% 0 round 0 0 48px 48px)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0 round 0 0 0px 0px)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0 round 0 0 48px 48px)' }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="wrap-wide flex items-center justify-between" style={{ height: 'var(--header-h)' }}>
              <Link href="/" className="rounded-xl" aria-label="Texas ABA Centers home" onClick={() => setOpen(false)}>
                <Logo className="[&_*]:text-paper" markClassName="" />
              </Link>
              <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-paper/30 px-4 font-sans text-[length:var(--t-sm)] font-semibold text-paper hover:bg-paper hover:text-ink" onClick={() => setOpen(false)} autoFocus>
                <X className="h-4 w-4" aria-hidden /> Close
              </button>
            </div>
            <div className="wrap-wide grid flex-1 content-start gap-10 overflow-y-auto pb-28 pt-6 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:pb-12">
              <nav aria-label="Menu" className="flex flex-col">
                {primary.map((n, i) => (
                  <motion.div key={n.href} initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                    <Link href={n.href} className="group flex items-baseline justify-between border-b border-paper/15 py-3 font-display text-[length:var(--t-2xl)] leading-none tracking-tight text-paper hover:text-butter sm:py-4">
                      {n.label}
                      <ArrowUpRight className="h-6 w-6 shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden />
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                  {more.map((n) => (
                    <Link key={n.href} href={n.href} lang={n.href === '/es' ? 'es' : undefined} className="font-sans text-[length:var(--t-base)] font-semibold text-paper/75 underline-offset-4 hover:text-paper hover:underline">
                      {n.label}
                    </Link>
                  ))}
                  <a href={site.careersUrl} target="_blank" rel="noopener noreferrer" className="font-sans text-[length:var(--t-base)] font-semibold text-paper/75 underline-offset-4 hover:text-paper hover:underline">
                    Careers ↗
                  </a>
                </div>
              </nav>
              <div className="flex flex-col gap-6">
                <OpenWorldMark tone="butter" className="h-16 w-20" />
                <p className="font-sans text-[length:var(--t-base)] text-paper/75">Six centers across Texas. One phone number, answered by a person.</p>
                <div className="flex flex-wrap gap-2">
                  {locations.map((l) => (
                    <Link key={l.slug} href={`/locations/${l.slug}`} className="rounded-full border border-paper/25 px-3 py-1.5 font-sans text-[length:var(--t-sm)] font-semibold text-paper hover:bg-paper hover:text-ink">
                      {l.name}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/request-a-tour" className="btn-sun">
                    Request a tour
                  </Link>
                  <a href={`tel:${site.phone.tel}`} className="btn border border-paper/30 text-paper hover:bg-paper hover:text-ink" onClick={() => track({ name: 'call_tap', center: 'main', place: 'menu' })}>
                    <Phone className="h-4 w-4" aria-hidden /> {site.phone.display}
                  </a>
                </div>
                {inFamilies && <p className="font-sans text-[length:var(--t-xs)] text-paper/60">You are in Common Ground, the parent side of Texas ABA Centers.</p>}
                {isEs && <p className="font-sans text-[length:var(--t-xs)] text-paper/60" lang="es">Versión en español en camino.</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
