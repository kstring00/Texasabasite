'use client';

import { useState } from 'react';

/** A destructive action that asks first. The real check is on the server; this only prevents slips. */
export function LcConfirm({ label, question, confirmLabel, cancelLabel = 'Cancel', icon, children }: { label: string; question: string; confirmLabel: string; cancelLabel?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" className="lc-btn lc-btn-secondary" onClick={() => setAsking(true)}>
        {icon}
        {label}
      </button>
    );
  }
  return (
    <div className="lc-confirm" role="group" aria-label={label}>
      <p>{question}</p>
      <div className="lc-confirm-actions">
        {children}
        <button type="submit" className="lc-btn lc-btn-destructive">
          {confirmLabel}
        </button>
        <button type="button" className="lc-btn lc-btn-secondary" onClick={() => setAsking(false)}>
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
