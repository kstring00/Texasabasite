'use client';

import { Analytics } from '@vercel/analytics/next';

/** The site's anonymous page-view analytics, with every /learn/staff page view dropped. */
export function LcAnalytics() {
  return <Analytics beforeSend={(event) => (new URL(event.url, 'https://x.invalid').pathname.startsWith('/learn/staff') ? null : event)} />;
}
