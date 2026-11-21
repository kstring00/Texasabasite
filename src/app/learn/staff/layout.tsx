import type { Metadata } from 'next';
import { LogOut } from 'lucide-react';
import { LcEducationBand } from '@/components/learn/LcEducationBand';
import { LcEmpty } from '@/components/learn/LcEmpty';
import { LcSubNav } from '@/components/learn/LcSubNav';
import { LcStaffDemoBanner, LcStaffSignIn } from '@/components/learn/staff/LcStaffChrome';
import { LcStaffShell, type LcStaffNavItem } from '@/components/learn/staff/LcStaffShell';
import { learnFlags } from '@/lib/learn/flags';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { canOpenProduction, reviewQueue } from '@/lib/learn/staff/pipeline';
import { reportTargets } from '@/lib/learn/staff/reports';
import { LC_ROLE_LABEL, can } from '@/lib/learn/staff/roles';
import { getStaffStore } from '@/lib/learn/staff/store';
import { signOutAction } from './actions';

// Staff pages are never indexed, in any mode.
export const metadata: Metadata = { title: { default: 'Staff workspace', template: '%s · Staff workspace | Caregiver Learning Center' }, robots: { index: false, follow: false } };

/**
 * Everything under /learn/staff passes through here.
 *
 * 1. Staff demo off (the default, and always on Vercel): one closed page, whatever the address.
 * 2. Demo on but nobody signed in: the fictional role picker.
 * 3. Signed in: the workspace, with links chosen from the role's permissions.
 *
 * This layout is the front door, not the lock. Each page, action and file route checks again.
 */
export default async function LearnStaffLayout({ children }: { children: React.ReactNode }) {
  if (!learnFlags.demoStaff) {
    return (
      <>
        <LcSubNav />
        <div className="wrap lc-page">
          <LcEmpty
            pageTitle
            title="Staff sign-in is not set up yet"
            text="The staff workspace needs the organization’s approved sign-in before it can open. Nothing is available here yet."
            action={{ href: '/learn', label: 'Back to the Learning Center' }}
          />
        </div>
        <LcEducationBand />
      </>
    );
  }

  const actor = await getStaffActor();
  if (!actor) {
    return (
      <div data-lc-chrome="app" data-lc-scene="staff" className="lc-staff">
        <LcStaffDemoBanner />
        <LcStaffSignIn />
      </div>
    );
  }

  const nav: LcStaffNavItem[] = [{ href: '/learn/staff', label: 'Overview', icon: 'overview' }];
  if (can(actor, 'submission.create')) nav.push({ href: '/learn/staff/submissions', label: 'My submissions', icon: 'mine' });
  if (can(actor, 'submission.read_all')) nav.push({ href: '/learn/staff/submissions/all', label: 'All submissions', icon: 'all' });
  if (can(actor, 'review.source') || can(actor, 'review.final')) {
    const q = reviewQueue(getStaffStore(), actor);
    nav.push({ href: '/learn/staff/reviews', label: 'Reviews', icon: 'reviews', count: q.sources.filter((x) => !x.blocked).length + q.modules.filter((x) => !x.blocked).length });
  }
  if (canOpenProduction(actor)) nav.push({ href: '/learn/staff/modules', label: 'Modules', icon: 'modules' });
  if (can(actor, 'training.manage')) nav.push({ href: '/learn/staff/trainings', label: 'Trainings', icon: 'trainings' });
  if (can(actor, 'analytics.view')) {
    const waiting = reportTargets(getStaffStore(), actor, new Date()).filter((x) => x.report === null).length;
    nav.push({ href: '/learn/staff/analytics', label: 'Reporting', icon: 'reporting', count: waiting });
  }

  return (
    <div data-lc-chrome="app" data-lc-scene="staff" className="lc-staff">
      <LcStaffDemoBanner />
      <LcStaffShell
        nav={nav}
        who={actor.displayName}
        role={LC_ROLE_LABEL[actor.role]}
        signOut={
          <form action={signOutAction}>
            <button type="submit" className="lc-shell-signout">
              <LogOut width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
              Switch demo role
            </button>
          </form>
        }
      >
        {children}
      </LcStaffShell>
    </div>
  );
}
