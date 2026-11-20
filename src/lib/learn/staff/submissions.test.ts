import { describe, expect, it } from 'vitest';
import type { LcStaffActor } from './roles';
import { LC_PPTX_MIME } from './pptx';
import {
  assetFor, attachFile, createDraft, deleteDraft, emptyStaffStore, listSubmissions, removeFile, sanitizeDraftInput, startRevision, submitForReview, updateDraft, viewSubmission,
  type LcAsset, type LcCtx, type LcStaffStore,
} from './submissions';

const rbt: LcStaffActor = { id: 'rbt-1', displayName: 'R', role: 'rbt', active: true };
const other: LcStaffActor = { id: 'rbt-2', displayName: 'O', role: 'apprentice', active: true };
const bcba: LcStaffActor = { id: 'bcba-1', displayName: 'B', role: 'bcba_reviewer', active: true };
const producer: LcStaffActor = { id: 'prod-1', displayName: 'P', role: 'producer', active: true };

let n = 0;
const ctx = (): LcCtx => ({ now: `2026-01-01T00:00:${String(n % 60).padStart(2, '0')}.000Z`, newId: () => `id-${++n}` });
const checks = { noClientIdentifiers: true, noCaseNotes: true, noConfidentialMaterial: true, plainLanguageObjective: true, eligibleContributor: true };
const full = { title: 'Bedtime routines', summary: 'General ideas about calmer evenings with made-up examples.', categoryId: 'cat-routines', tags: ['At home'], objectives: ['Describe one small step toward a calmer bedtime.'], audience: 'All caregivers', checklist: checks, revisionNotes: '' };
const asset = (id: string): LcAsset => ({ id, objectKey: `${id}.pptx`, fileName: 'deck.pptx', mimeType: LC_PPTX_MIME, byteSize: 10, sha256: 'x', scanState: 'not_configured', uploadedBy: rbt.id, createdAt: 'now', synthetic: false });

/** A store holding one submission by `rbt` that has been submitted for review. */
function submitted(): { store: LcStaffStore; id: string } {
  const store = emptyStaffStore();
  const d = createDraft(store, rbt, full, ctx());
  if (!d.ok) throw new Error('setup');
  attachFile(store, rbt, d.value.id, asset('a1'), ctx());
  const s = submitForReview(store, rbt, d.value.id, d.value.rev, ctx());
  if (!s.ok) throw new Error(`setup: ${s.message}`);
  return { store, id: d.value.id };
}
/** The same, after a reviewer has asked for changes (the review itself arrives in phase 3). */
function changesRequested() {
  const x = submitted();
  const s = x.store.submissions[0];
  s.status = 'changes_requested';
  x.store.reviews.push({ id: 'r1', targetType: 'source_pptx', targetVersionId: x.store.versions[0].id, submissionId: s.id, reviewerId: bcba.id, decision: 'changes_requested', comments: 'Please revise.', decidedAt: 'then' });
  return x;
}

