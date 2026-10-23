/**
 * The 5-step path from first worry to first day.
 * "duration" lines are assumed until Dom confirms; they are phrased as ranges, never promises.
 */
export type Step = {
  n: number;
  slug: string;
  title: string;
  short: string;
  whoYouMeet: string;
  whatToBring: string;
  howLong: string;
  howLongVerified: boolean;
  whatHappens: string[];
  whatsNext: string;
  answers: string;
};

export const steps: Step[] = [
  {
    n: 1,
    slug: 'talk',
    title: 'Talk to a person',
    short: 'Call or request a tour. A real person texts you back.',
    whoYouMeet: 'A family contact, not a call center.',
    whatToBring: 'Nothing. Just what you have noticed and what the pediatrician said.',
    howLong: 'A 10-minute call. We reply within one business day.',
    howLongVerified: false,
    whatHappens: [
      'You tell us what is going on in your own words.',
      'We tell you whether your child needs an evaluation first or can go straight to a benefits check.',
      'You pick the center closest to you and a time to see it.',
    ],
    whatsNext: 'If your child has no diagnosis yet, we schedule an evaluation. If they do, we verify your benefits.',
    answers: '"Who do I call? I do not want a call center."',
  },
  {
    n: 2,
    slug: 'evaluation',
    title: 'Evaluation, if needed',
    short: 'We do it in-house. No separate waitlist.',
    whoYouMeet: 'A licensed evaluator and your family contact.',
    whatToBring: 'Any reports from your pediatrician, school, or Early Childhood Intervention. Your insurance card.',
    howLong: 'One or two visits, then a sit-down to go over the report.',
    howLongVerified: false,
    whatHappens: [
      'The evaluator plays with your child and talks with you about their history.',
      'You get a written report in plain language.',
      'If the answer is autism, we start planning care right away.',
    ],
    whatsNext: 'Benefits verification. We already have what we need.',
    answers: '"Does my child need a diagnosis first?"',
  },
  {
    n: 3,
    slug: 'benefits',
    title: 'Benefits verified, free',
    short: 'We call your insurance so you do not have to.',
    whoYouMeet: 'Your family contact and our benefits team.',
    whatToBring: 'A photo of the front and back of your insurance card.',
    howLong: 'Usually a few business days.',
    howLongVerified: false,
    whatHappens: [
      'We check what your plan covers for evaluation and therapy.',
      'We explain your deductible, copay or coinsurance, and out-of-pocket max in plain words.',
      'You know what it costs before you commit to anything.',
    ],
    whatsNext: 'Your tour, if you have not taken it yet, and a start date.',
    answers: '"Do you take my insurance? What will it actually cost?"',
  },
  {
    n: 4,
    slug: 'tour',
    title: 'Tour',
    short: 'See the rooms. Meet the people. Ask everything.',
    whoYouMeet: 'The center\'s clinical lead and your family contact.',
    whatToBring: 'Your child, if you like. Your questions. A sibling is welcome.',
    howLong: 'About 30 to 45 minutes.',
    howLongVerified: false,
    whatHappens: [
      'You walk through the therapy rooms, the play spaces, and the parent area.',
      'You meet a BCBA and see how a session looks.',
      'You ask every question, including the hard ones.',
    ],
    whatsNext: 'If it feels right, we schedule your first day.',
    answers: '"What happens on a tour? What do I bring?"',
  },
  {
    n: 5,
    slug: 'first-day',
    title: 'First day',
    short: 'A gentle start. You stay as long as you need.',
    whoYouMeet: 'Your child\'s BCBA and RBT.',
    whatToBring: 'A comfort item, a snack, a change of clothes for little ones.',
    howLong: 'The first days are shorter so your child can settle in.',
    howLongVerified: false,
    whatHappens: [
      'Your child meets their RBT with you nearby.',
      'The first sessions are mostly play and getting comfortable.',
      'You and the BCBA agree on how to talk during the week: text, calls, or a quick chat at pickup.',
    ],
    whatsNext: 'Parent training, regular progress reviews, and Common Ground: the parent community you can join from day one.',
    answers: '"Will I be included or shut out once my kid starts?"',
  },
];
