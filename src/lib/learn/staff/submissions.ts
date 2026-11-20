import { z } from 'zod';
import { lcCategories } from '@/data/learn/categories';
import type { LcManifest } from '../manifest';
import { can, type LcStaffActor, type LcStaffRole } from './roles';

/**
 * PowerPoint submissions: the records, the rules and every change a contributor can make.
 * These are plain functions over a store object, so the rules can be tested without a server,
 * and the server actions that call them stay thin. Every function checks who is asking.
 */

/* ── Records ─────────────────────────────────────────────────────────────── */

export type LcWorkflowStatus =
  | 'draft' | 'submitted' | 'in_review' | 'changes_requested' | 'declined' | 'source_approved'
  | 'awaiting_production' | 'in_production' | 'final_review' | 'final_approved' | 'published' | 'withdrawn' | 'archived';

export const LC_CHECKLIST = [
  { key: 'noClientIdentifiers', label: 'No client identifiers. No names, initials, photos, dates of birth, schools or anything else that could point to a child or family.' },
  { key: 'noCaseNotes', label: 'No case notes. Nothing copied from session notes, behavior plans, assessments or reports.' },
  { key: 'noConfidentialMaterial', label: 'No confidential clinical materials. I checked hidden slides, speaker notes, comments and the file’s properties as well as the slides.' },
  { key: 'plainLanguageObjective', label: 'The learning objectives are written in plain language a caregiver would understand.' },
  { key: 'eligibleContributor', label: 'I am a current staff member who is allowed to contribute, and this is general education, not advice for one child.' },
] as const;
export type LcChecklistKey = (typeof LC_CHECKLIST)[number]['key'];
export type LcChecklistState = Record<LcChecklistKey, boolean>;
export const emptyChecklist = (): LcChecklistState => ({ noClientIdentifiers: false, noCaseNotes: false, noConfidentialMaterial: false, plainLanguageObjective: false, eligibleContributor: false });

export const LC_APPROVED_TAGS = ['Getting started', 'At home', 'Out in the community', 'Working with your clinical team', 'For new families'] as const;
export const LC_AUDIENCES = ['All caregivers', 'Caregivers new to ABA', 'Caregivers of young children', 'Caregivers of teens'] as const;

export type LcSubmissionDetails = { title: string; summary: string; categoryId: string; tags: string[]; objectives: string[]; audience: string };

export type LcSubmission = LcSubmissionDetails & {
  id: string;
  createdBy: string;
  status: LcWorkflowStatus;
  /** Goes up on every change. A save that carries an old number is refused, so two tabs cannot overwrite each other. */
  rev: number;
  checklist: LcChecklistState;
  /** Who has picked this up for the source review, once someone has. */
  reviewerId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LcSubmissionVersion = {
  id: string;
  submissionId: string;
  versionNumber: number;
  assetId: string | null;
  revisionNotes: string;
  createdBy: string;
  createdAt: string;
  /** Set when submitted. A frozen version is never edited or replaced again. */
  frozenAt: string | null;
  /** The details exactly as they were when this version was submitted. */
  snapshot: (LcSubmissionDetails & { checklist: LcChecklistState }) | null;
};

export type LcAsset = {
  id: string;
  /** File name inside the private upload folder. Never a public address. */
  objectKey: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
  /** No malware scanner is connected in the demo, and the record says so. */
  scanState: 'not_configured';
  uploadedBy: string;
  createdAt: string;
  synthetic: boolean;
};

export type LcReview = {
  id: string;
  /** One record approves one thing. A source review can never stand in for a final-module review. */
  targetType: 'source_pptx' | 'derived_module';
  targetVersionId: string;
  submissionId: string;
  reviewerId: string;
  decision: 'approved' | 'changes_requested' | 'declined';
  comments: string;
  decidedAt: string;
  /** What the reviewer ticked. Absent on seeded sample reviews. */
  checklist?: Record<string, boolean>;
  /** For a final-module review: the fingerprint of the exact content that was reviewed. */
  targetHash?: string;
};

export type LcAuditEvent = { id: string; actorId: string; actorRole: LcStaffRole; action: string; targetType: 'submission'; targetId: string; targetVersionId: string | null; at: string; note: string };

export type LcModuleStatus = 'draft' | 'final_review' | 'changes_requested' | 'rejected' | 'final_approved' | 'published' | 'withdrawn';

/** An interactive module made from an approved source. Its content never changes once it is sent for final review. */
export type LcModuleVersion = {
  id: string;
  submissionId: string;
  /** The exact source PowerPoint version this was made from. That version must hold a source approval. */
  sourceVersionId: string;
  versionNumber: number;
  manifest: LcManifest;
  /** Fingerprint of the manifest. A final approval is tied to this exact value. */
  contentHash: string;
  importedBy: string;
  importedAt: string;
  conversionDate: string;
  generationMethod: 'external_ai_assisted' | 'written_by_hand';
  /** What the producer says is new compared with the source: explanations, scenarios, questions. */
  newContentNotes: string;
  status: LcModuleStatus;
  submittedForReviewAt: string | null;
  publishedBy: string | null;
  publishedAt: string | null;
  withdrawnBy: string | null;
  withdrawnAt: string | null;
  withdrawnReason: string;
};

export type LcStaffStore = { v: 1; submissions: LcSubmission[]; versions: LcSubmissionVersion[]; assets: LcAsset[]; reviews: LcReview[]; audit: LcAuditEvent[]; modules: LcModuleVersion[] };
export const emptyStaffStore = (): LcStaffStore => ({ v: 1, submissions: [], versions: [], assets: [], reviews: [], audit: [], modules: [] });

/* ── Input ───────────────────────────────────────────────────────────────── */

const clean = (s: unknown, max: number) => (typeof s === 'string' ? s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max) : '');
const cleanBlock = (s: unknown, max: number) => (typeof s === 'string' ? s.replace(/[<>]/g, '').replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max) : '');

