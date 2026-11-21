'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { steps, type Step } from '@/data/steps';
import styles from './StepStage.module.css';

const LAST = steps.length - 1;
/** Must match the "Pinned" media query in the stylesheet. */
const PIN = '(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)';
const NAV = 80;

const facts = (s: Step) => [
  { k: 'Who you meet', v: s.whoYouMeet },
  { k: 'How long', v: s.howLong, note: s.howLongVerified ? undefined : 'typical, to confirm' },
  { k: 'What to bring', v: s.whatToBring },
  { k: 'What happens next', v: s.whatsNext },
];
const two = (n: number) => String(n).padStart(2, '0');

/**
 * Getting Started as one stage.
 *
 * Laptop: the stage is pinned for a stretch of the page. Scrolling through that stretch advances
 * the five steps; so do the five dots, the two arrow buttons and the Left and Right arrow keys.
 * With reduced motion, or on a very short window, nothing is pinned and the same stage works as
 * plain tabs. Phone: five snap cards to swipe, with dots.
 * All five steps are in the page at all times, so nothing depends on scrolling to be read.
 */
export function StepStage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [pin, setPin] = useState(false);
  const activeRef = useRef(0);
  activeRef.current = active;

  useEffect(() => {
    const mq = window.matchMedia(PIN);
    const on = () => setPin(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Pinned: the step follows the scroll position, and the line fills smoothly with it.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: [`start ${NAV}px`, 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (pin) setActive(Math.round(p * LAST));
  });
  const scrollFill = useSpring(scrollYProgress, { stiffness: 160, damping: 32, mass: 0.4 });
  // Not pinned: the line moves to the chosen step.
  const tabFill = useMotionValue(0);
  useEffect(() => {
    if (pin) return;
    const controls = animate(tabFill, active / LAST, { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [active, pin, tabFill]);

  useEffect(() => setDrawer(false), [active]);

  const go = useCallback(
    (i: number, focusTab = false) => {
      const to = Math.max(0, Math.min(LAST, i));
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        const card = scrollerRef.current?.children[to] as HTMLElement | undefined;
        if (card && scrollerRef.current) scrollerRef.current.scrollTo({ left: card.offsetLeft - scrollerRef.current.offsetLeft - parseFloat(getComputedStyle(scrollerRef.current).paddingLeft), behavior: calm ? 'auto' : 'smooth' });
        setActive(to);
        return;
      }
      const track = trackRef.current;
      const stage = stageRef.current;
      if (pin && track && stage) {
        const stepPx = (track.offsetHeight - stage.offsetHeight) / LAST;
        window.scrollTo({ top: Math.round(track.getBoundingClientRect().top + window.scrollY - NAV + to * stepPx), behavior: 'smooth' });
      } else setActive(to);
      if (focusTab) tabRefs.current[to]?.focus({ preventScroll: true });
    },
    [pin],
  );

  // Left and Right arrow keys, while the stage is on screen and the reader is not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const r = stageRef.current?.getBoundingClientRect();
      if (!r || r.bottom < window.innerHeight * 0.5 || r.top > window.innerHeight * 0.5) return;
      e.preventDefault();
      go(activeRef.current + (e.key === 'ArrowRight' ? 1 : -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  // A link such as /getting-started#tour opens that step.
  useEffect(() => {
    const open = () => {
      const i = steps.findIndex((s) => `#${s.slug}` === window.location.hash);
      if (i < 0) return;
      if (!window.matchMedia(PIN).matches) trackRef.current?.scrollIntoView({ block: 'start' });
      window.requestAnimationFrame(() => go(i));
    };
    const t = window.setTimeout(open, 60);
    window.addEventListener('hashchange', open);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('hashchange', open);
    };
  }, [go]);

  // Phone: the dots follow the card that is on screen.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (window.matchMedia('(min-width: 1024px)').matches) return;
        entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i)));
      },
      { root, threshold: 0.6 },
    );
    Array.from(root.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const onTabKey = (e: React.KeyboardEvent) => {
    const k = e.key;
    const to = k === 'ArrowDown' || k === 'ArrowRight' ? active + 1 : k === 'ArrowUp' || k === 'ArrowLeft' ? active - 1 : k === 'Home' ? 0 : k === 'End' ? LAST : null;
    if (to === null) return;
    e.preventDefault();
    e.stopPropagation();
    go(to, true);
  };

  const step = steps[active] ?? steps[0];

  return (
    <section className={styles.section} aria-labelledby="gs-title">
      <div ref={trackRef} className={styles.track}>
        <div ref={stageRef} className={styles.stage}>
          <div className={`wrap ${styles.inner}`}>
            <header className={styles.head}>
              <div>
                <p className={styles.eyebrow}>Getting started</p>
                <h1 id="gs-title" className={styles.h1}>
                  From first worry to <em>first day.</em>
                </h1>
              </div>
              <p className={styles.lede}>Nobody should have to guess what happens next. Here is every step, who you meet, what to bring, and how long it usually takes.</p>
            </header>

            {/* Laptop */}
            <div className={styles.main}>
              <div className={styles.rail}>
                <span className={styles.railLine} aria-hidden="true">
                  <motion.span className={styles.railFill} style={{ scaleY: pin ? scrollFill : tabFill }} />
                </span>
                <div className={styles.dots} role="tablist" aria-label="The five steps from first worry to first day" aria-orientation="vertical" onKeyDown={onTabKey}>
                  {steps.map((s, i) => (
                    <button
                      key={s.slug}
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`gs-tab-${i}`}
                      aria-selected={i === active}
                      aria-controls={`gs-panel-${i}`}
                      aria-label={`Step ${s.n}: ${s.title}`}
                      tabIndex={i === active ? 0 : -1}
                      data-done={i < active}
                      className={styles.dot}
                      onClick={() => go(i)}
                    >
                      {s.n}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.arch} aria-hidden="true">
                <span className={styles.archGlow} />
                <p className={styles.archLabel}>Step</p>
                <p className={styles.num}>
                  <span>0</span>
                  <span className={styles.reel}>
                    <span className={styles.reelInner} style={{ transform: `translateY(${(-active * 100) / steps.length}%)` }}>
                      {steps.map((s) => (
                        <span key={s.slug}>{s.n}</span>
                      ))}
                    </span>
                  </span>
                </p>
                <div className={styles.doorway}>
                  <span className={styles.light} />
                  <span className={styles.leaf} style={{ transform: `scaleX(${0.92 - (active / LAST) * 0.8})` }} />
                </div>
              </div>

              <div className={styles.right}>
                <div className={styles.panels}>
                  {steps.map((s, i) => {
                    const on = i === active;
                    return (
                      <div key={s.slug} role="tabpanel" id={`gs-panel-${i}`} aria-labelledby={`gs-tab-${i}`} inert={!on || undefined} data-on={on} data-dir={i < active ? 'before' : 'after'} className={styles.panel}>
                        <p className={styles.kicker}>
                          Step {s.n} of {steps.length}
                        </p>
                        <h2 className={styles.title}>{s.title}</h2>
                        <p className={styles.short}>{s.short}</p>
                        <div className={styles.tilesWrap}>
                          <dl className={styles.tiles}>
                            {facts(s).map((f, j) => (
                              <div key={f.k} className={styles.tile} style={{ ['--i' as string]: j }}>
                                <dt>
                                  {f.k}
                                  {f.note && <span>({f.note})</span>}
                                </dt>
                                <dd>{f.v}</dd>
                              </div>
                            ))}
                          </dl>
                          <div id={`gs-drawer-${i}`} className={styles.drawer} data-open={on && drawer} inert={!(on && drawer) || undefined}>
                            <p className={styles.drawerTitle}>What happens in this step</p>
                            <ul>
                              {s.whatHappens.map((w) => (
                                <li key={w}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.controls}>
                  <button type="button" className={styles.drawerBtn} aria-expanded={drawer} aria-controls={`gs-drawer-${active}`} onClick={() => setDrawer((v) => !v)}>
                    What happens in this step <ChevronUp aria-hidden="true" />
                  </button>
                  <p className={styles.hint}>{pin ? 'Scroll, or use the dots and arrow keys' : 'Use the dots or the arrow keys'}</p>
                  <div className={styles.arrows}>
                    <button type="button" className={styles.ctl} aria-label="Previous step" disabled={active === 0} onClick={() => go(active - 1)}>
                      <ArrowLeft aria-hidden="true" />
                    </button>
                    <button type="button" className={styles.ctl} aria-label="Next step" disabled={active === LAST} onClick={() => go(active + 1)}>
                      <ArrowRight aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className={styles.swipe}>
              <div ref={scrollerRef} className={styles.scroller} role="group" aria-roledescription="carousel" aria-label="The five steps from first worry to first day. Swipe to move between them." tabIndex={0}>
                {steps.map((s, i) => (
                  <article key={s.slug} data-i={i} className={styles.card} aria-label={`Step ${s.n} of ${steps.length}: ${s.title}`}>
                    <p className={styles.cardNo}>
                      <span className={styles.cardNum} aria-hidden="true">
                        {two(s.n)}
                      </span>
                      Step {s.n} of {steps.length}
                    </p>
                    <h2>{s.title}</h2>
                    <p className={styles.cardShort}>{s.short}</p>
                    <dl className={styles.cardFacts}>
                      {facts(s).map((f) => (
                        <div key={f.k}>
                          <dt>
                            {f.k}
                            {f.note && <span>({f.note})</span>}
                          </dt>
                          <dd>{f.v}</dd>
                        </div>
                      ))}
                    </dl>
                    <details className={styles.cardDrawer}>
                      <summary>
                        What happens in this step <ChevronDown aria-hidden="true" />
                      </summary>
                      <ul>
                        {s.whatHappens.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </details>
                  </article>
                ))}
              </div>
              <div className={styles.swipeDots}>
                {steps.map((s, i) => (
                  <button key={s.slug} type="button" className={styles.swipeDot} aria-label={`Go to step ${s.n}: ${s.title}`} aria-current={i === active ? 'step' : undefined} onClick={() => go(i)} />
                ))}
              </div>
            </div>

            <p className="sr-only" role="status">
              Step {step.n} of {steps.length}: {step.title}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
