'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ClipboardList, HeartHandshake, Phone, ShieldCheck, Stethoscope } from 'lucide-react';
import { site } from '@/data/site';
import { CENTER_NAME, HOUSTON_CENTERS, firstName, initials, visiblePeople, type Person } from '@/data/people';
import { useMyCenter } from '@/lib/site/myCenter';
import { track } from '@/lib/site/analytics';
import styles from './CareMap.module.css';

type NodeDef = { id: string; parent?: string; dashed?: boolean; first?: boolean; avatar: ReactNode; avatarClass: string; name: string; title: string; job: string; person?: Person; detailTitle?: string };
type TierDef = { n: string; stage: string; when: string; nodes: NodeDef[] };

const CENTER_ORDER = ['pearland', 'sugarland', 'katy', 'plano', 'cedarhill', 'austin'];
const byId = (id: string) => visiblePeople.find((p) => p.id === id) as Person;

/** Who is responsible for a family at each point, for one center. Real names only; roles otherwise. */
function tiersFor(centerId: string): TierDef[] {
  const houston = HOUSTON_CENTERS.includes(centerId);
  const marcie = byId('marcie');
  const cd = visiblePeople.find((p) => p.title === 'Clinical Director' && p.centers.includes(centerId));
  const ops = houston ? byId('jaden') : null;
  const red = houston ? byId('dom') : null;
  // TODO: confirm the "at this point" lines with the clinical team.
  return [
    { n: '01', stage: 'First call', when: 'Day one', nodes: [
      { id: 'marcie', first: true, person: marcie, avatar: initials(marcie), avatarClass: styles.avGold, name: marcie.name, title: marcie.title, job: 'Answers your first call, books your tour, checks your insurance, and stays your point of contact.' },
    ] },
    { n: '02', stage: 'Evaluation', when: 'If your child needs one', nodes: [
      cd
        ? { id: 'cd', parent: 'marcie', person: cd, avatar: initials(cd), avatarClass: styles.avBlue, name: cd.name, title: 'Clinical Director', detailTitle: `Clinical Director · ${cd.centers.map((c) => CENTER_NAME[c]).join(' & ')}`, job: 'Leads clinical care at your center: the evaluation, your child’s program and the BCBA team.' }
        : { id: 'cd', parent: 'marcie', avatar: <Stethoscope aria-hidden />, avatarClass: styles.avRole, name: 'Your Clinical Director', title: 'Introduced at your tour', job: 'Leads clinical care at your center: the evaluation, your child’s program and the BCBA team.' },
    ] },
    { n: '03', stage: 'The plan', when: 'Before therapy starts', nodes: [
      { id: 'bcba', parent: 'cd', avatar: <ClipboardList aria-hidden />, avatarClass: styles.avRole, name: 'Your child’s BCBA', title: 'Board Certified Behavior Analyst', job: 'Writes the plan with you, sets the first goals, and supervises every session.' },
    ] },
    { n: '04', stage: 'Every session', when: 'Week to week', nodes: [
      { id: 'rbt', parent: 'bcba', avatar: <HeartHandshake aria-hidden />, avatarClass: styles.avRole, name: 'Your child’s RBT', title: 'Registered Behavior Technician', job: 'In the room with your child, session by session. The person they’ll know best.' },
      ...(ops ? [{ id: 'ops', parent: 'bcba', person: ops, avatar: initials(ops), avatarClass: styles.avBlue, name: ops.name, title: ops.title, job: 'Keeps the schedule running: session times, changes and day-to-day logistics.' }] : []),
    ] },
    { n: '05', stage: 'If something’s off', when: 'Anytime', nodes: [
      red
        ? { id: 'red', parent: 'rbt', dashed: true, person: red, avatar: initials(red), avatarClass: styles.avBlue, name: red.name, title: red.title, job: 'Oversees the Houston-area centers. Steps in when something isn’t resolved.' }
        : { id: 'red', parent: 'rbt', dashed: true, avatar: <ShieldCheck aria-hidden />, avatarClass: styles.avRole, name: 'Center leadership', title: 'Your center’s director', job: 'Steps in when something isn’t resolved. Start with Marcie and she’ll connect you.' },
    ] },
  ];
}

