'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { WhoToContact } from './WhoToContact';

/** A modal sheet with the router, preselected to a center. Escape closes; focus returns to the opener. */
export function WhoToContactSheet({ open, onClose, centerId, place }: { open: boolean; onClose: () => void; centerId: string; place: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement;
    const first = ref.current?.querySelector<HTMLElement>('button, a');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Who to contact" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] bg-paper p-6 text-ink shadow-[0_40px_80px_-30px_rgb(23_38_56/0.6)] sm:rounded-[28px] sm:p-8">
        <div className="mb-2 flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary min-h-10 px-3 py-1 text-[14px]" aria-label="Close">
            <X className="h-4 w-4" aria-hidden /> Close
          </button>
        </div>
        <WhoToContact centerId={centerId} place={place} />
      </div>
    </div>
  );
}
