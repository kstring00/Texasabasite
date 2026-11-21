'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { learnFlags } from '@/lib/learn/flags';
import { getLcContent } from '@/lib/learn/content';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { changeListingStatus, createListing, updateListing, type LcListingAction, type LcListingEnv, type LcListingErrors } from '@/lib/learn/staff/listings';
import { saveReport, type LcReportErrors } from '@/lib/learn/staff/reports';
import { commitStaffStore, getStaffStore } from '@/lib/learn/staff/store';
import type { LcCtx } from '@/lib/learn/staff/submissions';

/**
 * Training listing and reporting actions. Each one checks on the server that the staff demo is on
 * and who is asking, then lets the rules in listings.ts and reports.ts decide. A refusal comes
 * back as a plain sentence and nothing is changed.
 */
export type LcTrainingState = { ok: boolean; message: string; code?: string; id?: string; fieldErrors?: LcListingErrors & LcReportErrors; problems?: string[] };

const CLOSED: LcTrainingState = { ok: false, message: 'Staff sign-in is not set up yet.', code: 'closed' };
const SIGNED_OUT: LcTrainingState = { ok: false, message: 'Your demo session has ended. Sign in again to continue.', code: 'signed_out' };
const ctx = (): LcCtx => ({ now: new Date().toISOString(), newId: () => randomUUID() });

/** The sample listing's address is taken, and only published modules may be linked. */
function env(): LcListingEnv {
  const live = getLcContent();
  return { takenSlugs: live.listTrainings().filter((t) => !getStaffStore().listings.some((l) => l.id === t.id)).map((t) => t.slug), publishedModuleIds: live.listModules().map((m) => m.manifest.id) };
}

function done(): void {
  commitStaffStore();
  revalidatePath('/learn', 'layout');
}

export async function saveListingAction(id: string | null, rev: number, input: unknown): Promise<LcTrainingState> {
  if (!learnFlags.demoStaff) return CLOSED;
  const actor = await getStaffActor();
  if (!actor) return SIGNED_OUT;
  const store = getStaffStore();
  const r = id ? updateListing(store, actor, id, rev, input, env(), ctx()) : createListing(store, actor, input, env(), ctx());
  if (!r.ok) return { ok: false, message: r.message, code: r.code, fieldErrors: r.fieldErrors, problems: r.problems };
  done();
  return { ok: true, message: 'Saved.', id: r.value.id };
}

const OK_MESSAGE: Record<LcListingAction, string> = { publish: 'Published.', close_registration: 'Registration closed.', reopen_registration: 'Registration reopened.', cancel: 'Cancelled.', complete: 'Marked completed.', archive: 'Archived.' };

export async function listingStatusAction(id: string, rev: number, action: LcListingAction): Promise<LcTrainingState> {
  if (!learnFlags.demoStaff) return CLOSED;
  const actor = await getStaffActor();
  if (!actor) return SIGNED_OUT;
  const r = changeListingStatus(getStaffStore(), actor, id, rev, action, ctx());
  if (!r.ok) return { ok: false, message: r.message, code: r.code, problems: r.problems };
  done();
  return { ok: true, message: OK_MESSAGE[action] ?? 'Done.', id };
}

export async function saveReportAction(input: unknown): Promise<LcTrainingState> {
  if (!learnFlags.demoStaff) return CLOSED;
  const actor = await getStaffActor();
  if (!actor) return SIGNED_OUT;
  const r = saveReport(getStaffStore(), actor, input, ctx());
  if (!r.ok) return { ok: false, message: r.message, code: r.code, fieldErrors: r.fieldErrors };
  done();
  return { ok: true, message: r.value.revision === 1 ? 'Numbers saved.' : 'Correction saved.', id: r.value.trainingId };
}
