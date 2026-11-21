'use server';

import { createHash, randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { learnFlags } from '@/lib/learn/flags';
import { getLcContent } from '@/lib/learn/content';
import { getStaffActor } from '@/lib/learn/staff/guard';
import {
  claimSourceReview, collectForProduction, decideFinal, decideSource, importModule, publishModule, submitModuleForFinalReview, withdrawModule,
  type LcFinalDecision, type LcImportInput, type LcPipelineCtx, type LcSourceDecision,
} from '@/lib/learn/staff/pipeline';
import { commitStaffStore, getStaffStore } from '@/lib/learn/staff/store';
import type { LcResult } from '@/lib/learn/staff/submissions';

/**
 * Review, production and publishing actions. As everywhere in the staff area, each one checks on
 * the server that the demo is on and who is asking, then lets the rules in pipeline.ts decide.
 * A refusal comes back as a plain sentence; nothing is changed.
 */
export type LcPipelineState = { ok: boolean; message: string; code?: string; problems?: string[] };

const CLOSED: LcPipelineState = { ok: false, message: 'Staff sign-in is not set up yet.', code: 'closed' };
const SIGNED_OUT: LcPipelineState = { ok: false, message: 'Your demo session has ended. Sign in again to continue.', code: 'signed_out' };
const ctx = (): LcPipelineCtx => ({ now: new Date().toISOString(), newId: () => randomUUID(), hash: (text) => createHash('sha256').update(text).digest('hex') });

async function run<T>(okMessage: string, work: (actor: NonNullable<Awaited<ReturnType<typeof getStaffActor>>>) => LcResult<T> & { problems?: string[] }): Promise<LcPipelineState> {
  if (!learnFlags.demoStaff) return CLOSED;
  const actor = await getStaffActor();
  if (!actor) return SIGNED_OUT;
  const r = work(actor);
  if (!r.ok) return { ok: false, message: r.message, code: r.code, problems: r.problems };
  commitStaffStore();
  revalidatePath('/learn', 'layout');
  return { ok: true, message: okMessage };
}

export async function claimSourceReviewAction(submissionId: string, rev: number): Promise<LcPipelineState> {
  return run('Review started.', (actor) => claimSourceReview(getStaffStore(), actor, submissionId, rev, ctx()));
}

export async function decideSourceAction(input: LcSourceDecision): Promise<LcPipelineState> {
  return run('Decision recorded.', (actor) => decideSource(getStaffStore(), actor, input, ctx()));
}

export async function collectForProductionAction(submissionId: string, rev: number): Promise<LcPipelineState> {
  return run('Collected for production.', (actor) => collectForProduction(getStaffStore(), actor, submissionId, rev, ctx()));
}

export async function importModuleAction(input: LcImportInput): Promise<LcPipelineState> {
  return run('Module imported as a draft.', (actor) => {
    const store = getStaffStore();
    const others = store.modules.filter((m) => m.submissionId !== input.submissionId && m.status !== 'withdrawn' && m.status !== 'rejected');
    const live = getLcContent();
    const samples = live.listModules().filter((m) => m.origin === 'sample');
    return importModule(store, actor, input, {
      takenIds: [...samples.map((m) => m.manifest.id), ...others.map((m) => m.manifest.id)],
      takenSlugs: [...samples.map((m) => m.manifest.slug), ...others.map((m) => m.manifest.slug)],
      knownModuleIds: live.listModules().map((m) => m.manifest.id),
      knownTrainingIds: live.listTrainings().map((t) => t.id),
    }, ctx());
  });
}

export async function submitModuleAction(moduleVersionId: string, rev: number): Promise<LcPipelineState> {
  return run('Sent for final review.', (actor) => submitModuleForFinalReview(getStaffStore(), actor, moduleVersionId, rev, ctx()));
}

export async function decideFinalAction(input: LcFinalDecision): Promise<LcPipelineState> {
  return run('Decision recorded.', (actor) => decideFinal(getStaffStore(), actor, input, ctx()));
}

export async function publishModuleAction(moduleVersionId: string, rev: number): Promise<LcPipelineState> {
  return run('Published.', (actor) => publishModule(getStaffStore(), actor, moduleVersionId, rev, ctx()));
}

export async function withdrawModuleAction(moduleVersionId: string, rev: number, reason: string): Promise<LcPipelineState> {
  return run('Withdrawn.', (actor) => withdrawModule(getStaffStore(), actor, moduleVersionId, rev, reason, ctx()));
}
