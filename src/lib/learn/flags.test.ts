import { describe, expect, it } from 'vitest';
import { resolveLearnFlags } from './flags';

const ALL_ON = { NEXT_PUBLIC_LEARN_ENABLED: '1', LEARN_DEMO_CONTENT: '1', LEARN_DEMO_STAFF: '1' };

describe('Learning Center flags', () => {
  it('everything is off by default', () => {
    expect(resolveLearnFlags({})).toEqual({ enabled: false, demoContent: false, demoStaff: false });
  });

  it('only the exact value "1" turns a flag on', () => {
    for (const v of ['true', 'yes', '0', '', ' 1', 'on']) {
      expect(resolveLearnFlags({ NEXT_PUBLIC_LEARN_ENABLED: v, LEARN_DEMO_CONTENT: '1', LEARN_DEMO_STAFF: '1' })).toEqual({ enabled: false, demoContent: false, demoStaff: false });
    }
  });

  it('demo flags do nothing while the zone is off', () => {
    expect(resolveLearnFlags({ LEARN_DEMO_CONTENT: '1', LEARN_DEMO_STAFF: '1' })).toEqual({ enabled: false, demoContent: false, demoStaff: false });
  });

  it('enabled alone shows the zone with no demo content and no staff demo', () => {
    expect(resolveLearnFlags({ NEXT_PUBLIC_LEARN_ENABLED: '1' })).toEqual({ enabled: true, demoContent: false, demoStaff: false });
  });

  it('on a local machine all three can be on', () => {
    expect(resolveLearnFlags(ALL_ON)).toEqual({ enabled: true, demoContent: true, demoStaff: true });
  });

  it('staff demo is refused whenever VERCEL is set, in every Vercel environment', () => {
    for (const VERCEL_ENV of ['production', 'preview', 'development', undefined]) {
      expect(resolveLearnFlags({ ...ALL_ON, VERCEL: '1', VERCEL_ENV }).demoStaff).toBe(false);
    }
  });

  it('demo content is refused when VERCEL_ENV is production', () => {
    expect(resolveLearnFlags({ ...ALL_ON, VERCEL: '1', VERCEL_ENV: 'production' })).toEqual({ enabled: true, demoContent: false, demoStaff: false });
  });

  it('demo content is allowed on a Vercel preview, but staff demo still is not', () => {
    expect(resolveLearnFlags({ ...ALL_ON, VERCEL: '1', VERCEL_ENV: 'preview' })).toEqual({ enabled: true, demoContent: true, demoStaff: false });
  });
});
