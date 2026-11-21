import { lcCategories } from '@/data/learn/categories';
import { locations } from '@/data/locations';
import { ctDay } from '../time';
import { can, type LcStaffActor } from './roles';
import type { LcListing } from './listings';
import type { LcCtx, LcStaffStore } from './submissions';

/**
 * Aggregate participation reporting. The Clinical Director asked for trends, not a record of which
 * family attended. So this file can only hold whole-number totals that a member of staff reads off
 * the Microsoft Teams organizer report and types in. There is no field anywhere for a name, an
 * email address, a child, or a row per person, and nothing here is connected to Teams.
 *
 * Three rules are enforced in this one place:
 *   1. A number that was not entered is "not yet available". It is never shown or added as zero.
 *   2. A rate is only worked out from two numbers that count the same trainings.
 *   3. A small count for one center or one source is never shown on its own.
 */

/** The smallest count that may be shown for one center or one source. A compliance decision; proposed value 5. */
export const LC_SMALL_CELL_MINIMUM = 5;

/**
 * Whether each optional split is offered at all. A split only means something if the Microsoft Teams
 * registration form asks the question. If the clinic decides not to ask, switch it off here: the
 * boxes disappear from the entry page, nothing is stored, and the section leaves the report.
 */
export type LcReportSplits = { byCenter: boolean; bySource: boolean };
export const LC_REPORT_SPLITS: LcReportSplits = { byCenter: true, bySource: true };

export const LC_REPORT_SOURCES = ['Microsoft Teams organizer report', 'Other approved source'] as const;

/** How a family heard about the training, if the registration form asked. A fixed list, so no free text is stored. */
export const LC_REFERRAL_SOURCES = [
  { id: 'clinical_team', label: 'Their clinical team' },
  { id: 'center_message', label: 'A message from the center' },
  { id: 'website', label: 'This website' },
  { id: 'another_family', label: 'Another family' },
  { id: 'other', label: 'Something else' },
] as const;

export const LC_REPORT_CENTERS = locations.map((l) => ({ id: l.slug, label: l.name }));
const NOT_STATED = 'not_stated';

export type LcReportValues = {
  /** The day a member of staff read the source report: "2026-11-05". */
  reportReviewedOn: string;
  sourceLabel: string;
  trainingHeld: boolean;
  /** Null means the number was not available. It is not zero. */
  registrationsTotal: number | null;
  registrationsApproved: number | null;
  attendancesTotal: number | null;
  /** Registrations submitted, split by center. Null when the split was not collected. */
  centerCounts: Record<string, number> | null;
  /** Registrations submitted, split by how the family heard about the training. */
  sourceCounts: Record<string, number> | null;
};

/** One entry. A correction never edits an entry: it adds the next revision, with a reason. */
export type LcAggregateReport = LcReportValues & { id: string; trainingId: string; revision: number; reason: string; enteredBy: string; enteredAt: string };

export type LcReportField = 'trainingId' | 'reportReviewedOn' | 'sourceLabel' | 'registrationsTotal' | 'registrationsApproved' | 'attendancesTotal' | 'centerCounts' | 'sourceCounts' | 'reason';
export type LcReportErrors = Partial<Record<LcReportField, string>>;
export type LcReportFail = { ok: false; code: 'forbidden' | 'not_found' | 'stale' | 'invalid' | 'state'; message: string; fieldErrors?: LcReportErrors };
export type LcReportResult<T> = { ok: true; value: T } | LcReportFail;

const FORBIDDEN: LcReportFail = { ok: false, code: 'forbidden', message: 'Your role cannot see or enter participation numbers.' };

export const canViewAnalytics = (actor: LcStaffActor | null | undefined) => can(actor, 'analytics.view');

/* ── Small numbers ───────────────────────────────────────────────────────── */

