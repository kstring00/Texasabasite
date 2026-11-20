import { describe, expect, it } from 'vitest';
import { demoAbcsOfBehavior } from '@/data/learn/demo/abcs-of-behavior';
import { LC_PPTX_MIME } from './pptx';
import {
  LC_FINAL_CHECKLIST, LC_REVIEW_POLICY, LC_SOURCE_CHECKLIST, approvedSource, claimSourceReview, collectForProduction, decideFinal, decideSource, finalApproval, importModule, moduleImportProblems,
  productionList, publishBlock, publishModule, publishedManifests, reviewQueue, submitModuleForFinalReview, withdrawModule, type LcImportContext, type LcPipelineCtx,
} from './pipeline';
import type { LcStaffActor, LcStaffRole } from './roles';
import { attachFile, createDraft, emptyStaffStore, submitForReview, viewSubmission, type LcAsset, type LcStaffStore } from './submissions';

const person = (id: string, role: LcStaffRole): LcStaffActor => ({ id, displayName: id, role, active: true });
const rbt = person('rbt', 'rbt');
const apprentice = person('apprentice', 'apprentice');
const bcba = person('bcba', 'bcba_reviewer');
const bcba2 = person('bcba2', 'bcba_reviewer');
const director = person('director', 'clinical_director');
const producer = person('producer', 'producer');
const it_admin = person('it', 'it_admin');

let n = 0;
const ctx = (): LcPipelineCtx => ({ now: `2026-02-01T00:00:${String(n % 60).padStart(2, '0')}.000Z`, newId: () => `id-${++n}`, hash: (t) => `h${t.length}:${t.slice(0, 40)}` });
const yes = (list: readonly { key: string }[]) => Object.fromEntries(list.map((c) => [c.key, true]));
const checks = { noClientIdentifiers: true, noCaseNotes: true, noConfidentialMaterial: true, plainLanguageObjective: true, eligibleContributor: true };
const full = { title: 'Bedtime routines', summary: 'General ideas about calmer evenings with made-up examples.', categoryId: 'cat-routines', tags: [], objectives: ['Describe one small step toward a calmer bedtime.'], audience: 'All caregivers', checklist: checks, revisionNotes: '' };
const asset = (id: string, by: string): LcAsset => ({ id, objectKey: `${id}.pptx`, fileName: 'deck.pptx', mimeType: LC_PPTX_MIME, byteSize: 10, sha256: 'x', scanState: 'not_configured', uploadedBy: by, createdAt: 'now', synthetic: true });
const pkg = (over: Record<string, unknown> = {}) => JSON.stringify({ ...(structuredClone(demoAbcsOfBehavior) as object), id: 'bedtime-routines', slug: 'bedtime-routines', relatedTrainingIds: [], ...over });
const context: LcImportContext = { takenIds: ['abcs-of-behavior'], takenSlugs: ['understanding-the-abcs-of-behavior'], knownModuleIds: ['abcs-of-behavior'], knownTrainingIds: [] };
const rev = (store: LcStaffStore) => store.submissions[0].rev;

/** A submission by `author`, submitted and waiting for its source review. */
function waiting(author: LcStaffActor = rbt): { store: LcStaffStore; id: string; versionId: string } {
  const store = emptyStaffStore();
  const d = createDraft(store, author, full, ctx());
  if (!d.ok) throw new Error('setup');
  attachFile(store, author, d.value.id, asset('a1', author.id), ctx());
  const s = submitForReview(store, author, d.value.id, d.value.rev, ctx());
  if (!s.ok) throw new Error(s.message);
  return { store, id: d.value.id, versionId: store.versions[0].id };
}
const approveSource = (x: ReturnType<typeof waiting>, by: LcStaffActor = director) => decideSource(x.store, by, { submissionId: x.id, versionId: x.versionId, rev: rev(x.store), decision: 'approved', comments: '', checklist: yes(LC_SOURCE_CHECKLIST) }, ctx());
/** …through to a module sitting in final review. Source approved by `sourceBy`. */
function inFinalReview(sourceBy: LcStaffActor = director) {
  const x = waiting();
  if (!approveSource(x, sourceBy).ok) throw new Error('source');
  if (!collectForProduction(x.store, producer, x.id, rev(x.store), ctx()).ok) throw new Error('collect');
  const m = importModule(x.store, producer, { submissionId: x.id, rev: rev(x.store), manifestJson: pkg(), conversionDate: '2026-02-01', generationMethod: 'external_ai_assisted', newContentNotes: 'Two new quiz questions and one new scenario.' }, context, ctx());
  if (!m.ok) throw new Error(`import: ${m.message} ${(m.problems ?? []).join('; ')}`);
  if (!submitModuleForFinalReview(x.store, producer, m.value.id, rev(x.store), ctx()).ok) throw new Error('submit module');
  return { ...x, moduleId: m.value.id };
}
const approveFinal = (x: ReturnType<typeof inFinalReview>, by: LcStaffActor = bcba) => decideFinal(x.store, by, { moduleVersionId: x.moduleId, rev: rev(x.store), decision: 'approved', comments: '', checklist: yes(LC_FINAL_CHECKLIST) }, ctx());
const code = (r: { ok: boolean; code?: string }) => (r.ok ? 'ok' : r.code);

