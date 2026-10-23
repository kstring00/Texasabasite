'use client';

import { CENTER_NAME } from '@/data/people';

/** "Your center: Sugar Land · change", small and unobtrusive. */
export function CenterPill({ centerId, onChange, className = '' }: { centerId: string; onChange?: () => void; className?: string }) {
  return (
    <span className={`inline-flex min-h-9 items-center gap-2 rounded-full border border-line px-3 font-sans text-[14px] text-soft ${className}`}>
      Your center: <b className="font-semibold text-ink">{CENTER_NAME[centerId] ?? centerId}</b>
      {onChange && (
        <>
          <span aria-hidden>·</span>
          <button type="button" onClick={onChange} className="font-semibold text-cobalt underline-offset-4 hover:underline">
            change
          </button>
        </>
      )}
    </span>
  );
}
