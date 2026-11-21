'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, CalendarX, CircleAlert, CircleCheck, Globe, Lock, LockOpen } from 'lucide-react';
import { listingStatusAction, type LcTrainingState } from '@/app/learn/staff/trainingActions';
import type { LcListingAction } from '@/lib/learn/staff/listings';

type Control = { action: LcListingAction; label: string; primary?: boolean; confirm?: { question: string; yes: string; destructive?: boolean } };

const ICON: Record<LcListingAction, React.ReactNode> = {
  publish: <Globe width={20} height={20} strokeWidth={1.75} aria-hidden="true" />,
  close_registration: <Lock width={20} height={20} strokeWidth={1.75} aria-hidden="true" />,
  reopen_registration: <LockOpen width={20} height={20} strokeWidth={1.75} aria-hidden="true" />,
  cancel: <CalendarX width={20} height={20} strokeWidth={1.75} aria-hidden="true" />,
  complete: <CircleCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />,
  archive: <Archive width={20} height={20} strokeWidth={1.75} aria-hidden="true" />,
};

/**
 * The buttons that move a listing from one status to the next. Which ones appear is decided on the
 * server from the listing's status. Pressing one asks the server, which checks the role and the
 * status again; a refusal is shown here in words and nothing changes.
 */
export function LcListingControls({ id, rev, controls }: { id: string; rev: number; controls: Control[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState<LcListingAction | null>(null);
  const [result, setResult] = useState<LcTrainingState | null>(null);

  async function go(action: LcListingAction) {
    setBusy(true);
    setResult(null);
    let r: LcTrainingState;
    try {
      r = await listingStatusAction(id, rev, action);
    } catch {
      r = { ok: false, message: 'That did not go through. Check your connection and try again.' };
    }
    setBusy(false);
    setAsking(null);
    setResult(r);
    if (r.ok) router.refresh();
  }

  const pending = controls.find((c) => c.action === asking);
  return (
    <div className="lc-control" data-lc-listing-id={id} data-lc-listing-rev={rev}>
      {pending?.confirm ? (
        <div className="lc-confirm" role="group" aria-label={pending.label}>
          <p>{pending.confirm.question}</p>
          <div className="lc-confirm-actions">
            <button type="button" className={`lc-btn ${pending.confirm.destructive ? 'lc-btn-destructive' : 'lc-btn-primary'}`} disabled={busy} onClick={() => void go(pending.action)}>
              {pending.confirm.yes}
            </button>
            <button type="button" className="lc-btn lc-btn-secondary" disabled={busy} onClick={() => setAsking(null)}>
              Not yet
            </button>
          </div>
        </div>
      ) : (
        <div className="lc-action-row">
          {controls.map((c) => (
            <button key={c.action} type="button" className={`lc-btn ${c.primary ? 'lc-btn-primary' : 'lc-btn-secondary'}`} disabled={busy} onClick={() => (c.confirm ? setAsking(c.action) : void go(c.action))}>
              {ICON[c.action]}
              {c.label}
            </button>
          ))}
        </div>
      )}
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
        {result?.ok ? <p className="lc-saved">{result.message}</p> : null}
      </div>
    </div>
  );
}