describe('drafts', () => {
  it('lets a contributor start a draft, and nobody without that permission', () => {
    const store = emptyStaffStore();
    expect(createDraft(store, rbt, { title: 'A title' }, ctx()).ok).toBe(true);
    for (const who of [producer, null, { ...rbt, active: false }]) {
      const r = createDraft(store, who, { title: 'A title' }, ctx());
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.code).toBe('forbidden');
    }
    expect(store.submissions).toHaveLength(1);
    expect(store.versions[0]).toMatchObject({ versionNumber: 1, frozenAt: null });
  });
  it('needs a title to save', () => {
    const r = createDraft(emptyStaffStore(), rbt, { title: '   ' }, ctx());
    expect(r.ok).toBe(false);
  });
  it('reduces whatever the browser sends to bounded plain text', () => {
    const clean = sanitizeDraftInput({ title: '  <script>x</script>  Hello   world ', summary: 5, tags: ['At home', 'Made up tag'], objectives: ['a', '', 7], checklist: { noCaseNotes: 'yes', noClientIdentifiers: true }, extra: 'ignored' });
    expect(clean.title).toBe('scriptx/script Hello world');
    expect(clean.summary).toBe('');
    expect(clean.tags).toEqual(['At home']);
    expect(clean.objectives).toEqual(['a']);
    expect(clean.checklist).toMatchObject({ noClientIdentifiers: true, noCaseNotes: false });
    expect(sanitizeDraftInput(null).title).toBe('');
    expect(sanitizeDraftInput({ title: 'x'.repeat(500) }).title).toHaveLength(120);
  });
  it('refuses a save that carries an old revision number', () => {
    const store = emptyStaffStore();
    const d = createDraft(store, rbt, full, ctx());
    if (!d.ok) throw new Error('setup');
    expect(updateDraft(store, rbt, d.value.id, 1, { ...full, title: 'First tab' }, ctx()).ok).toBe(true);
    const stale = updateDraft(store, rbt, d.value.id, 1, { ...full, title: 'Second tab' }, ctx());
    expect(stale.ok).toBe(false);
    if (!stale.ok) expect(stale.code).toBe('stale');
    expect(store.submissions[0].title).toBe('First tab');
  });
  it('treats someone else’s draft as not found, for every kind of change', () => {
    const store = emptyStaffStore();
    const d = createDraft(store, rbt, full, ctx());
    if (!d.ok) throw new Error('setup');
    const id = d.value.id;
    const results = [updateDraft(store, other, id, 1, full, ctx()), attachFile(store, other, id, asset('zz'), ctx()), removeFile(store, other, id, 1, ctx()), submitForReview(store, other, id, 1, ctx()), startRevision(store, other, id, 1, ctx()), deleteDraft(store, other, id, 1, ctx())];
    for (const r of results) {
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.code).toBe('not_found');
    }
    // A reviewer who can read everything still cannot edit another person's draft.
    expect(updateDraft(store, bcba, id, 1, full, ctx()).ok).toBe(false);
    expect(store.submissions[0].title).toBe('Bedtime routines');
    expect(store.assets).toHaveLength(0);
  });
});

describe('submitting', () => {
  it('needs valid details, a file and the full checklist', () => {
    const store = emptyStaffStore();
    const d = createDraft(store, rbt, { title: 'Hi', checklist: {} }, ctx());
    if (!d.ok) throw new Error('setup');
    const r = submitForReview(store, rbt, d.value.id, d.value.rev, ctx());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fieldErrors ?? {}).sort()).toEqual(['audience', 'categoryId', 'checklist', 'file', 'objectives', 'summary', 'title']);
    expect(store.submissions[0].status).toBe('draft');
    expect(store.versions[0].frozenAt).toBeNull();
  });
  it('freezes the version with a snapshot and records it', () => {
    const { store } = submitted();
    expect(store.submissions[0].status).toBe('submitted');
    expect(store.versions[0].frozenAt).not.toBeNull();
    expect(store.versions[0].snapshot).toMatchObject({ title: 'Bedtime routines', checklist: checks });
    expect(store.audit.map((e) => e.action)).toEqual(['draft_created', 'file_uploaded', 'submitted_for_review']);
  });
  it('lets nobody change a frozen version: not its details, its file, or by deleting it', () => {
    const { store, id } = submitted();
    const rev = store.submissions[0].rev;
    for (const r of [updateDraft(store, rbt, id, rev, { ...full, title: 'Changed' }, ctx()), attachFile(store, rbt, id, asset('a2'), ctx()), removeFile(store, rbt, id, rev, ctx()), submitForReview(store, rbt, id, rev, ctx()), deleteDraft(store, rbt, id, rev, ctx())]) {
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.code).toBe('state');
    }
    expect(store.submissions[0].title).toBe('Bedtime routines');
    expect(store.versions[0].assetId).toBe('a1');
    expect(store.assets.map((a) => a.id)).toEqual(['a1']);
  });
  it('gives a contributor no way to approve their own submission', () => {
    const { store, id } = submitted();
    // No function in this module moves a submission to an approved status, and the view offers no such control.
    const view = viewSubmission(store, rbt, id)!;
    expect(view).toMatchObject({ canEdit: false, canStartRevision: false, canDelete: false });
    expect(store.submissions[0].status).toBe('submitted');
    expect(store.reviews).toHaveLength(0);
  });
});

