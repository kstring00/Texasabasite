'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert, CircleCheck, Save } from 'lucide-react';
import { saveListingAction, type LcTrainingState } from '@/app/learn/staff/trainingActions';
import type { LcListingField, LcListingInput } from '@/lib/learn/staff/listings';

type Option = { id: string; label: string };
const ORDER: LcListingField[] = ['title', 'summary', 'description', 'objectives', 'categoryId', 'date', 'startTime', 'endTime', 'presenterLabel', 'relatedModuleIds', 'registrationUrl'];

/**
 * The listing editor. Everything typed here is checked again on the server before it is stored.
 * A registration link that is not a Microsoft Teams registration page is refused, not saved.
 */
export function LcListingForm({ listing, initial, categories, modules, isPublic }: { listing: { id: string; rev: number } | null; initial: LcListingInput; categories: Option[]; modules: Option[]; isPublic: boolean }) {
  const router = useRouter();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [v, setV] = useState<LcListingInput>(initial);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LcTrainingState | null>(null);
  const errors = result && !result.ok ? result.fieldErrors ?? {} : {};
  const set = <K extends keyof LcListingInput>(key: K, value: LcListingInput[K]) => setV((old) => ({ ...old, [key]: value }));
  const id = (field: string) => `${uid}-${field}`;

  // After a refused save, put the cursor in the first field that needs another look.
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
      r = await saveListingAction(listing?.id ?? null, listing?.rev ?? 0, v);
    } catch {
      r = { ok: false, message: 'That did not save. Check your connection and try again. What you typed is still here.' };
    }
    setBusy(false);
    setResult(r);
    if (r.ok) {
      if (!listing && r.id) router.push(`/learn/staff/trainings/${r.id}?saved=1`);
      else router.refresh();
    }
  }

  const err = (field: LcListingField) =>
    errors[field] ? (
      <p className="lc-field-error" id={id(`${field}-error`)}>
        <CircleAlert width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
        {errors[field]}
      </p>
    ) : null;
  const describe = (field: LcListingField, hint = true) => [hint ? id(`${field}-hint`) : '', errors[field] ? id(`${field}-error`) : ''].filter(Boolean).join(' ') || undefined;
  const invalid = (field: LcListingField) => (errors[field] ? true : undefined);

  return (
    <form ref={formRef} className="lc-form" onSubmit={save} noValidate>
      <div className="lc-field">
        <label htmlFor={id('title')} className="lc-label">Title</label>
        <input id={id('title')} data-field="title" className="lc-input" value={v.title} maxLength={120} onChange={(e) => set('title', e.target.value)} aria-invalid={invalid('title')} aria-describedby={describe('title', false)} />
        {err('title')}
      </div>
      <div className="lc-field">
        <label htmlFor={id('summary')} className="lc-label">Short summary</label>
        <textarea id={id('summary')} data-field="summary" className="lc-input lc-textarea" rows={2} value={v.summary} maxLength={240} onChange={(e) => set('summary', e.target.value)} aria-describedby={describe('summary')} />
        <p className="lc-hint" id={id('summary-hint')}>One or two sentences. Shown on the training card.</p>
        {err('summary')}
      </div>
      <div className="lc-field">
        <label htmlFor={id('description')} className="lc-label">Description</label>
        <textarea id={id('description')} data-field="description" className="lc-input lc-textarea" rows={5} value={v.description} maxLength={2000} onChange={(e) => set('description', e.target.value)} aria-describedby={describe('description')} />
        <p className="lc-hint" id={id('description-hint')}>General education only. Leave a blank line between paragraphs. Nothing about a real child or family.</p>
        {err('description')}
      </div>
      <div className="lc-field">
        <label htmlFor={id('objectives')} className="lc-label">Learning objectives</label>
        <textarea id={id('objectives')} data-field="objectives" className="lc-input lc-textarea" rows={3} value={v.objectives} maxLength={1000} onChange={(e) => set('objectives', e.target.value)} aria-describedby={describe('objectives')} />
        <p className="lc-hint" id={id('objectives-hint')}>One per line, in plain language.</p>
        {err('objectives')}
      </div>
      <div className="lc-field">
        <label htmlFor={id('categoryId')} className="lc-label">Topic</label>
        <select id={id('categoryId')} data-field="categoryId" className="lc-input lc-select" value={v.categoryId} onChange={(e) => set('categoryId', e.target.value)} aria-invalid={invalid('categoryId')} aria-describedby={describe('categoryId', false)}>
          <option value="">Choose a topic</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        {err('categoryId')}
      </div>

      <fieldset className="lc-fieldset">
        <legend className="lc-label">Date and time</legend>
        <p className="lc-hint" id={id('date-hint')}>Central Time (CT). The site works out daylight saving time for the date you choose.</p>
        <div className="lc-when-grid">
          <div className="lc-field">
            <label htmlFor={id('date')} className="lc-label lc-label-sub">Date</label>
            <input id={id('date')} data-field="date" type="date" className="lc-input" value={v.date} onChange={(e) => set('date', e.target.value)} aria-invalid={invalid('date')} aria-describedby={describe('date')} />
          </div>
          <div className="lc-field">
            <label htmlFor={id('startTime')} className="lc-label lc-label-sub">Starts</label>
            <input id={id('startTime')} data-field="startTime" type="time" className="lc-input" value={v.startTime} onChange={(e) => set('startTime', e.target.value)} aria-invalid={invalid('startTime')} aria-describedby={describe('startTime', false)} />
          </div>
          <div className="lc-field">
            <label htmlFor={id('endTime')} className="lc-label lc-label-sub">Ends</label>
            <input id={id('endTime')} data-field="endTime" type="time" className="lc-input" value={v.endTime} onChange={(e) => set('endTime', e.target.value)} aria-invalid={invalid('endTime')} aria-describedby={describe('endTime', false)} />
          </div>
        </div>
        {err('date')}
        {err('startTime')}
        {err('endTime')}
      </fieldset>

      <div className="lc-field">
        <label htmlFor={id('presenterLabel')} className="lc-label">Presenter <span className="lc-optional">optional</span></label>
        <input id={id('presenterLabel')} data-field="presenterLabel" className="lc-input" value={v.presenterLabel} maxLength={80} onChange={(e) => set('presenterLabel', e.target.value)} aria-invalid={invalid('presenterLabel')} aria-describedby={describe('presenterLabel')} />
        <p className="lc-hint" id={id('presenterLabel-hint')}>Leave empty unless the presenter has agreed to be named. In this demo, do not type a real person’s name.</p>
        <label className="lc-check-row" data-picked={v.presenterApproved ? '' : undefined}>
          <input type="checkbox" checked={v.presenterApproved} onChange={() => set('presenterApproved', !v.presenterApproved)} />
          <span>The presenter has agreed to be named on the public page.</span>
        </label>
        {err('presenterLabel')}
      </div>

      <fieldset className="lc-fieldset">
        <legend className="lc-label">Related modules <span className="lc-optional">optional</span></legend>
        {modules.length > 0 ? (
          <div className="lc-choice-list">
            {modules.map((m) => {
              const on = v.relatedModuleIds.includes(m.id);
              return (
                <label key={m.id} className="lc-check-row" data-picked={on ? '' : undefined}>
                  <input type="checkbox" checked={on} onChange={() => set('relatedModuleIds', on ? v.relatedModuleIds.filter((x) => x !== m.id) : [...v.relatedModuleIds, m.id])} />
                  <span>{m.label}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="lc-muted">No module is published yet, so there is nothing to link.</p>
        )}
        <p className="lc-hint">Only published modules can be linked.</p>
        {err('relatedModuleIds')}
      </fieldset>

      <div className="lc-field">
        <label htmlFor={id('registrationUrl')} className="lc-label">Microsoft Teams registration link <span className="lc-optional">optional</span></label>
        <input id={id('registrationUrl')} data-field="registrationUrl" type="url" inputMode="url" autoComplete="off" spellCheck={false} className="lc-input" value={v.registrationUrl} maxLength={500} onChange={(e) => set('registrationUrl', e.target.value)} aria-invalid={invalid('registrationUrl')} aria-describedby={describe('registrationUrl')} />
        <p className="lc-hint" id={id('registrationUrl-hint')}>
          Paste the event’s registration page from Microsoft Teams. It starts with https://events.teams.microsoft.com. Never paste a link for joining the meeting. Without a link, caregivers see “Registration details coming soon”.
        </p>
        {err('registrationUrl')}
      </div>

      <p className="lc-muted">Audience: Currently enrolled families only. This is shown on every listing and cannot be changed here.</p>

      <div aria-live="polite">
        {result && !result.ok ? (
          <div className="lc-field-error">
            <CircleAlert width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p>{result.message}</p>
              {result.problems && result.problems.length > 0 ? (
                <ul className="lc-problems">
                  {result.problems.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}
        {result?.ok ? (
          <p className="lc-saved">
            <CircleCheck width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
            Saved.
          </p>
        ) : null}
      </div>
      <div className="lc-form-submit">
        <button type="submit" className="lc-btn lc-btn-primary lc-btn-wrap" disabled={busy}>
          <Save width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          {isPublic ? 'Save changes to the public listing' : listing ? 'Save draft' : 'Create draft'}
        </button>
      </div>
    </form>
  );
}
