import { describe, expect, it } from 'vitest';
import { checkRegistrationUrl } from './registration';

describe('registration links', () => {
  it('accepts an official Teams event registration page', () => {
    expect(checkRegistrationUrl('https://events.teams.microsoft.com/event/1234@abcd').ok).toBe(true);
    expect(checkRegistrationUrl('  https://teams.microsoft.com/registration/xyz  ').ok).toBe(true);
  });
  it('treats a missing link as not ready, never as active', () => {
    for (const v of [null, undefined, '', '   ']) expect(checkRegistrationUrl(v).ok).toBe(false);
  });
  it('rejects scripts, other schemes and plain http', () => {
    for (const v of ['javascript:alert(1)', 'data:text/html,hi', 'http://events.teams.microsoft.com/event/1', 'not a link', '//events.teams.microsoft.com/x']) {
      expect(checkRegistrationUrl(v).ok).toBe(false);
    }
  });
  it('rejects look-alike and unrelated hosts', () => {
    for (const v of ['https://events.teams.microsoft.com.evil.example/event/1', 'https://evil.example/?u=events.teams.microsoft.com', 'https://user:pw@events.teams.microsoft.com/event/1', 'https://zoom.us/j/123']) {
      expect(checkRegistrationUrl(v).ok).toBe(false);
    }
  });
  it('rejects a link for joining a meeting', () => {
    const r = checkRegistrationUrl('https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc/0');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/joining a meeting/);
    expect(checkRegistrationUrl('https://teams.microsoft.com/meet/123456').ok).toBe(false);
  });
});
