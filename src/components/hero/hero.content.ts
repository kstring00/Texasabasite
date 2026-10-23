/**
 * Every word in the hero lives here so it can be edited without touching markup.
 * The H1 renders as three masked lines; `next` is the italic word with the underline.
 */
export const heroContent = {
  eyebrow: 'TEXAS ABA CENTERS',
  headline: {
    line1: 'A whole lot',
    line2Prefix: 'of ',
    line2Word: 'life',
    line3Prefix: 'happens',
    line3Word: 'next.',
  },
  lede: {
    before: 'Autism evaluations and individualized ABA therapy across Texas. From the first evaluation we work toward one day: ',
    strong: 'graduation',
    after: ', when your child steps into school, friendships and the real world with the skills to thrive.',
  },
  primaryCta: { label: 'Find a center', href: '#centers' },
  secondaryCta: { label: 'Talk to someone', href: 'tel:+18777715725' },
  promise: { strong: 'Every graduation starts with one conversation.', rest: ' Yours can start today.' },
  caption: 'SIX CENTERS · TEXAS',
  /** Replace with real milestones. The last chip is always the yellow one. */
  milestones: ['First words', 'First friend', 'First day of school', 'Graduation day'],
};

export type HeroContent = typeof heroContent;
