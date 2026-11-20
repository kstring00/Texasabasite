'use server';

import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { learnFlags } from '@/lib/learn/flags';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { LC_SESSION_COOKIE, makeSessionToken } from '@/lib/learn/staff/session';
import { commitStaffStore, deleteUpload, getSessionSecret, getStaffStore, resetStaffStore } from '@/lib/learn/staff/store';
import { createDraft, deleteDraft, removeFile, startRevision, submitForReview, updateDraft, type LcCtx, type LcFieldErrors } from '@/lib/learn/staff/submissions';

/**
 * Every staff action. Each one re-checks, on the server, that the staff demo is on and who is
 * asking, then lets the rules in submissions.ts decide. Nothing here trusts what the page shows.
 */
export type LcActionState = { ok: boolean; message: string; id?: string; rev?: number; fieldErrors?: LcFieldErrors; code?: string };

const CLOSED: LcActionState = { ok: false, message: 'Staff sign-in is not set up yet.' };
const SIGNED_OUT: LcActionState = { ok: false, message: 'Your demo session has ended. Sign in again to continue.' };
const ctx = (): LcCtx => ({ now: new Date().toISOString(), newId: () => randomUUID() });
const BASE = '/learn/staff';

export async function signInAction(formData: FormData): Promise<void> {
  if (!learnFlags.demoStaff) redirect(BASE);
  const persona = getDemoStaff(String(formData.get('persona') ?? ''));
  if (persona) {
    (await cookies()).set(LC_SESSION_COOKIE, makeSessionToken(persona.id, getSessionSecret()), { httpOnly: true, sameSite: 'strict', path: BASE, maxAge: 60 * 60 * 8 });
  }
  redirect(BASE);
}

export async function signOutAction(): Promise<void> {
  (await cookies()).delete({ name: LC_SESSION_COOKIE, path: BASE });
  redirect(BASE);
}

export async function resetDemoAction(): Promise<void> {
  if (!learnFlags.demoStaff) redirect(BASE);
  resetStaffStore();
  (await cookies()).delete({ name: LC_SESSION_COOKIE, path: BASE });
  revalidatePath(BASE, 'layout');
  redirect(`${BASE}?reset=1`);
}

/** Create the draft on first save, update it after that. */
export async function saveDraftAction(id: string | null, rev: number, input: unknown): Promise<LcActionState> {
  if (!learnFlags.demoStaff) return CLOSED;
  const actor = await getStaffActor();
  if (!actor) return SIGNED_OUT;
  const store = getStaffStore();
  const r = id ? updateDraft(store, actor, id, rev, input, ctx()) : createDraft(store, actor, input, ctx());
  if (!r.ok) return { ok: false, message: r.message, fieldErrors: r.fieldErrors, code: r.code };
  commitStaffStore();
  // No page refresh here on purpose. A refresh would start the site's page-transition animation,
  // and input during that animation is dropped. Staff pages are rendered fresh on every visit anyway.
  return { ok: true, message: 'Draft saved.', id: r.value.id, rev: r.value.rev };
}

export async function removeFileAction(id: string, rev: number): Promise<LcActionState> {
  if (!learnFlags.demoStaff) return CLOSED;
  const actor = await getStaffActor();
  if (!actor) return SIGNED_OUT;
  const r = removeFile(getStaffStore(), actor, id, rev, ctx());
  if (!r.ok) return { ok: false, message: r.message };
  if (r.value.removed) deleteUpload(r.value.removed.objectKey);
  commitStaffStore();
  return { ok: true, message: 'File removed.', id, rev: r.value.submission.rev };
}

/** Save what is on screen, then submit. Submission only succeeds when the server finds everything in place. */
export async function submitAction(id: string, rev: number, input: unknown): Promise<LcActionState> {
  if (!learnFlags.demoStaff) return CLOSED;
  const actor = await getStaffActor();
  if (!actor) return SIGNED_OUT;
  const store = getStaffStore();
  const saved = updateDraft(store, actor, id, rev, input, ctx());
  if (!saved.ok) return { ok: false, message: saved.message, fieldErrors: saved.fieldErrors };
  const r = submitForReview(store, actor, id, saved.value.rev, ctx());
  commitStaffStore();
  if (!r.ok) return { ok: false, message: r.message, fieldErrors: r.fieldErrors, id, rev: saved.value.rev };
  revalidatePath(BASE, 'layout');
  return { ok: true, message: 'Submitted for clinical review.', id, rev: r.value.rev };
}

export async function startRevisionAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!learnFlags.demoStaff) redirect(BASE);
  const actor = await getStaffActor();
  if (!actor) redirect(BASE);
  const r = startRevision(getStaffStore(), actor, id, Number(formData.get('rev')), ctx());
  if (!r.ok) redirect(`${BASE}/submissions/${encodeURIComponent(id)}?problem=${r.code}`);
  commitStaffStore();
  revalidatePath(BASE, 'layout');
  redirect(`${BASE}/submissions/${encodeURIComponent(id)}/edit`);
}

export async function deleteDraftAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!learnFlags.demoStaff) redirect(BASE);
  const actor = await getStaffActor();
  if (!actor) redirect(BASE);
  const r = deleteDraft(getStaffStore(), actor, id, Number(formData.get('rev')), ctx());
  if (!r.ok) redirect(`${BASE}/submissions/${encodeURIComponent(id)}?problem=${r.code}`);
  for (const a of r.value.removedAssets) deleteUpload(a.objectKey);
  commitStaffStore();
  revalidatePath(BASE, 'layout');
  redirect(`${BASE}/submissions?deleted=1`);
}
