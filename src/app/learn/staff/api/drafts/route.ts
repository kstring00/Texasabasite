import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { learnFlags } from '@/lib/learn/flags';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { commitStaffStore, getStaffStore } from '@/lib/learn/staff/store';
import { createDraft, updateDraft, viewSubmission } from '@/lib/learn/staff/submissions';

export const dynamic = 'force-dynamic';

const json = (status: number, body: Record<string, unknown>) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * Save a draft as the page is being left (refresh, Back, closing the tab). The wizard sends
 * this with `keepalive`, which a normal save cannot use. Same checks as every other staff
 * route: demo flag, same-site origin, signed-in owner, and the rules in submissions.ts.
 */
export async function POST(request: Request) {
  if (!learnFlags.demoStaff) return json(404, { ok: false });
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) return json(403, { ok: false });
  const actor = await getStaffActor();
  if (!actor) return json(401, { ok: false });
  let body: { id?: unknown; rev?: unknown; input?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json(400, { ok: false });
  }
  const ctx = { now: new Date().toISOString(), newId: () => randomUUID() };
  const store = getStaffStore();
  const r = typeof body.id === 'string' && body.id ? updateDraft(store, actor, body.id, Number(body.rev), body.input, ctx) : createDraft(store, actor, body.input, ctx);
  if (!r.ok) return json(r.code === 'not_found' ? 404 : r.code === 'forbidden' ? 403 : 409, { ok: false, message: r.message });
  commitStaffStore();
  return json(200, { ok: true, id: r.value.id, rev: r.value.rev });
}

/** The current saved copy of the caller's own editable draft, so a tab can check whether its unsaved typing already landed. */
export async function GET(request: Request) {
  if (!learnFlags.demoStaff) return json(404, { ok: false });
  const actor = await getStaffActor();
  if (!actor) return json(401, { ok: false });
  const id = new URL(request.url).searchParams.get('id') ?? '';
  const view = viewSubmission(getStaffStore(), actor, id);
  const working = view?.versions.find((v) => !v.frozenAt);
  if (!view || !view.canEdit || !working) return json(404, { ok: false });
  const s = view.submission;
  return json(200, { ok: true, rev: s.rev, input: { title: s.title, summary: s.summary, categoryId: s.categoryId, tags: s.tags, objectives: s.objectives, audience: s.audience, checklist: s.checklist, revisionNotes: working.revisionNotes } });
}
