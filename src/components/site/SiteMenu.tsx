'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ChevronDown, Phone, X } from 'lucide-react';
import { CG_NEXT_STEP, cgGroups } from '@/data/commonGround';
import { insurance } from '@/data/insurance';
import { locations } from '@/data/locations';
import { services } from '@/data/services';
import { site } from '@/data/site';
import { steps } from '@/data/steps';
import { track } from '@/lib/site/analytics';
import { cn } from '@/lib/site/utils';

export type MenuItem = { href: string; label: string; menuLabel?: string };

const eyebrow = 'font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter';
const plink = 'inline-flex min-h-9 items-center font-sans text-[15px] font-semibold leading-tight text-paper/90 underline decoration-paper/30 underline-offset-4 transition-colors hover:text-paper hover:decoration-butter';
const cta = 'mt-4 inline-flex min-h-11 items-center gap-2 font-sans text-[15px] font-bold text-butter underline-offset-4 hover:underline lg:mt-6';

/** What the preview shows for each main item. Every panel is made of links the site already had. */
function Panel({ href, close }: { href: string; close: () => void }) {
  if (href === '/locations')
    return (
      <>
        <p className={eyebrow}>Six centers</p>
        <p className="mt-2 max-w-md font-sans text-[length:var(--t-base)] text-paper/80 max-lg:hidden">Six centers across Texas. One phone number, answered by a person.</p>
        <ul className="mt-3 grid grid-cols-2 gap-2 lg:mt-5 lg:gap-3">
          {locations.map((l) => (
            <li key={l.slug}>
              <Link href={`/locations/${l.slug}`} onClick={close} className="group/c flex min-h-11 items-center justify-between rounded-2xl border border-paper/20 px-4 py-2 transition-colors hover:border-butter hover:bg-butter hover:text-ink lg:min-h-[4.25rem]">
                <span>
                  <span className="block font-display text-[1.05rem] leading-tight lg:text-[length:var(--t-lg)]">{l.name}</span>
                  <span className="block font-sans text-[13px] text-paper/70 group-hover/c:text-ink/80 max-lg:hidden">{l.region}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/locations" onClick={close} className={cta}>
          Find a center <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </>
    );
  if (href === '/services')
    return (
      <>
        <p className={eyebrow}>Six services, one plan</p>
        <ul className="mt-2 grid gap-x-6 lg:mt-4 lg:grid-cols-2 lg:gap-y-3">
          {services.map((s) => (
            <li key={s.slug}>
              <Link href={`/services/${s.slug}`} onClick={close} className={plink}>
                {s.name}
              </Link>
              <span className="block font-sans text-[13px] leading-snug text-paper/70 max-lg:hidden">{s.ages}</span>
            </li>
          ))}
        </ul>
        <Link href="/services" onClick={close} className={cta}>
          All services <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </>
    );
  if (href === '/getting-started')
    return (
      <>
        <p className={eyebrow}>Five steps, first worry to first day</p>
        <ol className="mt-2 lg:mt-4">
          {steps.map((s) => (
            <li key={s.slug} className="border-b border-paper/15 last:border-0">
              <Link href={`/getting-started#${s.slug}`} onClick={close} className="group/s flex min-h-10 items-baseline gap-4 py-1.5 lg:py-2.5">
                <span className="num w-7 shrink-0 text-[1.05rem] text-butter">{String(s.n).padStart(2, '0')}</span>
                <span>
                  <span className="font-display text-[1.05rem] leading-tight underline-offset-4 group-hover/s:underline lg:text-[length:var(--t-lg)]">{s.title}</span>
                  <span className="block font-sans text-[13px] leading-snug text-paper/70 max-lg:hidden">{s.short}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </>
    );
  if (href === '/insurance')
    return (
      <>
        <p className={eyebrow}>Know the cost before you commit</p>
        <p className="mt-2 max-w-lg font-sans text-[length:var(--t-base)] leading-snug text-paper/80 lg:mt-4">{insurance.freeVerification}</p>
        <p className="mt-4 font-sans text-[13px] font-semibold text-paper/70 max-lg:hidden">The five words, in plain English</p>
        <ul className="mt-2 flex flex-wrap gap-2 max-lg:hidden">
          {insurance.costTerms.map((t) => (
            <li key={t.term} className="rounded-full border border-paper/25 px-3 py-1 font-sans text-[14px] font-semibold text-paper/90">
              {t.term}
            </li>
          ))}
        </ul>
        <Link href="/request-a-tour?about=coverage" onClick={() => (track({ name: 'coverage_check_click', place: 'menu' }), close())} className={cta}>
          Check my coverage <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </>
    );
  if (href === '/families')
    return (
      <>
        <div className="grid grid-cols-2 gap-x-5 gap-y-3 lg:gap-x-8 lg:gap-y-5">
          {cgGroups.map((g) => (
            <div key={g.id}>
              <p className={eyebrow}>{g.label}</p>
              <ul className="mt-1 lg:mt-2">
                {g.pages.map((pg) => (
                  <li key={pg.href}>
                    <Link href={pg.href} onClick={close} className={cn(plink, 'max-lg:min-h-8 max-lg:text-[14px]')}>
                      {pg.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link href={CG_NEXT_STEP} onClick={close} className={cta}>
          Not sure where to start? Find my next step <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </>
    );
  if (href === '/learn')
    return (
      <>
        <p className={eyebrow}>Caregiver Learning Center</p>
        <ul className="mt-2 lg:mt-4">
          {[
            ['/learn/library', 'Learning Library'],
            ['/learn/trainings', 'Live Trainings'],
          ].map(([h, l]) => (
            <li key={h}>
              <Link href={h} onClick={close} className={plink}>
                {l}
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  return null;
}

/**
 * The full-screen menu. It fits one screen at laptop and phone size with no scrolling.
 * Laptop: the main items on the left, and a preview on the right that swaps as each item is
 * hovered or focused. Phone: the same items as an accordion with one group open at a time.
 * Each preview sits right after its item in the page order, so the Tab key walks item, then
 * its links, then the next item. Up and Down arrows jump between the main items.
 */
export function SiteMenu({ items, more, onClose }: { items: MenuItem[]; more: { href: string; label: string }[]; onClose: () => void }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const current = items.findIndex((n) => pathname === n.href || pathname.startsWith(n.href + '/'));
  // Laptop always shows one preview. Phones start with every group closed.
  const [active, setActive] = useState<number | null>(null);
  const shown = active ?? (current >= 0 ? current : 0);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  // Escape closes the menu. Tab stays inside it, wrapping from the last link back to Close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !rootRef.current) return;
      const stops = Array.from(rootRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((el) => !el.closest('[inert]') && el.getClientRects().length > 0);
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onItemKey = (e: React.KeyboardEvent, i: number) => {
    const to = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : -1;
    if (to < 0 || to >= items.length) return;
    e.preventDefault();
    itemRefs.current[to]?.focus();
  };

  return (
    <motion.div
      ref={rootRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-hidden bg-ink text-paper"
      initial={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 100% 0 round 0 0 48px 48px)' }}
      animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0 round 0 0 0px 0px)' }}
      exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0 round 0 0 48px 48px)' }}
      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1600px] shrink-0 items-center justify-between px-5 sm:px-8 lg:h-20">
        <Link href="/" className="inline-flex rounded-md focus-visible:outline-butter" aria-label="Texas ABA Centers home" onClick={onClose}>
          <Image src="/logos/texas-aba-centers.png" alt="Texas ABA Centers" width={104} height={40} className="h-[34px] w-auto brightness-0 invert md:h-[40px]" />
        </Link>
        <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-paper/30 px-4 font-sans text-[15px] font-semibold text-paper hover:bg-paper hover:text-ink focus-visible:outline-butter" onClick={onClose} autoFocus>
          <X className="h-4 w-4" aria-hidden /> Close
        </button>
      </div>

      <nav aria-label="Menu" className="relative mx-auto min-h-0 w-full max-w-[1600px] flex-1 px-5 sm:px-8">
        <ul className="flex h-full flex-col lg:w-[40%] lg:justify-center">
          {items.map((n, i) => {
            const on = shown === i;
            const openOnPhone = active === i;
            return (
              <li key={n.href} className="border-b border-paper/15 lg:border-0">
                <motion.div className="flex items-center" initial={reduce ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                  <Link
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    href={n.href}
                    onClick={onClose}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onKeyDown={(e) => onItemKey(e, i)}
                    aria-current={current === i ? 'page' : undefined}
                    className={cn(
                      'group flex min-h-[3.25rem] flex-1 items-center gap-4 font-display text-[1.6rem] leading-none tracking-tight transition-colors focus-visible:outline-butter lg:min-h-0 lg:py-[clamp(0.5rem,1.6vh,1rem)] lg:text-[clamp(2rem,5.2vh,3.1rem)]',
                      on ? 'lg:text-butter' : 'lg:text-paper/60 lg:hover:text-paper',
                    )}
                  >
                    <span aria-hidden className={cn('hidden h-px bg-butter transition-transform duration-500 ease-out lg:block lg:w-10 lg:origin-left', on ? 'scale-x-100' : 'scale-x-0')} />
                    {n.menuLabel ?? n.label}
                  </Link>
                  <button type="button" className="grid h-11 w-11 place-items-center rounded-full text-paper/80 focus-visible:outline-butter lg:hidden" aria-expanded={openOnPhone} aria-controls={`menu-panel-${i}`} aria-label={`${n.menuLabel ?? n.label} links`} onClick={() => setActive(openOnPhone ? null : i)}>
                    <ChevronDown className={cn('h-5 w-5 transition-transform duration-300', openOnPhone && 'rotate-180')} aria-hidden />
                  </button>
                </motion.div>
                <div
                  id={`menu-panel-${i}`}
                  inert={!on || undefined}
                  className={cn(
                    'pb-4 lg:absolute lg:inset-y-0 lg:right-8 lg:flex lg:w-[52%] lg:flex-col lg:justify-center lg:border-l lg:border-paper/15 lg:pb-0 lg:pl-12 lg:transition-[opacity,transform,visibility] lg:duration-500 lg:ease-out',
                    openOnPhone ? 'max-lg:block max-lg:motion-safe:animate-slide-up' : 'max-lg:hidden',
                    on ? 'lg:visible lg:translate-y-0 lg:opacity-100' : 'lg:invisible lg:translate-y-3 lg:opacity-0',
                  )}
                >
                  <Panel href={n.href} close={onClose} />
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mx-auto flex w-full max-w-[1600px] shrink-0 flex-col gap-3 border-t border-paper/15 px-5 py-3 sm:px-8 lg:h-[4.5rem] lg:flex-row lg:items-center lg:justify-between lg:py-0">
        {/* One line at every size. On a phone the line scrolls sideways inside its own strip. */}
        <ul className="-mx-5 flex gap-x-6 overflow-x-auto whitespace-nowrap px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden" aria-label="More pages">
          {more.map((n) => (
            <li key={n.href}>
              <Link href={n.href} lang={n.href === '/es' ? 'es' : undefined} onClick={onClose} className="quiet-link inline-flex min-h-11 items-center font-sans text-[15px] font-semibold text-paper/85 hover:text-paper">
                {n.label}
              </Link>
            </li>
          ))}
          <li>
            <a href={site.careersUrl} target="_blank" rel="noopener noreferrer" className="quiet-link inline-flex min-h-11 items-center font-sans text-[15px] font-semibold text-paper/85 hover:text-paper">
              Careers ↗<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
        <div className="flex shrink-0 items-center gap-3">
          <a href={`tel:${site.phone.tel}`} className="btn min-h-11 flex-1 whitespace-nowrap border border-paper/30 px-4 text-paper hover:bg-paper hover:text-ink lg:flex-none lg:px-6" onClick={() => track({ name: 'call_tap', center: 'main', place: 'menu' })}>
            <Phone className="h-4 w-4" aria-hidden /> {site.phone.display}
          </a>
          <Link href="/request-a-tour" className="btn-sun min-h-11 flex-1 whitespace-nowrap px-4 lg:flex-none lg:px-6" onClick={onClose}>
            Request a tour <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
