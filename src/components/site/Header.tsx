'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Phone, X, ArrowUpRight } from 'lucide-react';
import { site } from '@/data/site';
import { locations } from '@/data/locations';
import { track } from '@/lib/site/analytics';
import { cn } from '@/lib/site/utils';

const primary = [
  { href: '/team', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/locations', label: 'Our Centers' },
  { href: '/families', label: 'For Families' },
  { href: '/blog', label: 'Resources' },
];
const more = [
  { href: '/getting-started', label: 'Getting started' },
  { href: '/insurance', label: 'Insurance & cost' },
  { href: '/request-a-tour', label: 'Request a tour' },
  { href: '/events', label: 'Events' },
  { href: '/providers', label: 'For providers' },
  { href: '/contact', label: 'Contact' },
  { href: '/es', label: 'Español' },
];

function Logo({ className, tall = 40 }: { className?: string; tall?: number }) {
  // The real Texas ABA Centers logo file. 200 × 77 source; rendered 40px tall on desktop, 34px on mobile.
  return <Image src="/logos/texas-aba-centers.png" alt="Texas ABA Centers" width={Math.round((200 / 77) * tall)} height={tall} priority className={cn('h-[34px] w-auto md:h-[40px]', className)} />;
}

/**
 * Site header. Transparent over the hero; after 80px of scroll it sticks with a blurred cream
 * background, a hairline, and eases from 108px to 76px tall. Below 1100px the links collapse to Menu.
 */
export function Header() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const findHref = pathname === '/' ? '#locations' : '/#locations';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 transition-[height,background-color,border-color] duration-300 motion-safe:animate-[nav-in_0.3s_ease-out_both]',
          scrolled ? 'h-[76px] border-b border-ink/10 bg-paper/85 backdrop-blur-[12px]' : 'h-[88px] border-b border-transparent bg-transparent lg:h-[108px]',
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-[1680px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-[max(52px,3.3vw)]">
          <Link href="/" className="inline-flex min-h-[44px] shrink-0 items-center rounded-md" aria-label="Texas ABA Centers home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-14 min-[1100px]:flex" aria-label="Main">
            {primary.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + '/');
              return (
                <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined} className="group relative whitespace-nowrap py-2 font-sans text-[15px] font-medium text-ink">
                  {n.label}
                  <span aria-hidden className={cn('absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-cobalt transition-transform duration-[350ms] ease-out group-hover:scale-x-100', active && 'scale-x-100')} />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={findHref} className="group inline-flex h-[52px] items-center gap-2 whitespace-nowrap rounded-full bg-cobalt px-4 font-sans text-[15px] font-semibold text-white transition hover:bg-ink sm:px-7 sm:text-[16px]">
              <span className="max-[400px]:hidden">Find a center</span>
              <span className="min-[401px]:hidden">Centers</span>
              <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-[3px]">
                →
              </span>
            </Link>
            <button
              type="button"
              className="inline-flex h-[52px] items-center gap-2 rounded-full border border-ink/25 px-3 font-sans sm:px-4 text-[15px] font-semibold text-ink transition hover:bg-ink hover:text-paper min-[1100px]:hidden"
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
            <div className="mx-auto flex h-[88px] w-full max-w-[1600px] items-center justify-between px-5 sm:px-8">
              <Link href="/" className="inline-flex rounded-md" aria-label="Texas ABA Centers home" onClick={() => setOpen(false)}>
                <Logo className="brightness-0 invert" />
              </Link>
              <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-paper/30 px-4 font-sans text-[15px] font-semibold text-paper hover:bg-paper hover:text-ink" onClick={() => setOpen(false)} autoFocus>
                <X className="h-4 w-4" aria-hidden /> Close
              </button>
            </div>
            <div className="mx-auto grid w-full max-w-[1600px] flex-1 content-start gap-10 overflow-y-auto px-5 pb-28 pt-4 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:pb-12">
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
                <p className="font-sans text-[length:var(--t-base)] text-paper/75">Six centers across Texas. One phone number, answered by a person.</p>
                <div className="flex flex-wrap gap-2">
                  {locations.map((l) => (
                    <Link key={l.slug} href={`/locations/${l.slug}`} className="rounded-full border border-paper/25 px-3 py-1.5 font-sans text-[length:var(--t-sm)] font-semibold text-paper hover:bg-paper hover:text-ink">
                      {l.name}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={findHref} className="btn-sun" onClick={() => setOpen(false)}>
                    Find a center →
                  </Link>
                  <a href={`tel:${site.phone.tel}`} className="btn border border-paper/30 text-paper hover:bg-paper hover:text-ink" onClick={() => track({ name: 'call_tap', center: 'main', place: 'menu' })}>
                    <Phone className="h-4 w-4" aria-hidden /> {site.phone.display}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