describe('Gate 1: source review', () => {
  it('approves one exact version, on its own record', () => {
    const x = waiting();
    expect(approveSource(x).ok).toBe(true);
    expect(x.store.submissions[0].status).toBe('source_approved');
    expect(x.store.reviews).toHaveLength(1);
    expect(x.store.reviews[0]).toMatchObject({ targetType: 'source_pptx', targetVersionId: x.versionId, reviewerId: 'director', decision: 'approved' });
    expect(approvedSource(x.store, x.id)?.version.id).toBe(x.versionId);
  });
  it('refuses RBTs, apprentices, producers and IT, whatever they send', () => {
    for (const who of [rbt, apprentice, producer, it_admin, null]) {
      const x = waiting(bcba2); // not their own, so only the role is in question
      expect(code(approveSource(x, who as LcStaffActor))).toBe('forbidden');
      expect(code(claimSourceReview(x.store, who, x.id, rev(x.store), ctx()))).toBe('forbidden');
      expect(x.store.submissions[0].status).toBe('submitted');
      expect(x.store.reviews).toHaveLength(0);
    }
  });
  it('refuses a reviewer approving their own submission', () => {
    const x = waiting(bcba);
    const r = approveSource(x, bcba);
    expect(code(r)).toBe('forbidden');
    if (!r.ok) expect(r.message).toMatch(/You submitted this presentation/);
    expect(code(claimSourceReview(x.store, bcba, x.id, rev(x.store), ctx()))).toBe('forbidden');
    expect(x.store.reviews).toHaveLength(0);
    expect(approveSource(x, director).ok).toBe(true); // someone else can
  });
  it('keeps that rule in one switch the organization can change', () => {
    const x = waiting(bcba);
    const r = decideSource(x.store, bcba, { submissionId: x.id, versionId: x.versionId, rev: rev(x.store), decision: 'approved', comments: '', checklist: yes(LC_SOURCE_CHECKLIST) }, ctx(), { ...LC_REVIEW_POLICY, reviewerMustNotBeAuthor: false });
    expect(r.ok).toBe(true);
  });
  it('needs the whole checklist to approve, and a note to request changes or decline', () => {
    const x = waiting();
    const part = { ...yes(LC_SOURCE_CHECKLIST), noPhi: false };
    expect(code(decideSource(x.store, director, { submissionId: x.id, versionId: x.versionId, rev: rev(x.store), decision: 'approved', comments: '', checklist: part }, ctx()))).toBe('invalid');
    expect(code(decideSource(x.store, director, { submissionId: x.id, versionId: x.versionId, rev: rev(x.store), decision: 'changes_requested', comments: 'short', checklist: {} }, ctx()))).toBe('invalid');
    expect(code(decideSource(x.store, director, { submissionId: x.id, versionId: x.versionId, rev: rev(x.store), decision: 'declined', comments: '', checklist: {} }, ctx()))).toBe('invalid');
    expect(x.store.reviews).toHaveLength(0);
    expect(decideSource(x.store, director, { submissionId: x.id, versionId: x.versionId, rev: rev(x.store), decision: 'changes_requested', comments: 'Please reword slide 4 as a general example.', checklist: {} }, ctx()).ok).toBe(true);
    expect(x.store.submissions[0].status).toBe('changes_requested');
    expect(viewSubmission(x.store, rbt, x.id)?.canStartRevision).toBe(true);
  });
  it('refuses a decision on the wrong version, from an old page, or made twice', () => {
    const x = waiting();
    expect(code(decideSource(x.store, director, { submissionId: x.id, versionId: 'some-other-version', rev: rev(x.store), decision: 'approved', comments: '', checklist: yes(LC_SOURCE_CHECKLIST) }, ctx()))).toBe('state');
    expect(code(decideSource(x.store, director, { submissionId: x.id, versionId: x.versionId, rev: rev(x.store) - 1, decision: 'approved', comments: '', checklist: yes(LC_SOURCE_CHECKLIST) }, ctx()))).toBe('stale');
    expect(approveSource(x).ok).toBe(true);
    expect(code(approveSource(x, bcba))).toBe('state');
    expect(x.store.reviews).toHaveLength(1);
  });
  it('marks a review as started and names the reviewer', () => {
    const x = waiting();
    expect(claimSourceReview(x.store, bcba, x.id, rev(x.store), ctx()).ok).toBe(true);
    expect(x.store.submissions[0]).toMatchObject({ status: 'in_review', reviewerId: 'bcba' });
    expect(approveSource(x, bcba).ok).toBe(true);
  });
});

