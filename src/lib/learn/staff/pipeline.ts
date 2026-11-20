import { lcCategories } from '@/data/learn/categories';
import { validateManifest, type LcManifest } from '../manifest';
import { can, type LcStaffActor } from './roles';
import {
  LC_AFTER_SOURCE_APPROVAL, canSee, type LcCtx, type LcFail, type LcModuleStatus, type LcModuleVersion, type LcResult, type LcReview, type LcStaffStore, type LcSubmission, type LcSubmissionVersion,
} from './submissions';

/**
 * From a submitted PowerPoint to a published module. Two approvals, always separate:
 *
 *   Gate 1  the source PowerPoint is clinically approved
 *   Gate 2  the finished interactive module is clinically approved, as its own decision on its
 *           own record, for one exact version of the content
 *
 * Approving the PowerPoint never approves the module. Only a module holding both approvals can be
 * published. Every function here checks who is asking; the screens are never the check.
 */

/* ── Policy ──────────────────────────────────────────────────────────────── */

/**
 * Reviewer independence. These are the product owner's rules for the pilot. They live in one
 * place so the organization can confirm or change them without touching the workflow.
 */
export type LcReviewPolicy = {
  /** Nobody reviews, at either gate, a submission they wrote. */
  reviewerMustNotBeAuthor: boolean;
  /** The two approvals must come from two different people. */
  finalReviewerMustDifferFromSourceReviewer: boolean;
  /** Whoever imported the module cannot give its final approval. */
  finalReviewerMustNotBeImporter: boolean;
};
export const LC_REVIEW_POLICY: LcReviewPolicy = { reviewerMustNotBeAuthor: true, finalReviewerMustDifferFromSourceReviewer: true, finalReviewerMustNotBeImporter: true };

/* ── Checklists ──────────────────────────────────────────────────────────── */

export const LC_SOURCE_CHECKLIST = [
  { key: 'accuracy', label: 'The content is accurate.' },
  { key: 'scope', label: 'It stays within general education. It gives no advice for an individual child and no treatment protocol.' },
  { key: 'language', label: 'A caregiver could understand the language. Terms are explained the first time they appear.' },
  { key: 'noPhi', label: 'There is no client information anywhere in the file, including hidden slides, notes, comments and file properties.' },
  { key: 'examples', label: 'Examples are appropriate, clearly made up, and could not be mistaken for a real family.' },
  { key: 'accessible', label: 'The materials can be made accessible: pictures can be described and no slide depends on colour alone.' },
  { key: 'purpose', label: 'It fits the educational purpose of the Learning Center.' },
] as const;

export const LC_FINAL_CHECKLIST = [
  { key: 'explanations', label: 'Every explanation in the module is accurate and matches the approved source.' },
  { key: 'examples', label: 'Every example and scenario is appropriate and clearly made up, including any that are new.' },
  { key: 'questions', label: 'Every knowledge-check question is clear, and the answers marked as correct are correct.' },
  { key: 'feedback', label: 'The feedback for every answer choice is accurate, kind and does not blame.' },
  { key: 'slides', label: 'Every slide reads correctly as text and has a description for people who cannot see it.' },
  { key: 'statement', label: 'The education-only statement appears, and nothing reads as advice for an individual child.' },
  { key: 'previewed', label: 'I went through the whole module in the caregiver lesson player, not only this page.' },
] as const;

const allChecked = (keys: readonly { key: string }[], given: unknown): Record<string, boolean> | null => {
  const g = (given && typeof given === 'object' ? given : {}) as Record<string, unknown>;
  const out: Record<string, boolean> = {};
  for (const { key } of keys) out[key] = g[key] === true;
  return keys.every(({ key }) => out[key]) ? out : null;
};
const cleanText = (s: unknown, max: number) => (typeof s === 'string' ? s.replace(/[<>]/g, '').replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max) : '');

/* ── Shared ──────────────────────────────────────────────────────────────── */

const fail = (code: LcFail['code'], message: string): LcFail => ({ ok: false, code, message });
const FORBIDDEN = fail('forbidden', 'Your role does not allow that.');
const NOT_FOUND = fail('not_found', 'That was not found.');
const STALE = fail('stale', 'This changed since you opened it. Reload the page to see the latest version, then try again.');

