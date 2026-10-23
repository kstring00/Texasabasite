import Link from 'next/link';
import { Logo } from './Logo';
import { OpenWorldMark } from './OpenWorld';
import { site } from '@/data/site';
import { locations } from '@/data/locations';
import { services } from '@/data/services';
import { cgGroups, CG_HOME } from '@/data/commonGround';

export function Footer() {
  return (
    <footer className="bg-ink pb-28 pt-[var(--s-5)] text-paper md:pb-[var(--s-4)]">
      <div className="wrap grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 lg:col-span-4">
          <Logo className="[&_*]:text-paper" />
          <p className="mt-6 max-w-sm font-sans text-[length:var(--t-lg)] leading-snug text-paper/85">{site.tagline}</p>
          <p className="mt-6 font-sans text-[length:var(--t-base)]">
            <a href={`tel:${site.phone.tel}`} className="font-display text-[length:var(--t-xl)] text-butter underline-offset-4 hover:underline">
              {site.phone.display}
            </a>
            <span className="block text-paper/60">{site.phoneHours}</span>
          </p>
          <OpenWorldMark tone="paper" className="mt-10 h-12 w-14 opacity-60" />
        </div>
        <nav aria-label="Centers" className="col-span-6 sm:col-span-4 lg:col-span-2">
          <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter">Centers</p>
          <ul className="mt-4 space-y-2">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link href={`/locations/${l.slug}`} className="font-sans text-[length:var(--t-base)] text-paper/85 underline-offset-4 hover:text-paper hover:underline">
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Services" className="col-span-6 sm:col-span-4 lg:col-span-2">
          <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter">Services</p>
          <ul className="mt-4 space-y-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="font-sans text-[length:var(--t-base)] text-paper/85 underline-offset-4 hover:text-paper hover:underline">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Common Ground" className="col-span-6 sm:col-span-4 lg:col-span-2">
          <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter">Common Ground</p>
          <ul className="mt-4 space-y-2">
            {cgGroups.map((g) => (
              <li key={g.id}>
                <Link href={`${CG_HOME}#${g.id}`} className="font-sans text-[length:var(--t-base)] text-paper/85 underline-offset-4 hover:text-paper hover:underline">
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="More" className="col-span-6 sm:col-span-4 lg:col-span-2">
          <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter">More</p>
          <ul className="mt-4 space-y-2">
            {[
              ['/getting-started', 'Getting started'],
              ['/request-a-tour', 'Request a tour'],
              ['/insurance', 'Insurance & cost'],
              ['/families', 'Common Ground'],
              ['/team', 'Your team'],
              ['/events', 'Events'],
              ['/blog', 'Blog'],
              ['/providers', 'For providers'],
              ['/contact', 'Contact'],
              ['/es', 'Español'],
              ['/privacy', 'Privacy policy'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} lang={href === '/es' ? 'es' : undefined} className="font-sans text-[length:var(--t-base)] text-paper/85 underline-offset-4 hover:text-paper hover:underline">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a href={site.careersUrl} className="font-sans text-[length:var(--t-base)] text-paper/85 underline-offset-4 hover:text-paper hover:underline" target="_blank" rel="noopener noreferrer">
                Careers ↗
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="wrap mt-[var(--s-4)] flex flex-wrap items-center justify-between gap-3 border-t border-paper/15 pt-6 font-sans text-[length:var(--t-xs)] text-paper/60">
        <p>&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>Common Ground is parent support, not clinical care.</p>
      </div>
    </footer>
  );
}
