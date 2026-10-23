/**
 * Site-wide facts. Edit here, never in components.
 * "verified" means it was on texasabacenters.com when this site was built.
 */
export const site = {
  name: 'Texas ABA Centers',
  shortName: 'Texas ABA',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://texasabacenters.com',
  tagline: 'ABA therapy and autism evaluations across Texas, with no long waitlist.',
  /** Main line shown on the current site. Verified. */
  phone: { display: '(877) 771-5725', tel: '+18777715725' },
  /** Second line shown on the current contact page beside the hours. Verified. */
  phoneAlt: { display: '(844) 620-8837', tel: '+18446208837' },
  /** Phone hours listed on the current contact page. Verified (phone line, not center hours). */
  phoneHours: 'Every day, 8:00 AM to 10:00 PM',
  /** Corporate careers page. We link out; we never build a careers section. */
  careersUrl: 'https://www.texasabacenters.com/about-us/careers/',
  /** Spanish is offered on the current site. Routing is ready; copy is the post-demo step. */
  languages: ['en', 'es'] as const,
  /** Who replies to tour requests. Pulled from people.ts at render time; this is the fallback. */
  responsePromise: 'We will text you within one business day to confirm a time.',
  /** The Vimeo id for "A Mother's Mission". Leave null until supplied; the section hides itself. */
  motherMissionVimeoId: null as string | null,
  social: {} as Record<string, string>,
};

export type Lang = (typeof site.languages)[number];
