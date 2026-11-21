import { describe, expect, it } from 'vitest';
import { demoAbcsOfBehavior } from '@/data/learn/demo/abcs-of-behavior';
import { validateManifest } from './manifest';

type Loose = { [key: string]: unknown; title?: string; review: unknown; lessons: { id: string; steps: { id: string; body: string[]; choices: { correct: boolean }[] }[] }[] };
const demo = () => structuredClone(demoAbcsOfBehavior) as Loose;

describe('module manifest', () => {
  it('accepts the demo module', () => {
    const r = validateManifest(demoAbcsOfBehavior);
    expect(r.ok, r.ok ? '' : r.problems.join('\n')).toBe(true);
  });
  it('keeps the demo module marked as an unapproved sample', () => {
    const r = validateManifest(demoAbcsOfBehavior);
    if (!r.ok) throw new Error('demo invalid');
    expect(r.manifest.review).toEqual({ status: 'demo_sample', reviewerLabel: null, reviewedOn: null });
    expect(r.manifest.lessons.length).toBeGreaterThanOrEqual(3);
  });
  it('gives every knowledge check a correct answer and feedback for every choice', () => {
    const r = validateManifest(demoAbcsOfBehavior);
    if (!r.ok) throw new Error('demo invalid');
    const checks = r.manifest.lessons.flatMap((l) => l.steps).filter((s) => s.type === 'knowledge_check');
    expect(checks.length).toBeGreaterThan(0);
    for (const c of checks) {
      expect(c.choices.some((x) => x.correct)).toBe(true);
      for (const x of c.choices) expect(x.feedback.length).toBeGreaterThan(10);
    }
  });
  it('rejects HTML anywhere in the text', () => {
    const m = demo();
    m.lessons[0].steps[0].body[0] = 'Hello <script>alert(1)</script>';
    expect(validateManifest(m).ok).toBe(false);
  });
  it('rejects a knowledge check with no correct answer, or two in a single-answer check', () => {
    const none = demo();
    none.lessons[0].steps[3].choices.forEach((c: { correct: boolean }) => (c.correct = false));
    expect(validateManifest(none).ok).toBe(false);
    const two = demo();
    two.lessons[0].steps[3].choices.forEach((c: { correct: boolean }) => (c.correct = true));
    expect(validateManifest(two).ok).toBe(false);
  });
  it('rejects duplicate lesson or step ids', () => {
    const a = demo();
    a.lessons[1].id = a.lessons[0].id;
    expect(validateManifest(a).ok).toBe(false);
    const b = demo();
    b.lessons[1].steps[0].id = b.lessons[0].steps[0].id;
    expect(validateManifest(b).ok).toBe(false);
  });
  it('rejects a module claiming approval without a reviewer and date', () => {
    const m = demo();
    m.review = { status: 'final_approved', reviewerLabel: null, reviewedOn: null };
    const r = validateManifest(m);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problems.join(' ')).toMatch(/who reviewed it/);
  });
  it('rejects an unknown schema version or a missing field, with readable problems', () => {
    expect(validateManifest({ ...demo(), schemaVersion: 2 }).ok).toBe(false);
    const m = demo();
    delete m.title;
    const r = validateManifest(m);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problems[0]).toContain('title');
  });
});
