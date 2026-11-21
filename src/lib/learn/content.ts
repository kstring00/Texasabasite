import { learnFlags } from './flags';
import { validateManifest, type LcManifest } from './manifest';
import { isPubliclyListed, type LcTraining } from './trainings';
import { demoAbcsOfBehavior } from '@/data/learn/demo/abcs-of-behavior';
import { demoTrainings } from '@/data/learn/demo/trainings';
import { publicTrainings } from './staff/listings';
import { publishedManifests } from './staff/pipeline';
import { getStaffStore } from './staff/store';

/**
 * What caregiver pages are allowed to read. SERVER ONLY: import this from server components
 * and pass plain data down, so unpublished content never reaches the browser bundle.
 *
 * The public side sees only published module versions and public listings. Today there are two
 * sources: nothing at all (the default), or the labelled demo set when LEARN_DEMO_CONTENT is on.
 * A real content service later implements the same interface.
 */
/**
 * `sample`: the hand-written demo module. `demo_workflow`: a module published through the local
 * staff demo by fictional reviewers. Both are demo content and are labelled as such everywhere.
 */
export type LcPublishedModule = { manifest: LcManifest; isDemo: boolean; origin: 'sample' | 'demo_workflow' };

export interface LcContentAdapter {
  listModules(): LcPublishedModule[];
  listTrainings(): LcTraining[];
}

const emptyAdapter: LcContentAdapter = { listModules: () => [], listTrainings: () => [] };

function buildDemoAdapter(): LcContentAdapter {
  const checked = validateManifest(demoAbcsOfBehavior);
  // A sample that fails validation is not shown at all.
  const modules: LcPublishedModule[] = checked.ok ? [{ manifest: checked.manifest, isDemo: true, origin: 'sample' }] : [];
  return { listModules: () => modules, listTrainings: () => demoTrainings.filter(isPubliclyListed) };
}

/**
 * Modules published through the local staff demo. Only versions that hold both approvals and are
 * currently published come back; a withdrawn module is simply absent. Local machine only: the
 * staff demo flag is refused on Vercel, so this never runs there.
 */
function demoWorkflowModules(taken: Set<string>): LcPublishedModule[] {
  if (!learnFlags.demoStaff) return [];
  return publishedManifests(getStaffStore())
    .filter((m) => !taken.has(m.slug) && !taken.has(m.id))
    .map((manifest) => ({ manifest, isDemo: true, origin: 'demo_workflow' as const }));
}

let cached: LcContentAdapter | null = null;
export function getLcContent(): LcContentAdapter {
  if (!cached) cached = learnFlags.demoContent ? buildDemoAdapter() : emptyAdapter;
  if (!learnFlags.demoStaff) return cached;
  // With the staff demo on, published modules and public listings are read fresh each time, so changes show at once.
  const base = cached;
  const samples = base.listModules();
  const published = demoWorkflowModules(new Set(samples.flatMap((m) => [m.manifest.slug, m.manifest.id])));
  // Listings made public in the local staff demo join the example listing. Drafts and archived listings never do.
  const sampleTrainings = base.listTrainings();
  const taken = new Set(sampleTrainings.flatMap((t) => [t.id, t.slug]));
  const listed = publicTrainings(getStaffStore()).filter((t) => !taken.has(t.id) && !taken.has(t.slug));
  return { listModules: () => [...samples, ...published], listTrainings: () => [...sampleTrainings, ...listed] };
}

/* ── Read helpers used by the pages ── */

export type LcModuleSummary = {
  id: string;
  slug: string;
  version: string;
  title: string;
  summary: string;
  categoryId: string;
  topics: string[];
  estimatedMinutes: number;
  lessons: { id: string; stepCount: number }[];
  isDemo: boolean;
};

export function toSummary(m: LcPublishedModule): LcModuleSummary {
  const { manifest: x } = m;
  return {
    id: x.id,
    slug: x.slug,
    version: x.version,
    title: x.title,
    summary: x.summary,
    categoryId: x.categoryId,
    topics: x.topics,
    estimatedMinutes: x.estimatedMinutes,
    lessons: x.lessons.map((l) => ({ id: l.id, stepCount: l.steps.length })),
    isDemo: m.isDemo,
  };
}

export const listModuleSummaries = (): LcModuleSummary[] => getLcContent().listModules().map(toSummary);
export const getModuleBySlug = (slug: string): LcPublishedModule | null => getLcContent().listModules().find((m) => m.manifest.slug === slug) ?? null;
export const getModuleById = (id: string): LcPublishedModule | null => getLcContent().listModules().find((m) => m.manifest.id === id) ?? null;
export const listTrainings = (): LcTraining[] => getLcContent().listTrainings();
export const getTrainingBySlug = (slug: string): LcTraining | null => listTrainings().find((t) => t.slug === slug) ?? null;
export const getTrainingById = (id: string): LcTraining | null => listTrainings().find((t) => t.id === id) ?? null;
