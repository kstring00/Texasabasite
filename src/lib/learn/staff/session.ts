import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * The demo session token: a persona id plus a signature made with a secret that never leaves
 * the server. It lives in an httpOnly cookie, so page scripts cannot read or forge it.
 *
 * This is demo sign-in for a local machine only. It is not authentication and must never be
 * presented as real sign-in. Real use needs the organization's identity provider.
 */
export const LC_SESSION_COOKIE = 'lc-demo-staff';

const sign = (personaId: string, secret: string) => createHmac('sha256', secret).update(`lc-demo-staff:v1:${personaId}`).digest('base64url');

export function makeSessionToken(personaId: string, secret: string): string {
  return `${personaId}.${sign(personaId, secret)}`;
}

/** Returns the persona id only when the signature matches. Anything else is null. */
export function readSessionToken(token: string | undefined | null, secret: string): string | null {
  if (!token || !secret) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const personaId = token.slice(0, dot);
  if (!/^[a-z0-9-]{1,40}$/.test(personaId)) return null;
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(personaId, secret));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return personaId;
}
