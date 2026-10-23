'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Phone, X, ArrowUpRight, ChevronDown } from 'lucide-react';
import { CG_NEXT_STEP, cgGroups } from '@/data/commonGround';
import { site } from '@/data/site';
import { locations } from '@/data/locations';
import { track } from '@/lib/site/analytics';
import { cn } from '@/lib/site/utils';
import { useNavScroll } from '@/lib/site/useNavScroll';

const primary: { href: string; label: string; mega?: boolean }[] = [
  { href: '/locations', label: 'Locations' },
  { href: '/services', label: 'Services' },
  { href: '/getting-started', label: 'Getting started' },
  { href: '/insurance', label: 'Insurance' },
  { href: '/families', label: 'Common Ground', mega: true },
];
const more = [
  { href: '/team', label: 'About' },
  { href: '/blog', label: 'Resources' },
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
 * Site header. Over the homepage hero it is absolute and transparent with white text; after 80px
 * of scroll on any page it is a frosted dark bar so it stays readable over any section.
 * Phone and "Request a tour" are reachable from the nav on every page.
 */
export function Header() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const { hidden, atTop } = useNavScroll();
  const home = pathname === '/';
  // Always visible while the menu is open or anything in the nav has keyboard focus.
  const shown = open || focusWithin || !hidden;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  // Tell sticky things below (Common Ground sub-nav, Getting Started panel) where the nav ends.
  useEffect(() => {
    document.documentElement.dataset.nav = shown ? 'shown' : 'hidden';
  }, [shown]);

  // Light text over the hero video and over the frosted bar; ink only at the top of cream pages.
  const light = home || !atTop;
  const text = light ? 'text-paper' : 'text-ink';

  return (
    <>
      <header
        data-tone={light ? 'light' : 'dark'}
        onFocus={() => setFocusWithin(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusWithin(false);
        }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 h-16 border-b will-change-transform lg:h-20',
          'transition-[transform,opacity,background-color,border-color] ease-out',
          shown ? 'duration-[250ms]' : 'duration-300',
          reduce ? (shown ? 'opacity-100' : 'pointer-events-none opacity-0 !duration-150') : shown ? 'translate-y-0' : '-translate-y-full',
          home && 'motion-safe:animate-[nav-in_0.5s_ease-out_1.3s_both]',
          atTop ? 'border-transparent bg-transparent' : 'border-white/10 bg-ink/75 backdrop-blur-md',
          text,
        )}
      >
        <div className="wrap flex h-full min-w-0 items-center justify-between gap-4">
          <Link href="/" className="inline-flex min-h-[44px] shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter/60" aria-label="Texas ABA Centers home">
            <Logo className={cn(light && 'brightness-0 invert')} />
          </Link>

          <nav className="hidden items-center gap-8 min-[1280px]:flex xl:gap-10" aria-label="Main">
            {primary.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + '/');
              if (n.mega) return <MegaMenu key={n.href} href={n.href} label={n.label} active={active} />;
              return (
                <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined} className="group relative whitespace-nowrap py-2 font-sans text-[15px] font-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter/60">
                  {n.label}
                  <span aria-hidden className={cn('absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-current transition-transform duration-[350ms] ease-out group-hover:scale-x-100', active && 'scale-x-100')} />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`tel:${site.phone.tel}`}
              className={cn('inline-flex h-11 items-center gap-2 rounded-full border px-3 font-sans text-[15px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter/60 sm:h-12 sm:px-4', light ? 'border-paper/60 text-paper hover:bg-paper hover:text-ink' : 'border-ink/40 text-ink hover:bg-ink hover:text-paper')}
              aria-label={`Call ${site.phone.display}`}
              onClick={() => track({ name: 'call_tap', center: 'main', place: 'nav' })}
            >
              <Phone className="h-4 w-4" aria-hidden />
              <span className="hidden md:inline">{site.phone.display}</span>
            </a>
            <Link
              href="/request-a-tour"
              className={cn('inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 font-sans text-[15px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter/60 sm:h-12 sm:px-6', light ? 'bg-paper text-ink hover:bg-butter' : 'bg-ink text-paper hover:bg-cobalt')}
            >
              <span className="max-[400px]:hidden">Request a tour</span>
              <span className="min-[401px]:hidden">Tour</span>
            </Link>
            <button
              type="button"
              className={cn('inline-grid h-11 w-11 shrink-0 place-items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter/60 sm:h-12 sm:w-12', light ? 'border-paper/60 text-paper hover:bg-paper hover:text-ink' : 'border-ink/40 text-ink hover:bg-ink hover:text-paper')}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <span className="flex flex-col gap-[5px]" aria-hidden>
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>
      {!home && <div aria-hidden className="h-16 shrink-0 lg:h-20" />}

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
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {cgGroups.map((g) => (
                    <div key={g.id}>
                      <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter">Common Ground · {g.label}</p>
                      <ul className="mt-2 space-y-1.5">
                        {g.pages.map((pg) => (
                          <li key={pg.href}>
                            <Link href={pg.href} className="font-sans text-[length:var(--t-base)] font-semibold text-paper/85 underline-offset-4 hover:text-paper hover:underline">
                              {pg.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
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
                  <Link href="/request-a-tour" className="btn-sun" onClick={() => setOpen(false)}>
                    Request a tour →
                  </Link>
                  <Link href="/locations" className="btn border border-paper/30 text-paper hover:bg-paper hover:text-ink" onClick={() => setOpen(false)}>
                    Find a center
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


/**
 * Common Ground mega-menu. Opens on hover or focus, closes on Escape (focus returns to the
 * trigger) and on outside click. Four groups, each link with its icon and one-line description,
 * plus the featured "Find my next step" tile.
 */
function MegaMenu({ href, label, active }: { href: string; label: string; active: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);
  const reduce = useReducedMotion();

  const [panelTop, setPanelTop] = useState(108);
  const show = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    const hdr = rootRef.current?.closest('header')?.getBoundingClientRect();
    if (hdr) setPanelTop(hdr.bottom + 8);
    setOpen(true);
  };
  const hideSoon = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        if (rootRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <div className="flex items-center">
        <Link href={href} aria-current={active ? 'page' : undefined} className="group relative whitespace-nowrap py-2 font-sans text-[15px] font-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter/60" onFocus={show}>
          {label}
          <span aria-hidden className={cn('absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-current transition-transform duration-[350ms] ease-out group-hover:scale-x-100', (active || open) && 'scale-x-100')} />
        </Link>
        <button ref={triggerRef} type="button" aria-expanded={open} aria-controls="cg-mega" aria-label={`${label} menu`} onClick={() => setOpen((v) => !v)} className="ml-1 rounded-md p-1 opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter/60">
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            id="cg-mega"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ top: panelTop }}
            className="fixed left-[max(24px,calc(50vw-640px))] z-50 w-[min(1280px,calc(100vw-48px))] rounded-[28px] border border-line bg-card p-6 shadow-[0_30px_60px_-30px_rgb(23_38_56/0.45)]"
            onMouseEnter={show}
            onMouseLeave={hideSoon}
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr_1fr_0.9fr]">
              {cgGroups.map((g) => (
                <div key={g.id}>
                  <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-cobalt">{g.label}</p>
                  <ul className="mt-3 space-y-1">
                    {g.pages.map((pg) => (
                      <li key={pg.href}>
                        <Link href={pg.href} className="group/l flex gap-3 rounded-xl p-2 transition hover:bg-ink/[0.05]" onClick={() => setOpen(false)}>
                          <pg.icon className="mt-0.5 h-5 w-5 shrink-0 text-cobalt" strokeWidth={1.8} aria-hidden />
                          <span>
                            <span className="block font-sans text-[15px] font-semibold text-ink">{pg.label}</span>
                            <span className="block font-sans text-[14px] leading-snug text-soft">{pg.description}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Link href={CG_NEXT_STEP} className="group/t flex flex-col justify-between rounded-[22px] bg-ink p-6 text-paper transition hover:bg-cobalt" onClick={() => setOpen(false)}>
                <span className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter">Not sure where to start?</span>
                <span className="mt-6 font-display text-[length:var(--t-xl)] leading-tight">
                  Find my next step <span aria-hidden>→</span>
                </span>
                <span className="mt-3 font-sans text-[14px] text-paper/80">Two quick questions, then one focused place to begin.</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
