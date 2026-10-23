'use client';

import Image from 'next/image';
import { contact } from './data/gettingStarted';
import { PhoneIcon, TextIcon } from './icons';
import { track } from '@/lib/site/analytics';
import styles from './GettingStarted.module.css';

/** The same person on every step: avatar, name, Call (with the visible number) and Text. */
export function ContactRow({ place }: { place: 'panel' | 'strip' }) {
  return (
    <div className={styles.contact}>
      <span className={styles.cAv} aria-hidden="true">
        {contact.photo ? <Image src={contact.photo} alt="" width={48} height={48} className={styles.cPhoto} /> : contact.initials}
      </span>
      <div className={styles.cWho}>
        <b>{contact.name}</b>
        <small>{contact.role}</small>
      </div>
      <div className={styles.cActs}>
        <a className={`${styles.cBtn} ${styles.gold}`} href={`tel:${contact.tel}`} onClick={() => track({ name: 'call_tap', center: 'main', place: `getting-started-${place}` })}>
          <PhoneIcon />
          {contact.phone}
        </a>
        <a className={styles.cBtn} href={`sms:${contact.tel}`} aria-label={`Text ${contact.name}`}>
          <TextIcon />
          Text
        </a>
      </div>
    </div>
  );
}
