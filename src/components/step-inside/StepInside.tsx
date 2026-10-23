'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { type CenterModel } from '@/data/centerModels';
import { CENTER_SLUG, firstName, marcie, messageHref } from '@/data/people';
import { buildWorld } from './buildWorld';
import { RoomModuleView } from './RoomModules';
import styles from './StepInside.module.css';

type Cam = { spin: number; tilt: number; zoom: number; cx: number; cy: number; ox: number; oy: number; base: number; tiltAlt: boolean };
const T_MS = 11000;

export type StepInsideHandle = { explore: () => void; tour: () => void; path: () => void };

type Props = {
  model: CenterModel;
  /** Room to open on mount (from the URL hash). */
  initialRoom?: string | null;
  /** What to do once mounted: nothing, start exploring, or start the guided tour. */
  autostart?: 'explore' | 'tour' | 'path' | null;
  /** Receives imperative controls so the page header buttons can drive the stage. */
  onHandle?: (h: StepInsideHandle) => void;
};

/**
 * The live walkthrough: CSS-3D miniature, room panel, guided tour and Path to Progress.
 * The miniature is built imperatively (buildWorld); React owns the chrome around it.
 */
export function StepInside({ model, initialRoom, autostart, onHandle }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const legendRef = useRef<HTMLElement>(null);
  const cam = useRef<Cam>({ spin: -32, tilt: 57, zoom: 1, cx: 340, cy: 230, ox: 0, oy: 0, base: 1, tiltAlt: false });
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [view, setView] = useState<'explore' | 'path'>('explore');
  const [stage, setStage] = useState(0);
  const [tour, setTour] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const tourStart = useRef(0);
  const raf = useRef(0);
  const returnFocusTo = useRef<string | null>(null);

  const rooms = model.rooms;
  const room = active ? rooms.find((r) => r.id === active) ?? null : null;

  const setCam = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    const c = cam.current;
    w.style.setProperty('--spin', c.spin + 'deg');
    w.style.setProperty('--tilt', c.tilt + 'deg');
    w.style.setProperty('--zoom', String(c.zoom * c.base));
    w.style.setProperty('--cx', String(c.cx));
    w.style.setProperty('--cy', String(c.cy));
    w.style.setProperty('--ox', c.ox + 'px');
    w.style.setProperty('--oy', c.oy + 'px');
  }, []);

  const homeView = useCallback(() => {
    const c = cam.current;
    c.zoom = 1; c.cx = 340; c.cy = 230; c.ox = 0; c.oy = 0; c.tilt = c.tiltAlt ? 44 : 57;
    setCam();
  }, [setCam]);

  const focusRoom = useCallback((id: string) => {
    const r = rooms.find((x) => x.id === id);
    if (!r) return;
    const c = cam.current;
    const desktop = window.innerWidth > 860;
    c.cx = r.x + r.w / 2; c.cy = r.y + r.d / 2; c.zoom = desktop ? 1.85 : 1.5; c.tilt = c.tiltAlt ? 40 : 52;
    c.ox = desktop ? -200 : 0; c.oy = desktop ? 10 : -110;
    setCam();
  }, [rooms, setCam]);

  const selectRoom = useCallback((id: string, from?: string) => {
    if (from) returnFocusTo.current = from;
    setActive(id);
    focusRoom(id);
    worldRef.current?.classList.add(styles.focus);
    worldRef.current?.querySelectorAll<HTMLElement>(`.${styles.room}`).forEach((g) => g.classList.toggle(styles.active, g.dataset.room === id));
  }, [focusRoom]);

  const endTour = useCallback(() => {
    setTour(null);
    cancelAnimationFrame(raf.current);
  }, []);

  const closeRoom = useCallback(() => {
    setActive(null);
    worldRef.current?.classList.remove(styles.focus);
    worldRef.current?.querySelectorAll<HTMLElement>(`.${styles.room}`).forEach((g) => g.classList.remove(styles.active));
    homeView();
    endTour();
    const id = returnFocusTo.current;
    if (id) legendRef.current?.querySelector<HTMLElement>(`[data-room="${id}"]`)?.focus();
  }, [homeView, endTour]);

  /* ---- build the world once ---- */
  useLayoutEffect(() => {
    const world = worldRef.current;
    const stageEl = stageRef.current;
    if (!world || !stageEl) return;
    buildWorld(world, model, styles);
    const fit = () => {
      cam.current.base = Math.min(1, Math.max(0.42, stageEl.clientWidth / 980));
      setCam();
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [model, setCam]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  /* ---- intro drift, hash, autostart ---- */
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const c = cam.current;
    if (!reduced && !initialRoom) {
      c.spin = -70; c.zoom = 0.82; setCam();
      requestAnimationFrame(() => requestAnimationFrame(() => { c.spin = -32; c.zoom = 1; setCam(); }));
    }
    if (initialRoom && rooms.some((r) => r.id === initialRoom)) selectRoom(initialRoom);
    if (autostart === 'tour') startTour();
    if (autostart === 'path') setView('path');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- drag / keys / click ---- */
  useEffect(() => {
    const stageEl = stageRef.current;
    const world = worldRef.current;
    if (!stageEl || !world) return;
    let drag: { x: number; y: number; s: number; t: number } | null = null;
    let moved = false;
    const down = (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, s: cam.current.spin, t: cam.current.tilt }; moved = false; stageEl.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 5 && !moved) { moved = true; setDragging(true); }
      if (moved) { cam.current.spin = drag.s + dx * 0.35; cam.current.tilt = Math.max(28, Math.min(72, drag.t - dy * 0.15)); setCam(); }
    };
    const up = () => { drag = null; setDragging(false); };
    const click = (e: MouseEvent) => {
      if (moved) { moved = false; return; }
      const g = (e.target as HTMLElement).closest<HTMLElement>(`.${styles.room}`);
      if (g?.dataset.room) selectRoom(g.dataset.room, g.dataset.room);
    };
    stageEl.addEventListener('pointerdown', down);
    stageEl.addEventListener('pointermove', move);
    stageEl.addEventListener('pointerup', up);
    stageEl.addEventListener('pointercancel', up);
    world.addEventListener('click', click);
    return () => {
      stageEl.removeEventListener('pointerdown', down);
      stageEl.removeEventListener('pointermove', move);
      stageEl.removeEventListener('pointerup', up);
      stageEl.removeEventListener('pointercancel', up);
      world.removeEventListener('click', click);
    };
  }, [selectRoom, setCam]);

  const onStageKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { cam.current.spin -= 15; setCam(); }
    if (e.key === 'ArrowRight') { cam.current.spin += 15; setCam(); }
    if (e.key === 'Escape' && active) { e.preventDefault(); closeRoom(); }
  };

  /* ---- Escape closes the room from anywhere inside the experience ---- */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRoom();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, closeRoom]);

  /* ---- panel focus ---- */
  useEffect(() => {
    if (active) {
      const t = window.setTimeout(() => panelHeadingRef.current?.focus({ preventScroll: true }), reduced ? 0 : 350);
      return () => window.clearTimeout(t);
    }
  }, [active, reduced]);

  /* ---- guided tour ---- */
  const tourGo = useCallback((i: number) => {
    setTour(i);
    selectRoom(rooms[i].id);
    tourStart.current = performance.now();
    setProgress(0);
  }, [rooms, selectRoom]);

  const startTour = useCallback(() => {
    setView('explore');
    setPaused(false);
    tourGo(0);
  }, [tourGo]);

  useEffect(() => {
    if (tour === null || reduced) return;
    const f = () => {
      if (!paused) {
        const p = (performance.now() - tourStart.current) / T_MS;
        setProgress(Math.min(100, p * 100));
        if (p >= 1) {
          if (tour < rooms.length - 1) tourGo(tour + 1);
          else { endTour(); closeRoom(); }
          return;
        }
      }
      raf.current = requestAnimationFrame(f);
    };
    raf.current = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf.current);
  }, [tour, paused, reduced, rooms.length, tourGo, endTour, closeRoom]);

  /* ---- handle for the page header ---- */
  useEffect(() => {
    onHandle?.({
      explore: () => { setView('explore'); closeRoom(); cam.current.spin = -32; homeView(); stageRef.current?.focus({ preventScroll: true }); stageRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); },
      tour: () => { startTour(); stageRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); },
      path: () => setView('path'),
    });
  }, [onHandle, closeRoom, homeView, startTour, reduced]);

  const idx = room ? rooms.indexOf(room) : -1;
  const prev = idx >= 0 ? rooms[(idx + rooms.length - 1) % rooms.length] : null;
  const next = idx >= 0 ? rooms[(idx + 1) % rooms.length] : null;
  const current = model.path[stage];

  return (
    <div className={styles.root}>
      <section id="experience" hidden={view === 'path'} aria-label="Explore the center">
        <div className={`${styles.stageWrap} ${active ? styles.open : ''} ${tour !== null ? styles.touring : ''}`}>
          <div ref={stageRef} className={`${styles.stage} ${dragging ? styles.dragging : ''}`} tabIndex={0} aria-label="Interactive miniature of the center. Drag to rotate. Use arrow keys to rotate." onKeyDown={onStageKey}>
            <div ref={worldRef} className={styles.world} />
          </div>
          <div className={styles.chrome}>
            <div className={styles.badge}><i /> <span>Illustrative concept</span></div>
            <div className={styles.orbit} role="group" aria-label="View controls">
              <button type="button" aria-label="Rotate left" onClick={() => { cam.current.spin -= 45; setCam(); }}>↺</button>
              <button type="button" aria-label="Rotate right" onClick={() => { cam.current.spin += 45; setCam(); }}>↻</button>
              <button type="button" aria-label="Change viewing angle" onClick={() => { const c = cam.current; c.tiltAlt = !c.tiltAlt; c.tilt = active ? (c.tiltAlt ? 40 : 52) : (c.tiltAlt ? 44 : 57); setCam(); }}>⤴</button>
              <button type="button" aria-label="Reset view" onClick={() => { cam.current.spin = -32; cam.current.tiltAlt = false; if (active) focusRoom(active); else homeView(); }}>⌂</button>
            </div>
            <div className={styles.hint}>Drag to rotate · click any room to step inside</div>

            <aside className={styles.panel} aria-live="polite" aria-label={room ? room.name : 'Room details'}>
              {room && (
                <>
                  <div className={styles.panelHead}>
                    <span className={styles.eyebrow}><span>Environment {String(room.n).padStart(2, '0')}</span><span className={styles.dot} /><span>Illustrative</span></span>
                    <button type="button" className={styles.close} aria-label="Close" onClick={closeRoom}>✕</button>
                  </div>
                  <div className={styles.panelScroll}>
                    <div>
                      <h2 ref={panelHeadingRef} tabIndex={-1}>{room.name}</h2>
                      <p className={styles.lede} style={{ marginTop: 8 }}>{room.lede}</p>
                    </div>
                    {model.modules[room.id] && <RoomModuleView key={room.id} module={model.modules[room.id]} reduced={reduced} />}
                    <section><h3>What happens here</h3><p>{room.what}</p></section>
                    <section><h3>Skills that may be supported</h3><ul className={styles.chips}>{room.skills.map((s) => <li key={s}>{s}</li>)}</ul></section>
                    <section><h3>Why it matters day to day</h3><p>{room.why}</p></section>
                    <section><h3>Bringing it home</h3><ul>{room.home.map((s) => <li key={s}>{s}</li>)}</ul></section>
                    <section className={styles.fit}><h3>Where it fits</h3><p>{room.fit}</p><small>Every child&rsquo;s path is individualized. Rooms and skills are examples of how a program may be organized, not a required sequence.</small></section>
                    <div className={styles.person}>
                      <b>Want to see it in person?</b>
                      <div className={styles.acts}>
                        <Link href={`/request-a-tour?center=${CENTER_SLUG[model.centerId]}`} className={styles.gold}>Request a tour at {model.name}</Link>
                        <Link href={messageHref(marcie, model.centerId)} className={styles.outline}>Ask {firstName(marcie)}</Link>
                      </div>
                    </div>
                    <nav className={styles.panelNav} aria-label="Rooms">
                      {prev && <button type="button" onClick={() => selectRoom(prev.id)}>‹ {prev.short}</button>}
                      {next && <button type="button" onClick={() => selectRoom(next.id)}>{next.short} ›</button>}
                    </nav>
                  </div>
                </>
              )}
            </aside>

            <div className={styles.tourbar}>
              <div className={styles.tt}><b>{tour !== null ? rooms[tour].name : 'Guided tour'}</b><span>Stop {tour !== null ? tour + 1 : 1} of {rooms.length}</span></div>
              <div className={styles.bar}><i style={{ width: `${progress}%` }} /></div>
              <button type="button" aria-label="Previous stop" onClick={() => tour !== null && tour > 0 && tourGo(tour - 1)}>‹</button>
              {!reduced && <button type="button" aria-label={paused ? 'Resume' : 'Pause'} onClick={() => { setPaused((p) => { if (p) tourStart.current = performance.now() - (progress / 100) * T_MS; return !p; }); }}>{paused ? '▶' : '❚❚'}</button>}
              <button type="button" aria-label="Next stop" onClick={() => { if (tour === null) return; if (tour < rooms.length - 1) tourGo(tour + 1); else { endTour(); closeRoom(); } }}>›</button>
              <button type="button" className={styles.end} onClick={() => { endTour(); closeRoom(); }}>End tour</button>
            </div>
          </div>
        </div>
        <nav ref={legendRef} className={styles.legend} aria-label="Rooms">
          {rooms.map((r) => (
            <button key={r.id} type="button" data-room={r.id} aria-pressed={active === r.id} className={active === r.id ? styles.on : ''} onClick={() => selectRoom(r.id, r.id)}>
              <span className={styles.n}>{r.n}</span>{r.short}
            </button>
          ))}
        </nav>
      </section>

      <section id="path" className={styles.path} hidden={view !== 'path'} aria-label="Path to progress">
        <button type="button" className="btn-secondary self-start" onClick={() => setView('explore')}>← Back to the center</button>
        <div className={styles.pathHead}>
          <h2>Path to progress.</h2>
          <p>Five areas of growth that show up across the center. Children move between them in their own order and often work on several at once.</p>
          <p>Every path is individual. For many families it leads toward school, friendships and graduation day.</p>
        </div>
        <div className={styles.callout}><i /><div>Every child&rsquo;s program is individualized with their family and clinical team. These areas describe <em>kinds</em> of growth, not a fixed sequence, and no set of abilities is required to transition out of services.</div></div>
        <div className={styles.track}>
          {model.path.map((s, i) => (
            <button key={s.id} type="button" className={`${styles.stageCard} ${i === stage ? styles.on : ''}`} aria-pressed={i === stage} onClick={() => setStage(i)}>
              <span className={styles.num}>{i + 1}</span><h3>{s.title}</h3><p>{s.blurb}</p>
            </button>
          ))}
        </div>
        <div className={styles.detail} aria-live="polite">
          <div>
            <div className={styles.title}>{current.title}</div>
            <h4>What it may look like</h4>
            <p>{current.looks}</p>
            <p style={{ marginTop: 12, color: 'var(--fg-2)', fontSize: 14 }}>Children often work in several of these areas at once, and the order varies by child.</p>
            {current.graduation && (
              <p className={styles.grad}>
                Where it can lead: school, friendships and <Link href="/#hero">graduation day</Link>.
              </p>
            )}
          </div>
          <div><h4>Example skills</h4><ul>{current.skills.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div>
            <h4>Often practiced in</h4>
            <div className={styles.rooms}>
              {current.rooms.map((id) => { const r = rooms.find((x) => x.id === id)!; return <button key={id} type="button" onClick={() => { setView('explore'); selectRoom(id, id); }}>{r.n} · {r.short}</button>; })}
            </div>
            <h4 style={{ marginTop: 16 }}>Families can</h4>
            <p>{current.family}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