export type LcPipelineCtx = LcCtx & { hash: (text: string) => string };

function audit(store: LcStaffStore, actor: LcStaffActor, ctx: LcCtx, action: string, s: LcSubmission, versionId: string | null, note = '') {
  store.audit.push({ id: ctx.newId(), actorId: actor.id, actorRole: actor.role, action, targetType: 'submission', targetId: s.id, targetVersionId: versionId, at: ctx.now, note });
}
function touch(s: LcSubmission, ctx: LcCtx) {
  s.rev += 1;
  s.updatedAt = ctx.now;
}
const frozenVersions = (store: LcStaffStore, id: string) => store.versions.filter((v) => v.submissionId === id && v.frozenAt).sort((a, b) => a.versionNumber - b.versionNumber);
export const modulesOf = (store: LcStaffStore, submissionId: string) => store.modules.filter((m) => m.submissionId === submissionId).sort((a, b) => a.versionNumber - b.versionNumber);

/** The source version that holds a Gate 1 approval, with that approval. */
export function approvedSource(store: LcStaffStore, submissionId: string): { version: LcSubmissionVersion; review: LcReview } | null {
  for (const version of [...frozenVersions(store, submissionId)].reverse()) {
    const review = store.reviews.find((r) => r.targetType === 'source_pptx' && r.targetVersionId === version.id && r.decision === 'approved');
    if (review) return { version, review };
  }
  return null;
}
/** The Gate 2 approval for one exact module version, if it has one. */
export function finalApproval(store: LcStaffStore, m: LcModuleVersion): LcReview | null {
  return store.reviews.find((r) => r.targetType === 'derived_module' && r.targetVersionId === m.id && r.decision === 'approved' && r.targetHash === m.contentHash) ?? null;
}

/* ── Gate 1: the source PowerPoint ───────────────────────────────────────── */

/** Why this person may not review this source, or null if they may. Shown on screen and enforced below. */
export function sourceReviewBlock(actor: LcStaffActor | null, s: LcSubmission, policy: LcReviewPolicy = LC_REVIEW_POLICY): string | null {
  if (!actor || !can(actor, 'review.source')) return 'Your role does not include reviewing source PowerPoints.';
  if (policy.reviewerMustNotBeAuthor && s.createdBy === actor.id) return 'You submitted this presentation, so someone else has to review it.';
  return null;
}

export function claimSourceReview(store: LcStaffStore, actor: LcStaffActor | null, submissionId: string, rev: number, ctx: LcCtx, policy: LcReviewPolicy = LC_REVIEW_POLICY): LcResult<LcSubmission> {
  if (!actor || !can(actor, 'review.source')) return FORBIDDEN;
  const s = store.submissions.find((x) => x.id === submissionId);
  if (!s) return NOT_FOUND;
  const block = sourceReviewBlock(actor, s, policy);
  if (block) return fail('forbidden', block);
  if (rev !== s.rev) return STALE;
  if (s.status !== 'submitted') return fail('state', 'This submission is not waiting for a review to start.');
  s.status = 'in_review';
  s.reviewerId = actor.id;
  touch(s, ctx);
  audit(store, actor, ctx, 'source_review_started', s, frozenVersions(store, s.id).at(-1)?.id ?? null);
  return { ok: true, value: s };
}

export type LcSourceDecision = { submissionId: string; versionId: string; rev: number; decision: 'approved' | 'changes_requested' | 'declined'; comments: unknown; checklist: unknown };