describe('production', () => {
  it('lets only a producer collect, and only a clinically approved source', () => {
    const x = waiting();
    expect(code(collectForProduction(x.store, producer, x.id, rev(x.store), ctx()))).toBe('not_found'); // not approved yet, so a producer cannot even see it
    approveSource(x);
    for (const who of [rbt, apprentice, bcba, director]) expect(code(collectForProduction(x.store, who, x.id, rev(x.store), ctx()))).toBe('forbidden');
    expect(collectForProduction(x.store, producer, x.id, rev(x.store), ctx()).ok).toBe(true);
    expect(x.store.submissions[0].status).toBe('in_production');
    expect(productionList(x.store, producer)).toHaveLength(1);
    expect(productionList(x.store, rbt)).toHaveLength(0);
  });
  it('reports what is wrong with a module package in plain sentences', () => {
    expect(moduleImportProblems('not json', context).problems[0]).toMatch(/not valid JSON/);
    expect(moduleImportProblems(pkg(), context).problems).toEqual([]);
    const text = (over: Record<string, unknown>) => moduleImportProblems(pkg(over), context).problems.join(' | ');
    expect(text({ slug: 'understanding-the-abcs-of-behavior' })).toMatch(/already uses the address/);
    expect(text({ id: 'abcs-of-behavior' })).toMatch(/already uses/);
    expect(text({ categoryId: 'cat-made-up' })).toMatch(/not one of the six topics/);
    expect(text({ relatedModuleIds: ['ghost-module'] })).toMatch(/not a published module/);
    expect(text({ relatedTrainingIds: ['ghost-training'] })).toMatch(/not a listed training/);
    expect(text({ review: { status: 'final_approved', reviewerLabel: 'Someone', reviewedOn: '2026-01-01' } })).toMatch(/cannot declare itself approved/);
    expect(text({ title: '<b>Bold</b>' })).toMatch(/Plain text only/);
    expect(moduleImportProblems(pkg({ lessons: [] }), context).manifest).toBeNull();
  });
  it('imports a valid package against the approved source version, and nothing else', () => {
    const x = waiting();
    approveSource(x);
    const imp = (manifestJson: string, who: LcStaffActor = producer) => importModule(x.store, who, { submissionId: x.id, rev: rev(x.store), manifestJson, conversionDate: '2026-02-01', generationMethod: 'written_by_hand', newContentNotes: 'Nothing new beyond the slides.' }, context, ctx());
    expect(code(imp(pkg()))).toBe('state'); // not collected for production yet
    collectForProduction(x.store, producer, x.id, rev(x.store), ctx());
    for (const who of [rbt, apprentice, bcba, director]) expect(code(imp(pkg(), who))).toBe('forbidden');
    const bad = imp(pkg({ slug: 'understanding-the-abcs-of-behavior' }));
    expect(code(bad)).toBe('invalid');
    expect(bad.problems?.length).toBeGreaterThan(0);
    expect(x.store.modules).toHaveLength(0);
    const good = imp(pkg());
    expect(good.ok).toBe(true);
    expect(x.store.modules[0]).toMatchObject({ status: 'draft', sourceVersionId: x.versionId, versionNumber: 1, importedBy: 'producer' });
    expect(imp(pkg({ title: 'Bedtime routines, second try' })).ok).toBe(true); // an unsubmitted draft can be replaced
    expect(x.store.modules).toHaveLength(1);
    expect(x.store.modules[0].manifest.title).toBe('Bedtime routines, second try');
  });
});