describe('revising after changes are requested', () => {
  it('is not available while a version is waiting for review', () => {
    const { store, id } = submitted();
    const r = startRevision(store, rbt, id, store.submissions[0].rev, ctx());
    expect(r.ok).toBe(false);
  });
  it('opens version 2 and leaves version 1 exactly as it was reviewed', () => {
    const { store, id } = changesRequested();
    const before = JSON.stringify(store.versions[0]);
    const r = startRevision(store, rbt, id, store.submissions[0].rev, ctx());
    expect(r.ok).toBe(true);
    expect(store.versions).toHaveLength(2);
    expect(store.versions[1]).toMatchObject({ versionNumber: 2, frozenAt: null, assetId: null });
    expect(JSON.stringify(store.versions[0])).toBe(before);
    expect(startRevision(store, rbt, id, store.submissions[0].rev, ctx()).ok).toBe(false); // only one working version at a time
  });
  it('needs a new file, a fresh checklist and a note about what changed', () => {
    const { store, id } = changesRequested();
    startRevision(store, rbt, id, store.submissions[0].rev, ctx());
    const r = submitForReview(store, rbt, id, store.submissions[0].rev, ctx());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fieldErrors ?? {}).sort()).toEqual(['checklist', 'file', 'revisionNotes']);
    attachFile(store, rbt, id, asset('a2'), ctx());
    updateDraft(store, rbt, id, store.submissions[0].rev, { ...full, revisionNotes: 'Reworded slide 4 as a general example.' }, ctx());
    expect(submitForReview(store, rbt, id, store.submissions[0].rev, ctx()).ok).toBe(true);
    expect(store.submissions[0].status).toBe('submitted');
    expect(store.versions.map((v) => [v.versionNumber, v.assetId, !!v.frozenAt])).toEqual([[1, 'a1', true], [2, 'a2', true]]);
    expect(store.assets.map((a) => a.id).sort()).toEqual(['a1', 'a2']);
  });
});

describe('deleting', () => {
  it('removes a never-submitted draft and its file, and keeps an audit line', () => {
    const store = emptyStaffStore();
    const d = createDraft(store, rbt, full, ctx());
    if (!d.ok) throw new Error('setup');
    attachFile(store, rbt, d.value.id, asset('a1'), ctx());
    const r = deleteDraft(store, rbt, d.value.id, store.submissions[0].rev, ctx());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.removedAssets.map((a) => a.id)).toEqual(['a1']);
    expect([store.submissions.length, store.versions.length, store.assets.length]).toEqual([0, 0, 0]);
    expect(store.audit.at(-1)).toMatchObject({ action: 'draft_deleted', note: 'Bedtime routines' });
  });
  it('keeps anything that has been reviewed', () => {
    const { store, id } = changesRequested();
    expect(deleteDraft(store, rbt, id, store.submissions[0].rev, ctx()).ok).toBe(false);
    expect(store.reviews).toHaveLength(1);
  });
});

describe('who can see what', () => {
  it('shows contributors only their own submissions and reviewers all of them', () => {
    const { store } = submitted();
    createDraft(store, other, { title: 'Another person’s draft' }, ctx());
    expect(listSubmissions(store, rbt, 'mine')).toHaveLength(1);
    expect(listSubmissions(store, rbt, 'all')).toHaveLength(1); // asking for "all" changes nothing without the permission
    expect(listSubmissions(store, bcba, 'all')).toHaveLength(2);
    expect(listSubmissions(store, bcba, 'mine')).toHaveLength(0);
    expect(listSubmissions(store, producer, 'all')).toHaveLength(0);
    expect(listSubmissions(store, null, 'all')).toHaveLength(0);
  });
  it('returns nothing for a submission the person may not see, the same as one that does not exist', () => {
    const { store, id } = submitted();
    expect(viewSubmission(store, other, id)).toBeNull();
    expect(viewSubmission(store, producer, id)).toBeNull();
    expect(viewSubmission(store, null, id)).toBeNull();
    expect(viewSubmission(store, rbt, 'nope')).toBeNull();
    expect(viewSubmission(store, bcba, id)).toMatchObject({ isOwner: false, canEdit: false, canDelete: false, canStartRevision: false });
  });
  it('guards file downloads the same way', () => {
    const { store } = submitted();
    expect(assetFor(store, rbt, 'a1')?.id).toBe('a1');
    expect(assetFor(store, bcba, 'a1')?.id).toBe('a1');
    expect(assetFor(store, other, 'a1')).toBeNull();
    expect(assetFor(store, null, 'a1')).toBeNull();
    expect(assetFor(store, rbt, 'missing')).toBeNull();
  });
});
