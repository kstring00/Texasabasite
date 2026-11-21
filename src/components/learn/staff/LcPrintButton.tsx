'use client';

import { Printer } from 'lucide-react';

/** Opens the browser's print dialog. The print layout drops the menu and the buttons and keeps the demo banner. */
export function LcPrintButton() {
  return (
    <button type="button" className="lc-btn lc-btn-secondary" onClick={() => window.print()}>
      <Printer width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
      Print
    </button>
  );
}