describe('Gate 2: final module review', () => {
  it('is a separate record from the source review, tied to the exact content', () => {
    const x = inFinalReview();
    expect(approveFinal(x).ok).toBe(true);
    expect(x.store.reviews.map((r) => r.targetType)).toEqual(['source_pptx', 'derived_module']);
    expect(x.store.reviews[1]).toMatchObject({ targetVersionId: x.moduleId, reviewerId: 'bcba', decision: 'approved', targetHash: x.store.modules[0].contentHash });
    expect(x.store.modules[0].status).toBe('final_approved');
    expect(finalApproval(x.store, x.store.modules[0])).not.toBeNull();
  });
  it('refuses the same person giving both approvals', () => {
    const x = inFinalReview(director); // the director approved the source
    const r = approveFinal(x, director);
    expect(code(r)).toBe('forbidden');
    if (!r.ok) expect(r.message).toMatch(/two approvals come from two people/);
    expect(x.store.modules[0].status).toBe('final_review');
    expect(x.store.reviews).toHaveLength(1);
    expect(approveFinal(x, bcba).ok).toBe(true); // a second reviewer can
  });
  it('refuses the author of the presentation and the person who imported the module', () => {
    const own = waiting(bcba);
    approveSource(own, director);
    collectForProduction(own.store, producer, own.id, rev(own.store), ctx());
    const m = importModule(own.store, producer, { submissionId: own.id, rev: rev(own.store), manifestJson: pkg(), conversionDate: '2026-02-01', generationMethod: 'written_by_hand', newContentNotes: 'Nothing new beyond the slides.' }, context, ctx());
    if (!m.ok) throw new Error('setup');
    submitModuleForFinalReview(own.store, producer, m.value.id, rev(own.store), ctx());
    const asAuthor = decideFinal(own.store, bcba, { moduleVersionId: m.value.id, rev: rev(own.store), decision: 'approved', comments: '', checklist: yes(LC_FINAL_CHECKLIST) }, ctx());
    expect(code(asAuthor)).toBe('forbidden');
    if (!asAuthor.ok) expect(asAuthor.message).toMatch(/You submitted the presentation/);
    own.store.modules[0].importedBy = 'bcba2'; // as if a reviewer had also done the import
    const asImporter = decideFinal(own.store, bcba2, { moduleVersionId: m.value.id, rev: rev(own.store), decision: 'approved', comments: '', checklist: yes(LC_FINAL_CHECKLIST) }, ctx());
    expect(code(asImporter)).toBe('forbidden');
    if (!asImporter.ok) expect(asImporter.message).toMatch(/You imported this module/);
    expect(own.store.reviews.filter((r) => r.targetType === 'derived_module')).toHaveLength(0);
  });
  it('refuses RBTs, apprentices, producers and IT', () => {
    for (const who of [rbt, apprentice, producer, it_admin, null]) {
      const x = inFinalReview();
      expect(code(approveFinal(x, who as LcStaffActor))).toBe('forbidden');
      expect(x.store.modules[0].status).toBe('final_review');
    }
  });
  it('needs the whole checklist to approve and a note otherwise', () => {
    const x = inFinalReview();
    expect(code(decideFinal(x.store, bcba, { moduleVersionId: x.moduleId, rev: rev(x.store), decision: 'approved', comments: '', checklist: { ...yes(LC_FINAL_CHECKLIST), previewed: false } }, ctx()))).toBe('invalid');
    expect(code(decideFinal(x.store, bcba, { moduleVersionId: x.moduleId, rev: rev(x.store), decision: 'rejected', comments: '', checklist: {} }, ctx()))).toBe('invalid');
    expect(decideFinal(x.store, bcba, { moduleVersionId: x.moduleId, rev: rev(x.store), decision: 'changes_requested', comments: 'The second quiz question has two right answers.', checklist: {} }, ctx()).ok).toBe(true);
    expect(x.store.modules[0].status).toBe('changes_requested');
    expect(x.store.submissions[0].status).toBe('in_production');
  });
  it('makes a changed module a new version that needs its own approval', () => {
    const x = inFinalReview();
    decideFinal(x.store, bcba, { moduleVersionId: x.moduleId, rev: rev(x.store), decision: 'changes_requested', comments: 'The second quiz question has two right answers.', checklist: {} }, ctx());
    const v2 = importModule(x.store, producer, { submissionId: x.id, rev: rev(x.store), manifestJson: pkg({ title: 'Bedtime routines, revised' }), conversionDate: '2026-02-02', generationMethod: 'external_ai_assisted', newContentNotes: 'Fixed the second quiz question.' }, context, ctx());
    expect(v2.ok).toBe(true);
    expect(x.store.modules.map((m) => [m.versionNumber, m.status])).toEqual([[1, 'changes_requested'], [2, 'draft']]);
    if (v2.ok) expect(finalApproval(x.store, v2.value)).toBeNull();
  });
});

