import type { LcStaffActor } from '@/lib/learn/staff/roles';

/**
 * DEMO SAMPLE. Fictional staff for the local demo. They are roles, not people: no real
 * employee is named, and none of this is connected to any staff directory or sign-in system.
 */
export const demoStaff: LcStaffActor[] = [
  { id: 'demo-rbt', displayName: 'Sample RBT', role: 'rbt', active: true },
  { id: 'demo-apprentice', displayName: 'Sample Apprentice', role: 'apprentice', active: true },
  { id: 'demo-bcba', displayName: 'Sample BCBA', role: 'bcba_reviewer', active: true },
  { id: 'demo-director', displayName: 'Sample Clinical Director', role: 'clinical_director', active: true },
];

export const getDemoStaff = (id: string | null | undefined) => demoStaff.find((p) => p.id === id && p.active) ?? null;
