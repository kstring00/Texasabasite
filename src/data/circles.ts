/**
 * Parent circles and support groups that live in Common Ground (/families).
 * These mirror the planned pilot groups in the Common Ground codebase.
 * `status` is honest: "pilot" means the group is planned, not meeting yet.
 */
export type Circle = {
  id: string;
  name: string;
  who: string;
  status: 'open' | 'pilot';
  href: string;
  regions: ('Houston' | 'Dallas–Fort Worth' | 'Austin' | 'all')[];
};

export const circles: Circle[] = [
  {
    id: 'new-diagnosis',
    name: 'New Diagnosis Circle',
    who: 'Parents learning a new language, making early decisions, and carrying a lot at once.',
    status: 'pilot',
    href: '/families/connect',
    regions: ['all'],
  },
  {
    id: 'working-parents',
    name: 'Working Parents Circle',
    who: 'Parents balancing work, appointments, school communication, and recovery.',
    status: 'pilot',
    href: '/families/connect',
    regions: ['all'],
  },
];

/** The "While You Wait" entry points inside Common Ground. */
export const whileYouWait = [
  { title: 'While You Wait', text: 'Everything for the weeks between the call and the first day, in one place.', href: '/families/while-you-wait' },
  { title: 'I need a next step', text: 'A short guided path to what matters this week.', href: '/families/intake' },
  { title: 'What is ABA, in plain words', text: 'No jargon. What a session looks like and what your role is.', href: '/families/what-is-aba' },
  { title: 'Help at home right now', text: 'Routines, transitions, and the hard moments.', href: '/families/at-home' },
  { title: 'Paying for care', text: 'Insurance, Medicaid, waivers, and grants explained.', href: '/families/financial' },
  { title: 'Parent Pulse', text: 'A one-minute weekly check-in on you.', href: '/families/pulse' },
];