describe('publishing', () => {
  it('publishes only with both approvals on record', () => {
    const x = inFinalReview();
    expect(code(publishModule(x.store, director, x.moduleId, rev(x.store), ctx()))).toBe('state'); // still in final review
    approveFinal(x);
    expect(publishBlock(x.store, x.store.modules[0])).toBeNull();
    expect(publishModule(x.store, director, x.moduleId, rev(x.store), ctx()).ok).toBe(true);
    expect(x.store.modules[0]).toMatchObject({ status: 'published', publishedBy: 'director' });
    expect(publishedManifests(x.store).map((m) => m.slug)).toEqual(['bedtime-routines']);
  });
  it('refuses to publish when either approval record is missing, even if the status says approved', () => {
    const noFinal = inFinalReview();
    noFinal.store.modules[0].status = 'final_approved'; // status forced, no review record behind it
    const a = publishModule(noFinal.store, director, noFinal.moduleId, rev(noFinal.store), ctx());
    expect(code(a)).toBe('state');
    if (!a.ok) expect(a.message).toMatch(/no recorded final clinical approval/);

    const noSource = inFinalReview();
    approveFinal(noSource);
    noSource.store.reviews = noSource.store.reviews.filter((r) => r.targetType !== 'source_pptx');
    const b = publishModule(noSource.store, director, noSource.moduleId, rev(noSource.store), ctx());
    expect(code(b)).toBe('state');
    if (!b.ok) expect(b.message).toMatch(/source PowerPoint .* no recorded clinical approval/);

    const changed = inFinalReview();
    approveFinal(changed);
    changed.store.modules[0].contentHash = 'different-content'; // content altered after approval
    expect(code(publishModule(changed.store, director, changed.moduleId, rev(changed.store), ctx()))).toBe('state');
    for (const s of [noFinal, noSource, changed]) expect(publishedManifests(s.store)).toEqual([]);
  });
  it('refuses RBTs, apprentices, producers, reviewers without publish rights and IT', () => {
    for (const who of [rbt, apprentice, producer, bcba, it_admin, null]) {
      const x = inFinalReview();
      approveFinal(x);
      expect(code(publishModule(x.store, who as LcStaffActor, x.moduleId, rev(x.store), ctx()))).toBe('forbidden');
      expect(code(withdrawModule(x.store, who as LcStaffActor, x.moduleId, rev(x.store), 'No longer accurate enough.', ctx()))).toBe('forbidden');
      expect(x.store.modules[0].status).toBe('final_approved');
    }
  });
  it('withdraws at once, with a reason, and keeps the record', () => {
    const x = inFinalReview();
    approveFinal(x);
    publishModule(x.store, director, x.moduleId, rev(x.store), ctx());
    expect(code(withdrawModule(x.store, director, x.moduleId, rev(x.store), 'short', ctx()))).toBe('invalid');
    expect(withdrawModule(x.store, director, x.moduleId, rev(x.store), 'A slide needs correcting before families see it.', ctx()).ok).toBe(true);
    expect(publishedManifests(x.store)).toEqual([]);
    expect(x.store.modules[0]).toMatchObject({ status: 'withdrawn', withdrawnBy: 'director' });
    expect(x.store.reviews).toHaveLength(2); // the audit trail stays
    expect(x.store.audit.map((e) => e.action)).toContain('module_withdrawn');
    expect(code(publishModule(x.store, director, x.moduleId, rev(x.store), ctx()))).toBe('state'); // a withdrawn version is not simply switched back on
  });
});

describe('review queue', () => {
  it('keeps the two gates in two lists and says why someone is blocked', () => {
    const x = inFinalReview(director);
    const other = waiting(bcba);
    x.store.submissions.push(...other.store.submissions.map((s) => ({ ...s, id: 'second' })));
    x.store.versions.push(...other.store.versions.map((v) => ({ ...v, id: 'second-v1', submissionId: 'second' })));
    const q = reviewQueue(x.store, bcba);
    expect(q.sources.map((s) => [s.submission.id, s.blocked !== null])).toEqual([['second', true]]); // their own submission
    expect(q.modules.map((m) => m.blocked)).toEqual([null]);
    expect(reviewQueue(x.store, director).modules[0].blocked).toMatch(/two approvals/);
    expect(reviewQueue(x.store, rbt)).toEqual({ sources: [], modules: [] });
    expect(reviewQueue(x.store, producer)).toEqual({ sources: [], modules: [] });
  });
});
