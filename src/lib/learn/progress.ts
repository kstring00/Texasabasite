/**
 * Lesson progress. It is kept only in this browser's local storage, under one versioned key,
 * and holds no name, no account and nothing about a child: just which step of which module
 * this browser last showed. The Learning Center never sends it anywhere.
 */
export const LC_PROGRESS_KEY = 'lc-progress-v1';
export const LC_PROGRESS_EVENT = 'lc-progress-change';

export type LcModuleProgress = {
  /** The module version this progress belongs to. */
  version: string;
  lessonId: string;
  /** Zero-based step inside that lesson. */
  step: number;
  doneLessons: string[];
  completed: boolean;
  /** Last choice ids picked in each knowledge check, by step id. */
  answers: Record<string, string[]>;
  at: string;
};
export type LcProgressStore = { v: 1; modules: Record<string, LcModuleProgress> };

const empty = (): LcProgressStore => ({ v: 1, modules: {} });
const isStringArray = (x: unknown): x is string[] => Array.isArray(x) && x.every((s) => typeof s === 'string');

/** Read whatever is stored, tolerating anything malformed. Bad entries are dropped, never trusted. */
export function parseProgress(raw: string | null): LcProgressStore {
  if (!raw) return empty();
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || (data as { v?: unknown }).v !== 1) return empty();
    const mods = (data as { modules?: unknown }).modules;
    if (!mods || typeof mods !== 'object') return empty();
    const out = empty();
    for (const [key, value] of Object.entries(mods as Record<string, unknown>)) {
      const m = value as Partial<LcModuleProgress> | null;
      if (!m || typeof m.version !== 'string' || typeof m.lessonId !== 'string' || typeof m.step !== 'number' || !Number.isInteger(m.step) || m.step < 0) continue;
      const answers: Record<string, string[]> = {};
      if (m.answers && typeof m.answers === 'object') for (const [k, v] of Object.entries(m.answers)) if (isStringArray(v)) answers[k] = v;
      out.modules[key] = {
        version: m.version,
        lessonId: m.lessonId,
        step: m.step,
        doneLessons: isStringArray(m.doneLessons) ? m.doneLessons : [],
        completed: m.completed === true,
        answers,
        at: typeof m.at === 'string' ? m.at : '',
      };
    }
    return out;
  } catch {
    return empty();
  }
}

export type LcModuleShape = { version: string; lessons: { id: string; stepCount: number }[] };

/**
 * Fit saved progress to the module as it is now. If the module has a newer version, or the saved
 * place no longer exists, the saved place is discarded (`stale`) instead of landing the reader
 * on a step that does not match.
 */
export function reconcileProgress(saved: LcModuleProgress | undefined, mod: LcModuleShape): { progress: LcModuleProgress | null; stale: boolean } {
  if (!saved) return { progress: null, stale: false };
  if (saved.version !== mod.version) return { progress: null, stale: true };
  const lesson = mod.lessons.find((l) => l.id === saved.lessonId);
  if (!lesson) return { progress: null, stale: true };
  const ids = new Set(mod.lessons.map((l) => l.id));
  return { progress: { ...saved, step: Math.min(saved.step, lesson.stepCount - 1), doneLessons: saved.doneLessons.filter((x) => ids.has(x)) }, stale: false };
}

/** How many lessons are finished, for the "Lesson 2 of 4" line on a module card. */
export function lessonPosition(p: LcModuleProgress, lessonIds: string[]): number {
  const i = lessonIds.indexOf(p.lessonId);
  return i < 0 ? 1 : i + 1;
}

/* ── Browser access. Every call is safe when storage is blocked or absent. ── */

export function storageAvailable(): boolean {
  try {
    const k = 'lc-storage-test';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function readStore(): LcProgressStore {
  try {
    return parseProgress(window.localStorage.getItem(LC_PROGRESS_KEY));
  } catch {
    return empty();
  }
}

function writeStore(store: LcProgressStore): boolean {
  try {
    window.localStorage.setItem(LC_PROGRESS_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(LC_PROGRESS_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function saveModuleProgress(moduleId: string, progress: LcModuleProgress): boolean {
  const store = readStore();
  store.modules[moduleId] = progress;
  return writeStore(store);
}

export function clearModuleProgress(moduleId: string): boolean {
  const store = readStore();
  delete store.modules[moduleId];
  return writeStore(store);
}
