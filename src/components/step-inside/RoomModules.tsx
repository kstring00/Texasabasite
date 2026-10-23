'use client';

import { useEffect, useRef, useState } from 'react';
import type { RoomModule } from '@/data/centerModels';
import styles from './StepInside.module.css';

/** The interactive module at the top of a room panel. Copy is HTML from the model file (trusted, local). */
export function RoomModuleView({ module: m, reduced }: { module: RoomModule; reduced: boolean }) {
  if (m.kind === 'stepper') return <Stepper m={m} reduced={reduced} />;
  if (m.kind === 'moments') return <Moments m={m} />;
  if (m.kind === 'routine') return <Routine m={m} />;
  return (
    <div className={styles.module}>
      <div className={styles.mh}><b>{m.title}</b><span>{m.note}</span></div>
      <div className={styles.cards3}>
        {m.cards.map((c) => (
          <div key={c.title}><b>{c.title}</b>{c.text}</div>
        ))}
      </div>
    </div>
  );
}

function Stepper({ m, reduced }: { m: Extract<RoomModule, { kind: 'stepper' }>; reduced: boolean }) {
  const [s, setS] = useState(0);
  const [auto, setAuto] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!auto) return;
    timer.current = window.setInterval(() => {
      setS((v) => {
        const n = (v + 1) % m.steps.length;
        if (n === 0) setAuto(false);
        return n;
      });
    }, reduced ? 3000 : 1800);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [auto, m.steps.length, reduced]);
  return (
    <div className={styles.module}>
      <div className={styles.mh}><b>{m.title}</b><span>{m.note}</span></div>
      <div className={styles.trial} role="list">
        {m.steps.map((st, i) => (
          <div key={st.label} role="listitem" className={`${styles.st} ${i === s ? styles.on : ''}`} aria-current={i === s ? 'step' : undefined}>
            <em>{st.label}</em>{st.sub}
          </div>
        ))}
      </div>
      <div className={styles.scene} aria-live="polite" dangerouslySetInnerHTML={{ __html: m.steps[s].text }} />
      <div className={styles.mrow}>
        <button type="button" className={`${styles.mbtn} ${styles.primary}`} onClick={() => setS((v) => (v + 1) % m.steps.length)}>Next step</button>
        <button type="button" className={styles.mbtn} onClick={() => { if (auto) setAuto(false); else { setS(0); setAuto(true); } }}>{auto ? 'Stop' : 'Play the trial'}</button>
      </div>
    </div>
  );
}

function Moments({ m }: { m: Extract<RoomModule, { kind: 'moments' }> }) {
  const [k, setK] = useState(0);
  return (
    <div className={styles.module}>
      <div className={styles.mh}><b>{m.title}</b><span>{m.note}</span></div>
      <div className={styles.mrow} role="tablist" aria-label={m.title}>
        {m.moments.map((mo, i) => (
          <button key={mo.label} type="button" role="tab" aria-selected={i === k} className={`${styles.mbtn} ${i === k ? styles.on : ''}`} onClick={() => setK(i)}>{mo.label}</button>
        ))}
      </div>
      <div className={styles.scene} role="tabpanel" dangerouslySetInnerHTML={{ __html: m.moments[k].text }} />
    </div>
  );
}

function Routine({ m }: { m: Extract<RoomModule, { kind: 'routine' }> }) {
  const [done, setDone] = useState<boolean[]>(() => m.steps.map(() => false));
  const [level, setLevel] = useState(0);
  const n = done.filter(Boolean).length;
  return (
    <div className={styles.module}>
      <div className={styles.mh}><b>{m.title}</b><span>{m.note}</span></div>
      <div className={styles.steps}>
        {m.steps.map((st, i) => (
          <label key={st} className={done[i] ? styles.done : ''}>
            <input type="checkbox" checked={done[i]} onChange={(e) => setDone((d) => d.map((v, j) => (j === i ? e.target.checked : v)))} /> {st}
          </label>
        ))}
      </div>
      <div className={styles.bar} role="progressbar" aria-valuemin={0} aria-valuemax={m.steps.length} aria-valuenow={n} aria-label="Steps learned"><i style={{ width: `${(n / m.steps.length) * 100}%` }} /></div>
      {m.fading && (
        <>
          <div className={styles.mh} style={{ marginTop: 4 }}><b>{m.fading.title}</b><span>{m.fading.note}</span></div>
          <div className={styles.seg} role="tablist" aria-label={m.fading.title}>
            {m.fading.levels.map((l, i) => (
              <button key={l.label} type="button" role="tab" aria-selected={i === level} className={i === level ? styles.on : ''} onClick={() => setLevel(i)}>{l.label}</button>
            ))}
          </div>
          <div className={styles.scene} role="tabpanel" dangerouslySetInnerHTML={{ __html: m.fading.levels[level].text }} />
        </>
      )}
    </div>
  );
}
