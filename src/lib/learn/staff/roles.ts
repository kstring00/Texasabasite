/**
 * Staff roles and what each may do. This table is the single source of truth for permissions.
 * It is checked on the server for every restricted action. Hiding a button is never the check.
 *
 * It follows the capability table in the master brief. The exact policy still needs sign-off
 * by the organization before real use.
 */
export type LcStaffRole = 'rbt' | 'apprentice' | 'bcba_reviewer' | 'clinical_director' | 'producer' | 'it_admin';

export type LcCapability =
  | 'submission.create' // upload and edit your own PowerPoint drafts, and submit them
  | 'submission.read_all' // read every submission, not only your own
  | 'review.source' // gate 1: approve, decline or request changes on a source PowerPoint
  | 'review.final' // gate 2: approve the final interactive module
  | 'module.import' // register a converted module against an approved source
  | 'module.publish' // publish or withdraw an approved module
  | 'training.manage' // manage website listings for Teams trainings
  | 'analytics.view' // see aggregate participation
  | 'settings.manage';

export const LC_ROLE_LABEL: Record<LcStaffRole, string> = {
  rbt: 'Registered Behavior Technician (RBT)',
  apprentice: 'Apprentice',
  bcba_reviewer: 'Board Certified Behavior Analyst (BCBA), assigned reviewer',
  clinical_director: 'Clinical Director',
  producer: 'Content producer',
  it_admin: 'IT administrator',
};

const ROLE_CAPABILITIES: Record<LcStaffRole, readonly LcCapability[]> = {
  // RBTs and apprentices contribute. Under no circumstances can they grant clinical approval.
  rbt: ['submission.create'],
  apprentice: ['submission.create'],
  bcba_reviewer: ['submission.create', 'submission.read_all', 'review.source', 'review.final'],
  clinical_director: ['submission.create', 'submission.read_all', 'review.source', 'review.final', 'module.publish', 'training.manage', 'analytics.view'],
  // Producing a module is not approving it.
  producer: ['module.import'],
  // IT manages settings. That does not include clinical review.
  it_admin: ['settings.manage'],
};

export type LcStaffActor = { id: string; displayName: string; role: LcStaffRole; active: boolean };

export function capabilitiesOf(role: LcStaffRole): readonly LcCapability[] {
  return ROLE_CAPABILITIES[role] ?? [];
}

/** The one permission check. An inactive or missing actor can do nothing. */
export function can(actor: LcStaffActor | null | undefined, capability: LcCapability): boolean {
  if (!actor || !actor.active) return false;
  return capabilitiesOf(actor.role).includes(capability);
}
