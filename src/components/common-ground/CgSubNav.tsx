'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Phone } from 'lucide-react';
import { CG_HOME, CG_PHONE, cgGroups, cgLocate, cgPages } from '@/data/commonGround';
import { cn } from '@/lib/site/utils';
import { track } from '@/lib/site/analytics';

/**
 * The only Common Ground-specific chrome: a slim sticky sub-nav under the site header.
 * Desktop: label, four group tabs with dropdowns, "Talk to someone".
 * Mobile: one scrollable row of page links, the current page scrolled into view.
 */
export function CgSubNav() {
  const pathname = usePathname();
  const { group: currentGroup, page: currentPage } = cgLocate(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile row: bring the current page into view.
  useEffect(() => {
    const row = rowRef.current;
    const current = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (row && current) row.scrollTo({ left: current.offsetLeft - 16, behavior: 'auto' });
  }, [pathname]);

  // Close dropdowns on route change, outside click and Escape.
  useEffect(() => setOpenId(null), [pathname]);
  useEffect(() => {
    if (!openId) return;
    const onDown = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openId]);

  return (
    <nav
      ref={navRef}
      aria-label="Common Ground"
      className={cn(
        'sticky top-[var(--nav-offset)] z-30 h-14 border-b border-line transition-[top,background-color,box-shadow] duration-[250ms] ease-out',
        scrolled ? 'bg-paper/85 shadow-[0_8px_24px_-20px_rgb(23_38_56/0.4)] backdrop-blur-[12px]' : 'bg-paper',
      )}
    >
      <div className="wrap flex h-full items-center gap-4">
        <Link href={CG_HOME} className="hidden shrink-0 font-sans text-[16px] font-semibold text-ink underline-offset-4 hover:underline sm:inline">
          Common Ground
        </Link>

        {/* Desktop tabs */}
        <ul className="ml-4 hidden h-full items-stretch gap-1 min-[900px]:flex">
          {cgGroups.map((g) => (
            <GroupTab key={g.id} id={g.id} label={g.label} pages={g.pages} current={currentGroup?.id === g.id} currentHref={currentPage?.href} open={openId === g.id} onToggle={() => setOpenId((v) => (v === g.id ? null : g.id))} onClose={() => setOpenId(null)} />
          ))}
        </ul>

        {/* Mobile row */}
        <div ref={rowRef} className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 [scrollbar-width:none] min-[900px]:hidden [&::-webkit-scrollbar]:hidden">
          {cgPages.map((p) => {
            const on = currentPage?.href === p.href;
            return (
              <Link key={p.href} href={p.href} aria-current={on ? 'page' : undefined} className={cn('shrink-0 whitespace-nowrap rounded-full px-3 py-2 font-sans text-[14px] font-semibold transition', on ? 'bg-cobalt text-white' : 'text-ink hover:bg-ink/[0.06]')}>
                {p.label}
              </Link>
            );
          })}
        </div>

        <a href={`tel:${CG_PHONE.tel}`} className="btn-secondary ml-auto hidden min-h-[40px] shrink-0 px-4 py-2 sm:inline-flex" onClick={() => track({ name: 'call_tap', center: 'main', place: 'common-ground-subnav' })}>
          <Phone className="h-4 w-4" aria-hidden /> Talk to someone
        </a>
        <a href={`tel:${CG_PHONE.tel}`} className="btn-secondary ml-auto inline-flex h-10 w-10 shrink-0 p-0 sm:hidden" aria-label="Talk to someone" onClick={() => track({ name: 'call_tap', center: 'main', place: 'common-ground-subnav' })}>
          <Phone className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </nav>
  );
}

type TabProps = { id: string; label: string; pages: { href: string; label: string }[]; current: boolean; currentHref?: string; open: boolean; onToggle: () => void; onClose: () => void };

function GroupTab({ id, label, pages, current, currentHref, open, onToggle, onClose }: TabProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (open) menuRef.current?.querySelector<HTMLElement>('a')?.focus();
  }, [open]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      btnRef.current?.focus();
      return;
    }
    if (!open) return;
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Tab') {
      onClose();
    }
  };

  return (
    <li className="relative flex" onKeyDown={onKey} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) onClose(); }}>
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={onToggle}
        className={cn(
          'relative inline-flex items-center gap-1 px-3 font-sans text-[15px] font-medium text-ink transition hover:text-cobalt',
          'after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:bg-cobalt after:transition-transform after:duration-300 after:content-[""]',
          current ? 'text-cobalt after:scale-x-100' : 'after:scale-x-0',
        )}
      >
        {label}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <ul ref={menuRef} id={menuId} className="absolute left-0 top-full z-40 mt-0 min-w-[16rem] rounded-2xl border border-line bg-card p-2 shadow-[0_24px_50px_-30px_rgb(23_38_56/0.5)]" aria-label={`${label} pages`}>
          {pages.map((p) => (
            <li key={p.href}>
              <Link href={p.href} aria-current={currentHref === p.href ? 'page' : undefined} className={cn('block rounded-xl px-3 py-2.5 font-sans text-[15px] font-medium transition hover:bg-ink/[0.06]', currentHref === p.href ? 'text-cobalt' : 'text-ink')} onClick={onClose}>
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <span className="sr-only">{id}</span>
    </li>
  );
}
