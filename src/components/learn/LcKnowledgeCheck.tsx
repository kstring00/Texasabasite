'use client';

import { useEffect, useRef, useState } from 'react';
import { CircleCheck, Undo2 } from 'lucide-react';
import type { LcKnowledgeCheck as Check } from '@/lib/learn/manifest';

/**
 * A knowledge check. It teaches; it does not grade. Every choice has its own reviewed feedback,
 * there is no score, no limit on tries, and it never blocks the Next button.
 */
export function LcKnowledgeCheck({ step, saved, onAnswer }: { step: Check; saved: string[]; onAnswer: (ids: string[]) => void }) {
  const [picked, setPicked] = useState<string[]>(saved);
  const [checked, setChecked] = useState(false);
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    setPicked(saved);
    setChecked(false);
    setNudge(false);
    // Only when the step itself changes; `saved` is this step's stored answer at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  // On a phone the feedback can land below the fold, so bring it into view once it appears.
  const liveRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (checked || nudge) liveRef.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [checked, nudge]);

  const multiple = step.mode === 'multiple';
  const toggle = (id: string) => {
    const next = multiple ? (picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]) : [id];
    setPicked(next);
    setChecked(false);
    setNudge(false);
    onAnswer(next);
  };
  const shown = checked ? step.choices.filter((c) => picked.includes(c.id)) : [];
  const missed = checked && multiple && shown.every((c) => c.correct) && step.choices.some((c) => c.correct && !picked.includes(c.id));

  return (
    <div className="lc-kc">
      <fieldset className="lc-kc-set">
        <legend className="lc-kc-question">{step.question}</legend>
        <div className="lc-kc-options">
          {step.choices.map((c) => (
            <label key={c.id} className="lc-kc-option" data-picked={picked.includes(c.id) ? '' : undefined}>
              <input type={multiple ? 'checkbox' : 'radio'} name={step.id} value={c.id} checked={picked.includes(c.id)} onChange={() => toggle(c.id)} />
              <span>{c.text}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="lc-kc-actions">
        <button
          type="button"
          className="lc-btn lc-btn-secondary"
          onClick={() => {
            if (picked.length === 0) setNudge(true);
            else setChecked(true);
          }}
        >
          Check my answer
        </button>
        <p className="lc-muted">There is no score. You can try as many times as you like, or move on.</p>
      </div>
      <div aria-live="polite" className="lc-kc-live" ref={liveRef}>
        {nudge ? <p className="lc-feedback" data-kind="retry"><Undo2 width={22} height={22} strokeWidth={1.75} aria-hidden="true" /><span>Choose an answer first, then check it.</span></p> : null}
        {shown.map((c) => (
          <p key={c.id} className="lc-feedback" data-kind={c.correct ? 'right' : 'retry'}>
            {c.correct ? <CircleCheck width={22} height={22} strokeWidth={1.75} aria-hidden="true" /> : <Undo2 width={22} height={22} strokeWidth={1.75} aria-hidden="true" />}
            <span>
              {multiple ? <strong>{c.text}. </strong> : null}
              {c.feedback}
            </span>
          </p>
        ))}
        {missed ? (
          <p className="lc-feedback" data-kind="retry">
            <Undo2 width={22} height={22} strokeWidth={1.75} aria-hidden="true" />
            <span>Those fit. There is at least one more to find. You can try again.</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
