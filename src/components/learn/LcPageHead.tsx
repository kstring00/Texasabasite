import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** A plain "back to" link above a page. Always a word, never an arrow alone. */
export function LcBack({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="lc-back">
      <ArrowLeft width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </Link>
  );
}

/** The title block at the top of a caregiver page. Sits on a surface so its supporting line is easy to read. */
export function LcPageHead({ eyebrow, title, lead, children, id = 'lc-page-title' }: { eyebrow?: string; title: React.ReactNode; lead?: React.ReactNode; children?: React.ReactNode; id?: string }) {
  return (
    <header className="lc-surface lc-pagehead">
      {eyebrow ? <p className="lc-eyebrow">{eyebrow}</p> : null}
      <h1 id={id} className="lc-h1">
        {title}
      </h1>
      {lead ? <p className="lc-lead lc-pagehead-lead">{lead}</p> : null}
      {children}
    </header>
  );
}
