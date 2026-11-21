import { lcCategories } from '@/data/learn/categories';
import { checkRegistrationUrl } from '../registration';
import { ctInputParts, ctWallTimeToUtc, LC_TIME_ZONE } from '../time';
import { isPubliclyListed, type LcListingStatus, type LcTraining } from '../trainings';
import { can, type LcStaffActor } from './roles';
import type { LcCtx, LcStaffStore } from './submissions';

/**
 * Website listings for live trainings. The training itself, its registration, who is approved and
 * who attends all live in Microsoft Teams. A listing is only the public notice: what, when, and
 * where to register. It never holds a join link, a registrant, or anything about a family.
 *
 * Plain functions over the store, like the rest of the staff rules. Each one checks who is asking.
 */

export const LC_LISTING_AUDIENCE = 'Currently enrolled families only';

export type LcListing = {
  id: string;
  /** Goes up on every change. A save that carries an old number is refused. */
  rev: number;
  training: LcTraining;
  /** Ticked by staff: the presenter has agreed to be named on the public page. */
  presenterApproved: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  /** Set the first time the listing goes public. After that its web address never changes. */
  publishedAt: string | null;
};

export type LcListingInput = {
  title: string; summary: string; description: string; objectives: string; date: string; startTime: string; endTime: string;
  categoryId: string; relatedModuleIds: string[]; presenterLabel: string; presenterApproved: boolean; registrationUrl: string;
};
export type LcListingField = 'title' | 'summary' | 'description' | 'objectives' | 'date' | 'startTime' | 'endTime' | 'categoryId' | 'relatedModuleIds' | 'presenterLabel' | 'registrationUrl';
export type LcListingErrors = Partial<Record<LcListingField, string>>;

export type LcListingFail = { ok: false; code: 'forbidden' | 'not_found' | 'stale' | 'invalid' | 'state'; message: string; fieldErrors?: LcListingErrors; problems?: string[] };
export type LcListingResult<T> = { ok: true; value: T } | LcListingFail;

const FORBIDDEN: LcListingFail = { ok: false, code: 'forbidden', message: 'Your role cannot manage training listings.' };
const NOT_FOUND: LcListingFail = { ok: false, code: 'not_found', message: 'That listing could not be found.' };
const STALE: LcListingFail = { ok: false, code: 'stale', message: 'This listing was changed somewhere else since you opened it. Reload the page to see the latest version, then try again.' };
const fail = (code: LcListingFail['code'], message: string, extra: Partial<LcListingFail> = {}): LcListingFail => ({ ok: false, code, message, ...extra });

/** What the editor needs to know about the world outside the listing. */
export type LcListingEnv = { takenSlugs: string[]; publishedModuleIds: string[] };

/* ── Input ───────────────────────────────────────────────────────────────── */

const clean = (s: unknown, max: number) => (typeof s === 'string' ? s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max) : '');
const cleanBlock = (s: unknown, max: number) => (typeof s === 'string' ? s.replace(/[<>]/g, '').replace(/\r/g, '').replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max) : '');

/** Reduce whatever the browser sent to bounded plain text. The link is kept as typed so it can be checked, never trusted. */
export function sanitizeListingInput(raw: unknown): LcListingInput {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    title: clean(r.title, 120),
    summary: clean(r.summary, 240),
    description: cleanBlock(r.description, 2000),
    objectives: cleanBlock(r.objectives, 1000),
    date: clean(r.date, 10),
    startTime: clean(r.startTime, 5),
    endTime: clean(r.endTime, 5),
    categoryId: clean(r.categoryId, 60),
    relatedModuleIds: Array.isArray(r.relatedModuleIds) ? [...new Set(r.relatedModuleIds.map((x) => clean(x, 80)).filter(Boolean))].slice(0, 6) : [],
    presenterLabel: clean(r.presenterLabel, 80),
    presenterApproved: r.presenterApproved === true,
    registrationUrl: typeof r.registrationUrl === 'string' ? r.registrationUrl.trim().slice(0, 500) : '',
  };
}

const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.replace(/\n/g, ' ').trim()).filter(Boolean).slice(0, 8);
const lines = (text: string) => text.split('\n').map((l) => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean).slice(0, 8);

/** The form values for a stored listing. */
export function listingToInput(l: LcListing): LcListingInput {
  const t = l.training;
  const start = t.startAtUtc ? ctInputParts(t.startAtUtc) : null;
  const end = t.endAtUtc ? ctInputParts(t.endAtUtc) : null;
  return {
    title: t.title, summary: t.summary, description: t.description.join('\n\n'), objectives: t.objectives.join('\n'),
    date: start?.date ?? '', startTime: start?.time ?? '', endTime: end?.time ?? '',
    categoryId: t.categoryId, relatedModuleIds: t.relatedModuleIds, presenterLabel: t.presenterLabel ?? '', presenterApproved: l.presenterApproved, registrationUrl: t.registrationUrl ?? '',
  };
}