export type LcDraftInput = LcSubmissionDetails & { checklist: LcChecklistState; revisionNotes: string };

/** Take whatever the browser sent and reduce it to safe, bounded plain text. Nothing is trusted as-is. */
export function sanitizeDraftInput(raw: unknown): LcDraftInput {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const list = (v: unknown, max: number, len: number) => (Array.isArray(v) ? v.map((x) => clean(x, len)).filter(Boolean).slice(0, max) : []);
  const checklist = emptyChecklist();
  const given = (r.checklist && typeof r.checklist === 'object' ? r.checklist : {}) as Record<string, unknown>;
  for (const { key } of LC_CHECKLIST) checklist[key] = given[key] === true;
  return {
    title: clean(r.title, 120),
    summary: cleanBlock(r.summary, 600),
    categoryId: clean(r.categoryId, 60),
    tags: list(r.tags, 4, 40).filter((t) => (LC_APPROVED_TAGS as readonly string[]).includes(t)),
    objectives: list(r.objectives, 5, 200),
    audience: clean(r.audience, 160),
    checklist,
    revisionNotes: cleanBlock(r.revisionNotes, 1000),
  };
}

const detailsSchema = z.object({
  title: z.string().min(5, 'Give the presentation a title of at least 5 characters.'),
  summary: z.string().min(20, 'Write a short summary of at least 20 characters.'),
  categoryId: z.string().refine((id) => lcCategories.some((c) => c.id === id), 'Choose one of the six topics.'),
  objectives: z.array(z.string().min(10, 'Each objective needs at least 10 characters.')).min(1, 'Add at least one learning objective.'),
  audience: z.string().min(3, 'Say who this is for.'),
});

export type LcFieldErrors = Partial<Record<'title' | 'summary' | 'categoryId' | 'objectives' | 'audience' | 'file' | 'checklist' | 'revisionNotes', string>>;

/** Everything that must be true before a version can go to clinical review. */
export function submitProblems(s: LcSubmission, v: LcSubmissionVersion): LcFieldErrors {
  const errors: LcFieldErrors = {};
  const parsed = detailsSchema.safeParse(s);
  if (!parsed.success) for (const issue of parsed.error.issues) {
    const field = issue.path[0] as keyof LcFieldErrors;
    if (!errors[field]) errors[field] = issue.message;
  }
  if (!v.assetId) errors.file = 'Upload your PowerPoint (.pptx) file.';
  if (!LC_CHECKLIST.every(({ key }) => s.checklist[key])) errors.checklist = 'Confirm every item on the checklist.';
  if (v.versionNumber > 1 && v.revisionNotes.length < 10) errors.revisionNotes = 'Say briefly what you changed in this version (at least 10 characters).';
  return errors;
}