/**
 * Decide which parts of one training's split may be shown.
 *
 * A part smaller than the minimum is folded into "Other / not displayed". Because the total is
 * shown, hiding one part alone would not hide it: anyone could subtract. So at least two parts
 * are always folded together, and more are added until the folded figure itself reaches the
 * minimum. If that cannot be done, nothing is shown for this training and its whole total is
 * counted as "Other / not displayed".
 *
 * `total` is the declared total the parts belong to. Whatever the parts leave unexplained is
 * treated as one more part ("did not say"), so the result always adds back up to the total.
 */
export function safeBreakdown(counts: Record<string, number>, total: number, min: number = LC_SMALL_CELL_MINIMUM): { shown: Record<string, number>; other: number } {
  const parts = Object.entries(counts).filter(([, n]) => n > 0);
  const stated = parts.reduce((sum, [, n]) => sum + n, 0);
  if (total - stated > 0) parts.push([NOT_STATED, total - stated]);
  const small = parts.filter(([, n]) => n < min);
  if (small.length === 0) return { shown: Object.fromEntries(parts), other: 0 };
  const rest = parts.filter(([, n]) => n >= min).sort((a, b) => a[1] - b[1]);
  const folded = [...small];
  const foldedSum = () => folded.reduce((sum, [, n]) => sum + n, 0);
  while ((folded.length < 2 || foldedSum() < min) && rest.length > 0) folded.push(rest.shift()!);
  if (folded.length < 2 || foldedSum() < min || rest.length === 0) return { shown: {}, other: total };
  return { shown: Object.fromEntries(rest), other: foldedSum() };
}

/* ── Entering and correcting ─────────────────────────────────────────────── */

export type LcReportInput = {
  trainingId: string; reportReviewedOn: string; sourceLabel: string; trainingHeld: boolean;
  registrationsTotal: string; registrationsApproved: string; attendancesTotal: string;
  centerCounts: Record<string, string>; sourceCounts: Record<string, string>;
  /** On a correction: leave the split exactly as it was entered. The earlier figures are not sent back to the page. */
  centerKeep: boolean; sourceKeep: boolean;
  reason: string;
  /** The revision the form was opened on: 0 for a first entry. A form opened on an older revision is refused. */
  baseRevision: number;
};

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max) : '');
const record = (v: unknown, keys: readonly string[]) => {
  const r = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  return Object.fromEntries(keys.map((k) => [k, text(r[k], 12)]));
};

export function sanitizeReportInput(raw: unknown): LcReportInput {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    trainingId: text(r.trainingId, 80), reportReviewedOn: text(r.reportReviewedOn, 10), sourceLabel: text(r.sourceLabel, 60), trainingHeld: r.trainingHeld === true,
    registrationsTotal: text(r.registrationsTotal, 12), registrationsApproved: text(r.registrationsApproved, 12), attendancesTotal: text(r.attendancesTotal, 12),
    centerCounts: record(r.centerCounts, LC_REPORT_CENTERS.map((c) => c.id)), sourceCounts: record(r.sourceCounts, LC_REFERRAL_SOURCES.map((s) => s.id)),
    centerKeep: r.centerKeep === true, sourceKeep: r.sourceKeep === true,
    reason: text(r.reason, 300), baseRevision: typeof r.baseRevision === 'number' && Number.isInteger(r.baseRevision) ? r.baseRevision : -1,
  };
}

const WHOLE = 'Use a whole number, 0 or more. Leave the box empty if the number is not known.';
/** "" is "not known". Anything else must be plain digits. */
function count(raw: string): { ok: true; value: number | null } | { ok: false } {
  if (raw === '') return { ok: true, value: null };
  if (!/^\d{1,6}$/.test(raw)) return { ok: false };
  return { ok: true, value: Number(raw) };
}

const realDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(`${day}T12:00:00Z`)) && new Date(`${day}T12:00:00Z`).toISOString().slice(0, 10) === day;
/** A reason is a sentence about the numbers. It is not a place for anyone's contact details. */
const looksPersonal = (s: string) => /@/.test(s) || /\d[\d\s().-]{6,}\d/.test(s);

