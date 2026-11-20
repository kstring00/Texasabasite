'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, CircleAlert, CircleCheck, MessageSquareWarning } from 'lucide-react';
import { decideFinalAction, decideSourceAction, type LcPipelineState } from '@/app/learn/staff/pipelineActions';

type Item = { key: string; label: string };
type Target = { gate: 'source'; submissionId: string; versionId: string } | { gate: 'final'; moduleVersionId: string };

/**
 * The reviewer's decision for one gate. Approve, request changes and decline look different and
 * approve asks for confirmation. The server decides whether this person may make the decision;
 * if it refuses, the reason is shown here and nothing is recorded.
 */
export function LcDecisionForm({ target, rev, checklist, what, declineLabel }: { target: Target; rev: number; checklist: Item[]; what: string; declineLabel: string }) {
  const router = useRouter();
  const uid = useId();
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LcPipelineState | null>(null);
  const allTicked = checklist.every((c) => ticks[c.key]);

  async function decide(decision: 'approved' | 'changes_requested' | 'declined') {
    setBusy(true);
    setResult(null);
    let r: LcPipelineState;
    try {
      r = target.gate === 'source'
        ? await decideSourceAction({ submissionId: target.submissionId, versionId: target.versionId, rev, decision, comments, checklist: ticks })
        : await decideFinalAction({ moduleVersionId: target.moduleVersionId, rev, decision: decision === 'declined' ? 'rejected' : decision, comments, checklist: ticks });
    } catch {
      r = { ok: false, message: 'The decision could not be recorded. Check your connection and try again. Your notes are still here.' };
    }
    setBusy(false);
    setConfirming(false);
    setResult(r);
    if (r.ok) router.push(`/learn/staff/reviews?gate=${target.gate === 'source' ? 'source' : 'module'}&done=${decision}`);
  }

  return (
    <div className="lc-form lc-decision">
      <fieldset className="lc-fieldset">
        <legend className="lc-label">Review checklist</legend>
        <p className="lc-hint">Every item must be ticked to approve. To request changes or {declineLabel.toLowerCase()}, write a note instead.</p>
        <div className="lc-choice-list">
          {checklist.map((c) => (
            <label key={c.key} className="lc-check-row" data-picked={ticks[c.key] ? '' : undefined}>
              <input type="checkbox" checked={!!ticks[c.key]} onChange={() => setTicks({ ...ticks, [c.key]: !ticks[c.key] })} />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="lc-field">
        <label htmlFor={`${uid}-notes`} className="lc-label">
          Notes
        </label>
        <textarea id={`${uid}-notes`} className="lc-input lc-textarea" rows={5} value={comments} maxLength={2000} onChange={(e) => setComments(e.target.value)} aria-describedby={`${uid}-notes-hint`} />
        <p className="lc-hint" id={`${uid}-notes-hint`}>
          Needed when you request changes or {declineLabel.toLowerCase()}. Optional when you approve. Do not write anything about a real child or family.
        </p>
      </div>

      <div aria-live="polite">
        {result && !result.ok ? (
          <p className="lc-field-error">
            <CircleAlert width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
            {result.message}
          </p>
        ) : null}
      </div>

      {confirming ? (
        <div className="lc-confirm" role="group" aria-label="Confirm approval">
          <p>Approve {what}? This is recorded with your name and the time, and cannot be undone.</p>
          <div className="lc-confirm-actions">
            <button type="button" className="lc-btn lc-btn-primary" onClick={() => void decide('approved')} disabled={busy}>
              <CircleCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
              Yes, approve
            </button>
            <button type="button" className="lc-btn lc-btn-secondary" onClick={() => setConfirming(false)} disabled={busy}>
              Not yet
            </button>
          </div>
        </div>
      ) : (
        <div className="lc-decision-actions">
          <button type="button" className="lc-btn lc-btn-primary" onClick={() => setConfirming(true)} disabled={busy || !allTicked}>
            <CircleCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            {target.gate === 'source' ? 'Approve source' : 'Approve final module'}
          </button>
          <button type="button" className="lc-btn lc-btn-secondary" onClick={() => void decide('changes_requested')} disabled={busy}>
            <MessageSquareWarning width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            Request changes
          </button>
          <button type="button" className="lc-btn lc-btn-destructive" onClick={() => void decide('declined')} disabled={busy}>
            <Ban width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            {declineLabel}
          </button>
        </div>
      )}
      {!allTicked && !confirming ? <p className="lc-muted">The approve button turns on once every checklist item is ticked.</p> : null}
    </div>
  );
}