/* ── Results ─────────────────────────────────────────────────────────────── */

export type LcFail = { ok: false; code: 'forbidden' | 'not_found' | 'stale' | 'invalid' | 'state'; message: string; fieldErrors?: LcFieldErrors };
export type LcResult<T> = { ok: true; value: T } | LcFail;
const fail = (code: LcFail['code'], message: string, fieldErrors?: LcFieldErrors): LcFail => ({ ok: false, code, message, fieldErrors });
const FORBIDDEN = fail('forbidden', 'Your role does not allow that.');
const NOT_FOUND = fail('not_found', 'That submission was not found.');
const STALE = fail('stale', 'This submission changed since you opened it. Reload the page to see the latest version, then try again.');

export type LcCtx = { now: string; newId: () => string };

/* ── Reading ─────────────────────────────────────────────────────────────── */

const versionsOf = (store: LcStaffStore, id: string) => store.versions.filter((v) => v.submissionId === id).sort((a, b) => a.versionNumber - b.versionNumber);
export const workingVersion = (store: LcStaffStore, id: string) => versionsOf(store, id).find((v) => !v.frozenAt) ?? null;

/** Who may see a submission: its author, or a role allowed to read all of them. Nobody else. */
export const LC_AFTER_SOURCE_APPROVAL: LcWorkflowStatus[] = ['source_approved', 'awaiting_production', 'in_production', 'final_review', 'final_approved', 'published', 'withdrawn'];

export function canSee(actor: LcStaffActor | null, s: LcSubmission): boolean {
  if (!actor || !actor.active) return false;
  if (s.createdBy === actor.id || can(actor, 'submission.read_all')) return true;
  // A producer sees a submission only once its source PowerPoint has been clinically approved.
  return can(actor, 'module.import') && LC_AFTER_SOURCE_APPROVAL.includes(s.status);
}

