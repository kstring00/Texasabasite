'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Center } from './data/centers';
import { getPeopleForCenter } from '@/data/people';
import { getCenterModel, insideHref } from '@/data/centerModels';
import { Avatar } from '@/components/people/Avatar';
import { WhoToContactSheet } from '@/components/people/WhoToContactSheet';
import { track } from '@/lib/site/analytics';
import styles from './Locations.module.css';

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);

export function CenterCard({ center: c, animate }: { center: Center; animate: boolean }) {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.address)}`;
  const team = getPeopleForCenter(c.id);
  const model = getCenterModel(c.id);
  const [who, setWho] = useState(false);
  return (
    <article className={`${styles.card} ${animate ? styles.fade : ''}`} aria-live="polite" key={c.id}>
      <div className={styles.metro}>{c.metro}</div>
      <h3 className={styles.name}>{c.name}</h3>
      <div className={styles.rows}>
        {c.address && (
          <div className={styles.row}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span>{c.address}</span>
          </div>
        )}
        <div className={styles.row}>
          <PhoneIcon />
          <span>{c.phone.display}</span>
        </div>
      </div>
      <p className={styles.serves}>Serves {c.serves}</p>
      <div className={styles.team}>
        <span className={styles.teamLabel}>Your team here</span>
        <ul className={styles.faces} aria-label="Your team here">
          {team.map((p) => (
            <li key={p.id} title={`${p.name}, ${p.title}`}>
              <Avatar person={p} size={36} className={styles.face} />
              <span className="sr-only">{p.name}, {p.title}</span>
            </li>
          ))}
        </ul>
        <button type="button" className={styles.who} onClick={() => setWho(true)}>
          Who should I contact? <span aria-hidden="true">→</span>
        </button>
      </div>
      <WhoToContactSheet open={who} onClose={() => setWho(false)} centerId={c.id} place="locations-card" />
      <div className={styles.actions}>
        <Link className={`${styles.btn} ${styles.gold}`} href={`/request-a-tour?center=${c.slug}`}>
          Request a tour <span aria-hidden="true">→</span>
        </Link>
        <a className={`${styles.btn} ${styles.outline}`} href={`tel:${c.phone.tel}`} onClick={() => track({ name: 'call_tap', center: c.slug, place: 'locations-map' })}>
          <PhoneIcon />
          <span>Call {c.name}</span>
        </a>
      </div>
      {c.address && (
        <a className={styles.dir} href={directions} target="_blank" rel="noopener noreferrer" onClick={() => track({ name: 'directions_tap', center: c.slug })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 11 21 3l-8 18-2-8-8-2Z" />
          </svg>
          Get directions
        </a>
      )}
      {model && (
        <>
          <br />
          <Link className={styles.dir} href={insideHref(model)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
              <path d="M4 7l8 4 8-4M12 11v10" />
            </svg>
            Step inside the center <span aria-hidden="true">→</span>
          </Link>
        </>
      )}
      <br />
      <Link className={styles.pageLink} href={`/locations/${c.slug}`}>
        Visit the {c.name} page ↗
      </Link>
    </article>
  );
}
