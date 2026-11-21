'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert, Save } from 'lucide-react';
import { saveReportAction, type LcTrainingState } from '@/app/learn/staff/trainingActions';
import type { LcReportField, LcReportInput } from '@/lib/learn/staff/reports';

type Option = { id: string; label: string };
const ORDER: LcReportField[] = ['reportReviewedOn', 'sourceLabel', 'registrationsTotal', 'registrationsApproved', 'attendancesTotal', 'centerCounts', 'sourceCounts', 'reason'];

/**
 * Totals for one training, typed in by a member of staff from the Microsoft Teams report.
 * The only boxes are whole numbers, a date, and two fixed lists. There is nowhere to put a name.
 */
export function LcReportForm({ initial, isCorrection, hadCenter, hadSource, splits, cancelled, sources, centers, referrals, today }: { initial: LcReportInput; isCorrection: boolean; hadCenter: boolean; hadSource: boolean; splits: { byCenter: boolean; bySource: boolean }; cancelled: boolean; sources: string[]; centers: Option[]; referrals: Option[]; today: string }) {
  const router = useRouter();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [v, setV] = useState<LcReportInput>(initial);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LcTrainingState | null>(null);
  const errors = result && !result.ok ? result.fieldErrors ?? {} : {};
  const set = <K extends keyof LcReportInput>(key: K, value: LcReportInput[K]) => setV((old) => ({ ...old, [key]: value }));
  const id = (field: string) => `${uid}-${field}`;

  useEffect(() => {
    if (!result || result.ok || !result.fieldErrors) return;
    const first = ORDER.find((f) => result.fieldErrors?.[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
  }, [result]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    let r: LcTrainingState;
    try {
      r = await saveReportAction(v);
    } catch {
      r = { ok: false, message: 'That did not save. Check your connection and try again. What you typed is still here.' };
    }
    setBusy(false);
    setResult(r);
    if (r.ok) router.push(`/learn/staff/analytics?saved=${isCorrection ? 'correction' : 'numbers'}`);
  }

  const err = (field: LcReportField) =>
    errors[field] ? (
      <p className="lc-field-error" id={id(`${field}-error`)}>
        <CircleAlert width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
        {errors[field]}
      </p>
    ) : null;
  const describe = (field: LcReportField) => [id(`${field}-hint`), errors[field] ? id(`${field}-error`) : ''].filter(Boolean).join(' ');
  const number = (field: 'registrationsTotal' | 'registrationsApproved' | 'attendancesTotal', label: string, hint: string, disabled = false) => (
    <div className="lc-field">
      <label htmlFor={id(field)} className="lc-label">{label}</label>
      <input id={id(field)} data-field={field} className="lc-input lc-input-short" inputMode="numeric" autoComplete="off" maxLength={6} value={v[field]} disabled={disabled} onChange={(e) => set(field, e.target.value)} aria-invalid={errors[field] ? true : undefined} aria-describedby={describe(field)} />
      <p className="lc-hint" id={id(`${field}-hint`)}>{hint}</p>
      {err(field)}
    </div>
  );
  const split = (field: 'centerCounts' | 'sourceCounts', keepKey: 'centerKeep' | 'sourceKeep', had: boolean, legend: string, hint: string, options: Option[]) => (
    <fieldset className="lc-fieldset">
      <legend className="lc-label">{legend} <span className="lc-optional">optional</span></legend>
      <p className="lc-hint" id={id(`${field}-hint`)}>{hint}</p>
      {had ? (
        <div className="lc-choice-list lc-choice-list-inline">
          <label className="lc-check-row" data-picked={v[keepKey] ? '' : undefined}>
            <input type="radio" name={id(keepKey)} data-field={v[keepKey] ? field : undefined} checked={v[keepKey]} onChange={() => set(keepKey, true)} />
            <span>Keep the split as entered</span>
          </label>
          <label className="lc-check-row" data-picked={!v[keepKey] ? '' : undefined}>
            <input type="radio" name={id(keepKey)} checked={!v[keepKey]} onChange={() => set(keepKey, false)} />
            <span>Type it in again</span>
          </label>
        </div>
      ) : null}
      {had && v[keepKey] ? (
        <p className="lc-hint">The split entered earlier stays as it is. It is not shown here because some of its counts may be small.</p>
      ) : (
        <div className="lc-count-grid">
          {options.map((o, i) => (
            <div key={o.id} className="lc-field">
              <label htmlFor={id(`${field}-${o.id}`)} className="lc-label lc-label-sub">{o.label}</label>
              <input id={id(`${field}-${o.id}`)} data-field={i === 0 ? field : undefined} className="lc-input lc-input-short" inputMode="numeric" autoComplete="off" maxLength={6} value={v[field][o.id] ?? ''} onChange={(e) => set(field, { ...v[field], [o.id]: e.target.value })} aria-invalid={errors[field] ? true : undefined} aria-describedby={describe(field)} />
            </div>
          ))}
        </div>
      )}
      {had && !v[keepKey] ? <p className="lc-hint">Leave every box empty to remove the split.</p> : null}
      {err(field)}
    </fieldset>
  );

  return (
    <form ref={formRef} className="lc-form" onSubmit={save} noValidate>
      <div className="lc-field">
        <label htmlFor={id('reportReviewedOn')} className="lc-label">Date you read the report</label>
        <input id={id('reportReviewedOn')} data-field="reportReviewedOn" type="date" max={today} className="lc-input lc-input-short" value={v.reportReviewedOn} onChange={(e) => set('reportReviewedOn', e.target.value)} aria-invalid={errors.reportReviewedOn ? true : undefined} aria-describedby={describe('reportReviewedOn')} />
        <p className="lc-hint" id={id('reportReviewedOn-hint')}>The day you looked at the numbers, in Central Time.</p>
        {err('reportReviewedOn')}
      </div>
      <div className="lc-field">
        <label htmlFor={id('sourceLabel')} className="lc-label">Where the numbers came from</label>
        <select id={id('sourceLabel')} data-field="sourceLabel" className="lc-input lc-select" value={v.sourceLabel} onChange={(e) => set('sourceLabel', e.target.value)} aria-invalid={errors.sourceLabel ? true : undefined} aria-describedby={describe('sourceLabel')}>
          <option value="">Choose a source</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="lc-hint" id={id('sourceLabel-hint')}>Type the totals in by hand. Do not upload or paste the report itself.</p>
        {err('sourceLabel')}
      </div>

      <fieldset className="lc-fieldset">
        <legend className="lc-label">Was the training held?</legend>
        <div className="lc-choice-list lc-choice-list-inline">
          <label className="lc-check-row" data-picked={v.trainingHeld ? '' : undefined}>
            <input type="radio" name={id('held')} checked={v.trainingHeld} disabled={cancelled} onChange={() => set('trainingHeld', true)} />
            <span>Yes, it took place</span>
          </label>
          <label className="lc-check-row" data-picked={!v.trainingHeld ? '' : undefined}>
            <input type="radio" name={id('held')} checked={!v.trainingHeld} onChange={() => setV((old) => ({ ...old, trainingHeld: false, attendancesTotal: '' }))} />
            <span>No, it did not take place</span>
          </label>
        </div>
        {cancelled ? <p className="lc-hint">This listing is marked cancelled, so it is recorded as not held.</p> : null}
      </fieldset>

      {number('registrationsTotal', 'Registrations submitted', 'How many registration requests Teams received, approved or not. Leave empty if you do not have this number.')}
      {number('registrationsApproved', 'Approved registrations', 'How many of those requests were approved in Teams. Leave empty if you do not have this number.')}
      {number('attendancesTotal', 'Attendances', v.trainingHeld ? 'The attendee count on the Teams report for this one training. Leave empty if you do not have this number.' : 'Not used for a training that did not take place.', !v.trainingHeld)}

      {splits.byCenter && split('centerCounts', 'centerKeep', hadCenter, 'Registrations by center', 'Only if the registration form asked families for their center. These are a split of registrations submitted. If they add up to less, the rest is shown as “Did not say”.', centers)}
      {splits.bySource && split('sourceCounts', 'sourceKeep', hadSource, 'Registrations by how families heard about it', 'Only if the registration form asked. These are a split of registrations submitted.', referrals)}

      {isCorrection ? (
        <div className="lc-field">
          <label htmlFor={id('reason')} className="lc-label">Why are the numbers changing?</label>
          <textarea id={id('reason')} data-field="reason" className="lc-input lc-textarea" rows={3} maxLength={300} value={v.reason} onChange={(e) => set('reason', e.target.value)} aria-invalid={errors.reason ? true : undefined} aria-describedby={describe('reason')} />
          <p className="lc-hint" id={id('reason-hint')}>One sentence about the numbers. The earlier entry is kept, with this reason beside the new one. No names, email addresses or phone numbers.</p>
          {err('reason')}
        </div>
      ) : null}

      <div aria-live="polite">
        {result && !result.ok ? (
          <p className="lc-field-error">
            <CircleAlert width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
            {result.message}
          </p>
        ) : null}
      </div>
      <div className="lc-form-submit">
        <button type="submit" className="lc-btn lc-btn-primary" disabled={busy}>
          <Save width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          {isCorrection ? 'Save correction' : 'Save numbers'}
        </button>
      </div>
    </form>
  );
}