export const reportsFor = (store: LcStaffStore, trainingId: string) => store.reports.filter((r) => r.trainingId === trainingId).sort((a, b) => a.revision - b.revision);
export const currentReport = (store: LcStaffStore, trainingId: string): LcAggregateReport | null => reportsFor(store, trainingId).at(-1) ?? null;

export type LcReportState = 'ready' | 'not_public' | 'not_finished';
/** Numbers can be entered once a public training has finished or been cancelled. Never for a draft. */
export function reportState(l: LcListing, now: Date): LcReportState {
  if (!l.publishedAt) return 'not_public';
  const t = l.training;
  const over = t.endAtUtc ? new Date(t.endAtUtc).getTime() < now.getTime() : false;
  return t.listingStatus === 'cancelled' || t.listingStatus === 'completed' || t.listingStatus === 'archived' || over ? 'ready' : 'not_finished';
}

export function saveReport(store: LcStaffStore, actor: LcStaffActor | null, raw: unknown, ctx: LcCtx, splits: LcReportSplits = LC_REPORT_SPLITS): LcReportResult<LcAggregateReport> {
  if (!actor || !canViewAnalytics(actor)) return FORBIDDEN;
  const input = sanitizeReportInput(raw);
  const listing = store.listings.find((l) => l.id === input.trainingId);
  if (!listing) return { ok: false, code: 'not_found', message: 'Choose a training from the list.', fieldErrors: { trainingId: 'Choose a training from the list.' } };
  const now = new Date(ctx.now);
  const state = reportState(listing, now);
  if (state === 'not_public') return { ok: false, code: 'state', message: 'Numbers can only be entered for a training that was listed publicly.' };
  if (state === 'not_finished') return { ok: false, code: 'state', message: 'This training has not finished yet. Enter its numbers after it ends.' };

  const previous = currentReport(store, listing.id);
  if (input.baseRevision !== (previous?.revision ?? 0)) {
    return { ok: false, code: 'stale', message: 'These numbers were changed somewhere else since you opened this page. Reload to see the latest entry, then try again.' };
  }

  const errors: LcReportErrors = {};
  if (!realDay(input.reportReviewedOn)) errors.reportReviewedOn = 'Add the date you read the report.';
  else if (input.reportReviewedOn > ctDay(ctx.now)) errors.reportReviewedOn = 'This date is in the future.';
  else if (input.trainingHeld && listing.training.startAtUtc && input.reportReviewedOn < ctDay(listing.training.startAtUtc)) errors.reportReviewedOn = 'This date is before the training took place.';
  if (!(LC_REPORT_SOURCES as readonly string[]).includes(input.sourceLabel)) errors.sourceLabel = 'Choose where the numbers came from.';
  if (input.trainingHeld && listing.training.listingStatus === 'cancelled') errors.attendancesTotal = 'This training is marked cancelled, so it cannot be recorded as held.';

  const total = count(input.registrationsTotal);
  const approved = count(input.registrationsApproved);
  const attended = count(input.attendancesTotal);
  if (!total.ok) errors.registrationsTotal = WHOLE;
  if (!approved.ok) errors.registrationsApproved = WHOLE;
  if (!attended.ok) errors.attendancesTotal = WHOLE;
  if (total.ok && approved.ok && total.value !== null && approved.value !== null && approved.value > total.value) errors.registrationsApproved = 'Approved registrations cannot be more than registrations submitted.';
  if (attended.ok && attended.value !== null && !input.trainingHeld && !errors.attendancesTotal) errors.attendancesTotal = 'A training that was not held has no attendances. Leave this empty.';

  const split = (given: Record<string, string>, field: 'centerCounts' | 'sourceCounts', what: string): Record<string, number> | null => {
    const entries = Object.entries(given).filter(([, v]) => v !== '');
    if (entries.length === 0) return null;
    const out: Record<string, number> = {};
    for (const [key, v] of Object.entries(given)) {
      const c = count(v);
      if (!c.ok) {
        errors[field] = WHOLE;
        return null;
      }
      out[key] = c.value ?? 0;
    }
    const sum = Object.values(out).reduce((a, b) => a + b, 0);
    if (!total.ok || total.value === null) errors[field] = `Enter registrations submitted first. The ${what} counts are a split of that number.`;
    else if (sum > total.value) errors[field] = `These add up to ${sum}, which is more than the ${total.value} registrations submitted.`;
    return out;
  };
  /** Carry a split over from the entry being corrected, checking it still fits the new total. */
  const keep = (earlier: Record<string, number> | null, field: 'centerCounts' | 'sourceCounts'): Record<string, number> | null => {
    if (!earlier) return null;
    const sum = Object.values(earlier).reduce((a, b) => a + b, 0);
    if (!total.ok || total.value === null || sum > total.value) errors[field] = 'The split entered earlier no longer fits the registrations submitted. Choose “Type it in again”.';
    return earlier;
  };
  // A split that is switched off is never stored, whatever the browser sent.
  const centerCounts = !splits.byCenter ? null : input.centerKeep && previous ? keep(previous.centerCounts, 'centerCounts') : split(input.centerCounts, 'centerCounts', 'center');
  const sourceCounts = !splits.bySource ? null : input.sourceKeep && previous ? keep(previous.sourceCounts, 'sourceCounts') : split(input.sourceCounts, 'sourceCounts', 'source');

  if (previous) {
    if (input.reason.length < 10) errors.reason = 'Say in a sentence why the numbers are changing.';
    else if (looksPersonal(input.reason)) errors.reason = 'Leave out names, email addresses and phone numbers. Describe the change to the numbers only.';
  }
  if (Object.keys(errors).length > 0) return { ok: false, code: 'invalid', message: 'Some entries need another look. Nothing was saved.', fieldErrors: errors };

  const values: LcReportValues = {
    reportReviewedOn: input.reportReviewedOn, sourceLabel: input.sourceLabel, trainingHeld: input.trainingHeld,
    registrationsTotal: total.ok ? total.value : null, registrationsApproved: approved.ok ? approved.value : null, attendancesTotal: attended.ok ? attended.value : null,
    centerCounts, sourceCounts,
  };
  if (previous) {
    const same = (Object.keys(values) as (keyof LcReportValues)[]).every((k) => JSON.stringify(values[k]) === JSON.stringify(previous[k]));
    if (same) return { ok: false, code: 'invalid', message: 'Nothing was changed, so there is nothing to correct.' };
  }
  const report: LcAggregateReport = { ...values, id: ctx.newId(), trainingId: listing.id, revision: (previous?.revision ?? 0) + 1, reason: previous ? input.reason : '', enteredBy: actor.id, enteredAt: ctx.now };
  store.reports.push(report);
  // The history records that numbers changed and why. The numbers themselves stay in the report revisions.
  store.audit.push({ id: ctx.newId(), actorId: actor.id, actorRole: actor.role, action: previous ? 'report_corrected' : 'report_entered', targetType: 'report', targetId: listing.id, targetVersionId: report.id, at: ctx.now, note: previous ? `Revision ${report.revision}: ${report.reason}` : 'Revision 1' });
  return { ok: true, value: report };
}

