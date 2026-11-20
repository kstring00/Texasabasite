'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ClipboardCheck, FileStack, Layers, LayoutDashboard, Menu, Presentation, X, type LucideIcon } from 'lucide-react';

export type LcStaffNavItem = { href: string; label: string; icon: 'overview' | 'mine' | 'all' | 'reviews' | 'modules'; count?: number };
const ICONS: Record<LcStaffNavItem['icon'], LucideIcon> = { overview: LayoutDashboard, mine: Presentation, all: FileStack, reviews: ClipboardCheck, modules: Layers };

/**
 * The staff workspace frame: a dark sidebar beside the content on a desktop, a drawer opened by
 * a labelled Menu button on smaller screens. Which links appear is decided on the server from
 * the signed-in role. The links are a convenience; every page checks the role again itself.
 */
export function LcStaffShell({ nav, who, role, signOut, children }: { nav: LcStaffNavItem[]; who: string; role: string; signOut: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  const current = (href: string) => (href === '/learn/staff' ? pathname === href : href.endsWith('/submissions') ? pathname.startsWith(href) && !pathname.startsWith(`${href}/all`) : pathname.startsWith(href));

  return (
    <div className="lc-shell" data-open={open ? '' : undefined}>
      <div className="lc-shell-bar">
        <button type="button" className="lc-btn lc-btn-secondary" aria-expanded={open} aria-controls="lc-staff-nav" onClick={() => setOpen((v) => !v)}>
          {open ? <X width={20} height={20} strokeWidth={1.75} aria-hidden="true" /> : <Menu width={20} height={20} strokeWidth={1.75} aria-hidden="true" />}
          {open ? 'Close menu' : 'Menu'}
        </button>
        <span className="lc-shell-bar-name">Learning Center · Staff workspace</span>
      </div>
      <div className="lc-shell-frame">
        <nav id="lc-staff-nav" className="lc-sidebar lc-shell-side" aria-label="Staff workspace">
          <div className="lc-shell-brand">
            <span className="lc-shell-brand-name">Learning Center</span>
            <span className="lc-shell-brand-eyebrow">Staff workspace</span>
          </div>
          <ul className="lc-shell-nav">
            {nav.map((n) => {
              const Icon = ICONS[n.icon];
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={current(n.href) ? 'page' : undefined}>
                    <Icon width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                    {n.label}
                    {n.count ? <span className="lc-shell-count">{n.count}<span className="lc-sr-only"> waiting</span></span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="lc-shell-foot">
            <p className="lc-shell-who">
              <span>{who}</span>
              <span>{role}</span>
              <span>Demo role, not a real account</span>
            </p>
            {signOut}
            <Link href="/learn" className="lc-shell-back">
              <ArrowLeft width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
              Back to site
            </Link>
          </div>
        </nav>
        <div className="lc-shell-main" id="lc-staff-main">
          {children}
        </div>
      </div>
      {open ? <button type="button" className="lc-shell-scrim" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
    </div>
  );
}
