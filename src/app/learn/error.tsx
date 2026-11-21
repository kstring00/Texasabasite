'use client';

import Link from 'next/link';
import { RotateCcw } from 'lucide-react';

/**
 * Shown if a Learning Center page fails while loading. It says what happened in plain words,
 * offers a way forward, and shows no technical detail. Nothing a caregiver did is lost: lesson
 * progress stays saved on their device.
 */
export default function LearnError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap lc-page">
      <div className="lc-surface lc-empty" role="alert">
        <h1 className="lc-empty-title">Something went wrong on this page</h1>
        <p className="lc-muted">This is a problem on our side, not something you did. Please try again.</p>
        <div className="lc-action-row lc-error-actions">
          <button type="button" className="lc-btn lc-btn-primary" onClick={() => reset()}>
            <RotateCcw width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            Try again
          </button>
          <Link href="/learn" className="lc-btn lc-btn-secondary">
            Back to the Learning Center
          </Link>
        </div>
      </div>
    </div>
  );
}
