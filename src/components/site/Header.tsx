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

const primary: { href: string; label: string; mega?: boolean }[] = [
  { href: '/team', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/locations', label: 'Our Centers' },
  { href: '/families', label: 'Common Ground', mega: true },
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
              if (n.mega) return <MegaMenu key={n.href} href={n.href} label={n.label} active={active} />;
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
              className="inline-flex h-[52px] items-center gap-2 rounded-full border border-ink/40 bg-transparent px-3 font-sans text-[15px] font-semibold text-ink transition hover:border-ink hover:bg-ink hover:text-paper sm:px-4 min-[1100px]:hidden"
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
        <Link href={href} aria-current={active ? 'page' : undefined} className="group relative whitespace-nowrap py-2 font-sans text-[15px] font-medium text-ink" onFocus={show}>
          {label}
          <span aria-hidden className={cn('absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-cobalt transition-transform duration-[350ms] ease-out group-hover:scale-x-100', (active || open) && 'scale-x-100')} />
        </Link>
        <button ref={triggerRef} type="button" aria-expanded={open} aria-controls="cg-mega" aria-label={`${label} menu`} onClick={() => setOpen((v) => !v)} className="ml-1 rounded-md p-1 text-ink hover:text-cobalt">
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
