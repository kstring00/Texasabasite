import { z } from 'zod';

/**
 * The module manifest: the one typed, versioned format every caregiver module is stored in.
 * A module converted from an approved PowerPoint is imported as one of these, so the lesson
 * player never needs rewriting. Plain text only: no HTML is accepted anywhere in a manifest.
 */
export const LC_MANIFEST_SCHEMA_VERSION = 1;

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens');
const text = z.string().trim().min(1).refine((s) => !/[<>]/.test(s), 'Plain text only, no HTML');
const paragraphs = z.array(text).min(1);

const stepBase = { id, title: text };

const introStep = z.object({ ...stepBase, type: z.literal('intro'), body: paragraphs, whyItMatters: text.optional() });
const slideStep = z.object({
  ...stepBase,
  type: z.literal('slide'),
  /** `sequence` draws the items as ordered stages; `list` as a plain list. Both are real text. */
  layout: z.enum(['sequence', 'list']),
  items: z.array(z.object({ label: text.optional(), title: text, text: text.optional() })).min(1).max(6),
  /** What the slide shows, for people who cannot see it. */
  description: text,
  narration: paragraphs,
});
const explanationStep = z.object({ ...stepBase, type: z.literal('explanation'), body: paragraphs });
const scenarioStep = z.object({ ...stepBase, type: z.literal('scenario'), story: paragraphs, afterword: paragraphs.optional() });
const choice = z.object({ id, text, correct: z.boolean(), feedback: text });
const knowledgeCheckStep = z
  .object({ ...stepBase, type: z.literal('knowledge_check'), mode: z.enum(['single', 'multiple']), question: text, choices: z.array(choice).min(2).max(4) })
  .superRefine((s, ctx) => {
    const right = s.choices.filter((c) => c.correct).length;
    if (right === 0) ctx.addIssue({ code: 'custom', message: 'A knowledge check needs at least one correct choice' });
    if (s.mode === 'single' && right !== 1) ctx.addIssue({ code: 'custom', message: 'A single-answer check needs exactly one correct choice' });
    if (new Set(s.choices.map((c) => c.id)).size !== s.choices.length) ctx.addIssue({ code: 'custom', message: 'Choice ids must be unique' });
  });
const takeawaysStep = z.object({ ...stepBase, type: z.literal('takeaways'), points: z.array(text).min(1).max(3) });
const relatedTrainingStep = z.object({ ...stepBase, type: z.literal('related_training'), trainingId: id });

export const lcStepSchema = z.union([introStep, slideStep, explanationStep, scenarioStep, knowledgeCheckStep, takeawaysStep, relatedTrainingStep]);

const lesson = z.object({ id, title: text, summary: text, steps: z.array(lcStepSchema).min(1) });

export const lcManifestSchema = z
  .object({
    schemaVersion: z.literal(LC_MANIFEST_SCHEMA_VERSION),
    id,
    slug: id,
    /** Changes whenever the content changes. Saved progress is tied to it. */
    version: z.string().min(1),
    language: z.literal('en'),
    title: text,
    summary: text,
    categoryId: id,
    topics: z.array(text),
    objectives: z.array(text).min(1),
    estimatedMinutes: z.number().int().positive(),
    lessons: z.array(lesson).min(1).max(5),
    takeaways: z.array(text).min(1).max(5),
    relatedModuleIds: z.array(id),
    relatedTrainingIds: z.array(id),
    review: z.object({
      /** `demo_sample` is never clinically approved. `final_approved` requires the second (final module) approval. */
      status: z.enum(['demo_sample', 'final_approved']),
      reviewerLabel: text.nullable(),
      reviewedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    }),
    source: z.object({ submissionId: text, sourceVersion: text, generatedWithExternalAi: z.boolean() }).nullable(),
  })
  .superRefine((m, ctx) => {
    const lessonIds = m.lessons.map((l) => l.id);
    if (new Set(lessonIds).size !== lessonIds.length) ctx.addIssue({ code: 'custom', message: 'Lesson ids must be unique' });
    const stepIds = m.lessons.flatMap((l) => l.steps.map((s) => s.id));
    if (new Set(stepIds).size !== stepIds.length) ctx.addIssue({ code: 'custom', message: 'Step ids must be unique across the module' });
    if (m.review.status === 'final_approved' && (!m.review.reviewerLabel || !m.review.reviewedOn)) {
      ctx.addIssue({ code: 'custom', message: 'An approved module must record who reviewed it and when' });
    }
  });

export type LcStep = z.infer<typeof lcStepSchema>;
export type LcKnowledgeCheck = Extract<LcStep, { type: 'knowledge_check' }>;
export type LcLesson = z.infer<typeof lesson>;
export type LcManifest = z.infer<typeof lcManifestSchema>;

export type LcValidation = { ok: true; manifest: LcManifest } | { ok: false; problems: string[] };

/** Validate unknown data as a manifest. Problems come back as plain sentences a reviewer can read. */
export function validateManifest(data: unknown): LcValidation {
  const r = lcManifestSchema.safeParse(data);
  if (r.success) return { ok: true, manifest: r.data };
  return { ok: false, problems: r.error.issues.map((i) => `${i.path.join(' > ') || 'module'}: ${i.message}`) };
}
