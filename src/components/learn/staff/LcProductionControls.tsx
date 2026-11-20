'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert, CircleCheck, EyeOff, Globe, PackagePlus, Send, Upload } from 'lucide-react';
import { claimSourceReviewAction, collectForProductionAction, importModuleAction, publishModuleAction, submitModuleAction, withdrawModuleAction, type LcPipelineState } from '@/app/learn/staff/pipelineActions';

function Refusal({ result }: { result: LcPipelineState | null }) {
  return (
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
    </div>
  );
}

/** One button that runs one server action, shows a refusal in words, and refreshes the page on success. */
function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LcPipelineState | null>(null);
  const go = async (work: () => Promise<LcPipelineState>, then?: string) => {
    setBusy(true);
    setResult(null);
    let r: LcPipelineState;
    try {
      r = await work();
    } catch {
      r = { ok: false, message: 'That did not go through. Check your connection and try again.' };
    }
    setBusy(false);
    setResult(r);
    if (r.ok) {
      if (then) router.push(then);
      else router.refresh();
    }
    return r;
  };
  return { busy, result, go };
}

export function LcStartReviewButton({ submissionId, rev }: { submissionId: string; rev: number }) {
  const { busy, result, go } = useAction();
  return (
    <div className="lc-control">
      <button type="button" className="lc-btn lc-btn-secondary" disabled={busy} onClick={() => void go(() => claimSourceReviewAction(submissionId, rev))}>
        Start review
      </button>
      <Refusal result={result} />
    </div>
  );
}

export function LcCollectButton({ submissionId, rev }: { submissionId: string; rev: number }) {
  const { busy, result, go } = useAction();
  return (
    <div className="lc-control">
      <button type="button" className="lc-btn lc-btn-primary" disabled={busy} onClick={() => void go(() => collectForProductionAction(submissionId, rev), `/learn/staff/modules/${submissionId}`)}>
        <PackagePlus width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
        Collect for production
      </button>
      <Refusal result={result} />
    </div>
  );
}

export function LcSubmitModuleButton({ moduleVersionId, rev }: { moduleVersionId: string; rev: number }) {
  const { busy, result, go } = useAction();
  return (
    <div className="lc-control">
      <button type="button" className="lc-btn lc-btn-primary" disabled={busy} onClick={() => void go(() => submitModuleAction(moduleVersionId, rev))}>
        <Send width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
        Send for final review
      </button>
      <p className="lc-muted">After this the module version is locked. A change means importing a new version, which needs its own review.</p>
      <Refusal result={result} />
    </div>
  );
}

export function LcPublishControl({ moduleVersionId, rev, title }: { moduleVersionId: string; rev: number; title: string }) {
  const { busy, result, go } = useAction();
  const [asking, setAsking] = useState(false);
  return (
    <div className="lc-control">
      {asking ? (
        <div className="lc-confirm" role="group" aria-label="Confirm publishing">
          <p>Publish “{title}” to the Learning Library? Families will be able to open it straight away.</p>
          <div className="lc-confirm-actions">
            {/* The id travels in a field so the server, not this page, decides what may be published. */}
            <input type="hidden" name="moduleVersionId" value={moduleVersionId} data-lc-publish-id />
            <button type="button" className="lc-btn lc-btn-primary" disabled={busy} onClick={(e) => { const field = e.currentTarget.parentElement?.querySelector<HTMLInputElement>('[data-lc-publish-id]'); void go(() => publishModuleAction(field?.value ?? moduleVersionId, rev)); }}>
              <Globe width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
              Yes, publish
            </button>
            <button type="button" className="lc-btn lc-btn-secondary" disabled={busy} onClick={() => setAsking(false)}>
              Not yet
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="lc-btn lc-btn-primary" onClick={() => setAsking(true)}>
          <Globe width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          Publish
        </button>
      )}
      <Refusal result={result} />
    </div>
  );
}

