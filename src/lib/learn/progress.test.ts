import { describe, expect, it } from 'vitest';
import { lessonPosition, parseProgress, reconcileProgress, type LcModuleProgress } from './progress';

const saved: LcModuleProgress = { version: 'v1', lessonId: 'b', step: 2, doneLessons: ['a'], completed: false, answers: { q1: ['x'] }, at: '2026-01-01T00:00:00.000Z' };
const shape = { version: 'v1', lessons: [{ id: 'a', stepCount: 4 }, { id: 'b', stepCount: 5 }] };

describe('saved progress', () => {
  it('reads a well-formed store', () => {
    expect(parseProgress(JSON.stringify({ v: 1, modules: { m: saved } })).modules.m).toEqual(saved);
  });
  it('falls back to empty on anything malformed, without throwing', () => {
    for (const raw of [null, '', 'not json', '[]', '{"v":2,"modules":{}}', '{"v":1}', '{"v":1,"modules":"x"}']) {
      expect(parseProgress(raw)).toEqual({ v: 1, modules: {} });
    }
  });
  it('drops bad entries and bad fields but keeps good ones', () => {
    const store = parseProgress(JSON.stringify({ v: 1, modules: { good: saved, noStep: { version: 'v1', lessonId: 'a' }, negative: { ...saved, step: -1 }, messy: { ...saved, doneLessons: 'a', answers: { q: 'x', ok: ['y'] }, completed: 'yes' } } }));
    expect(Object.keys(store.modules).sort()).toEqual(['good', 'messy']);
    expect(store.modules.messy).toMatchObject({ doneLessons: [], answers: { ok: ['y'] }, completed: false });
  });
  it('keeps progress that still fits the module', () => {
    expect(reconcileProgress(saved, shape)).toEqual({ progress: saved, stale: false });
    expect(reconcileProgress(undefined, shape)).toEqual({ progress: null, stale: false });
  });
  it('discards progress from an older module version instead of restoring a mismatched step', () => {
    expect(reconcileProgress(saved, { ...shape, version: 'v2' })).toEqual({ progress: null, stale: true });
  });
  it('discards progress that points at a lesson that no longer exists', () => {
    expect(reconcileProgress({ ...saved, lessonId: 'gone' }, shape)).toEqual({ progress: null, stale: true });
  });
  it('pulls an out-of-range step back inside the lesson and forgets removed lessons', () => {
    const r = reconcileProgress({ ...saved, step: 40, doneLessons: ['a', 'gone'] }, shape);
    expect(r.progress).toMatchObject({ step: 4, doneLessons: ['a'] });
  });
  it('reports the lesson position for "Lesson 2 of 4"', () => {
    expect(lessonPosition(saved, ['a', 'b'])).toBe(2);
    expect(lessonPosition({ ...saved, lessonId: 'zzz' }, ['a', 'b'])).toBe(1);
  });
});