export function decideSource(store: LcStaffStore, actor: LcStaffActor | null, input: LcSourceDecision, ctx: LcCtx, policy: LcReviewPolicy = LC_REVIEW_POLICY): LcResult<LcSubmission> {
  if (!actor || !can(actor, 'review.source')) return FORBIDDEN;
  const s = store.submissions.find((x) => x.id === input.submissionId);
  if (!s) return NOT_FOUND;
  const block = sourceReviewBlock(actor, s, policy);
  if (block) return fail('forbidden', block);
  if (input.rev !== s.rev) return STALE;
  if (s.status !== 'submitted' && s.status !== 'in_review') return fail('state', 'This submission is not waiting for a source review.');
  const version = frozenVersions(store, s.id).at(-1);
  // The decision is recorded against one exact version. A decision made on an older page is refused.
  if (!version || version.id !== input.versionId) return fail('state', 'A different version is waiting for review. Reload the page and review that one.');
  const comments = cleanText(input.comments, 2000);
  let checklist: Record<string, boolean> = {};
  if (input.decision === 'approved') {
    const all = allChecked(LC_SOURCE_CHECKLIST, input.checklist);
    if (!all) return fail('invalid', 'Tick every item on the checklist before approving.');
    checklist = all;
  } else if (input.decision === 'changes_requested' || input.decision === 'declined') {
    if (comments.length < 10) return fail('invalid', 'Write a note for the contributor explaining what is needed (at least 10 characters).');
  } else {
    return fail('invalid', 'Choose approve, request changes or decline.');
  }
  store.reviews.push({ id: ctx.newId(), targetType: 'source_pptx', targetVersionId: version.id, submissionId: s.id, reviewerId: actor.id, decision: input.decision, comments, decidedAt: ctx.now, checklist });
  s.status = input.decision === 'approved' ? 'source_approved' : input.decision === 'declined' ? 'declined' : 'changes_requested';
  s.reviewerId = actor.id;
  touch(s, ctx);
  audit(store, actor, ctx, input.decision === 'approved' ? 'source_approved' : input.decision, s, version.id, `Version ${version.versionNumber}`);
  return { ok: true, value: s };
}

/* ── Production: the approved source becomes a module, outside this website ── */

export function collectForProduction(store: LcStaffStore, actor: LcStaffActor | null, submissionId: string, rev: number, ctx: LcCtx): LcResult<LcSubmission> {
  if (!actor || !can(actor, 'module.import')) return FORBIDDEN;
  const s = store.submissions.find((x) => x.id === submissionId);
  if (!s || !canSee(actor, s)) return NOT_FOUND;
  if (rev !== s.rev) return STALE;
  if (s.status !== 'source_approved' || !approvedSource(store, s.id)) return fail('state', 'Only a clinically approved source can be collected for production.');
  s.status = 'in_production';
  touch(s, ctx);
  audit(store, actor, ctx, 'production_started', s, approvedSource(store, s.id)!.version.id);
  return { ok: true, value: s };
}

export type LcImportContext = { takenIds: string[]; takenSlugs: string[]; knownModuleIds: string[]; knownTrainingIds: string[] };

/** Everything wrong with a module package, as sentences a producer can act on. Empty means it can be imported. */
export function moduleImportProblems(raw: string, context: LcImportContext): { manifest: LcManifest | null; problems: string[] } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { manifest: null, problems: ['This is not valid JSON. Paste the whole module package, starting with { and ending with }.'] };
  }
  const checked = validateManifest(data);
  if (!checked.ok) return { manifest: null, problems: checked.problems };
  const m = checked.manifest;
  const problems: string[] = [];
  if (!lcCategories.some((c) => c.id === m.categoryId)) problems.push(`categoryId: “${m.categoryId}” is not one of the six topics.`);
  if (m.review.status !== 'demo_sample') problems.push('review: a module package cannot declare itself approved. Approval is recorded here by a reviewer, not written into the package.');
  if (context.takenIds.includes(m.id)) problems.push(`id: another module already uses “${m.id}”.`);
  if (context.takenSlugs.includes(m.slug)) problems.push(`slug: another module already uses the address “${m.slug}”.`);
  for (const id of m.relatedModuleIds) if (!context.knownModuleIds.includes(id)) problems.push(`relatedModuleIds: “${id}” is not a published module.`);
  for (const id of m.relatedTrainingIds) if (!context.knownTrainingIds.includes(id)) problems.push(`relatedTrainingIds: “${id}” is not a listed training.`);
  for (const lesson of m.lessons) if (!lesson.steps.some((s) => s.type === 'takeaways')) problems.push(`lesson “${lesson.title}”: add a takeaways step so the lesson ends with what to remember.`);
  return { manifest: m, problems };
}

export type LcImportInput = { submissionId: string; rev: number; manifestJson: unknown; conversionDate: unknown; generationMethod: unknown; newContentNotes: unknown };

