'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Wordmark } from './Logo';
import { useEnter } from './motion';
import { site } from '@/data/site';
import { locations } from '@/data/locations';
import { services } from '@/data/services';
import { cgGroups, CG_HOME } from '@/data/commonGround';
import { track } from '@/lib/site/analytics';
import styles from './Footer.module.css';

const HEART_COLORS = ['#e2283a', '#8b2442', '#703068', '#32175a', '#1a2e52'];
/** The graph along the top edge: x and y in percent of its box. It trends upward, with small dips. */
const GRAPH: [number, number][] = [[0, 84], [9, 74], [19, 78], [30, 60], [41, 66], [52, 46], [63, 52], [74, 32], [85, 36], [94, 18], [100, 12]];

const FAMILIES: [string, string][] = [
  ['/getting-started', 'Getting started'],
  ['/request-a-tour', 'Request a tour'],
  ['/insurance', 'Insurance & cost'],
  ['/events', 'Events'],
  ['/blog', 'Blog'],
  ['/es', 'Español'],
];
const COMPANY: [string, string][] = [
  ['/team', 'Your team'],
  ['/providers', 'For providers'],
  ['/contact', 'Contact'],
  ['/contact#who', 'Who to contact'],
  ['/privacy', 'Privacy policy'],
];

/** One link column. A drawer on phones, always open from 768px up. */
function Column({ label, wide, children }: { label: string; wide: boolean; children: React.ReactNode }) {
  return (
    <nav aria-label={label}>
      <details className={styles.drawer} open={wide || undefined}>
        <summary className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter" tabIndex={wide ? -1 : undefined}>
          {label} <ChevronDown className="h-4 w-4" aria-hidden />
        </summary>
        <ul className="pb-3 font-sans text-[15px] leading-snug md:mt-3 md:pb-0">{children}</ul>
      </details>
    </nav>
  );
}

export function Footer() {
  const [ref, enter] = useEnter<HTMLElement>(0.2);
  // Server HTML has every column open, so the links are there without JavaScript. Phones then fold them.
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  return (
    <footer ref={ref} data-enter={enter} className="bg-ink pb-28 text-paper md:pb-0">
      {/* A thin gold line along the top edge, drawn once: a progress graph with its data points. */}
      <div className={styles.graph} aria-hidden="true">
        <div className={styles.graphWindow}>
          <div className={styles.graphInner}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline points={GRAPH.map(([x, y]) => `${x},${y}`).join(' ')} />
            </svg>
          </div>
        </div>
        {GRAPH.slice(1, -1).map(([x, y]) => (
          <span key={x} className={styles.dot} style={{ left: `${x}%`, top: `${y}%`, ['--at' as string]: x / 100 }} />
        ))}
      </div>

      <div className="wrap grid grid-cols-12 gap-x-8 gap-y-8 pb-8 pt-4 md:pt-6 lg:gap-y-0">
        <div className="col-span-12 lg:col-span-3">
          <span className="inline-flex items-center gap-3">
            <svg viewBox="0 0 100 100" className="h-11 w-11" aria-hidden="true">
              <g transform="translate(50 50)">
                {HEART_COLORS.map((c, i) => (
                  <g key={c} transform={`rotate(${i * 72})`}>
                    <path className={styles.petal} style={{ ['--i' as string]: i }} d="M0 -44 C 6 -56, 24 -54, 22 -38 C 21 -27, 8 -18, 0 -12 C -8 -18, -21 -27, -22 -38 C -24 -54, -6 -56, 0 -44 Z" fill={c} />
                  </g>
                ))}
                <path className={styles.star} d="M0 -17 L5 -6 L17 -5 L8 3 L10.5 15 L0 9 L-10.5 15 L-8 3 L-17 -5 L-5 -6 Z" fill="#ffffff" />
              </g>
            </svg>
            <Wordmark className="text-paper" />
          </span>
          <p className="mt-4 max-w-sm font-sans text-[length:var(--t-base)] leading-snug text-paper/85">{site.tagline}</p>
          <p className="mt-5">
            <a href={`tel:${site.phone.tel}`} className="font-display text-[clamp(1.9rem,1.5rem+1vw,2.2rem)] leading-none tracking-tight text-butter underline-offset-8 hover:underline focus-visible:outline-butter" onClick={() => track({ name: 'call_tap', center: 'main', place: 'footer' })}>
              {site.phone.display}
            </a>
            <span className="mt-2 block font-sans text-[length:var(--t-sm)] text-paper/75">{site.phoneHours}</span>
          </p>
        </div>

        <nav aria-label="Centers" className="col-span-12 md:col-span-5 lg:col-span-3">
          <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter">Six centers</p>
          <ul className="mt-3 flex flex-wrap gap-2 font-sans text-[15px] lg:max-w-[17rem]">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link href={`/locations/${l.slug}`} className={styles.pill}>
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-12 grid grid-cols-1 divide-y divide-paper/15 border-y border-paper/15 md:col-span-7 md:grid-cols-[1.2fr_0.8fr_1.5fr] md:gap-x-6 md:divide-y-0 md:border-0 lg:col-span-6">
          <Column label="Services" wide={wide}>
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className={styles.link}>
                  {s.name}
                </Link>
              </li>
            ))}
          </Column>
          <Column label="Common Ground" wide={wide}>
            {cgGroups.map((g) => (
              <li key={g.id}>
                <Link href={`${CG_HOME}#${g.id}`} className={styles.link}>
                  {g.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={CG_HOME} className={styles.link}>
                Common Ground
              </Link>
            </li>
          </Column>
          <Column label="Families & company" wide={wide}>
            <li className="grid grid-cols-2 gap-x-4">
              <ul aria-label="Families">
                {FAMILIES.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} lang={href === '/es' ? 'es' : undefined} className={styles.link}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul aria-label="Company">
                {COMPANY.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className={styles.link}>
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a href={site.careersUrl} className={styles.link} target="_blank" rel="noopener noreferrer">
                    Careers ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              </ul>
            </li>
          </Column>
        </div>
      </div>

      <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-paper/15 py-4 font-sans text-[length:var(--t-xs)] text-paper/75">
        <p suppressHydrationWarning>&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>Common Ground is parent support, not clinical care.</p>
      </div>
    </footer>
  );
}
