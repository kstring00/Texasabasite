'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CENTER_NAME, firstName, getBestContact, getPeopleForCenter, hasNamedTeam, visiblePeople, type Person, type Topic } from '@/data/people';
import { useMyCenter } from '@/lib/site/myCenter';
import { Avatar } from './Avatar';
import { PersonCard } from './PersonCard';
import { CenterPill } from './CenterPill';
import styles from './WhoToContact.module.css';

const TOPICS: { topic: Topic; label: string; sub: string }[] = [
  { topic: 'tour', label: 'Start services or book a tour', sub: 'Tours, first steps, what to bring' },
  { topic: 'insurance', label: 'Ask about insurance or cost', sub: 'Benefits, authorizations, what you may owe' },
  { topic: 'clinical', label: 'Talk about my child’s program or goals', sub: 'The plan, progress, the BCBA team' },
  { topic: 'scheduling', label: 'Change a schedule or ask about sessions', sub: 'Days, times, day-to-day logistics' },
  { topic: 'escalation', label: 'Share feedback or get help with something unresolved', sub: 'When you need someone senior' },
  { topic: 'start', label: 'I’m not sure', sub: 'That is fine. Start with Marcie.' },
];

const METROS: { label: string; ids: string[] }[] = [
  { label: 'HOUSTON', ids: ['pearland', 'sugarland', 'katy'] },
  { label: 'DALLAS–FORT WORTH', ids: ['plano', 'cedarhill'] },
  { label: 'AUSTIN', ids: ['austin'] },
];

type Props = {
  /** Preselect a center (e.g. on a center page). Falls back to the remembered center. */
  centerId?: string | null;
  /** Where this instance lives, for analytics. */
  place: string;
  /** Hide the section header (when the host page already has one). */
  hideHeader?: boolean;
  onCenterPicker?: () => void;
};

/**
 * The branching router: what do you need → which center → the right person.
 * Radio-group pattern per step, arrow keys move between options, result is aria-live and takes focus.
 */
