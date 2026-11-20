import Link from 'next/link';
import { ArrowLeft, Info, KeyRound, RotateCcw } from 'lucide-react';
import { demoStaff } from '@/data/learn/demo/staff';
import { LC_ROLE_LABEL, capabilitiesOf } from '@/lib/learn/staff/roles';
import { resetDemoAction, signInAction } from '@/app/learn/staff/actions';

/** The amber strip across the top of every demo staff page. It cannot be dismissed. */
export function LcStaffDemoBanner() {
  return (
    <div className="lc-demo-bar lc-demo-bar-staff" data-cast="amber" role="note">
      <div className="lc-demo-bar-inner">
        <Info width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
        <p>
          Illustrative demo data. <span className="lc-only-wide">Fictional staff and synthetic files, kept only on this computer. This is not real sign-in and nothing here is clinically approved.</span>
          <span className="lc-only-narrow">Fictional staff, not real sign-in.</span>
        </p>
      </div>
    </div>
  );
}

const WHAT: Record<string, string> = {
  rbt: 'Submits PowerPoints and sees only their own.',
  apprentice: 'Submits PowerPoints and sees only their own.',
  bcba_reviewer: 'Can read every submission. Reviewing arrives in the next build phase.',
  clinical_director: 'Can read every submission. Reviewing and publishing arrive in the next build phases.',
};

/** Demo sign-in: pick a fictional role. Shown only when the staff demo flag is on, which is local machines only. */
export function LcStaffSignIn() {
  return (
    <div className="lc-signin">
      <Link href="/learn" className="lc-back">
        <ArrowLeft width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
        Back to the Learning Center
      </Link>
      <div className="lc-solid lc-signin-card">
        <span className="lc-icon-tile" data-cast="iris" aria-hidden="true">
          <KeyRound width={26} height={26} strokeWidth={1.75} />
        </span>
        <h1 className="lc-h1">Staff workspace demo</h1>
        <p className="lc-lead lc-pagehead-lead">Choose a fictional role to look around. There is no password because this is not real sign-in. It only works on this computer.</p>
        <ul className="lc-persona-list">
          {demoStaff.map((p) => (
            <li key={p.id}>
              <form action={signInAction}>
                <input type="hidden" name="persona" value={p.id} />
                <button type="submit" className="lc-persona">
                  <span className="lc-persona-name">Continue as {p.displayName}</span>
                  <span className="lc-persona-role">{LC_ROLE_LABEL[p.role]}</span>
                  <span className="lc-persona-what">{WHAT[p.role] ?? `${capabilitiesOf(p.role).length} permissions`}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
        <form action={resetDemoAction} className="lc-signin-reset">
          <button type="submit" className="lc-btn lc-btn-quiet">
            <RotateCcw width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            Reset demo data
          </button>
          <p className="lc-muted">Puts the sample submissions back and removes every file uploaded during the demo.</p>
        </form>
      </div>
    </div>
  );
}
