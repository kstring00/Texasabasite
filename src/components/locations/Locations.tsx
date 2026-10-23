'use client';

import { useEffect, useState } from 'react';
import { centers, DEFAULT_CENTER_ID } from './data/centers';
import { TexasMap } from './TexasMap';
import { CenterCard } from './CenterCard';
import { CenterIndex } from './CenterIndex';
import styles from './Locations.module.css';
import { useMyCenter } from '@/lib/site/myCenter';

/**
 * The locations section. The map and the index are one control: selecting a center anywhere
 * updates everything. Hover or focus "peeks" without changing the selection.
 */
type Props = {
  /** Header copy. Defaults to the homepage version. */
  eyebrow?: string;
  title?: string;
  lede?: string;
};

export function Locations({
  eyebrow = 'LOCATIONS',
  title = 'Six centers across Texas. One front door.',
  lede = 'Pick the center closest to you. Every one of them does evaluations and therapy, so wherever you start, you start in the right place.',
}: Props = {}) {
  const [selectedId, setSelectedId] = useState(DEFAULT_CENTER_ID);
  const [peekId, setPeekId] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);
  const center = centers.find((c) => c.id === selectedId) ?? centers[0];
  const { setCenter: remember } = useMyCenter();
  // A deliberate pick (not the default) becomes the parent's remembered center.
  const select = (id: string) => {
    setSelectedId(id);
    remember(id);
  };

  useEffect(() => setAnimate(true), [selectedId]);

  return (
    <section className={styles.wrap} id="locations" aria-labelledby="locations-title">
      <div className={styles.head}>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h2 id="locations-title" className={styles.h2}>
          {title}
        </h2>
        {lede && <p>{lede}</p>}
      </div>
      <div className={styles.grid}>
        <TexasMap selectedId={selectedId} peekId={peekId} onSelect={select} onPeek={setPeekId} />
        <div className={styles.side}>
          <CenterCard center={center} animate={animate} />
          <CenterIndex selectedId={selectedId} peekId={peekId} onSelect={select} onPeek={setPeekId} />
        </div>
      </div>
    </section>
  );
}
