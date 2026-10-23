/**
 * Every word the Getting Started section says, plus the family contact.
 * Copy is verbatim from design/getting-started-reference.html.
 */

export type SceneKind = 'chat' | 'eval' | 'vob' | 'start';

export type Contact = {
  initials: string;
  name: string;
  role: string;
  phone: string;
  tel: string;
  /** Path under /public. No photo of Marcie exists in the repo yet; the initials are the fallback. */
  photo?: string;
};

export type Step = {
  title: string;
  body: string;
  meet: string;
  you: string;
  we: string;
  scene: SceneKind;
  /** Optional text link under the card, into Common Ground. */
  link?: { text: string; href: string };
};

// TODO: confirm — is Marcie the family contact for every center?
export const contact: Contact = {
  initials: 'MP',
  name: 'Marcie Pena',
  role: 'Your family contact, from first text to first day',
  phone: '(877) 771-5725',
  tel: '+18777715725',
};

export const firstName = contact.name.split(' ')[0];

export const header = {
  eyebrow: 'GETTING STARTED',
  title: 'Four steps. One person with you the whole way.',
  lede: 'Most families start with a single text. From there, your family contact walks with you through the evaluation, insurance and your child’s first day.',
};

export const steps: Step[] = [
  {
    title: 'Talk to a person',
    body: 'Call or request a tour. A real person texts you back.',
    meet: 'Your family contact.',
    you: 'Call, text, or tap Request a tour. That is all.',
    we: 'A real person texts you back, answers your questions and books your tour.',
    scene: 'chat',
  },
  {
    title: 'Evaluation, if needed',
    body: 'We do it in-house. No separate waitlist.',
    meet: 'A licensed evaluator and your family contact.',
    you: 'Bring your child, your insurance card and any past reports.', // TODO: confirm with the clinical team
    we: 'Run a play-based visit and go over the results with you in plain language.',
    scene: 'eval',
    link: { text: 'Waiting on your evaluation? See what to do while you wait', href: '/families/while-you-wait' },
  },
  {
    title: 'Benefits verified, free',
    body: 'We call your insurance so you do not have to.',
    meet: 'Your family contact and our benefits team.',
    you: 'Send a photo of the front and back of your insurance card.',
    we: 'Call your plan and explain what is covered before anything starts.',
    scene: 'vob',
  },
  // TODO: confirm step 4 with the clinical team
  {
    title: 'Start therapy',
    body: 'Meet your care team and begin with a plan built around your child.',
    meet: 'Your BCBA, your child’s therapist and your family contact.',
    you: 'Pick the days and times that work for your family.',
    we: 'Match your child with a BCBA and therapist and set their first goals with you.',
    scene: 'start',
    link: { text: 'Meet the people on your team', href: '/families/care-team' },
  },
];

/** The tour form the site already uses. */
export const tourHref = '/request-a-tour';