export function LcWithdrawControl({ moduleVersionId, rev, title }: { moduleVersionId: string; rev: number; title: string }) {
  const { busy, result, go } = useAction();
  const uid = useId();
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState('');
  return (
    <div className="lc-control">
      {asking ? (
        <div className="lc-confirm" role="group" aria-label="Confirm withdrawing">
          <p>Withdraw “{title}”? It disappears from the Learning Library at once and its address stops working.</p>
          <div className="lc-field">
            <label htmlFor={`${uid}-why`} className="lc-label">
              Why is it being withdrawn?
            </label>
            <textarea id={`${uid}-why`} className="lc-input lc-textarea" rows={3} value={reason} maxLength={1000} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="lc-confirm-actions">
            <button type="button" className="lc-btn lc-btn-destructive" disabled={busy} onClick={() => void go(() => withdrawModuleAction(moduleVersionId, rev, reason))}>
              <EyeOff width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
              Yes, withdraw
            </button>
            <button type="button" className="lc-btn lc-btn-secondary" disabled={busy} onClick={() => setAsking(false)}>
              Keep it published
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="lc-btn lc-btn-secondary" onClick={() => setAsking(true)}>
          <EyeOff width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          Withdraw
        </button>
      )}
      <Refusal result={result} />
    </div>
  );
}

const METHODS = [
  { value: 'external_ai_assisted', label: 'Made outside this website with an AI assistant, from the approved PowerPoint' },
  { value: 'written_by_hand', label: 'Written by hand from the approved PowerPoint' },
];

/** Import a module package (the manifest as text). The server validates it; problems come back as a list. */
export function LcImportForm({ submissionId, rev, sampleJson, today }: { submissionId: string; rev: number; sampleJson: string; today: string }) {
  const { busy, result, go } = useAction();
  const uid = useId();
  const [manifestJson, setManifestJson] = useState('');
  const [conversionDate, setConversionDate] = useState(today);
  const [generationMethod, setGenerationMethod] = useState('');
  const [newContentNotes, setNewContentNotes] = useState('');
  return (
    <div className="lc-form">
      <div className="lc-field">
        <label htmlFor={`${uid}-json`} className="lc-label">
          Module package
        </label>
        <textarea id={`${uid}-json`} className="lc-input lc-textarea lc-code" rows={10} value={manifestJson} onChange={(e) => setManifestJson(e.target.value)} spellCheck={false} aria-describedby={`${uid}-json-hint`} />
        <p className="lc-hint" id={`${uid}-json-hint`}>
          Paste the module package made from the approved PowerPoint. It is checked before anything is saved.
        </p>
        <button type="button" className="lc-btn lc-btn-secondary lc-btn-wrap" onClick={() => { setManifestJson(sampleJson); setGenerationMethod('written_by_hand'); setNewContentNotes('Synthetic sample for the demo. The two knowledge checks and their feedback are new and were not in the PowerPoint.'); }}>
          Fill in the synthetic sample package
        </button>
      </div>
      <div className="lc-field">
        <label htmlFor={`${uid}-date`} className="lc-label">
          Date the module was made
        </label>
        <input id={`${uid}-date`} type="date" className="lc-input lc-input-short" value={conversionDate} onChange={(e) => setConversionDate(e.target.value)} />
      </div>
      <div className="lc-field">
        <label htmlFor={`${uid}-method`} className="lc-label">
          How was it made?
        </label>
        <select id={`${uid}-method`} className="lc-input lc-select" value={generationMethod} onChange={(e) => setGenerationMethod(e.target.value)}>
          <option value="">Choose one</option>
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="lc-field">
        <label htmlFor={`${uid}-new`} className="lc-label">
          What is new compared with the PowerPoint?
        </label>
        <textarea id={`${uid}-new`} className="lc-input lc-textarea" rows={3} value={newContentNotes} maxLength={2000} onChange={(e) => setNewContentNotes(e.target.value)} aria-describedby={`${uid}-new-hint`} />
        <p className="lc-hint" id={`${uid}-new-hint`}>
          List any explanations, examples or questions that were not in the source, so the reviewer knows where to look hardest. If nothing is new, say so.
        </p>
      </div>
      <Refusal result={result} />
      {result?.ok ? (
        <p className="lc-note" data-cast="teal" role="status">
          <CircleCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
          <span>Imported as a draft. No problems were found in the package.</span>
        </p>
      ) : null}
      <button type="button" className="lc-btn lc-btn-primary lc-form-submit" disabled={busy} onClick={() => void go(() => importModuleAction({ submissionId, rev, manifestJson, conversionDate, generationMethod, newContentNotes }))}>
        <Upload width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
        {busy ? 'Checking…' : 'Check and import'}
      </button>
    </div>
  );
}
