import { cookies } from 'next/headers';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { learnFlags } from '../flags';
import type { LcStaffActor } from './roles';
import { LC_SESSION_COOKIE, readSessionToken } from './session';
import { getSessionSecret } from './store';

/**
 * Who is asking? SERVER ONLY. Every staff page, action and file route starts here.
 * With the staff demo off (the default, and always on Vercel) the answer is nobody,
 * so every privileged path fails closed.
 */
export async function getStaffActor(): Promise<LcStaffActor | null> {
  if (!learnFlags.demoStaff) return null;
  const token = (await cookies()).get(LC_SESSION_COOKIE)?.value;
  return getDemoStaff(readSessionToken(token, getSessionSecret()));
}
