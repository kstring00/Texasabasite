'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck, CloudUpload, FileText, Info, Plus, Save, Send, Trash2 } from 'lucide-react';
import { removeFileAction, saveDraftAction, submitAction } from '@/app/learn/staff/actions';
import { LC_MAX_UPLOAD_BYTES, LC_MAX_UPLOAD_LABEL, LC_TOO_LARGE_MESSAGE, checkPptxName, formatBytes } from '@/lib/learn/staff/pptx';
import { LC_APPROVED_TAGS, LC_AUDIENCES, LC_CHECKLIST, submitProblems, type LcChecklistState, type LcFieldErrors, type LcSubmissionDetails } from '@/lib/learn/staff/submissions';

export type LcWizardInitial = {
  id: string;
  rev: number;
  details: LcSubmissionDetails;
  checklist: LcChecklistState;
  revisionNotes: string;
  versionNumber: number;
  file: { name: string; size: number } | null;
};

const STEPS = ['Title and summary', 'Topic and tags', 'Objectives and audience', 'PowerPoint file', 'Checklist', 'Review and submit'] as const;
const FIELD_STEP: Record<keyof LcFieldErrors, number> = { title: 0, summary: 0, categoryId: 1, objectives: 2, audience: 2, file: 3, revisionNotes: 3, checklist: 4 };
const emptyChecks = (): LcChecklistState => ({ noClientIdentifiers: false, noCaseNotes: false, noConfidentialMaterial: false, plainLanguageObjective: false, eligibleContributor: false });

/**
 * The six-step PowerPoint submission. Every "Next" saves the draft, "Save draft" saves at any
 * time, and the file is uploaded to and checked by the server. Nothing here decides whether a
 * submission is allowed: the server checks the role, the owner and every required field again.
 */