export function reportHistory(store: LcStaffStore, actor: LcStaffActor | null, trainingId: string): LcAggregateReport[] {
  return canViewAnalytics(actor) ? reportsFor(store, trainingId).reverse() : [];
}

/** Trainings whose numbers can be entered or corrected, newest first. */
export function reportTargets(store: LcStaffStore, actor: LcStaffActor | null, now: Date): { listing: LcListing; report: LcAggregateReport | null }[] {
  if (!canViewAnalytics(actor)) return [];
  return store.listings
    .filter((l) => reportState(l, now) === 'ready')
    .sort((a, b) => (b.training.startAtUtc ?? '').localeCompare(a.training.startAtUtc ?? ''))
    .map((listing) => ({ listing, report: currentReport(store, listing.id) }));
}

/* ── The period ──────────────────────────────────────────────────────────── */

export type LcRangePreset = '30' | '90' | 'ytd' | 'custom';
export type LcRange = { preset: LcRangePreset; from: string; to: string; label: string; error: string | null };

const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);

/** Turn the filter in the address into two Central Time calendar days. Anything unreadable falls back to the last 90 days and says so. */
export function resolveRange(q: { range?: string; from?: string; to?: string }, now: Date): LcRange {
  const today = ctDay(now.toISOString());
  const last = (n: number, error: string | null = null): LcRange => ({ preset: n === 30 ? '30' : '90', from: addDays(today, -n), to: today, label: `Last ${n} days`, error });
  if (q.range === '30') return last(30);
  if (q.range === 'ytd') return { preset: 'ytd', from: `${today.slice(0, 4)}-01-01`, to: today, label: 'Year to date', error: null };
  if (q.range === 'custom') {
    const from = q.from ?? '';
    const to = q.to ?? '';
    if (!realDay(from) || !realDay(to)) return last(90, 'Those dates could not be read, so this shows the last 90 days instead.');
    if (from > to) return last(90, 'The start date is after the end date, so this shows the last 90 days instead.');
    if (daysBetween(from, to) > 366 * 3) return last(90, 'That is more than three years, so this shows the last 90 days instead.');
    return { preset: 'custom', from, to, label: 'Custom dates', error: null };
  }
  return last(90);
}

