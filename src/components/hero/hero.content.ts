/**
 * Every word, alt text and label in the hero. Edit here, not in markup.
 */
export const heroContent = {
  eyebrow: 'TEXAS ABA CENTERS',
  headline: { line1: 'A whole lot', line2: 'of life', line3: 'happens', word: 'next.' },
  lede: {
    before: 'Autism evaluations and individualized ABA therapy across Texas. From the first evaluation we work toward one day: ',
    strong: 'graduation',
    after: ', when your child steps into school, friendships and the real world with the skills to thrive.',
  },
  primaryCta: { label: 'Find a center', href: '#locations' },
  secondaryCta: { label: 'Talk to someone', href: 'tel:+18777715725' },
  promise: { strong: 'Every graduation starts with one conversation.', rest: ' Yours can start today.' },
  photos: {
    a: {
      src: '/images/hero/therapy-table.jpg',
      alt: 'A Texas ABA Centers therapist and a young girl sorting colorful emotion plush toys at a blue table while a second team member works on a tablet beside them, under an “IN YOU” wall mural',
      width: 768,
      height: 432,
    },
    b: {
      src: '/images/hero/slide.jpg',
      alt: 'A smiling boy in a grey hoodie sitting barefoot at the top of a yellow slide in the center’s purple indoor play structure',
      width: 500,
      height: 500,
    },
  },
  /** Replace with real milestones. The last chip is always the yellow one. */
  milestones: ['First words', 'First friend', 'First day of school', 'Graduation day'],
  milestonesIntro: 'The milestones we work toward together:',
};

export type HeroContent = typeof heroContent;
