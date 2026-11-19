import Link from 'next/link';
import { Info } from 'lucide-react';

/**
 * The quiet band above the site footer on every caregiver page: the educational-use statement,
 * the pilot notice, and the Learning Center's own privacy and accessibility notes.
 * Wording is a draft pending organizational and clinical review.
 */
export function LcEducationBand() {
  return (
    <aside className="lc-band" aria-label="About these learning resources">
      <div className="wrap">
        <div className="lc-surface lc-band-inner">
          <Info width={22} height={22} strokeWidth={1.75} aria-hidden="true" className="lc-band-icon" />
          <div>
            <p className="lc-band-statement">
              These educational resources support general learning. Your child&rsquo;s supervising Board Certified Behavior Analyst (BCBA) is responsible for individualized recommendations and treatment planning.
            </p>
            <p className="lc-band-note">Sugar Land pilot. The wording on these pages is a draft that is still being reviewed.</p>
            <ul className="lc-band-links">
              <li><Link href="/learn/privacy">Privacy for the Learning Center</Link></li>
              <li><Link href="/learn/accessibility">Accessibility</Link></li>
              <li><Link href="/learn/staff">Staff sign-in</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