export function LcSubmissionWizard({ initial, categories, feedback, startStep = 0, justSaved = false }: { initial: LcWizardInitial | null; categories: { id: string; name: string }[]; feedback: { reviewer: string; comments: string } | null; startStep?: number; justSaved?: boolean }) {
  const router = useRouter();
  const uid = useId();
  const [id, setId] = useState<string | null>(initial?.id ?? null);
  const [rev, setRev] = useState(initial?.rev ?? 0);
  const [d, setD] = useState<LcSubmissionDetails>(initial?.details ?? { title: '', summary: '', categoryId: '', tags: [], objectives: [''], audience: '' });
  const [objectives, setObjectives] = useState<string[]>(initial && initial.details.objectives.length > 0 ? initial.details.objectives : ['']);
  const [checklist, setChecklist] = useState<LcChecklistState>(initial?.checklist ?? emptyChecks());
  const [revisionNotes, setRevisionNotes] = useState(initial?.revisionNotes ?? '');
  const [file, setFile] = useState(initial?.file ?? null);
  const [step, setStep] = useState(Math.max(0, Math.min(STEPS.length - 1, startStep)));
  const [busy, setBusy] = useState<'idle' | 'saving' | 'uploading' | 'submitting'>('idle');
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(justSaved ? { kind: 'ok', text: 'Draft saved.' } : null);
  const [errors, setErrors] = useState<LcFieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [dragging, setDragging] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const moved = useRef(false);
  const versionNumber = initial?.versionNumber ?? 1;
  const isRevision = versionNumber > 1;

  // After a reload, return to the step this tab was last on.
  useEffect(() => {
    if (!initial) return;
    try {
      const saved = window.sessionStorage.getItem(`lc-wizard-step:${initial.id}`);
      if (saved && /^[0-5]$/.test(saved)) setStep(Number(saved));
    } catch {
      /* storage blocked */
    }
    // Only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    headingRef.current?.focus({ preventScroll: true });
    document.getElementById('lc-staff-main')?.scrollIntoView({ block: 'start' });
  }, [step]);

  // Warn before leaving with unsaved typing.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const edit = (patch: Partial<LcSubmissionDetails>) => {
    setD((prev) => ({ ...prev, ...patch }));
    setDirty(true);
    setNotice(null);
  };
  const payload = () => ({ ...d, objectives: objectives.map((o) => o.trim()).filter(Boolean), checklist, revisionNotes });

  /**
   * Save the draft. The first save creates it and moves to the draft's own address, carrying the
   * step to land on, because the page is rebuilt there. Returns null when the caller should stop.
   */
  async function save(landOn: number = step): Promise<{ id: string; rev: number } | null> {
    if (d.title.trim().length < 1) {
      setErrors({ title: 'Give the presentation a title before saving.' });
      setNotice({ kind: 'error', text: 'Add a title first, then save.' });
      goTo(0);
      return null;
    }
    setBusy('saving');
    let r;
    try {
      r = await saveDraftAction(id, rev, payload());
    } catch {
      setBusy('idle');
      setNotice({ kind: 'error', text: 'The draft could not be saved. Check your connection and try again. Your typing is still here.' });
      return null;
    }
    setBusy('idle');
    if (!r.ok || !r.id || r.rev === undefined) {
      setErrors(r.fieldErrors ?? {});
      setNotice({ kind: 'error', text: r.message });
      return null;
    }
    if (!id) {
      setDirty(false);
      rememberStep(r.id, landOn);
      router.replace(`/learn/staff/submissions/${r.id}/edit?step=${landOn + 1}&saved=1`);
      return null;
    }
    setId(r.id);
    setRev(r.rev);
    setDirty(false);
    setErrors({});
    setNotice({ kind: 'ok', text: `Draft saved at ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.` });
    return { id: r.id, rev: r.rev };
  }

  /**
   * The step is remembered in this tab's session storage, not in the address. Changing the address
   * would make the site re-fetch this page and run its page-transition animation, and input during
   * that animation is dropped.
   */
  function rememberStep(forId: string, n: number) {
    try {
      window.sessionStorage.setItem(`lc-wizard-step:${forId}`, String(n));
    } catch {
      /* storage blocked: the step simply is not remembered across a reload */
    }
  }

  function goTo(n: number) {
    moved.current = true;
    setStep(n);
    if (id) rememberStep(id, n);
  }

  async function next() {
    const to = Math.min(step + 1, STEPS.length - 1);
    if (await save(to)) goTo(to);
  }

  async function upload(chosen: File) {
    setNotice(null);
    const nameCheck = checkPptxName(chosen.name);
    if (!nameCheck.ok) return setErrors((e) => ({ ...e, file: nameCheck.message }));
    if (chosen.size > LC_MAX_UPLOAD_BYTES) return setErrors((e) => ({ ...e, file: LC_TOO_LARGE_MESSAGE }));
    const saved = dirty || !id ? await save() : { id, rev };
    if (!saved?.id) return;
    setBusy('uploading');
    setErrors((e) => ({ ...e, file: undefined }));
    const body = new FormData();
    body.set('file', chosen);
    body.set('submissionId', saved.id);
    try {
      const res = await fetch('/learn/staff/api/uploads', { method: 'POST', body });
      const data = (await res.json()) as { ok: boolean; message: string; rev?: number; file?: { name: string; size: number } };
      if (!data.ok || !data.file || data.rev === undefined) {
        setErrors((e) => ({ ...e, file: data.message || 'The file could not be uploaded.' }));
      } else {
        setFile(data.file);
        setRev(data.rev);
        setNotice({ kind: 'ok', text: 'File uploaded and checked.' });
      }
    } catch {
      setErrors((e) => ({ ...e, file: 'The upload did not finish. Check your connection and try again.' }));
    }
    setBusy('idle');
    if (fileInput.current) fileInput.current.value = '';
  }

  async function removeFile() {
    if (!id) return;
    setBusy('saving');
    const r = await removeFileAction(id, rev);
    setBusy('idle');
    if (!r.ok || r.rev === undefined) return setNotice({ kind: 'error', text: r.message });
    setRev(r.rev);
    setFile(null);
    setNotice({ kind: 'ok', text: 'File removed.' });
  }

  async function submit() {
    if (!id) return;
    setBusy('submitting');
    let r;
    try {
      r = await submitAction(id, rev, payload());
    } catch {
      setBusy('idle');
      return setNotice({ kind: 'error', text: 'It could not be submitted. Check your connection and try again.' });
    }
    if (r.rev !== undefined) setRev(r.rev);
    if (!r.ok) {
      setBusy('idle');
      setErrors(r.fieldErrors ?? {});
      return setNotice({ kind: 'error', text: r.message });
    }
    setDirty(false);
    try {
      window.sessionStorage.removeItem(`lc-wizard-step:${id}`);
    } catch {
      /* storage blocked */
    }
    router.push(`/learn/staff/submissions/${id}?submitted=1`);
  }

  // The same rules the server applies, shown early so nothing is a surprise at the end.
  const problems = submitProblems(
    { ...d, objectives: objectives.map((o) => o.trim()).filter(Boolean), id: '', createdBy: '', status: 'draft', rev: 0, checklist, createdAt: '', updatedAt: '' },
    { id: '', submissionId: '', versionNumber, assetId: file ? 'x' : null, revisionNotes: revisionNotes.trim(), createdBy: '', createdAt: '', frozenAt: null, snapshot: null },
  );
  const problemList = Object.entries(problems) as [keyof LcFieldErrors, string][];
  const working = busy !== 'idle';
  const err = (k: keyof LcFieldErrors) =>
    errors[k] ? (
      <p className="lc-field-error" id={`${uid}-${k}-error`}>
        <CircleAlert width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
        {errors[k]}
      </p>
    ) : null;
  const describe = (k: keyof LcFieldErrors, hint?: string) => [hint ? `${uid}-${k}-hint` : '', errors[k] ? `${uid}-${k}-error` : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div className="lc-wizard" data-cast="blue">
      {feedback ? (
        <div className="lc-gate-strip" data-cast="coral">
          <p className="lc-gate-strip-title">Version {versionNumber}: responding to feedback from {feedback.reviewer}</p>
          <p className="lc-feedback-text">{feedback.comments}</p>
          <p className="lc-muted">The version that was reviewed is kept exactly as it was. This is a new version.</p>
        </div>
      ) : null}

      <div className="lc-solid lc-wizard-card">
        <p className="lc-wizard-where">
          Step {step + 1} of {STEPS.length}
        </p>
        <div className="lc-segments" role="img" aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
          {STEPS.map((s, i) => (
            <span key={s} data-state={i < step ? 'done' : i === step ? 'current' : 'todo'} />
          ))}
        </div>
        <h2 ref={headingRef} tabIndex={-1} className="lc-h2 lc-wizard-title">
          {STEPS[step]}
        </h2>

        {step === 0 ? (
          <div className="lc-form">
            <div className="lc-field">
              <label htmlFor={`${uid}-title`} className="lc-label">
                Title
              </label>
              <input id={`${uid}-title`} className="lc-input" value={d.title} maxLength={120} onChange={(e) => edit({ title: e.target.value })} aria-invalid={errors.title ? true : undefined} aria-describedby={describe('title', 'y')} autoComplete="off" />
              <p className="lc-hint" id={`${uid}-title-hint`}>
                What a caregiver would see. For example: “Getting ready for transitions.”
              </p>
              {err('title')}
            </div>
            <div className="lc-field">
              <label htmlFor={`${uid}-summary`} className="lc-label">
                Short summary
              </label>
              <textarea id={`${uid}-summary`} className="lc-input lc-textarea" rows={4} value={d.summary} maxLength={600} onChange={(e) => edit({ summary: e.target.value })} aria-invalid={errors.summary ? true : undefined} aria-describedby={describe('summary', 'y')} />
              <p className="lc-hint" id={`${uid}-summary-hint`}>
                Two or three sentences about what the presentation teaches. General education only. Nothing about a real child or family.
              </p>
              {err('summary')}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="lc-form">
            <fieldset className="lc-fieldset" aria-describedby={describe('categoryId')}>
              <legend className="lc-label">Topic</legend>
              <div className="lc-choice-list">
                {categories.map((c) => (
                  <label key={c.id} className="lc-check-row" data-picked={d.categoryId === c.id ? '' : undefined}>
                    <input type="radio" name={`${uid}-category`} checked={d.categoryId === c.id} onChange={() => edit({ categoryId: c.id })} />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
              {err('categoryId')}
            </fieldset>
            <fieldset className="lc-fieldset">
              <legend className="lc-label">Tags (optional)</legend>
              <div className="lc-choice-list lc-choice-list-inline">
                {LC_APPROVED_TAGS.map((t) => (
                  <label key={t} className="lc-check-row" data-picked={d.tags.includes(t) ? '' : undefined}>
                    <input type="checkbox" checked={d.tags.includes(t)} onChange={() => edit({ tags: d.tags.includes(t) ? d.tags.filter((x) => x !== t) : [...d.tags, t] })} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="lc-form">
            <fieldset className="lc-fieldset" aria-describedby={describe('objectives', 'y')}>
              <legend className="lc-label">Learning objectives</legend>
              <p className="lc-hint" id={`${uid}-objectives-hint`}>
                What will a caregiver be able to do afterwards? Start with a plain verb, like “Describe” or “Recognize.” Up to five.
              </p>
              <ol className="lc-objectives">
                {objectives.map((o, i) => (
                  <li key={i}>
                    <label htmlFor={`${uid}-objective-${i}`} className="lc-sr-only">
                      Objective {i + 1}
                    </label>
                    <input
                      id={`${uid}-objective-${i}`}
                      className="lc-input"
                      value={o}
                      maxLength={200}
                      onChange={(e) => {
                        setObjectives(objectives.map((x, j) => (j === i ? e.target.value : x)));
                        setDirty(true);
                        setNotice(null);
                      }}
                      autoComplete="off"
                    />
                    {objectives.length > 1 ? (
                      <button type="button" className="lc-btn lc-btn-quiet" onClick={() => { setObjectives(objectives.filter((_, j) => j !== i)); setDirty(true); }}>
                        Remove<span className="lc-sr-only"> objective {i + 1}</span>
                      </button>
                    ) : null}
                  </li>
                ))}
              </ol>
              {objectives.length < 5 ? (
                <button type="button" className="lc-btn lc-btn-secondary" onClick={() => setObjectives([...objectives, ''])}>
                  <Plus width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                  Add another objective
                </button>
              ) : null}
              {err('objectives')}
            </fieldset>
            <div className="lc-field">
              <label htmlFor={`${uid}-audience`} className="lc-label">
                Who is this for?
              </label>
              <select id={`${uid}-audience`} className="lc-input lc-select" value={d.audience} onChange={(e) => edit({ audience: e.target.value })} aria-invalid={errors.audience ? true : undefined} aria-describedby={describe('audience')}>
                <option value="">Choose an audience</option>
                {LC_AUDIENCES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {err('audience')}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="lc-form">
            <p className="lc-note" data-cast="amber">
              <Info width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
              <span>
                <strong>Do not upload anything that contains client information.</strong> Check hidden slides, speaker notes, comments, screenshots and the file’s properties, not only the slides. Demo mode: use a made-up or blank presentation. Files stay on this computer.
              </span>
            </p>
            {file ? (
              <div className="lc-file-row">
                <span className="lc-icon-tile" data-size="sm" data-cast="iris" aria-hidden="true">
                  <FileText width={20} height={20} strokeWidth={1.75} />
                </span>
                <span className="lc-file-text">
                  <span className="lc-file-name">{file.name}</span>
                  <span className="lc-muted">{formatBytes(file.size)} · Checked: it is a PowerPoint file. Not scanned for malware in the demo.</span>
                </span>
                <button type="button" className="lc-btn lc-btn-secondary" onClick={removeFile} disabled={working}>
                  <Trash2 width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                  Remove
                </button>
              </div>
            ) : null}
            <div
              className="lc-dropzone"
              data-cast="iris"
              data-dragging={dragging ? '' : undefined}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) void upload(f); }}
            >
              <span className="lc-icon-tile" aria-hidden="true">
                <CloudUpload width={26} height={26} strokeWidth={1.75} />
              </span>
              <p className="lc-dropzone-title">{file ? 'Drop a different PowerPoint here to replace it' : 'Drop your PowerPoint here'}</p>
              <p className="lc-muted" id={`${uid}-file-hint`}>
                A .pptx file, up to {LC_MAX_UPLOAD_LABEL}.
              </p>
              <input ref={fileInput} id={`${uid}-file`} type="file" hidden aria-label="PowerPoint file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
              <button type="button" className="lc-btn lc-btn-secondary" onClick={() => fileInput.current?.click()} disabled={working}>
                {busy === 'uploading' ? 'Uploading…' : file ? 'Browse for a different file' : 'Browse files'}
              </button>
            </div>
            <div aria-live="polite">{err('file')}</div>
            {isRevision ? (
              <div className="lc-field">
                <label htmlFor={`${uid}-notes`} className="lc-label">
                  What did you change in this version?
                </label>
                <textarea id={`${uid}-notes`} className="lc-input lc-textarea" rows={4} value={revisionNotes} maxLength={1000} onChange={(e) => { setRevisionNotes(e.target.value); setDirty(true); setNotice(null); }} aria-invalid={errors.revisionNotes ? true : undefined} aria-describedby={describe('revisionNotes')} />
                {err('revisionNotes')}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="lc-form">
            <p className="lc-note" data-cast="amber">
              <Info width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
              <span>Ticking these boxes does not check the file for you. Please open the presentation and look before you confirm.</span>
            </p>
            <fieldset className="lc-fieldset" aria-describedby={describe('checklist')}>
              <legend className="lc-label">I confirm that</legend>
              <div className="lc-choice-list">
                {LC_CHECKLIST.map((c) => (
                  <label key={c.key} className="lc-check-row" data-picked={checklist[c.key] ? '' : undefined}>
                    <input type="checkbox" checked={checklist[c.key]} onChange={() => { setChecklist({ ...checklist, [c.key]: !checklist[c.key] }); setDirty(true); setNotice(null); }} />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
              {err('checklist')}
            </fieldset>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="lc-form">
            <dl className="lc-summary">
              <div><dt>Title</dt><dd>{d.title || 'Not added yet'}</dd></div>
              <div><dt>Summary</dt><dd>{d.summary || 'Not added yet'}</dd></div>
              <div><dt>Topic</dt><dd>{categories.find((c) => c.id === d.categoryId)?.name ?? 'Not chosen yet'}</dd></div>
              <div><dt>Tags</dt><dd>{d.tags.length ? d.tags.join(', ') : 'None'}</dd></div>
              <div><dt>Objectives</dt><dd>{objectives.filter((o) => o.trim()).length ? <ul>{objectives.filter((o) => o.trim()).map((o, i) => <li key={i}>{o}</li>)}</ul> : 'Not added yet'}</dd></div>
              <div><dt>Audience</dt><dd>{d.audience || 'Not chosen yet'}</dd></div>
              <div><dt>File</dt><dd>{file ? `${file.name} (${formatBytes(file.size)})` : 'Not uploaded yet'}</dd></div>
              {isRevision ? <div><dt>What changed</dt><dd>{revisionNotes || 'Not added yet'}</dd></div> : null}
              <div><dt>Checklist</dt><dd>{LC_CHECKLIST.filter((c) => checklist[c.key]).length} of {LC_CHECKLIST.length} confirmed</dd></div>
            </dl>
            {problemList.length > 0 ? (
              <div className="lc-gate-strip" data-cast="amber">
                <p className="lc-gate-strip-title">Still needed before you can submit</p>
                <ul className="lc-problem-list">
                  {problemList.map(([k, msg]) => (
                    <li key={k}>
                      <span>{msg}</span>
                      <button type="button" className="lc-btn lc-btn-quiet" onClick={() => goTo(FIELD_STEP[k])}>
                        Go to step {FIELD_STEP[k] + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="lc-note" data-cast="teal">
                <CircleCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                <span>Everything is in place. When you submit, this version is locked and sent for clinical review. You will not be able to change it, only start a new version if a reviewer asks for changes.</span>
              </p>
            )}
          </div>
        ) : null}

        <p className="lc-wizard-notice" role="status" data-kind={notice?.kind}>
          {notice?.kind === 'ok' ? <CircleCheck width={18} height={18} strokeWidth={1.75} aria-hidden="true" /> : null}
          {notice?.kind === 'error' ? <CircleAlert width={18} height={18} strokeWidth={1.75} aria-hidden="true" /> : null}
          {notice?.text ?? (dirty ? 'You have changes that are not saved yet.' : '')}
        </p>

        <div className="lc-wizard-bottom">
          <button type="button" className="lc-btn lc-btn-secondary" onClick={() => goTo(step - 1)} disabled={step === 0 || working}>
            <ArrowLeft width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            Back
          </button>
          <button type="button" className="lc-btn lc-btn-secondary" onClick={() => void save()} disabled={working}>
            <Save width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            {busy === 'saving' ? 'Saving…' : 'Save draft'}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="lc-btn lc-btn-primary" onClick={() => void next()} disabled={working}>
              Save and continue
              <ArrowRight width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" className="lc-btn lc-btn-primary" onClick={() => void submit()} disabled={working || problemList.length > 0}>
              <Send width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
              {busy === 'submitting' ? 'Submitting…' : 'Submit for clinical review'}
            </button>
          )}
        </div>
        {step === STEPS.length - 1 && problemList.length > 0 ? <p className="lc-muted lc-wizard-why">The submit button turns on once the items listed above are done.</p> : null}
        {step === 0 ? <p className="lc-muted lc-wizard-why">Back is off because this is the first step.</p> : null}
      </div>
    </div>
  );
}