/* ── The dashboard ───────────────────────────────────────────────────────── */

/** A total that is honest about what went into it. `value` is null when no training in scope has the number. */
export type LcSum = { value: number | null; counted: number; of: number };

export type LcRowState = 'held' | 'not_held' | 'cancelled' | 'awaiting' | 'upcoming';
export type LcDashboardRow = {
  trainingId: string; title: string; day: string; categoryId: string; state: LcRowState;
  registrationsTotal: number | null; registrationsApproved: number | null; attendancesTotal: number | null;
  revision: number | null; reportReviewedOn: string | null; sourceLabel: string | null;
};
export type LcBucket = { key: string; kind: 'week' | 'month'; held: number; registrations: LcSum; attendances: LcSum };
export type LcBreakdown = { rows: { key: string; label: string; count: number | null }[]; other: number; total: number; counted: number; of: number };
export type LcDashboard = {
  rows: LcDashboardRow[];
  held: number; notHeld: number; awaiting: number; upcoming: number;
  registrations: LcSum; approved: LcSum; attendances: LcSum;
  /** Attended divided by approved registrations, over only the trainings that have both numbers. */
  rate: { value: number | null; attended: number; approved: number; counted: number; of: number };
  topics: { categoryId: string; title: string; held: number; registrations: LcSum; attendances: LcSum }[];
  buckets: LcBucket[];
  byCenter: LcBreakdown | null;
  bySource: LcBreakdown | null;
  minimum: number;
  splits: LcReportSplits;
};

export type LcDashboardFilter = { from: string; to: string; categoryId?: string; trainingId?: string };

const sum = (values: (number | null)[], of: number): LcSum => {
  const known = values.filter((v): v is number => v !== null);
  return { value: known.length > 0 ? known.reduce((a, b) => a + b, 0) : null, counted: known.length, of };
};

