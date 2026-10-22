'use client';

import { track as vercelTrack } from '@vercel/analytics';

/**
 * Custom events Dom can filter in Vercel Analytics.
 * Keep names stable; they are the report.
 */
export type SiteEvent =
  | { name: 'tour_request_submit'; center: string; source?: string }
  | { name: 'call_tap'; center: string; place: string }
  | { name: 'directions_tap'; center: string }
  | { name: 'coverage_check_click'; place: string }
  | { name: 'event_rsvp_click'; event: string; center?: string }
  | { name: 'circle_join_click'; circle: string }
  | { name: 'blog_read'; slug: string };

export function track(event: SiteEvent) {
  const { name, ...props } = event;
  try {
    vercelTrack(name, props as Record<string, string>);
  } catch {
    // analytics must never break the page
  }
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[track]', name, props);
  }
}

/** utm_* and referrer, captured once per session so the tour form can carry them. */
export function captureAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const key = 'tac_attribution';
    const existing = window.sessionStorage.getItem(key);
    if (existing) return JSON.parse(existing);
    const params = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    params.forEach((v, k) => {
      if (k.startsWith('utm_')) out[k] = v;
    });
    if (document.referrer) out.referrer = document.referrer;
    out.landing = window.location.pathname;
    window.sessionStorage.setItem(key, JSON.stringify(out));
    return out;
  } catch {
    return {};
  }
}