type Parsed = { fields: Pick<LcTraining, 'title' | 'summary' | 'description' | 'objectives' | 'startAtUtc' | 'endAtUtc' | 'categoryId' | 'relatedModuleIds' | 'presenterLabel' | 'registrationUrl'>; presenterApproved: boolean; errors: LcListingErrors };

/** Check everything that must hold for any save, draft or public. A value that fails is never stored. */
function parse(input: LcListingInput, env: LcListingEnv): Parsed {
  const errors: LcListingErrors = {};
  if (input.title.length < 3) errors.title = 'Give the training a title.';
  if (input.categoryId && !lcCategories.some((c) => c.id === input.categoryId)) errors.categoryId = 'Choose a topic from the list.';

  let startAtUtc: string | null = null;
  let endAtUtc: string | null = null;
  const anyWhen = input.date || input.startTime || input.endTime;
  if (anyWhen) {
    if (!input.date) errors.date = 'Add the date.';
    if (!input.startTime) errors.startTime = 'Add the start time.';
    if (!input.endTime) errors.endTime = 'Add the end time.';
    if (input.date && input.startTime && input.endTime) {
      startAtUtc = ctWallTimeToUtc(input.date, input.startTime);
      endAtUtc = ctWallTimeToUtc(input.date, input.endTime);
      if (!startAtUtc) errors.startTime = 'That date and start time do not exist in Central Time. Check the date, and remember the clocks change in March.';
      else if (!endAtUtc) errors.endTime = 'That end time does not exist in Central Time on this date.';
      else if (new Date(endAtUtc).getTime() <= new Date(startAtUtc).getTime()) errors.endTime = 'The end time must be after the start time.';
      else if (new Date(endAtUtc).getTime() - new Date(startAtUtc).getTime() > 8 * 3600 * 1000) errors.endTime = 'A training cannot be longer than eight hours.';
    }
  }

  // A link that is not a Microsoft Teams registration page is refused outright. It is never saved "for later".
  let registrationUrl: string | null = null;
  if (input.registrationUrl) {
    const check = checkRegistrationUrl(input.registrationUrl);
    if (check.ok) registrationUrl = check.url;
    else errors.registrationUrl = check.reason;
  }

  let presenterLabel: string | null = null;
  if (input.presenterLabel) {
    if (!input.presenterApproved) errors.presenterLabel = 'Tick the box to confirm the presenter has agreed to be named, or leave the name out.';
    else presenterLabel = input.presenterLabel;
  }

  const unknown = input.relatedModuleIds.filter((id) => !env.publishedModuleIds.includes(id));
  if (unknown.length > 0) errors.relatedModuleIds = 'Only published modules can be linked to a training.';

  return {
    fields: { title: input.title, summary: input.summary, description: paragraphs(input.description), objectives: lines(input.objectives), startAtUtc, endAtUtc, categoryId: input.categoryId, relatedModuleIds: input.relatedModuleIds, presenterLabel, registrationUrl },
    presenterApproved: presenterLabel !== null,
    errors,
  };
}

/** What a listing still needs before caregivers may see it. An empty list means it can go public. */
export function listingPublishProblems(t: LcTraining, now: Date, opts: { mustBeUpcoming: boolean } = { mustBeUpcoming: true }): string[] {
  const problems: string[] = [];
  if (t.title.length < 3) problems.push('Add a title.');
  if (t.summary.length < 20) problems.push('Add a short summary, one or two sentences.');
  if (t.description.length < 1) problems.push('Add a description.');
  if (t.objectives.length < 1) problems.push('Add at least one learning objective.');
  if (!lcCategories.some((c) => c.id === t.categoryId)) problems.push('Choose a topic.');
  if (!t.startAtUtc || !t.endAtUtc) problems.push('Add the date, start time and end time.');
  else if (opts.mustBeUpcoming && new Date(t.startAtUtc).getTime() <= now.getTime()) problems.push('The start time has already passed. Choose a date in the future.');
  return problems;
}

/** Things staff should know but that do not block publishing. */
export function listingWarnings(t: LcTraining): string[] {
  const warnings: string[] = [];
  if (!checkRegistrationUrl(t.registrationUrl).ok) warnings.push('No registration link has been added. Caregivers will see “Registration details coming soon” and no registration button.');
  return warnings;
}

/* ── Reading ─────────────────────────────────────────────────────────────── */

