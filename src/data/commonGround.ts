import type { LucideIcon } from 'lucide-react';
import { Activity, BookOpen, Clock3, Compass, HeartHandshake, HeartPulse, HelpCircle, Lightbulb, Search, Stethoscope, Users, Wallet } from 'lucide-react';
import { AT_HOME_STRATEGIES_LABEL, MARRIAGE_RELATIONSHIPS_LABEL, RESOURCE_HUB_LABEL } from '@/lib/supportNavLabels';

/**
 * Common Ground: the parent-support section, mounted at /families.
 * One source of truth for the mega-menu, the section sub-nav, the footer column,
 * the landing page and the breadcrumbs. Descriptions are each page's own intro line.
 */
export const CG_HOME = '/families';
export const CG_NEXT_STEP = '/families/intake';
export const CG_PHONE = { display: '(877) 771-5725', tel: '+18777715725' };

export type CgPage = { href: string; label: string; icon: LucideIcon; description: string };
export type CgGroup = { id: string; label: string; blurb: string; pages: CgPage[] };

export const cgGroups: CgGroup[] = [
  {
    id: 'start-here',
    label: 'Start here',
    blurb: 'The first three doors. Pick one.',
    pages: [
      { href: '/families/care-plan', label: 'My Support Guide', icon: Compass, description: 'A short, guided path to one useful next step for the week you are actually having.' },
      { href: '/families/connect', label: 'Parent Circles & Groups', icon: Users, description: 'A moderated space for parents learning a new language, making early decisions, and carrying a lot at once.' },
      { href: '/families/intake', label: 'Find my next step', icon: Search, description: 'Two quick questions, then one focused starting point.' },
    ],
  },
  {
    id: 'your-center',
    label: 'Your center',
    blurb: 'What is happening at Texas ABA Centers, and who is on your side.',
    pages: [
      { href: '/families/while-you-wait', label: 'While You Wait', icon: Clock3, description: 'What to do between the first call and the first day. Free, before you are enrolled anywhere.' },
      { href: '/families/pulse', label: 'Parent Pulse', icon: Activity, description: 'A one-minute weekly check-in on how you are doing, not just your child. Stays on your device.' },
      { href: '/families/care-team', label: 'Your Care Team', icon: Stethoscope, description: 'Who is on your child’s team, what a BCBA and an RBT do, and how to reach a real person.' },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    blurb: 'For you, and for the people carrying this with you.',
    pages: [
      { href: '/families/caregiver', label: 'Mental Health Toolbox', icon: HeartPulse, description: 'Tools for before, during, and after the hard moments. Saved on this device.' },
      { href: '/families/couples', label: MARRIAGE_RELATIONSHIPS_LABEL, icon: HeartHandshake, description: 'Support for the relationships that support your child.' },
      { href: '/families/siblings', label: 'Sibling Support', icon: Users, description: 'What siblings need at 3–6, 7–11, 12–16, and 17+.' },
    ],
  },
  {
    id: 'learn',
    label: 'Learn',
    blurb: 'Plain answers, practical help, and the money questions.',
    pages: [
      { href: '/families/what-is-aba', label: 'What Is ABA?', icon: HelpCircle, description: 'The honest definition, in plain language.' },
      { href: '/families/at-home', label: AT_HOME_STRATEGIES_LABEL, icon: Lightbulb, description: 'Why a behavior happens and what to try at home, one function at a time.' },
      { href: '/families/resources', label: RESOURCE_HUB_LABEL, icon: BookOpen, description: 'Resources that actually help: worksheets, guides and places to call.' },
      { href: '/families/find', label: 'Find Local Help', icon: Search, description: 'Providers and community resources near you, with a private shortlist.' },
      { href: '/families/financial', label: 'Paying for Care', icon: Wallet, description: 'What ABA, speech, and OT plans cover, and the calls to make first.' },
    ],
  },
];

export const cgPages: CgPage[] = cgGroups.flatMap((g) => g.pages);

/** Titles for pages that live under Common Ground but are not in the menu. */
const extraTitles: Record<string, string> = {
  '/families/intake': 'Find my next step',
  '/families/check-in': 'Check-in',
  '/families/hard-days': 'Grounding for hard days',
  '/families/sleep': 'Sleep',
  '/families/crisis': 'Crisis support',
  '/families/mental-health': 'Mental Health Toolbox',
  '/families/community': 'Community',
  '/families/pathfinders': 'Pathfinders',
  '/families/providers': 'For providers',
  '/families/sensory-friendly': 'Sensory-friendly',
  '/families/help': 'Help',
  '/families/caregiver/identity': 'Identity',
  '/families/care-plan/crisis': 'Crisis support',
};

/** The group and page that own a pathname, for the sub-nav and the breadcrumb. */
export function cgLocate(pathname: string): { group: CgGroup | null; page: CgPage | null; title: string | null } {
  if (pathname === CG_HOME) return { group: null, page: null, title: null };
  let best: { group: CgGroup; page: CgPage } | null = null;
  for (const group of cgGroups) {
    for (const page of group.pages) {
      if (pathname === page.href || pathname.startsWith(page.href + '/')) {
        if (!best || page.href.length > best.page.href.length) best = { group, page };
      }
    }
  }
  if (best) return { group: best.group, page: best.page, title: best.page.label };
  const key = Object.keys(extraTitles).find((k) => pathname === k || pathname.startsWith(k + '/'));
  return { group: null, page: null, title: key ? extraTitles[key] : null };
}