type Path = { id: string; to: string; d: string; dashed?: boolean };

/**
 * The care map. A top-down tree: who you call first, who takes over at each stage, and what
 * each person does at that point. Lines are hand-offs, not reporting lines. Light beams travel
 * down the hand-offs; hovering or focusing a person lights the path from the first call to them.
 */
export function CareMap() {
  const { centerId: mine, setCenter } = useMyCenter();
  const [centerId, setCenterId] = useState<string>('pearland');
  useEffect(() => {
    if (mine) setCenterId(mine);
  }, [mine]);
  const tiers = useMemo(() => tiersFor(centerId), [centerId]);
  const parents = useMemo(() => Object.fromEntries(tiers.flatMap((t) => t.nodes).map((n) => [n.id, n.parent])), [tiers]);

  const treeRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [inView, setInView] = useState(false);
  const [pinned, setPinned] = useState('marcie');
  const [hover, setHover] = useState<string | null>(null);
  const active = hover ?? pinned;

  const measure = useCallback(() => {
    const tree = treeRef.current;
    if (!tree) return;
    const t = tree.getBoundingClientRect();
    const rect = (id: string) => tree.querySelector<HTMLElement>(`[data-node="${id}"]`)?.getBoundingClientRect();
    const out: Path[] = [];
    tiers.flatMap((tier) => tier.nodes).forEach((n) => {
      if (!n.parent) return;
      const a = rect(n.parent);
      const b = rect(n.id);
      if (!a || !b) return;
      const x1 = a.left + a.width / 2 - t.left;
      const y1 = a.bottom - t.top;
      const x2 = b.left + b.width / 2 - t.left;
      const y2 = b.top - t.top;
      const my = (y1 + y2) / 2;
      out.push({ id: `${n.parent}-${n.id}`, to: n.id, dashed: n.dashed, d: `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}` });
    });
    setBox({ w: t.width, h: t.height });
    setPaths(out);
  }, [tiers]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (treeRef.current) ro.observe(treeRef.current);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const el = treeRef.current;
    if (!el) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && (setInView(true), io.disconnect()), { threshold: 0.15 });
    io.observe(el);
    const safety = window.setTimeout(() => setInView(true), 3500);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  // Everything on the route from the first call to the active person.
  const lit = useMemo(() => {
    const s = new Set<string>();
    let cur: string | null = active;
    while (cur) {
      s.add(cur);
      cur = parents[cur] ?? null;
    }
    return s;
  }, [active, parents]);

  const pick = (id: string) => {
    setCenterId(id);
    setCenter(id);
  };
  const flat = tiers.flatMap((t) => t.nodes.map((n) => ({ ...n, tier: t })));
  const current = flat.find((n) => n.id === active) ?? flat[0];

  let order = 0;
  return (
    <section className={styles.section} aria-labelledby="care-map-title">
      <div className="wrap">
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Who&rsquo;s with you</p>
            <h2 id="care-map-title" className={styles.h2}>
              A name at every step, <em>not</em> a call center.
            </h2>
            <p className={styles.lede}>From the first call to the hundredth session, here is who is responsible for your child at each point, and what they do there.</p>
          </div>
          <div className={styles.centers}>
            <span className={styles.centersLabel} id="care-map-center">Showing the team at</span>
            <div className={styles.chips} role="radiogroup" aria-labelledby="care-map-center">
              {CENTER_ORDER.map((id) => (
                <button key={id} type="button" role="radio" aria-checked={centerId === id} className={styles.chip} onClick={() => pick(id)}>
                  {CENTER_NAME[id]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.body}>
        <div ref={treeRef} className={`${styles.tree} ${inView ? styles.in : ''}`}>
          <svg className={styles.svg} viewBox={`0 0 ${box.w || 1} ${box.h || 1}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="cm-beam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgb(242 207 104)" stopOpacity="0" />
                <stop offset="0.5" stopColor="rgb(242 207 104)" stopOpacity="1" />
                <stop offset="1" stopColor="rgb(77 104 255)" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {paths.map((p, i) => (
              <g key={p.id}>
                <path d={p.d} pathLength={1} className={`${styles.base} ${p.dashed ? styles.dashed : ''} ${lit.has(p.to) ? styles.lit : ''}`} style={{ transitionDelay: p.dashed ? undefined : `${200 + i * 140}ms` }} />
                {!p.dashed && <path d={p.d} pathLength={1} className={styles.beam} style={{ animationDelay: `${1.2 + i * 0.55}s` }} />}
              </g>
            ))}
          </svg>

          {tiers.map((tier) => (
            <div key={tier.n} className={styles.tier}>
              <div className={styles.stage} style={{ transitionDelay: `${order * 90}ms` }}>
                <span className={styles.stageNum}>{tier.n}</span>
                <span className={styles.stageName}>{tier.stage}</span>
                <span className={styles.stageWhen}>{tier.when}</span>
              </div>
              <ul className={`${styles.nodes} m-0 list-none p-0`}>
                {tier.nodes.map((n) => {
                  const delay = 120 + order++ * 120;
                  return (
                    <li key={n.id + centerId} className="contents">
                      <button
                        type="button"
                        data-node={n.id}
                        aria-pressed={pinned === n.id}
                        aria-controls="care-map-detail"
                        className={`${styles.node} ${lit.has(n.id) ? styles.lit : ''} ${active === n.id ? styles.on : ''}`}
                        style={{ transitionDelay: `${delay}ms` }}
                        onClick={() => setPinned(n.id)}
                        onMouseEnter={() => setHover(n.id)}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setPinned(n.id)}
                      >
                        {n.first && <span className={styles.firstTag}>Start here</span>}
                        <span className={`${styles.av} ${n.avatarClass}`} aria-hidden="true">{n.avatar}</span>
                        <span className={styles.name}>{n.name}</span>
                        <span className={styles.title}>{n.title}</span>
                        <span className={styles.jobInline}>{n.job}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <aside id="care-map-detail" className={styles.detail} aria-live="polite" aria-label="At this point">
          <div key={current.id + centerId} className={`${styles.swap} flex flex-1 flex-col`}>
            <p className={styles.dStage}>
              {current.tier.n} · {current.tier.stage}
            </p>
            <span className={`${styles.dAv} ${current.avatarClass}`} aria-hidden="true">{current.avatar}</span>
            <p className={styles.dName}>{current.name}</p>
            <p className={styles.dTitle}>{current.detailTitle ?? current.title}</p>
            <p className={styles.dLabel}>{current.tier.when} · their job</p>
            <p className={styles.dJob}>{current.job}</p>
            <div className={styles.dCall}>
              <a href={`tel:${site.phone.tel}`} onClick={() => track({ name: 'call_tap', center: centerId, place: `care-map-${current.id}` })}>
                <Phone aria-hidden /> {current.person ? `Call · ask for ${firstName(current.person)}` : `Call ${site.phone.display}`}
              </a>
            </div>
          </div>
        </aside>
        </div>

        <div className={styles.foot}>
          <div>
            <p className={styles.footText}>
              Every name answers the same line.{' '}
              <a href={`tel:${site.phone.tel}`} onClick={() => track({ name: 'call_tap', center: centerId, place: 'care-map' })}>
                Call {site.phone.display}
              </a>{' '}
              and ask for anyone by name.
            </p>
            <p className={styles.note}>Lines show who hands you to whom, not who reports to whom. {HOUSTON_CENTERS.includes(centerId) ? '' : 'Names for this center are shared at your tour.'}</p>
          </div>
          <div className={styles.footLinks}>
            <Link href="/contact#who">
              Who should I contact? <ArrowUpRight aria-hidden />
            </Link>
            <Link href="/team">
              Meet the team <ArrowUpRight aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