export function importModule(store: LcStaffStore, actor: LcStaffActor | null, input: LcImportInput, context: LcImportContext, ctx: LcPipelineCtx): LcResult<LcModuleVersion> & { problems?: string[] } {
  if (!actor || !can(actor, 'module.import')) return FORBIDDEN;
  const s = store.submissions.find((x) => x.id === input.submissionId);
  if (!s || !canSee(actor, s)) return NOT_FOUND;
  if (input.rev !== s.rev) return STALE;
  if (s.status !== 'in_production') return fail('state', 'A module can be imported only while the submission is in production.');
  const source = approvedSource(store, s.id);
  if (!source) return fail('state', 'This submission has no clinically approved source to build from.');
  const conversionDate = typeof input.conversionDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.conversionDate) ? input.conversionDate : '';
  if (!conversionDate) return fail('invalid', 'Give the date the module was made.');
  const generationMethod: LcModuleVersion['generationMethod'] | null = input.generationMethod === 'external_ai_assisted' || input.generationMethod === 'written_by_hand' ? input.generationMethod : null;
  if (!generationMethod) return fail('invalid', 'Say how the module was made.');
  const newContentNotes = cleanText(input.newContentNotes, 2000);
  if (newContentNotes.length < 10) return fail('invalid', 'Describe what is new compared with the PowerPoint, or write that nothing is new (at least 10 characters).');
  const { manifest, problems } = moduleImportProblems(typeof input.manifestJson === 'string' ? input.manifestJson : '', context);
  if (!manifest || problems.length > 0) return { ...fail('invalid', 'The module package has problems that need fixing before it can be imported.'), problems };
  const existing = modulesOf(store, s.id);
  const latest = existing.at(-1);
  if (latest && (latest.status === 'final_review' || latest.status === 'final_approved' || latest.status === 'published')) return fail('state', 'There is already a module version further along for this submission.');
  const contentHash = ctx.hash(JSON.stringify(manifest));
  const base = { submissionId: s.id, sourceVersionId: source.version.id, manifest, contentHash, importedBy: actor.id, importedAt: ctx.now, conversionDate, generationMethod, newContentNotes, status: 'draft' as LcModuleStatus, submittedForReviewAt: null, publishedBy: null, publishedAt: null, withdrawnBy: null, withdrawnAt: null, withdrawnReason: '' };
  let m: LcModuleVersion;
  if (latest && latest.status === 'draft') {
    // A draft that has not been sent for review can still be replaced.
    Object.assign(latest, base);
    m = latest;
  } else {
    m = { id: ctx.newId(), versionNumber: (latest?.versionNumber ?? 0) + 1, ...base };
    store.modules.push(m);
  }
  touch(s, ctx);
  audit(store, actor, ctx, 'module_imported', s, m.id, `Module version ${m.versionNumber}, from source version ${source.version.versionNumber}`);
  return { ok: true, value: m };
}

function findModule(store: LcStaffStore, moduleVersionId: string): { m: LcModuleVersion; s: LcSubmission } | null {
  const m = store.modules.find((x) => x.id === moduleVersionId);
  const s = m ? store.submissions.find((x) => x.id === m.submissionId) : undefined;
  return m && s ? { m, s } : null;
}

export function submitModuleForFinalReview(store: LcStaffStore, actor: LcStaffActor | null, moduleVersionId: string, rev: number, ctx: LcCtx): LcResult<LcModuleVersion> {
  if (!actor || !can(actor, 'module.import')) return FORBIDDEN;
  const found = findModule(store, moduleVersionId);
  if (!found || !canSee(actor, found.s)) return NOT_FOUND;
  const { m, s } = found;
  if (rev !== s.rev) return STALE;
  if (m.status !== 'draft' || s.status !== 'in_production') return fail('state', 'Only a module draft can be sent for final review.');
  m.status = 'final_review';
  m.submittedForReviewAt = ctx.now;
  s.status = 'final_review';
  touch(s, ctx);
  audit(store, actor, ctx, 'module_submitted', s, m.id, `Module version ${m.versionNumber}`);
  return { ok: true, value: m };
}

/* ── Gate 2: the finished module ─────────────────────────────────────────── */

