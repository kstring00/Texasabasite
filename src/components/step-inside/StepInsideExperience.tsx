'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Play } from 'lucide-react';
import type { CenterModel } from '@/data/centerModels';
import type { StepInsideHandle } from './StepInside';
import styles from './StepInside.module.css';

const StepInside = dynamic(() => import('./StepInside').then((m) => m.StepInside), { ssr: false, loading: () => <div className="h-[60vh] animate-pulse rounded-[28px] border border-line bg-card" aria-hidden /> });

/**
 * Server-rendered header actions, poster and legend links; the live 3D stage mounts on
 * Explore / Guided tour, or when the stage scrolls into view, whichever comes first.
 */
export function StepInsideExperience({ model, poster }: { model: CenterModel; poster: string }) {
  const [mounted, setMounted] = useState(false);
  const [autostart, setAutostart] = useState<'explore' | 'tour' | 'path' | null>(null);
  const [initialRoom, setInitialRoom] = useState<string | null>(null);
  const handle = useRef<StepInsideHandle | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // Deep links: #room-dtt opens that room.
  useEffect(() => {
    const read = () => {
      const m = window.location.hash.match(/^#room-([a-z-]+)$/);
      if (m && model.rooms.some((r) => r.id === m[1])) {
        setInitialRoom(m[1]);
        setMounted(true);
      }
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, [model.rooms]);

  // In view after the reader has started scrolling: mount. (Never on a cold load, so the
  // server-rendered poster and legend stay the LCP and the 3D build does not block first interaction.)
  useEffect(() => {
    if (mounted || !hostRef.current || !('IntersectionObserver' in window)) return;
    let io: IntersectionObserver | null = null;
    const arm = () => {
      window.removeEventListener('scroll', arm);
      if (!hostRef.current) return;
      io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setMounted(true)), { rootMargin: '120px 0px' });
      io.observe(hostRef.current);
    };
    window.addEventListener('scroll', arm, { passive: true, once: true });
    return () => {
      window.removeEventListener('scroll', arm);
      io?.disconnect();
    };
  }, [mounted]);

  const run = useCallback((what: 'explore' | 'tour' | 'path') => {
    if (handle.current) handle.current[what]();
    else {
      setAutostart(what);
      setMounted(true);
    }
    hostRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const onHandle = useCallback((h: StepInsideHandle) => {
    handle.current = h;
  }, []);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={() => run('explore')}>Explore the center</button>
        <button type="button" className="btn-secondary" onClick={() => run('tour')}>
          <Play className="h-4 w-4" aria-hidden /> Guided tour
        </button>
        <button type="button" className="inline-flex min-h-11 items-center gap-1 font-sans text-[length:var(--t-sm)] font-semibold text-ink underline-offset-4 hover:underline" onClick={() => run('path')}>
          Path to progress <span aria-hidden>→</span>
        </button>
      </div>
      <p className="mt-6 max-w-[62ch] font-sans text-[14px] text-soft">Illustrative layout. Rooms, furnishings and sizes are placeholders until our verified floor plan and photos are added.</p>

      <div ref={hostRef} className="mt-8 scroll-mt-[calc(var(--header-h)+1rem)]">
        {mounted ? (
          <StepInside model={model} initialRoom={initialRoom} autostart={autostart} onHandle={onHandle} />
        ) : (
          <div className={styles.root}>
            <button type="button" className={`${styles.stageWrap} block w-full cursor-pointer p-0 text-left`} onClick={() => run('explore')} aria-label="Explore the center">
              <Image src={poster} alt={`Illustrative miniature of the ${model.name} center with its ${model.rooms.length} rooms`} width={1600} height={900} priority className="block h-auto w-full" sizes="(min-width: 1280px) 1200px, 100vw" />
            </button>
            <nav className={styles.legend} aria-label="Rooms">
              {model.rooms.map((r) => (
                <Link key={r.id} href={`#room-${r.id}`} onClick={(e) => { e.preventDefault(); history.replaceState(null, '', `#room-${r.id}`); setInitialRoom(r.id); setMounted(true); }}>
                  <span className={styles.n}>{r.n}</span>{r.short}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </>
  );
}
