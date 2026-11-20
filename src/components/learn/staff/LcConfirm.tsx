'use client';

import { useEffect, useState } from 'react';

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

/** Rendered on the sign-in screen: forget this tab's wizard step and unsaved typing, so nothing carries from one role to the next. */
export function LcForgetWizardState() {
  useEffect(() => {
    try {
      for (const key of Object.keys(window.sessionStorage)) if (key.startsWith('lc-wizard-')) window.sessionStorage.removeItem(key);
    } catch {
      /* storage blocked */
    }
  }, []);
  return null;
}
