/**
 * Insurance and cost. The accepted-plan list is pending from Texas ABA Centers.
 * An empty list hides the logo row. Never guess a payer.
 */
export const insurance = {
  /** e.g. { name: 'Blue Cross Blue Shield of Texas', logo: '/images/insurance/bcbstx.svg' } */
  plans: [] as { name: string; logo?: string }[],
  freeVerification:
    'We verify your benefits for free before you commit to anything. You will know what your plan covers and what you would pay before the first session.',
  /** Verified: Texas Insurance Code 1355.015. Applies to state-regulated plans. */
  mandate:
    'Texas law requires most state-regulated health plans to cover ABA therapy for a child diagnosed with autism before their 10th birthday. Self-funded employer plans and some others follow federal rules instead. We will tell you which kind you have.',
  medicaidNote:
    'Texas Medicaid has covered ABA therapy for eligible children since 2022. Ask us and we will check your child\'s eligibility.',
  costTerms: [
    { term: 'Deductible', plain: 'What you pay first each year before the plan starts paying its share.' },
    { term: 'Copay', plain: 'A flat amount per visit, like $30.' },
    { term: 'Coinsurance', plain: 'A percentage of each visit you pay after the deductible, like 20%.' },
    { term: 'Out-of-pocket max', plain: 'The most you pay in a year. After this, the plan pays 100%.' },
    { term: 'Authorization', plain: 'The plan\'s approval for therapy hours. We request it for you.' },
  ],
  afterYouSubmit: [
    'A real person texts you within one business day.',
    'You send a photo of your insurance card.',
    'We call your plan and come back with plain numbers.',
    'You decide. No pressure, no deadline.',
  ],
};
