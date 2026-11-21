/**
 * Learning Center flags. This is the ONLY place the three flags are read.
 *
 *  NEXT_PUBLIC_LEARN_ENABLED=1  the zone exists (off by default: every /learn route is a 404).
 *  LEARN_DEMO_CONTENT=1         caregiver pages show the labelled sample module and example training.
 *                               Ignored when VERCEL_ENV is "production".
 *  LEARN_DEMO_STAFF=1           the fictional role switcher and seeded staff workflow work.
 *                               Ignored whenever VERCEL is set, so it only ever runs on a local machine.
 *
 * Everything fails closed: a flag that is unset, misspelled or anything other than "1" is off.
 * In browser bundles only `enabled` is meaningful (the other two are server-only variables).
 */
export type LearnEnv = {
  NEXT_PUBLIC_LEARN_ENABLED?: string;
  LEARN_DEMO_CONTENT?: string;
  LEARN_DEMO_STAFF?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
};

export type LearnFlags = {
  /** The zone exists at all. */
  enabled: boolean;
  /** Labelled sample content may be shown on caregiver pages. */
  demoContent: boolean;
  /** The local-only fictional staff demo may run. */
  demoStaff: boolean;
};

export function resolveLearnFlags(env: LearnEnv): LearnFlags {
  const enabled = env.NEXT_PUBLIC_LEARN_ENABLED === '1';
  const onVercel = Boolean(env.VERCEL);
  const demoContent = enabled && env.LEARN_DEMO_CONTENT === '1' && env.VERCEL_ENV !== 'production';
  const demoStaff = enabled && env.LEARN_DEMO_STAFF === '1' && !onVercel;
  return { enabled, demoContent, demoStaff };
}

export const learnFlags: LearnFlags = resolveLearnFlags({
  // Written out literally so Next can inline the public one into browser bundles.
  NEXT_PUBLIC_LEARN_ENABLED: process.env.NEXT_PUBLIC_LEARN_ENABLED,
  LEARN_DEMO_CONTENT: process.env.LEARN_DEMO_CONTENT,
  LEARN_DEMO_STAFF: process.env.LEARN_DEMO_STAFF,
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
});