export function finalReviewBlock(store: LcStaffStore, actor: LcStaffActor | null, m: LcModuleVersion, s: LcSubmission, policy: LcReviewPolicy = LC_REVIEW_POLICY): string | null {
  if (!actor || !can(actor, 'review.final')) return 'Your role does not include reviewing final modules.';
  if (policy.reviewerMustNotBeAuthor && s.createdBy === actor.id) return 'You submitted the presentation this module was made from, so someone else has to review it.';
  if (policy.finalReviewerMustNotBeImporter && m.importedBy === actor.id) return 'You imported this module, so someone else has to give its final approval.';
  const sourceReview = store.reviews.find((r) => r.targetType === 'source_pptx' && r.targetVersionId === m.sourceVersionId && r.decision === 'approved');
  if (policy.finalReviewerMustDifferFromSourceReviewer && sourceReview?.reviewerId === actor.id) return 'You approved the source PowerPoint. The final module needs a second reviewer, so the two approvals come from two people.';
  return null;
}

export type LcFinalDecision = { moduleVersionId: string; rev: number; decision: 'approved' | 'changes_requested' | 'rejected'; comments: unknown; checklist: unknown };

export function decideFinal(store: LcStaffStore, actor: LcStaffActor | null, input: LcFinalDecision, ctx: LcCtx, policy: LcReviewPolicy = LC_REVIEW_POLICY): LcResult<LcModuleVersion> {
  if (!actor || !can(actor, 'review.final')) return FORBIDDEN;
  const found = findModule(store, input.moduleVersionId);
  if (!found) return NOT_FOUND;
  const { m, s } = found;
  const block = finalReviewBlock(store, actor, m, s, policy);
  if (block) return fail('forbidden', block);
  if (input.rev !== s.rev) return STALE;
  if (m.status !== 'final_review' || s.status !== 'final_review') return fail('state', 'This module is not waiting for a final review.');
  const comments = cleanText(input.comments, 2000);
  let checklist: Record<string, boolean> = {};
  if (input.decision === 'approved') {
    const all = allChecked(LC_FINAL_CHECKLIST, input.checklist);
    if (!all) return fail('invalid', 'Tick every item on the checklist before approving.');
    checklist = all;
  } else if (input.decision === 'changes_requested' || input.decision === 'rejected') {
    if (comments.length < 10) return fail('invalid', 'Write a note for the producer explaining what is needed (at least 10 characters).');
  } else {
    return fail('invalid', 'Choose approve, request changes or reject.');
  }
  // A separate record from the source review, tied to this exact content.
  store.reviews.push({ id: ctx.newId(), targetType: 'derived_module', targetVersionId: m.id, submissionId: s.id, reviewerId: actor.id, decision: input.decision === 'rejected' ? 'declined' : input.decision, comments, decidedAt: ctx.now, checklist, targetHash: m.contentHash });
  if (input.decision === 'approved') {
    m.status = 'final_approved';
    s.status = 'final_approved';
  } else {
    m.status = input.decision === 'rejected' ? 'rejected' : 'changes_requested';
    s.status = 'in_production'; // back to the producer; a new module version will need its own final review
  }
  touch(s, ctx);
  audit(store, actor, ctx, input.decision === 'approved' ? 'final_approved' : input.decision === 'rejected' ? 'final_rejected' : 'final_changes_requested', s, m.id, `Module version ${m.versionNumber}`);
  return { ok: true, value: m };
}

/* ── Publish and withdraw ────────────────────────────────────────────────── */

/** Why this module cannot be published, or null if it can. Both approvals are read from the records, not assumed from a status. */
export function publishBlock(store: LcStaffStore, m: LcModuleVersion): string | null {
  const sourceOk = store.reviews.some((r) => r.targetType === 'source_pptx' && r.targetVersionId === m.sourceVersionId && r.decision === 'approved');
  if (!sourceOk) return 'The source PowerPoint this module was made from has no recorded clinical approval.';
  if (!finalApproval(store, m)) return 'This exact module version has no recorded final clinical approval.';
  if (m.status !== 'final_approved') return 'This module is not in the “Final approved” state.';
  if (store.modules.some((x) => x.id !== m.id && x.status === 'published' && (x.manifest.slug === m.manifest.slug || x.manifest.id === m.manifest.id))) return 'Another published module already uses this address.';
  return null;
}

