/**
 * Registration links. A training listing may only point at the official Microsoft Teams
 * registration page for that event. It must never hold a join link, which would let someone
 * skip registration and approval. This check runs before any link is shown as active.
 */
const REGISTRATION_HOSTS = ['events.teams.microsoft.com', 'teams.microsoft.com'];
const JOIN_LINK_PATTERNS = [/\/l\/meetup-join\//i, /\/meet\//i, /\/meetingjoin/i, /[?&]meetingjoin/i];

export type LcRegistrationCheck = { ok: true; url: string } | { ok: false; reason: string };

export function checkRegistrationUrl(raw: string | null | undefined): LcRegistrationCheck {
  if (!raw || !raw.trim()) return { ok: false, reason: 'No registration link has been added yet.' };
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return { ok: false, reason: 'This is not a complete web address.' };
  }
  if (u.protocol !== 'https:') return { ok: false, reason: 'The link must start with https://.' };
  if (u.username || u.password) return { ok: false, reason: 'The link must not contain a username or password.' };
  if (!REGISTRATION_HOSTS.includes(u.hostname.toLowerCase())) return { ok: false, reason: 'The link must be a Microsoft Teams registration page.' };
  if (JOIN_LINK_PATTERNS.some((p) => p.test(u.pathname + u.search))) {
    return { ok: false, reason: 'This looks like a link for joining a meeting. Use the event registration link instead.' };
  }
  return { ok: true, url: u.toString() };
}