export const canManageTrainings = (actor: LcStaffActor | null | undefined) => can(actor, 'training.manage');

export function listListings(store: LcStaffStore, actor: LcStaffActor | null): LcListing[] {
  if (!canManageTrainings(actor)) return [];
  return [...store.listings].sort((a, b) => (a.training.startAtUtc ?? '9999').localeCompare(b.training.startAtUtc ?? '9999'));
}

export function getListing(store: LcStaffStore, actor: LcStaffActor | null, id: string): LcListing | null {
  if (!canManageTrainings(actor)) return null;
  return store.listings.find((l) => l.id === id) ?? null;
}

/** What the public pages may read: listings that are public, as plain training records. Drafts and archived listings never leave. */
export function publicTrainings(store: LcStaffStore): LcTraining[] {
  return store.listings.map((l) => l.training).filter(isPubliclyListed);
}

export const listingAudit = (store: LcStaffStore, actor: LcStaffActor | null, id: string) =>
  canManageTrainings(actor) ? store.audit.filter((a) => a.targetType === 'training' && a.targetId === id).sort((a, b) => a.at.localeCompare(b.at)) : [];

/* ── Changing ────────────────────────────────────────────────────────────── */

const slugify = (title: string) => title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'training';

function freeSlug(title: string, taken: string[]): string {
  const base = slugify(title);
  if (!taken.includes(base)) return base;
  for (let n = 2; n < 500; n++) if (!taken.includes(`${base}-${n}`)) return `${base}-${n}`;
  return `${base}-${taken.length + 2}`;
}

function audit(store: LcStaffStore, actor: LcStaffActor, ctx: LcCtx, action: string, l: LcListing, note = '') {
  store.audit.push({ id: ctx.newId(), actorId: actor.id, actorRole: actor.role, action, targetType: 'training', targetId: l.id, targetVersionId: null, at: ctx.now, note });
}

function touch(l: LcListing, actor: LcStaffActor, ctx: LcCtx) {
  l.rev += 1;
  l.updatedAt = ctx.now;
  l.updatedBy = actor.id;
  l.training.lastUpdated = ctx.now;
}

export function createListing(store: LcStaffStore, actor: LcStaffActor | null, raw: unknown, env: LcListingEnv, ctx: LcCtx): LcListingResult<LcListing> {
  if (!actor || !canManageTrainings(actor)) return FORBIDDEN;
  const p = parse(sanitizeListingInput(raw), env);
  if (Object.keys(p.errors).length > 0) return fail('invalid', 'Some details need another look. Nothing was saved.', { fieldErrors: p.errors });
  const id = ctx.newId();
  const slug = freeSlug(p.fields.title, [...env.takenSlugs, ...store.listings.map((l) => l.training.slug)]);
  const listing: LcListing = {
    id, rev: 1, presenterApproved: p.presenterApproved, createdBy: actor.id, createdAt: ctx.now, updatedBy: actor.id, updatedAt: ctx.now, publishedAt: null,
    // Everything in the local demo store is example content, and is labelled that way on the public pages.
    training: { id, slug, ...p.fields, timeZone: LC_TIME_ZONE, listingStatus: 'draft', isExample: true, lastUpdated: ctx.now },
  };
  store.listings.push(listing);
  audit(store, actor, ctx, 'listing_created', listing);
  return { ok: true, value: listing };
}

const EDITABLE: LcListingStatus[] = ['draft', 'scheduled', 'registration_closed'];

export function updateListing(store: LcStaffStore, actor: LcStaffActor | null, id: string, rev: number, raw: unknown, env: LcListingEnv, ctx: LcCtx): LcListingResult<LcListing> {
  if (!actor || !canManageTrainings(actor)) return FORBIDDEN;
  const l = store.listings.find((x) => x.id === id);
  if (!l) return NOT_FOUND;
  if (rev !== l.rev) return STALE;
  if (!EDITABLE.includes(l.training.listingStatus)) return fail('state', 'A completed, cancelled or archived listing can no longer be edited.');
  const p = parse(sanitizeListingInput(raw), env);
  if (Object.keys(p.errors).length > 0) return fail('invalid', 'Some details need another look. Nothing was saved.', { fieldErrors: p.errors });
  const next: LcTraining = { ...l.training, ...p.fields };
  if (l.training.listingStatus !== 'draft') {
    // A public listing must stay complete. Its date only has to be in the future if the date is being changed.
    const dateChanged = next.startAtUtc !== l.training.startAtUtc;
    const problems = listingPublishProblems(next, new Date(ctx.now), { mustBeUpcoming: dateChanged });
    if (problems.length > 0) return fail('invalid', 'This listing is public, so it has to stay complete. Nothing was saved.', { problems });
  }
  // The web address follows the title only until the listing first goes public.
  if (!l.publishedAt && next.title !== l.training.title) {
    next.slug = freeSlug(next.title, [...env.takenSlugs, ...store.listings.filter((x) => x.id !== l.id).map((x) => x.training.slug)]);
  }
  l.training = next;
  l.presenterApproved = p.presenterApproved;
  touch(l, actor, ctx);
  audit(store, actor, ctx, l.training.listingStatus === 'draft' ? 'listing_saved' : 'listing_updated', l);
  return { ok: true, value: l };
}