export function publishModule(store: LcStaffStore, actor: LcStaffActor | null, moduleVersionId: string, rev: number, ctx: LcCtx): LcResult<LcModuleVersion> {
  if (!actor || !can(actor, 'module.publish')) return FORBIDDEN;
  const found = findModule(store, moduleVersionId);
  if (!found) return NOT_FOUND;
  const { m, s } = found;
  // The approvals are checked first, so a request for a module that is not approved is told exactly that.
  const block = publishBlock(store, m);
  if (block) return fail('state', `This module cannot be published. ${block}`);
  if (rev !== s.rev) return STALE;
  m.status = 'published';
  m.publishedBy = actor.id;
  m.publishedAt = ctx.now;
  s.status = 'published';
  touch(s, ctx);
  audit(store, actor, ctx, 'module_published', s, m.id, `Module version ${m.versionNumber}`);
  return { ok: true, value: m };
}

export function withdrawModule(store: LcStaffStore, actor: LcStaffActor | null, moduleVersionId: string, rev: number, reason: unknown, ctx: LcCtx): LcResult<LcModuleVersion> {
  if (!actor || !can(actor, 'module.publish')) return FORBIDDEN;
  const found = findModule(store, moduleVersionId);
  if (!found) return NOT_FOUND;
  const { m, s } = found;
  if (rev !== s.rev) return STALE;
  if (m.status !== 'published') return fail('state', 'Only a published module can be withdrawn.');
  const why = cleanText(reason, 1000);
  if (why.length < 10) return fail('invalid', 'Say briefly why this module is being withdrawn (at least 10 characters).');
  m.status = 'withdrawn';
  m.withdrawnBy = actor.id;
  m.withdrawnAt = ctx.now;
  m.withdrawnReason = why;
  s.status = 'withdrawn';
  touch(s, ctx);
  audit(store, actor, ctx, 'module_withdrawn', s, m.id, why);
  return { ok: true, value: m };
}

/* ── Reading ─────────────────────────────────────────────────────────────── */

/** What the public library may show from this store: published versions only. Nothing else leaves it. */
export function publishedManifests(store: LcStaffStore): LcManifest[] {
  return store.modules.filter((m) => m.status === 'published' && !publishBlock(store, { ...m, status: 'final_approved' })).map((m) => m.manifest);
}

export type LcQueueSource = { submission: LcSubmission; version: LcSubmissionVersion; blocked: string | null };
export type LcQueueModule = { module: LcModuleVersion; submission: LcSubmission; blocked: string | null };

export function reviewQueue(store: LcStaffStore, actor: LcStaffActor | null, policy: LcReviewPolicy = LC_REVIEW_POLICY): { sources: LcQueueSource[]; modules: LcQueueModule[] } {
  const sources: LcQueueSource[] = [];
  const modules: LcQueueModule[] = [];
  if (actor && can(actor, 'review.source')) {
    for (const s of store.submissions) {
      if (s.status !== 'submitted' && s.status !== 'in_review') continue;
      const version = frozenVersions(store, s.id).at(-1);
      if (version) sources.push({ submission: s, version, blocked: sourceReviewBlock(actor, s, policy) });
    }
  }
  if (actor && can(actor, 'review.final')) {
    for (const m of store.modules) {
      if (m.status !== 'final_review') continue;
      const s = store.submissions.find((x) => x.id === m.submissionId);
      if (s) modules.push({ module: m, submission: s, blocked: finalReviewBlock(store, actor, m, s, policy) });
    }
  }
  const byWait = (a: string | null, b: string | null) => (a ?? '').localeCompare(b ?? '');
  return { sources: sources.sort((a, b) => byWait(a.version.frozenAt, b.version.frozenAt)), modules: modules.sort((a, b) => byWait(a.module.submittedForReviewAt, b.module.submittedForReviewAt)) };
}

/** Who may open the production side: producers, reviewers of final modules, and publishers. */
export const canOpenProduction = (actor: LcStaffActor | null) => can(actor, 'module.import') || can(actor, 'module.publish') || can(actor, 'review.final');

export function productionList(store: LcStaffStore, actor: LcStaffActor | null): { submission: LcSubmission; modules: LcModuleVersion[] }[] {
  if (!canOpenProduction(actor)) return [];
  return store.submissions
    .filter((s) => LC_AFTER_SOURCE_APPROVAL.includes(s.status) && canSee(actor, s))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((submission) => ({ submission, modules: modulesOf(store, submission.id) }));
}