export function listSubmissions(store: LcStaffStore, actor: LcStaffActor | null, scope: 'mine' | 'all'): LcSubmission[] {
  if (!actor || !actor.active) return [];
  const mine = scope === 'mine' || !can(actor, 'submission.read_all');
  return store.submissions.filter((s) => (mine ? s.createdBy === actor.id : true)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export type LcSubmissionView = {
  submission: LcSubmission;
  versions: (LcSubmissionVersion & { asset: LcAsset | null })[];
  reviews: LcReview[];
  audit: LcAuditEvent[];
  isOwner: boolean;
  /** The author may edit only while there is an unfrozen working version. */
  canEdit: boolean;
  canStartRevision: boolean;
  canDelete: boolean;
};

/** Returns null both when the record does not exist and when the actor may not see it, so nothing leaks. */
export function viewSubmission(store: LcStaffStore, actor: LcStaffActor | null, id: string): LcSubmissionView | null {
  const submission = store.submissions.find((s) => s.id === id);
  if (!submission || !canSee(actor, submission) || !actor) return null;
  const versions = versionsOf(store, id).map((v) => ({ ...v, asset: store.assets.find((a) => a.id === v.assetId) ?? null }));
  const isOwner = submission.createdBy === actor.id;
  const working = versions.find((v) => !v.frozenAt) ?? null;
  const author = isOwner && can(actor, 'submission.create');
  return {
    submission,
    versions,
    reviews: store.reviews.filter((r) => r.submissionId === id).sort((a, b) => b.decidedAt.localeCompare(a.decidedAt)),
    audit: store.audit.filter((e) => e.targetId === id).sort((a, b) => b.at.localeCompare(a.at)),
    isOwner,
    canEdit: author && !!working && (submission.status === 'draft' || submission.status === 'changes_requested'),
    canStartRevision: author && !working && submission.status === 'changes_requested',
    canDelete: author && submission.status === 'draft' && versions.every((v) => !v.frozenAt),
  };
}

/** May this actor download this stored file? Only through a submission they are allowed to see. */
export function assetFor(store: LcStaffStore, actor: LcStaffActor | null, assetId: string): LcAsset | null {
  const version = store.versions.find((v) => v.assetId === assetId);
  const submission = version ? store.submissions.find((s) => s.id === version.submissionId) : null;
  if (!version || !submission || !canSee(actor, submission)) return null;
  return store.assets.find((a) => a.id === assetId) ?? null;
}

/* ── Changes a contributor can make ──────────────────────────────────────── */

function audit(store: LcStaffStore, actor: LcStaffActor, ctx: LcCtx, action: string, s: LcSubmission, versionId: string | null, note = '') {
  store.audit.push({ id: ctx.newId(), actorId: actor.id, actorRole: actor.role, action, targetType: 'submission', targetId: s.id, targetVersionId: versionId, at: ctx.now, note });
}

function touch(s: LcSubmission, ctx: LcCtx) {
  s.rev += 1;
  s.updatedAt = ctx.now;
}

/** Find a submission the actor owns and may still edit, guarding against stale saves. */
function ownEditable(store: LcStaffStore, actor: LcStaffActor | null, id: string, rev: number | null): LcResult<{ s: LcSubmission; v: LcSubmissionVersion; actor: LcStaffActor }> {
  if (!actor || !can(actor, 'submission.create')) return FORBIDDEN;
  const s = store.submissions.find((x) => x.id === id);
  // Someone else's record is reported as missing, never as "forbidden".
  if (!s || s.createdBy !== actor.id) return NOT_FOUND;
  if (rev !== null && rev !== s.rev) return STALE;
  const v = workingVersion(store, id);
  if (!v || (s.status !== 'draft' && s.status !== 'changes_requested')) return fail('state', 'This version has been submitted and can no longer be changed.');
  return { ok: true, value: { s, v, actor } };
}

export function createDraft(store: LcStaffStore, actor: LcStaffActor | null, raw: unknown, ctx: LcCtx): LcResult<LcSubmission> {
  if (!actor || !can(actor, 'submission.create')) return FORBIDDEN;
  const input = sanitizeDraftInput(raw);
  if (input.title.length < 1) return fail('invalid', 'Give the presentation a title before saving.', { title: 'Give the presentation a title before saving.' });
  const s: LcSubmission = { id: ctx.newId(), createdBy: actor.id, status: 'draft', rev: 1, title: input.title, summary: input.summary, categoryId: input.categoryId, tags: input.tags, objectives: input.objectives, audience: input.audience, checklist: input.checklist, createdAt: ctx.now, updatedAt: ctx.now };
  store.submissions.push(s);
  const v: LcSubmissionVersion = { id: ctx.newId(), submissionId: s.id, versionNumber: 1, assetId: null, revisionNotes: '', createdBy: actor.id, createdAt: ctx.now, frozenAt: null, snapshot: null };
  store.versions.push(v);
  audit(store, actor, ctx, 'draft_created', s, v.id);
  return { ok: true, value: s };
}

export function updateDraft(store: LcStaffStore, actor: LcStaffActor | null, id: string, rev: number, raw: unknown, ctx: LcCtx): LcResult<LcSubmission> {
  const found = ownEditable(store, actor, id, rev);
  if (!found.ok) return found;
  const { s, v } = found.value;
  const input = sanitizeDraftInput(raw);
  if (input.title.length < 1) return fail('invalid', 'Give the presentation a title before saving.', { title: 'Give the presentation a title before saving.' });
  Object.assign(s, { title: input.title, summary: input.summary, categoryId: input.categoryId, tags: input.tags, objectives: input.objectives, audience: input.audience, checklist: input.checklist });
  v.revisionNotes = input.revisionNotes;
  touch(s, ctx);
  return { ok: true, value: s };
}

/** Attach an uploaded file to the working version. Returns the file it replaced, so its bytes can be removed. */
export function attachFile(store: LcStaffStore, actor: LcStaffActor | null, id: string, asset: LcAsset, ctx: LcCtx): LcResult<{ submission: LcSubmission; replaced: LcAsset | null }> {
  const found = ownEditable(store, actor, id, null);
  if (!found.ok) return found;
  const { s, v } = found.value;
  const replaced = store.assets.find((a) => a.id === v.assetId) ?? null;
  if (replaced) store.assets = store.assets.filter((a) => a.id !== replaced.id);
  store.assets.push(asset);
  v.assetId = asset.id;
  touch(s, ctx);
  audit(store, found.value.actor, ctx, replaced ? 'file_replaced' : 'file_uploaded', s, v.id, asset.fileName);
  return { ok: true, value: { submission: s, replaced } };
}

export function removeFile(store: LcStaffStore, actor: LcStaffActor | null, id: string, rev: number, ctx: LcCtx): LcResult<{ submission: LcSubmission; removed: LcAsset | null }> {
  const found = ownEditable(store, actor, id, rev);
  if (!found.ok) return found;
  const { s, v } = found.value;
  const removed = store.assets.find((a) => a.id === v.assetId) ?? null;
  if (removed) store.assets = store.assets.filter((a) => a.id !== removed.id);
  v.assetId = null;
  touch(s, ctx);
  if (removed) audit(store, found.value.actor, ctx, 'file_removed', s, v.id, removed.fileName);
  return { ok: true, value: { submission: s, removed } };
}

/** Send the working version to clinical review. It is frozen here and never edited again. */
export function submitForReview(store: LcStaffStore, actor: LcStaffActor | null, id: string, rev: number, ctx: LcCtx): LcResult<LcSubmission> {
  const found = ownEditable(store, actor, id, rev);
  if (!found.ok) return found;
  const { s, v } = found.value;
  const problems = submitProblems(s, v);
  if (Object.keys(problems).length > 0) return fail('invalid', 'A few things are still needed before this can be submitted.', problems);
  v.frozenAt = ctx.now;
  v.snapshot = { title: s.title, summary: s.summary, categoryId: s.categoryId, tags: [...s.tags], objectives: [...s.objectives], audience: s.audience, checklist: { ...s.checklist } };
  s.status = 'submitted';
  // The attestation belongs to the version just frozen. A later version must be attested again.
  s.checklist = emptyChecklist();
  touch(s, ctx);
  audit(store, found.value.actor, ctx, 'submitted_for_review', s, v.id, `Version ${v.versionNumber}`);
  return { ok: true, value: s };
}

/** After "changes requested": open a new working version. The reviewed version stays exactly as it was. */
export function startRevision(store: LcStaffStore, actor: LcStaffActor | null, id: string, rev: number, ctx: LcCtx): LcResult<LcSubmission> {
  if (!actor || !can(actor, 'submission.create')) return FORBIDDEN;
  const s = store.submissions.find((x) => x.id === id);
  if (!s || s.createdBy !== actor.id) return NOT_FOUND;
  if (rev !== s.rev) return STALE;
  if (s.status !== 'changes_requested') return fail('state', 'A new version can be started only after a reviewer has requested changes.');
  if (workingVersion(store, id)) return fail('state', 'A new version is already in progress.');
  const last = versionsOf(store, id).at(-1);
  const v: LcSubmissionVersion = { id: ctx.newId(), submissionId: id, versionNumber: (last?.versionNumber ?? 0) + 1, assetId: null, revisionNotes: '', createdBy: actor.id, createdAt: ctx.now, frozenAt: null, snapshot: null };
  store.versions.push(v);
  touch(s, ctx);
  audit(store, actor, ctx, 'revision_started', s, v.id, `Version ${v.versionNumber}`);
  return { ok: true, value: s };
}

/** Delete a draft that has never been submitted. Anything that has been reviewed is kept. */
export function deleteDraft(store: LcStaffStore, actor: LcStaffActor | null, id: string, rev: number, ctx: LcCtx): LcResult<{ removedAssets: LcAsset[] }> {
  if (!actor || !can(actor, 'submission.create')) return FORBIDDEN;
  const s = store.submissions.find((x) => x.id === id);
  if (!s || s.createdBy !== actor.id) return NOT_FOUND;
  if (rev !== s.rev) return STALE;
  const versions = versionsOf(store, id);
  if (s.status !== 'draft' || versions.some((v) => v.frozenAt)) return fail('state', 'Only a draft that has never been submitted can be deleted. Reviewed versions are kept.');
  const assetIds = new Set(versions.map((v) => v.assetId).filter(Boolean));
  const removedAssets = store.assets.filter((a) => assetIds.has(a.id));
  store.assets = store.assets.filter((a) => !assetIds.has(a.id));
  store.versions = store.versions.filter((v) => v.submissionId !== id);
  store.submissions = store.submissions.filter((x) => x.id !== id);
  // The audit line stays, with the title, so there is a record that a draft existed and was removed.
  audit(store, actor, ctx, 'draft_deleted', s, null, s.title);
  return { ok: true, value: { removedAssets } };
}

/* ── Status wording, shared by every staff screen ────────────────────────── */

export type LcStatusFilter = 'all' | 'draft' | 'awaiting_review' | 'changes_requested' | 'source_approved' | 'in_production' | 'final_review' | 'published' | 'archived';
export const LC_STATUS_FILTERS: { id: LcStatusFilter; label: string; statuses: LcWorkflowStatus[] }[] = [
  { id: 'all', label: 'All', statuses: [] },
  { id: 'draft', label: 'Draft', statuses: ['draft'] },
  { id: 'awaiting_review', label: 'Awaiting review', statuses: ['submitted', 'in_review'] },
  { id: 'changes_requested', label: 'Changes requested', statuses: ['changes_requested'] },
  { id: 'source_approved', label: 'Approved source', statuses: ['source_approved'] },
  { id: 'in_production', label: 'In production', statuses: ['awaiting_production', 'in_production'] },
  { id: 'final_review', label: 'Final review', statuses: ['final_review', 'final_approved'] },
  { id: 'published', label: 'Published', statuses: ['published'] },
  { id: 'archived', label: 'Archived', statuses: ['archived', 'withdrawn', 'declined'] },
];

export const LC_STATUS: Record<LcWorkflowStatus, { label: string; cast: 'slate' | 'amber' | 'iris' | 'coral' | 'rose' | 'teal' | 'blue' | 'solid'; next: string }> = {
  draft: { label: 'Draft', cast: 'slate', next: 'Finish the steps and submit it for clinical review when you are ready.' },
  submitted: { label: 'Awaiting review', cast: 'amber', next: 'A BCBA or the Clinical Director will review this version. You do not need to do anything.' },
  in_review: { label: 'In review', cast: 'iris', next: 'A reviewer is looking at this version now.' },
  changes_requested: { label: 'Changes requested', cast: 'coral', next: 'Read the reviewer’s feedback, then start a new version with your changes.' },
  declined: { label: 'Declined', cast: 'rose', next: 'The reviewer explained why below. Talk with them before starting something new on this topic.' },
  source_approved: { label: 'Source approved', cast: 'teal', next: 'This PowerPoint is approved as a source. It still has to be turned into a module and approved a second time before families see it.' },
  awaiting_production: { label: 'Awaiting production', cast: 'blue', next: 'The approved source is waiting to be turned into an interactive module.' },
  in_production: { label: 'In production', cast: 'blue', next: 'The interactive module is being built from the approved source.' },
  final_review: { label: 'Final review', cast: 'iris', next: 'A clinician is reviewing the finished module itself. This is a separate approval from the first one.' },
  final_approved: { label: 'Final approved', cast: 'teal', next: 'The finished module is approved and waiting to be published.' },
  published: { label: 'Published', cast: 'solid', next: 'Families can now see the module made from this presentation.' },
  withdrawn: { label: 'Withdrawn', cast: 'slate', next: 'The module made from this presentation has been taken down.' },
  archived: { label: 'Archived', cast: 'slate', next: 'This submission is closed and kept for the record.' },
};

export const LC_AUDIT_LABEL: Record<string, string> = {
  draft_created: 'Draft started',
  file_uploaded: 'File uploaded',
  file_replaced: 'File replaced',
  file_removed: 'File removed',
  submitted_for_review: 'Submitted for clinical review',
  revision_started: 'New version started',
  draft_deleted: 'Draft deleted',
  changes_requested: 'Reviewer requested changes',
  source_approved: 'Source approved',
  declined: 'Declined',
  source_review_started: 'Source review started',
  production_started: 'Collected for production',
  module_imported: 'Module imported',
  module_submitted: 'Module sent for final review',
  final_approved: 'Final module approved',
  final_changes_requested: 'Changes requested on the module',
  final_rejected: 'Module rejected',
  module_published: 'Module published',
  module_withdrawn: 'Module withdrawn',
};