export type LcListingAction = 'publish' | 'close_registration' | 'reopen_registration' | 'cancel' | 'complete' | 'archive';

const ACTIONS: Record<LcListingAction, { from: LcListingStatus[]; to: LcListingStatus; audit: string; wrongState: string }> = {
  publish: { from: ['draft'], to: 'scheduled', audit: 'listing_published', wrongState: 'Only a draft can be published.' },
  close_registration: { from: ['scheduled'], to: 'registration_closed', audit: 'registration_closed', wrongState: 'Registration can only be closed on a scheduled listing.' },
  reopen_registration: { from: ['registration_closed'], to: 'scheduled', audit: 'registration_reopened', wrongState: 'Registration is not closed on this listing.' },
  cancel: { from: ['scheduled', 'registration_closed'], to: 'cancelled', audit: 'listing_cancelled', wrongState: 'Only a public, upcoming listing can be cancelled.' },
  complete: { from: ['scheduled', 'registration_closed'], to: 'completed', audit: 'listing_completed', wrongState: 'Only a public listing can be marked completed.' },
  archive: { from: ['draft', 'completed', 'cancelled'], to: 'archived', audit: 'listing_archived', wrongState: 'Cancel or complete this listing before archiving it.' },
};

export function changeListingStatus(store: LcStaffStore, actor: LcStaffActor | null, id: string, rev: number, action: LcListingAction, ctx: LcCtx): LcListingResult<LcListing> {
  if (!actor || !canManageTrainings(actor)) return FORBIDDEN;
  const l = store.listings.find((x) => x.id === id);
  if (!l) return NOT_FOUND;
  if (rev !== l.rev) return STALE;
  const rule = ACTIONS[action];
  if (!rule) return fail('invalid', 'That is not something a listing can do.');
  const t = l.training;
  if (!rule.from.includes(t.listingStatus)) return fail('state', rule.wrongState);
  const now = new Date(ctx.now);
  const over = t.endAtUtc ? new Date(t.endAtUtc).getTime() < now.getTime() : false;
  if (action === 'publish') {
    const problems = listingPublishProblems(t, now);
    if (problems.length > 0) return fail('invalid', 'This listing is not ready to publish yet.', { problems });
  }
  if ((action === 'cancel' || action === 'reopen_registration' || action === 'close_registration') && over) return fail('state', 'This training has already finished. Mark it completed instead.');
  if (action === 'complete' && !over) return fail('state', 'This training has not finished yet. It can be marked completed after its end time.');
  t.listingStatus = rule.to;
  if (action === 'publish' && !l.publishedAt) l.publishedAt = ctx.now;
  touch(l, actor, ctx);
  audit(store, actor, ctx, rule.audit, l);
  return { ok: true, value: l };
}

/* ── Words ───────────────────────────────────────────────────────────────── */

export const LC_LISTING_STATUS: Record<LcListingStatus, { label: string; cast: 'slate' | 'amber' | 'iris' | 'coral' | 'rose' | 'teal' | 'blue'; note: string }> = {
  draft: { label: 'Draft', cast: 'slate', note: 'Only staff can see this. Caregivers cannot.' },
  scheduled: { label: 'Scheduled', cast: 'teal', note: 'Public. Caregivers can see this listing.' },
  registration_closed: { label: 'Registration closed', cast: 'amber', note: 'Public, with no registration button.' },
  completed: { label: 'Completed', cast: 'slate', note: 'Public, shown as finished.' },
  cancelled: { label: 'Cancelled', cast: 'rose', note: 'Public, shown as cancelled.' },
  archived: { label: 'Archived', cast: 'slate', note: 'Removed from the public pages.' },
};

export const LC_LISTING_AUDIT_LABEL: Record<string, string> = {
  listing_created: 'Draft created',
  listing_saved: 'Draft saved',
  listing_updated: 'Public listing updated',
  listing_published: 'Published',
  registration_closed: 'Registration closed',
  registration_reopened: 'Registration reopened',
  listing_cancelled: 'Cancelled',
  listing_completed: 'Marked completed',
  listing_archived: 'Archived',
};
