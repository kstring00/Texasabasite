import Link from 'next/link';
import { LcOrb } from './LcOrb';

/**
 * A useful empty state: one line, one sentence, one way forward.
 * When it is the whole page (a closed or missing page), `pageTitle` makes its title the page's main heading.
 */
export function LcEmpty({ title, text, action, orb = true, pageTitle = false, children }: { title: string; text: string; action?: { href: string; label: string }; orb?: boolean; pageTitle?: boolean; children?: React.ReactNode }) {
  const Title = pageTitle ? 'h1' : 'p';
  return (
    <div className="lc-surface lc-empty">
      {orb ? (
        <div className="lc-empty-orb" aria-hidden="true">
          <LcOrb />
        </div>
      ) : null}
      <Title className="lc-empty-title">{title}</Title>
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
