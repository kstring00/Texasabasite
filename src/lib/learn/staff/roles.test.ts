import { describe, expect, it } from 'vitest';
import { can, capabilitiesOf, type LcCapability, type LcStaffActor, type LcStaffRole } from './roles';

const actor = (role: LcStaffRole, active = true): LcStaffActor => ({ id: `x-${role}`, displayName: role, role, active });
const APPROVALS: LcCapability[] = ['review.source', 'review.final', 'module.publish'];

describe('staff permissions', () => {
  it('lets RBTs and apprentices contribute and nothing else', () => {
    for (const role of ['rbt', 'apprentice'] as const) expect(capabilitiesOf(role)).toEqual(['submission.create']);
  });
  it('never lets an RBT or apprentice approve, publish or read other people’s submissions', () => {
    for (const role of ['rbt', 'apprentice'] as const) {
      for (const c of [...APPROVALS, 'submission.read_all', 'module.import'] as LcCapability[]) expect(can(actor(role), c)).toBe(false);
    }
  });
  it('does not let a producer grant clinical approval or publish', () => {
    expect(can(actor('producer'), 'module.import')).toBe(true);
    for (const c of APPROVALS) expect(can(actor('producer'), c)).toBe(false);
  });
  it('does not give IT clinical review by default', () => {
    for (const c of [...APPROVALS, 'submission.read_all'] as LcCapability[]) expect(can(actor('it_admin'), c)).toBe(false);
  });
  it('lets an assigned BCBA review but not publish', () => {
    expect(can(actor('bcba_reviewer'), 'review.source')).toBe(true);
    expect(can(actor('bcba_reviewer'), 'review.final')).toBe(true);
    expect(can(actor('bcba_reviewer'), 'module.publish')).toBe(false);
  });
  it('gives nothing to nobody, an inactive account, or an unknown role', () => {
    expect(can(null, 'submission.create')).toBe(false);
    expect(can(undefined, 'submission.create')).toBe(false);
    expect(can(actor('clinical_director', false), 'review.source')).toBe(false);
    expect(can({ ...actor('rbt'), role: 'owner' as LcStaffRole }, 'submission.create')).toBe(false);
  });
});