const mondayOf = (day: string) => addDays(day, -((new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7));

function breakdown(reports: { counts: Record<string, number> | null; total: number | null }[], labels: readonly { id: string; label: string }[], min: number): LcBreakdown | null {
  const usable = reports.filter((r): r is { counts: Record<string, number>; total: number } => r.counts !== null && r.total !== null);
  if (usable.length === 0) return null;
  const totals: Record<string, number> = {};
  let other = 0;
  for (const r of usable) {
    const safe = safeBreakdown(r.counts, r.total, min);
    for (const [key, n] of Object.entries(safe.shown)) totals[key] = (totals[key] ?? 0) + n;
    other += safe.other;
  }
  const rows = [...labels, { id: NOT_STATED, label: 'Did not say' }]
    .filter((l) => l.id !== NOT_STATED || totals[NOT_STATED])
    // A center with nothing to show is left blank, not zero: it may have a small count folded into "Other".
    .map((l) => ({ key: l.id, label: l.label, count: totals[l.id] ? totals[l.id] : null }));
  return { rows, other, total: usable.reduce((a, r) => a + r.total, 0), counted: usable.length, of: reports.length };
}

/** Everything the analytics page shows, worked out from the listings and the latest revision of each report. */
export function buildDashboard(store: LcStaffStore, actor: LcStaffActor | null, filter: LcDashboardFilter, now: Date, min: number = LC_SMALL_CELL_MINIMUM, splits: LcReportSplits = LC_REPORT_SPLITS): LcDashboard | null {
  if (!canViewAnalytics(actor)) return null;
  const inScope = store.listings.filter((l) => {
    const t = l.training;
    if (!l.publishedAt || !t.startAtUtc) return false;
    const day = ctDay(t.startAtUtc);
    if (day < filter.from || day > filter.to) return false;
    if (filter.categoryId && t.categoryId !== filter.categoryId) return false;
    if (filter.trainingId && l.id !== filter.trainingId) return false;
    return true;
  });

  const withReport = inScope
    .map((l) => ({ l, r: currentReport(store, l.id) }))
    .sort((a, b) => (a.l.training.startAtUtc ?? '').localeCompare(b.l.training.startAtUtc ?? ''));

  const rows: LcDashboardRow[] = withReport.map(({ l, r }) => {
    const t = l.training;
    const over = t.endAtUtc ? new Date(t.endAtUtc).getTime() < now.getTime() : false;
    const state: LcRowState = r ? (r.trainingHeld ? 'held' : 'not_held') : t.listingStatus === 'cancelled' ? 'cancelled' : over || t.listingStatus === 'completed' || t.listingStatus === 'archived' ? 'awaiting' : 'upcoming';
    return {
      trainingId: l.id, title: t.title, day: ctDay(t.startAtUtc!), categoryId: t.categoryId, state,
      registrationsTotal: r?.registrationsTotal ?? null, registrationsApproved: r?.registrationsApproved ?? null, attendancesTotal: r && r.trainingHeld ? r.attendancesTotal : null,
      revision: r?.revision ?? null, reportReviewedOn: r?.reportReviewedOn ?? null, sourceLabel: r?.sourceLabel ?? null,
    };
  });

  const is = (...states: LcRowState[]) => (row: LcDashboardRow) => states.includes(row.state);
  const expected = rows.filter(is('held', 'not_held', 'awaiting'));
  const heldOrAwaiting = rows.filter(is('held', 'awaiting'));
  const heldRows = rows.filter(is('held'));

  // The rate uses only trainings where both numbers exist and count the same event.
  const comparable = heldRows.filter((r) => r.attendancesTotal !== null && r.registrationsApproved !== null && r.registrationsApproved > 0 && r.attendancesTotal <= r.registrationsApproved);
  const attended = comparable.reduce((a, r) => a + (r.attendancesTotal ?? 0), 0);
  const approvedForRate = comparable.reduce((a, r) => a + (r.registrationsApproved ?? 0), 0);

  const span = daysBetween(filter.from, filter.to);
  const kind: LcBucket['kind'] = span <= 92 ? 'week' : 'month';
  const keyOf = (day: string) => (kind === 'week' ? mondayOf(day) : day.slice(0, 7));
  const keys: string[] = [];
  for (let day = kind === 'week' ? mondayOf(filter.from) : `${filter.from.slice(0, 7)}-01`; day <= filter.to; ) {
    keys.push(keyOf(day));
    day = kind === 'week' ? addDays(day, 7) : addDays(`${day.slice(0, 7)}-28`, 4).slice(0, 7) + '-01';
  }
  const buckets: LcBucket[] = keys.map((key) => {
    const mine = rows.filter((r) => keyOf(r.day) === key);
    return {
      key, kind, held: mine.filter(is('held')).length,
      registrations: sum(mine.filter(is('held', 'not_held', 'awaiting')).map((r) => r.registrationsTotal), mine.filter(is('held', 'not_held', 'awaiting')).length),
      attendances: sum(mine.filter(is('held', 'awaiting')).map((r) => r.attendancesTotal), mine.filter(is('held', 'awaiting')).length),
    };
  });

  const topics = lcCategories
    .map((c) => {
      const mine = rows.filter((r) => r.categoryId === c.id);
      return {
        categoryId: c.id, title: c.name, held: mine.filter(is('held')).length,
        registrations: sum(mine.filter(is('held', 'not_held', 'awaiting')).map((r) => r.registrationsTotal), mine.filter(is('held', 'not_held', 'awaiting')).length),
        attendances: sum(mine.filter(is('held', 'awaiting')).map((r) => r.attendancesTotal), mine.filter(is('held', 'awaiting')).length),
      };
    })
    .filter((t) => t.held > 0)
    .sort((a, b) => (b.attendances.value ?? -1) - (a.attendances.value ?? -1));

  const reported = withReport.filter((x) => x.r !== null).map((x) => x.r!);
  return {
    rows,
    held: heldRows.length, notHeld: rows.filter(is('not_held', 'cancelled')).length, awaiting: rows.filter(is('awaiting')).length, upcoming: rows.filter(is('upcoming')).length,
    registrations: sum(expected.map((r) => r.registrationsTotal), expected.length),
    approved: sum(expected.map((r) => r.registrationsApproved), expected.length),
    attendances: sum(heldOrAwaiting.map((r) => r.attendancesTotal), heldOrAwaiting.length),
    rate: { value: comparable.length > 0 ? attended / approvedForRate : null, attended, approved: approvedForRate, counted: comparable.length, of: heldRows.length },
    topics, buckets,
    byCenter: splits.byCenter ? breakdown(reported.map((r) => ({ counts: r.centerCounts, total: r.registrationsTotal })), LC_REPORT_CENTERS, min) : null,
    bySource: splits.bySource ? breakdown(reported.map((r) => ({ counts: r.sourceCounts, total: r.registrationsTotal })), LC_REFERRAL_SOURCES, min) : null,
    minimum: min,
    splits,
  };
}

/* ── Words ───────────────────────────────────────────────────────────────── */

export const LC_NOT_AVAILABLE = 'Not yet available';
/** Shown above every figure in the demo, and on the first lines of the download. */
export const LC_REPORT_BANNER = 'Illustrative demo data — not actual caregiver attendance';

export const LC_ROW_STATE: Record<LcRowState, string> = {
  held: 'Held',
  not_held: 'Not held',
  cancelled: 'Cancelled',
  awaiting: 'Held, numbers not entered yet',
  upcoming: 'Upcoming',
};

/** What each number means. Shown on the page and sent with the download, so nobody has to guess. */
export const LC_GLOSSARY: { term: string; meaning: string }[] = [
  { term: 'Trainings held', meaning: 'Trainings in the period that a member of staff recorded as having taken place.' },
  { term: 'Registrations submitted', meaning: 'How many registration requests Microsoft Teams received for a training, whether or not they were approved.' },
  { term: 'Approved registrations', meaning: 'How many of those requests staff approved in Microsoft Teams.' },
  { term: 'Attendances', meaning: 'The attendee count on the Microsoft Teams report for one training. Teams counts each training separately, so one caregiver who came to three trainings is three attendances. This is not a count of different people.' },
  { term: 'Attendance rate', meaning: 'Attendances divided by approved registrations, using only trainings that have both numbers. It is left out when the two numbers cannot be compared.' },
  { term: 'By center and by source', meaning: 'Registrations submitted, split by the center or the answer a family chose when registering. Shown only when the registration form asked.' },
  { term: 'Other / not displayed', meaning: `Counts under ${LC_SMALL_CELL_MINIMUM} for a single center or source at one training are never shown on their own. They are added together here, with at least one other count, so no small group can be worked out.` },
  { term: LC_NOT_AVAILABLE, meaning: 'The number has not been entered. It does not mean zero.' },
];

export const LC_REPORT_AUDIT_LABEL: Record<string, string> = { report_entered: 'Numbers entered', report_corrected: 'Numbers corrected' };

/* ── Download ────────────────────────────────────────────────────────────── */

/** One spreadsheet cell. Text that a spreadsheet could run as a formula is made inert. */
const cell = (v: string | number | null) => {
  if (v === null) return `"${LC_NOT_AVAILABLE}"`;
  if (typeof v === 'number') return String(v);
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};
const coverage = (s: LcSum) => (s.of === 0 ? '' : `from ${s.counted} of ${s.of} trainings`);

/** The download: totals only, the same figures as the page, with the definitions attached. No row describes a person. */
export function dashboardCsv(d: LcDashboard, meta: { period: string; filters: string; banner: string; generatedOn: string }): string {
  const lines: (string | number | null)[][] = [
    ['Caregiver Learning Center: aggregate participation'],
    [meta.banner],
    ['Period', meta.period],
    ['Filters', meta.filters],
    ['Made on', meta.generatedOn],
    [],
    ['Summary'],
    ['Trainings held', d.held],
    ['Registrations submitted', d.registrations.value, coverage(d.registrations)],
    ['Approved registrations', d.approved.value, coverage(d.approved)],
    ['Attendances', d.attendances.value, coverage(d.attendances)],
    ['Attendance rate', d.rate.value === null ? null : `${Math.round(d.rate.value * 100)}%`, d.rate.value === null ? '' : `${d.rate.attended} attendances out of ${d.rate.approved} approved registrations, from ${d.rate.counted} of ${d.rate.of} trainings held`],
    [],
    ['By training'],
    ['Training', 'Date (Central Time)', 'Topic', 'Status', 'Registrations submitted', 'Approved registrations', 'Attendances', 'Where the numbers came from', 'Report read on', 'Revision'],
    ...d.rows.map((r) => {
      const reported = r.revision !== null;
      const na = (n: number | null) => (reported || r.state === 'awaiting' ? n : '');
      return [r.title, r.day, lcCategories.find((c) => c.id === r.categoryId)?.name ?? '', LC_ROW_STATE[r.state], na(r.registrationsTotal), na(r.registrationsApproved), r.state === 'held' || r.state === 'awaiting' ? r.attendancesTotal : '', r.sourceLabel ?? '', r.reportReviewedOn ?? '', r.revision ?? ''];
    }),
  ];
  for (const [title, b] of [['Registrations submitted, by center', d.byCenter], ['Registrations submitted, by how families heard', d.bySource]] as const) {
    if (!b) continue;
    lines.push([], [title, `from ${b.counted} of ${b.of} trainings with numbers`]);
    for (const row of b.rows) lines.push([row.label, row.count === null ? 'None, or too few to show' : row.count]);
    if (b.other > 0) lines.push(['Other / not displayed', b.other]);
  }
  lines.push([], ['What the numbers mean'], ...LC_GLOSSARY.map((g) => [g.term, g.meaning]));
  return lines.map((l) => l.map(cell).join(',')).join('\r\n') + '\r\n';
}

/* ── Reading the filter from the address ─────────────────────────────────── */

export type LcReportQuery = { range: LcRange; categoryId: string | undefined; trainingId: string | undefined; search: string };

/** Turn what is in the address into a checked filter. Unknown values are dropped, never passed on. */
export function readReportQuery(q: Record<string, string | string[] | undefined>, now: Date): LcReportQuery {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  const range = resolveRange({ range: one(q.range), from: one(q.from), to: one(q.to) }, now);
  const topic = one(q.topic);
  const categoryId = lcCategories.some((c) => c.id === topic) ? topic : undefined;
  const training = one(q.training);
  const trainingId = /^[A-Za-z0-9-]{1,80}$/.test(training) ? training : undefined;
  const params = new URLSearchParams({ range: range.preset });
  if (range.preset === 'custom') {
    params.set('from', range.from);
    params.set('to', range.to);
  }
  if (categoryId) params.set('topic', categoryId);
  if (trainingId) params.set('training', trainingId);
  return { range, categoryId, trainingId, search: params.toString() };
}
