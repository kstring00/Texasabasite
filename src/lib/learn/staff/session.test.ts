import { describe, expect, it } from 'vitest';
import { makeSessionToken, readSessionToken } from './session';

const SECRET = 'a'.repeat(64);

describe('demo session token', () => {
  it('round-trips a persona id', () => {
    expect(readSessionToken(makeSessionToken('demo-rbt', SECRET), SECRET)).toBe('demo-rbt');
  });
  it('rejects a token signed with a different secret', () => {
    expect(readSessionToken(makeSessionToken('demo-rbt', 'b'.repeat(64)), SECRET)).toBeNull();
  });
  it('rejects a swapped persona: one role’s signature does not unlock another', () => {
    const [, sig] = makeSessionToken('demo-rbt', SECRET).split('.');
    expect(readSessionToken(`demo-director.${sig}`, SECRET)).toBeNull();
  });
  it('rejects missing, malformed and unsigned tokens', () => {
    for (const t of [undefined, null, '', 'demo-rbt', 'demo-rbt.', '.abc', 'DEMO RBT.abc', 'demo-rbt.not-the-signature']) expect(readSessionToken(t, SECRET)).toBeNull();
    expect(readSessionToken(makeSessionToken('demo-rbt', SECRET), '')).toBeNull();
  });
});
