'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Ticker } from '@/components/site/Ticker';
import { CG_HOME, cgPages } from '@/data/commonGround';
import styles from './CommonGroundBand.module.css';

/**
 * The three tools behind the door. Names, descriptions and destinations come from the Common
 * Ground page list, so they stay the same words used everywhere else. `sub` is the short line on
 * the button and `pills` are two facts taken from the description.
 */
const DOORS = [
  { href: '/families/while-you-wait', sub: 'Between the first call and the first day', pills: ['Free', 'Before you’re enrolled anywhere'] },
  { href: '/families/pulse', sub: 'A one-minute weekly check-in', pills: ['One minute a week', 'Stays on your device'] },
  { href: '/families/connect', sub: 'A moderated space for parents', pills: ['Moderated', 'For parents'] },
]
  .map((d) => ({ ...d, page: cgPages.find((p) => p.href === d.href) }))
  .filter((d): d is typeof d & { page: NonNullable<typeof d.page> } => Boolean(d.page));

const GLANCE = ['Free for every family', 'No account', 'Open before enrollment'];
const TICKER = ['Free for every family', 'No account', 'Open before your child is enrolled anywhere'];

/**
 * Home page only: Common Ground as a full-width blue band with a door and three ways through it.
 * The Getting Started page still uses the earlier card version, `CommonGroundSection`, unchanged.
 */
export function CommonGroundBand() {
  const [active, setActive] = useState(0);
  const door = DOORS[active] ?? DOORS[0];
  const number = String(active + 1).padStart(2, '0');

  return (
    <section id="common-ground" className={styles.band} aria-labelledby="cg-home-title">
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.top}>
          <p className={styles.name}>Common Ground</p>
          <ul className={styles.glance} aria-label="Common Ground at a glance">
            {GLANCE.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>

        <h2 id="cg-home-title" className={styles.title}>
          Support for you, not just <em>your child.</em>
        </h2>
        <p className={styles.lede}>The parent side of care has its own front door, open before your child is enrolled anywhere. Free for every family. No account.</p>

        <div className={styles.why}>
          <p className={styles.kicker}>Why it matters</p>
          <div className={styles.whyGrid}>
            <div>
              <p className={styles.quote}>Research shows high parenting stress weakens the gains of early intervention.</p>
              <a className={styles.cite} href="https://doi.org/10.1007/s10803-007-0497-7" target="_blank" rel="noopener noreferrer">
                Osborne et al., 2008, Journal of Autism and Developmental Disorders
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            <p className={styles.so}>So caring for the parent is part of caring for the child. That is what Common Ground is for.</p>
          </div>
        </div>

        <div className={styles.door}>
          <div className={styles.choices}>
            <p className={styles.kicker} id="cg-door-label">
              What&rsquo;s behind the door
            </p>
            <div className={styles.buttons} role="group" aria-labelledby="cg-door-label">
              {DOORS.map((d, i) => (
                <button key={d.href} type="button" className={styles.choice} aria-pressed={i === active} aria-controls="cg-door-panel" onClick={() => setActive(i)}>
                  <span className={styles.choiceN} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.choiceText}>
                    <span className={styles.choiceName}>{d.page.label}</span>{' '}
                    <span className={styles.choiceSub}>{d.sub}</span>
                  </span>
                </button>
              ))}
            </div>
            {/* Tells a screen reader what the door now shows, without re-reading the whole panel. */}
            <p className="sr-only" role="status">
              Showing {door.page.label}.
            </p>
          </div>

          <div className={styles.archFrame}>
            <div className={styles.arch} id="cg-door-panel">
              <p className={styles.archNo}>Door {number}</p>
              <h3 className={styles.archName}>
                <Link href={door.page.href}>{door.page.label}</Link>
              </h3>
              <p className={styles.archBody}>{door.page.description}</p>
              <ul className={styles.archPills}>
                {door.pills.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Link href={CG_HOME} className={styles.open}>
                Open Common Ground <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Ticker tone="ink" phrases={TICKER} seconds={30} control />
    </section>
  );
}