export function WhoToContact({ centerId: preset, place, hideHeader, onCenterPicker }: Props) {
  const { centerId: mine, setCenter } = useMyCenter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const centerId = preset ?? picked ?? mine ?? null;
  const needCenter = topic !== null && !centerId;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const groupId = useId();

  useEffect(() => {
    if (topic && centerId) {
      setPerson(getBestContact(topic, centerId));
    } else if (topic && !centerId && topic === 'start') {
      setPerson(getBestContact('start', null));
    }
  }, [topic, centerId]);

  useEffect(() => {
    if (person) headingRef.current?.focus({ preventScroll: true });
  }, [person]);

  const reset = () => {
    setTopic(null);
    setPicked(null);
    setPerson(null);
  };

  const team = person ? getPeopleForCenter(centerId).filter((p) => p.id !== person.id) : [];

  return (
    <section aria-labelledby={`${groupId}-title`} className="min-w-0">
      {!hideHeader && (
        <header className="mb-6 max-w-3xl">
          <p className="eyebrow">Who to contact</p>
          <h2 id={`${groupId}-title`} className="h2 mt-3">Tell us what you need. We&rsquo;ll point you to the right person.</h2>
        </header>
      )}
      {hideHeader && <h2 id={`${groupId}-title`} className="sr-only">Who to contact</h2>}

      {centerId && !person && (
        <div className="mb-4">
          <CenterPill centerId={centerId} onChange={onCenterPicker ?? (() => setCenter(null))} />
        </div>
      )}

      {!person && !needCenter && (
        <RadioRows
          label="I want to…"
          options={TOPICS.map((t) => ({ id: t.topic, label: t.label, sub: t.sub }))}
          value={topic}
          onChange={(id) => setTopic(id as Topic)}
        />
      )}

      {needCenter && !person && (
        <div className={styles.fade}>
          <p className="mb-2 font-sans text-[length:var(--t-sm)] font-semibold text-ink">Which center?</p>
          <RadioRows
            label="Which center?"
            grouped={METROS.map((m) => ({ label: m.label, options: m.ids.map((id) => ({ id, label: CENTER_NAME[id] })) }))}
            value={picked}
            onChange={(id) => {
              setPicked(id);
              setCenter(id);
            }}
          />
          <button type="button" className="mt-4 font-sans text-[14px] font-semibold text-soft underline-offset-4 hover:underline" onClick={reset}>
            Start over
          </button>
        </div>
      )}

      {person && (
        <div className={styles.fade} aria-live="polite">
          <h3 ref={headingRef} tabIndex={-1} className="mb-4 font-sans text-[length:var(--t-base)] text-body outline-none">
            {topic === 'start' ? 'Start here:' : `For that, talk to ${firstName(person)}:`}
          </h3>
          <PersonCard person={person} centerId={centerId} place={place} headingTag="p" />
          {centerId && !hasNamedTeam(centerId) && <p className="mt-3 font-sans text-[14px] text-soft">Your center team will introduce themselves at your tour.</p>}
          {team.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-sans text-[14px] text-soft">Also on your team:</span>
              {team.map((p) => (
                <button key={p.id} type="button" onClick={() => setPerson(p)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-2 py-1 pr-3 font-sans text-[14px] font-semibold text-ink transition hover:border-ink">
                  <Avatar person={p} size={28} /> {p.name}
                </button>
              ))}
            </div>
          )}
          {!centerId && (
            <p className="mt-3 font-sans text-[14px] text-soft">
              <Link href="/#locations" className="font-semibold text-ink underline-offset-4 hover:underline">
                Pick your center
              </Link>{' '}
              to see your team.
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button type="button" className="font-sans text-[14px] font-semibold text-soft underline-offset-4 hover:underline" onClick={reset}>
              Start over
            </button>
            {centerId && <CenterPill centerId={centerId} onChange={onCenterPicker ?? (() => { setCenter(null); setPicked(null); setPerson(null); })} />}
          </div>
        </div>
      )}
      <p className="sr-only">{visiblePeople.length} people available.</p>
    </section>
  );
}

type Opt = { id: string; label: string; sub?: string };

function RadioRows({ label, options, grouped, value, onChange }: { label: string; options?: Opt[]; grouped?: { label: string; options: Opt[] }[]; value: string | null; onChange: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const all = grouped ? grouped.flatMap((g) => g.options) : (options ?? []);

  const onKey = (e: KeyboardEvent) => {
    const keys = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const btns = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role=radio]') ?? []);
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? btns.length - 1 : (i + dir + btns.length) % btns.length;
    btns[n].focus();
  };

  const row = (o: Opt, i: number) => (
    <li key={o.id}>
      <button
        type="button"
        role="radio"
        aria-checked={value === o.id}
        tabIndex={value === o.id || (value === null && i === 0) ? 0 : -1}
        className={`${styles.row} ${value === o.id ? styles.on : ''} ${styles.fade}`}
        style={{ animationDelay: `${i * 40}ms` }}
        onClick={() => onChange(o.id)}
      >
        <span className={styles.pip} aria-hidden="true" />
        <span>
          <span className={styles.nm}>{o.label}</span>
          {o.sub && <span className={styles.sub}>{o.sub}</span>}
        </span>
        <span className={styles.go}>
          <ArrowUpRight aria-hidden />
        </span>
      </button>
    </li>
  );

  return (
    <div ref={ref} role="radiogroup" aria-label={label} className={styles.rows} onKeyDown={onKey}>
      {grouped
        ? grouped.map((g) => (
            <div key={g.label}>
              <p className={styles.metro}>{g.label}</p>
              <ul className="m-0 list-none p-0">{g.options.map((o) => row(o, all.indexOf(o)))}</ul>
            </div>
          ))
        : <ul className="m-0 list-none p-0">{all.map(row)}</ul>}
    </div>
  );
}
