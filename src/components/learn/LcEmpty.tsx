import Link from 'next/link';
import { LcOrb } from './LcOrb';

/** A useful empty state: one line, one sentence, one way forward. */
export function LcEmpty({ title, text, action, orb = true, children }: { title: string; text: string; action?: { href: string; label: string }; orb?: boolean; children?: React.ReactNode }) {
  return (
    <div className="lc-surface lc-empty">
      {orb ? (
        <div className="lc-empty-orb" aria-hidden="true">
          <LcOrb />
        </div>
      ) : null}
      <p className="lc-empty-title">{title}</p>
      <p className="lc-muted">{text}</p>
      {action ? (
        <Link href={action.href} className="lc-btn lc-btn-primary">
          {action.label}
        </Link>
      ) : null}
      {children}
    </div>
  );
}
