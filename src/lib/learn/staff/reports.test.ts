import { describe, expect, it } from 'vitest';
import { buildDemoStaffStore } from '@/data/learn/demo/staff-seed';
import { demoStaff } from '@/data/learn/demo/staff';
import { changeListingStatus, createListing } from './listings';
import { LC_SMALL_CELL_MINIMUM, buildDashboard, currentReport, dashboardCsv, reportHistory, reportTargets, resolveRange, safeBreakdown, saveReport } from './reports';
import { emptyStaffStore, type LcCtx, type LcStaffStore } from './submissions';

const who = (id: string) => demoStaff.find((p) => p.id === id)!;
const director = who('demo-director');
let n = 0;
const at = (iso: string): LcCtx => ({ now: iso, newId: () => `id-${++n}` });
const CREATED = '2026-06-01T15:00:00.000Z';
const AFTER = '2026-07-20T15:00:00.000Z';
const env = { takenSlugs: [], publishedModuleIds: [] };

/** A store with public trainings that have finished. Each one is on its own day in July 2026. */
function finished(count = 1, categoryId = 'cat-routines'): { store: LcStaffStore; ids: string[] } {
  const store = emptyStaffStore();
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const r = createListing(store, director, { title: `Training ${i + 1}`, summary: 'A made-up training used only by the tests.', description: 'About it.', objectives: 'Learn one thing.', date: `2026-07-${String(i + 1).padStart(2, '0')}`, startTime: '18:00', endTime: '19:00', categoryId }, env, at(CREATED));
    if (!r.ok) throw new Error(r.message);
    changeListingStatus(store, director, r.value.id, r.value.rev, 'publish', at(CREATED));
    ids.push(r.value.id);
  }
  return { store, ids };
}
const entry = (trainingId: string, over: Record<string, unknown> = {}) => ({
  trainingId, reportReviewedOn: '2026-07-10', sourceLabel: 'Microsoft Teams organizer report', trainingHeld: true, registrationsTotal: '20', registrationsApproved: '18', attendancesTotal: '15', centerCounts: {}, sourceCounts: {}, centerKeep: false, sourceKeep: false, reason: '', baseRevision: 0, ...over,
});
const july = { from: '2026-07-01', to: '2026-07-31' };

describe('small numbers', () => {
  const min = LC_SMALL_CELL_MINIMUM;
  it('shows every part when none is small', () => {
    expect(safeBreakdown({ a: 10, b: 6, c: 0 }, 16, min)).toEqual({ shown: { a: 10, b: 6 }, other: 0 });
  });
  it('folds small parts together', () => {
    expect(safeBreakdown({ a: 20, b: 3, c: 4 }, 27, min)).toEqual({ shown: { a: 20 }, other: 7 });
  });
  it('never hides one part alone, because the total would give it away', () => {
    const r = safeBreakdown({ a: 20, b: 9, c: 3 }, 32, min);
    // c is hidden, so the next smallest (b) is hidden with it. Only a can be read; c cannot be worked out.
    expect(r).toEqual({ shown: { a: 20 }, other: 12 });
  });
  it('keeps folding until the folded figure is itself not small', () => {
    expect(safeBreakdown({ a: 20, b: 9, c: 1, d: 2 }, 32, min)).toEqual({ shown: { a: 20 }, other: 12 });
  });
  it('shows nothing when hiding safely would leave nothing to show', () => {
    expect(safeBreakdown({ a: 20, b: 3 }, 23, min)).toEqual({ shown: {}, other: 23 });
    expect(safeBreakdown({ a: 3 }, 3, min)).toEqual({ shown: {}, other: 3 });
    expect(safeBreakdown({ a: 2, b: 1 }, 3, min)).toEqual({ shown: {}, other: 3 });
  });
  it('treats people who did not answer as one more part, so parts always add up to the total', () => {
    // Two people did not answer. That small part is folded with the next smallest, never shown as 2.
    expect(safeBreakdown({ a: 12, b: 8 }, 22, min)).toEqual({ shown: { a: 12 }, other: 10 });
    expect(safeBreakdown({ a: 12, b: 8 }, 26, min)).toEqual({ shown: { a: 12, b: 8, not_stated: 6 }, other: 0 });
  });
  it('never returns a shown figure under the minimum, and always adds up, for every small case', () => {
    for (let a = 0; a <= 12; a++) for (let b = 0; b <= 12; b++) for (let c = 0; c <= 12; c++) for (const extra of [0, 2, 7]) {
      const total = a + b + c + extra;
      const r = safeBreakdown({ a, b, c }, total, min);
      const shown = Object.values(r.shown);
      expect(shown.every((v) => v >= min)).toBe(true);
      expect(shown.reduce((x, y) => x + y, 0) + r.other).toBe(total);
      // If anything is folded, at least two real parts are in it, or everything is.
      const parts = [a, b, c, extra].filter((v) => v > 0).length;
      const hidden = parts - shown.length;
      expect(hidden === 0 || hidden >= 2 || shown.length === 0).toBe(true);
      expect(r.other === 0 || r.other >= min || shown.length === 0).toBe(true);
    }
  });
});

describe('who may see or enter numbers', () => {
  it('refuses every role without the permission', () => {
    const { store, ids } = finished();
    for (const id of ['demo-rbt', 'demo-apprentice', 'demo-bcba', 'demo-producer']) {
      const r = saveReport(store, who(id), entry(ids[0]), at(AFTER));
      expect(r.ok, id).toBe(false);
      if (!r.ok) expect(r.code).toBe('forbidden');
      expect(buildDashboard(store, who(id), july, new Date(AFTER))).toBeNull();
      expect(reportTargets(store, who(id), new Date(AFTER))).toEqual([]);
      expect(reportHistory(store, who(id), ids[0])).toEqual([]);
    }
    expect(saveReport(store, null, entry(ids[0]), at(AFTER)).ok).toBe(false);
    expect(store.reports).toHaveLength(0);
  });
});

describe('entering numbers', () => {
  it('accepts totals for a finished public training', () => {
    const { store, ids } = finished();
    const r = saveReport(store, director, entry(ids[0]), at(AFTER));
    expect(r.ok).toBe(true);
    expect(currentReport(store, ids[0])).toMatchObject({ revision: 1, registrationsTotal: 20, registrationsApproved: 18, attendancesTotal: 15, enteredBy: 'demo-director' });
  });
  it('refuses a draft and a training that has not finished', () => {
    const store = emptyStaffStore();
    const d = createListing(store, director, { title: 'Still a draft' }, env, at(CREATED));
    expect(d.ok && saveReport(store, director, entry(d.value.id), at(AFTER)).ok).toBe(false);
    const { store: s2, ids } = finished();
    expect(saveReport(s2, director, entry(ids[0], { reportReviewedOn: '2026-06-02' }), at('2026-06-02T15:00:00.000Z')).ok).toBe(false);
  });
  it('accepts whole numbers only, and nothing that could be a name or an address', () => {
    const { store, ids } = finished();
    for (const bad of ['-1', '1.5', 'twelve', 'Ana Lopez', 'a@b.org', '1e3', ' 12 x']) {
      const r = saveReport(store, director, entry(ids[0], { attendancesTotal: bad }), at(AFTER));
      expect(r.ok, bad).toBe(false);
      if (!r.ok) expect(r.fieldErrors?.attendancesTotal, bad).toBeTruthy();
    }
    expect(store.reports).toHaveLength(0);
  });
  it('keeps "not known" apart from zero', () => {
    const { store, ids } = finished(2);
    saveReport(store, director, entry(ids[0], { registrationsApproved: '' }), at(AFTER));
    saveReport(store, director, entry(ids[1], { registrationsApproved: '0', attendancesTotal: '0' }), at(AFTER));
    expect(currentReport(store, ids[0])?.registrationsApproved).toBeNull();
    expect(currentReport(store, ids[1])?.registrationsApproved).toBe(0);
  });
  it('checks that the numbers agree with each other', () => {
    const { store, ids } = finished();
    const more = saveReport(store, director, entry(ids[0], { registrationsApproved: '25' }), at(AFTER));
    const notHeld = saveReport(store, director, entry(ids[0], { trainingHeld: false }), at(AFTER));
    const split = saveReport(store, director, entry(ids[0], { centerCounts: { 'sugar-land': '15', katy: '9' } }), at(AFTER));
    const noTotal = saveReport(store, director, entry(ids[0], { registrationsTotal: '', registrationsApproved: '', centerCounts: { katy: '9' } }), at(AFTER));
    const future = saveReport(store, director, entry(ids[0], { reportReviewedOn: '2026-08-01' }), at(AFTER));
    const early = saveReport(store, director, entry(ids[0], { reportReviewedOn: '2026-06-30' }), at(AFTER));
    const source = saveReport(store, director, entry(ids[0], { sourceLabel: 'A spreadsheet someone emailed' }), at(AFTER));
    for (const r of [more, notHeld, split, noTotal, future, early, source]) expect(r.ok).toBe(false);
    expect(!more.ok && more.fieldErrors?.registrationsApproved).toBeTruthy();
    expect(!split.ok && split.fieldErrors?.centerCounts).toContain('24');
    expect(store.reports).toHaveLength(0);
  });
  it('stores only totals: no field can hold a person', () => {
    const { store, ids } = finished();
    saveReport(store, director, { ...entry(ids[0]), attendees: ['Ana Lopez'], email: 'a@b.org', notes: 'Family in room 3' }, at(AFTER));
    expect(Object.keys(store.reports[0]).sort()).toEqual(['attendancesTotal', 'centerCounts', 'enteredAt', 'enteredBy', 'id', 'reason', 'registrationsApproved', 'registrationsTotal', 'reportReviewedOn', 'revision', 'sourceCounts', 'sourceLabel', 'trainingHeld', 'trainingId']);
    expect(JSON.stringify(store)).not.toMatch(/Ana|a@b\.org|room 3/);
  });
});

describe('correcting numbers', () => {
  it('needs a reason, keeps the old entry, and uses the newest', () => {
    const { store, ids } = finished();
    saveReport(store, director, entry(ids[0]), at(AFTER));
    const noReason = saveReport(store, director, entry(ids[0], { attendancesTotal: '16', baseRevision: 1 }), at(AFTER));
    expect(noReason.ok).toBe(false);
    const ok = saveReport(store, director, entry(ids[0], { attendancesTotal: '16', baseRevision: 1, reason: 'The first count was read before the report was final.' }), at(AFTER));
    expect(ok.ok).toBe(true);
    expect(reportHistory(store, director, ids[0]).map((r) => [r.revision, r.attendancesTotal])).toEqual([[2, 16], [1, 15]]);
    expect(currentReport(store, ids[0])?.attendancesTotal).toBe(16);
    expect(store.audit.filter((a) => a.targetType === 'report').map((a) => a.action)).toEqual(['report_entered', 'report_corrected']);
  });
  it('can keep a split as entered without the figures ever being sent back, and checks it still fits', () => {
    const { store, ids } = finished();
    saveReport(store, director, entry(ids[0], { centerCounts: { 'sugar-land': '10', katy: '7', pearland: '3' } }), at(AFTER));
    const reason = 'Attendances corrected against the final report.';
    const kept = saveReport(store, director, entry(ids[0], { attendancesTotal: '16', centerKeep: true, baseRevision: 1, reason }), at(AFTER));
    expect(kept.ok && kept.value.centerCounts).toMatchObject({ 'sugar-land': 10, katy: 7, pearland: 3 });
    const tooSmall = saveReport(store, director, entry(ids[0], { registrationsTotal: '18', registrationsApproved: '18', centerKeep: true, baseRevision: 2, reason }), at(AFTER));
    expect(!tooSmall.ok && tooSmall.fieldErrors?.centerCounts).toBeTruthy();
    expect(!tooSmall.ok && JSON.stringify(tooSmall)).not.toMatch(/\b3\b|\b7\b|\b10\b|\b20\b/);
    const removed = saveReport(store, director, entry(ids[0], { attendancesTotal: '16', centerKeep: false, baseRevision: 2, reason }), at(AFTER));
    expect(removed.ok && removed.value.centerCounts).toBeNull();
  });
  it('refuses a correction that changes nothing, comes from an old page, or puts contact details in the reason', () => {
    const { store, ids } = finished();
    saveReport(store, director, entry(ids[0]), at(AFTER));
    const reason = 'Checked against the final Teams report.';
    expect(saveReport(store, director, entry(ids[0], { baseRevision: 1, reason }), at(AFTER)).ok).toBe(false);
    const stale = saveReport(store, director, entry(ids[0], { attendancesTotal: '16', baseRevision: 0, reason }), at(AFTER));
    expect(!stale.ok && stale.code).toBe('stale');
    for (const bad of ['Per email from parent@example.org the count was wrong', 'Call 555 555 0100 to confirm the count']) {
      const r = saveReport(store, director, entry(ids[0], { attendancesTotal: '16', baseRevision: 1, reason: bad }), at(AFTER));
      expect(!r.ok && r.fieldErrors?.reason, bad).toBeTruthy();
    }
    expect(store.reports).toHaveLength(1);
  });
});

describe('the dashboard', () => {
  it('adds up what was entered and says how many trainings each total covers', () => {
    const { store, ids } = finished(3);
    saveReport(store, director, entry(ids[0]), at(AFTER));
    saveReport(store, director, entry(ids[1], { registrationsTotal: '30', registrationsApproved: '', attendancesTotal: '22' }), at(AFTER));
    const d = buildDashboard(store, director, july, new Date(AFTER))!;
    expect(d.held).toBe(2);
    expect(d.awaiting).toBe(1);
    expect(d.registrations).toEqual({ value: 50, counted: 2, of: 3 });
    expect(d.approved).toEqual({ value: 18, counted: 1, of: 3 });
    expect(d.attendances).toEqual({ value: 37, counted: 2, of: 3 });
  });
  it('says "not yet available" rather than zero when nothing has been entered', () => {
    const { store } = finished(2);
    const d = buildDashboard(store, director, july, new Date(AFTER))!;
    expect(d.held).toBe(0);
    expect(d.registrations.value).toBeNull();
    expect(d.attendances.value).toBeNull();
    expect(d.rate.value).toBeNull();
    expect(d.byCenter).toBeNull();
  });
  it('works out the rate only from trainings that have both numbers', () => {
    const { store, ids } = finished(3);
    saveReport(store, director, entry(ids[0]), at(AFTER)); // 15 of 18
    saveReport(store, director, entry(ids[1], { registrationsApproved: '', attendancesTotal: '40', registrationsTotal: '50' }), at(AFTER)); // no approved number
    saveReport(store, director, entry(ids[2], { registrationsApproved: '10', attendancesTotal: '12' }), at(AFTER)); // more attendances than approvals: not comparable
    const d = buildDashboard(store, director, july, new Date(AFTER))!;
    expect(d.rate).toEqual({ value: 15 / 18, attended: 15, approved: 18, counted: 1, of: 3 });
  });
  it('counts a training that was not held as not held, with no attendances', () => {
    const { store, ids } = finished(2);
    saveReport(store, director, entry(ids[0], { trainingHeld: false, attendancesTotal: '', registrationsApproved: '' }), at(AFTER));
    saveReport(store, director, entry(ids[1]), at(AFTER));
    const d = buildDashboard(store, director, july, new Date(AFTER))!;
    expect([d.held, d.notHeld]).toEqual([1, 1]);
    expect(d.attendances).toEqual({ value: 15, counted: 1, of: 1 });
    expect(d.registrations.value).toBe(40);
  });
  it('filters by date, by topic and by training', () => {
    const { store, ids } = finished(3);
    for (const id of ids) saveReport(store, director, entry(id), at(AFTER));
    store.listings[2].training.categoryId = 'cat-communication';
    const now = new Date(AFTER);
    expect(buildDashboard(store, director, { from: '2026-07-02', to: '2026-07-02' }, now)!.rows.map((r) => r.trainingId)).toEqual([ids[1]]);
    expect(buildDashboard(store, director, { ...july, categoryId: 'cat-communication' }, now)!.held).toBe(1);
    expect(buildDashboard(store, director, { ...july, trainingId: ids[0] }, now)!.registrations.value).toBe(20);
    expect(buildDashboard(store, director, { from: '2025-01-01', to: '2025-12-31' }, now)!.rows).toEqual([]);
  });
  it('groups by week for short periods and by month for long ones', () => {
    const { store, ids } = finished(2);
    for (const id of ids) saveReport(store, director, entry(id), at(AFTER));
    const weeks = buildDashboard(store, director, july, new Date(AFTER))!.buckets;
    expect(weeks[0]).toMatchObject({ key: '2026-06-29', kind: 'week', held: 2, attendances: { value: 30 } });
    expect(weeks.at(-1)?.key).toBe('2026-07-27');
    expect(weeks[1].attendances).toEqual({ value: null, counted: 0, of: 0 });
    const months = buildDashboard(store, director, { from: '2026-01-01', to: '2026-12-31' }, new Date(AFTER))!.buckets;
    expect(months.map((b) => b.key)).toEqual(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12']);
    expect(months[6].registrations.value).toBe(40);
  });
  it('ranks topics by attendances', () => {
    const { store, ids } = finished(2);
    store.listings[1].training.categoryId = 'cat-communication';
    saveReport(store, director, entry(ids[0]), at(AFTER));
    saveReport(store, director, entry(ids[1], { attendancesTotal: '17' }), at(AFTER));
    expect(buildDashboard(store, director, july, new Date(AFTER))!.topics.map((t) => [t.categoryId, t.attendances.value])).toEqual([['cat-communication', 17], ['cat-routines', 15]]);
  });
  it('never shows a small center count, alone or by comparing two date ranges', () => {
    const { store, ids } = finished(2);
    saveReport(store, director, entry(ids[0], { centerCounts: { 'sugar-land': '10', katy: '7', pearland: '3' } }), at(AFTER));
    saveReport(store, director, entry(ids[1], { centerCounts: { 'sugar-land': '9', katy: '6', pearland: '5' } }), at(AFTER));
    const now = new Date(AFTER);
    const both = buildDashboard(store, director, july, now)!.byCenter!;
    const second = buildDashboard(store, director, { from: '2026-07-02', to: '2026-07-02' }, now)!.byCenter!;
    const count = (b: typeof both, key: string) => b.rows.find((r) => r.key === key)?.count ?? null;
    // Training 1 hides Pearland (3) and, with it, Katy (7). Training 2 shows all three.
    expect([count(both, 'sugar-land'), count(both, 'katy'), count(both, 'pearland'), both.other]).toEqual([19, 6, 5, 10]);
    expect([count(second, 'sugar-land'), count(second, 'katy'), count(second, 'pearland'), second.other]).toEqual([9, 6, 5, 0]);
    // Taking the second range away from the first leaves only what the first training shows by itself: no 3.
    expect((count(both, 'pearland') ?? 0) - (count(second, 'pearland') ?? 0)).toBe(0);
    for (const b of [both, second]) for (const r of b.rows) expect(r.count === null || r.count >= LC_SMALL_CELL_MINIMUM).toBe(true);
    expect(both.rows.reduce((a, r) => a + (r.count ?? 0), 0) + both.other).toBe(both.total);
  });
});

describe('switching a split off', () => {
  it('stores nothing for it and leaves it out of the report, whatever the browser sends', () => {
    const { store, ids } = finished();
    const off = { byCenter: false, bySource: true };
    const r = saveReport(store, director, entry(ids[0], { centerCounts: { 'sugar-land': '10', katy: '7' }, sourceCounts: { clinical_team: '12', website: '8' } }), at(AFTER), off);
    expect(r.ok && r.value.centerCounts).toBeNull();
    expect(r.ok && r.value.sourceCounts).toMatchObject({ clinical_team: 12, website: 8 });
    const d = buildDashboard(store, director, july, new Date(AFTER), LC_SMALL_CELL_MINIMUM, off)!;
    expect(d.byCenter).toBeNull();
    expect(d.bySource).not.toBeNull();
    expect(dashboardCsv(d, { period: '', filters: '', banner: '', generatedOn: '' })).not.toContain('by center');
  });
});

describe('choosing the period', () => {
  const now = new Date('2026-11-21T15:00:00.000Z');
  it('understands the presets in Central Time', () => {
    expect(resolveRange({}, now)).toMatchObject({ preset: '90', from: '2026-08-23', to: '2026-11-21' });
    expect(resolveRange({ range: '30' }, now)).toMatchObject({ from: '2026-10-22', to: '2026-11-21' });
    expect(resolveRange({ range: 'ytd' }, now)).toMatchObject({ from: '2026-01-01', to: '2026-11-21' });
    // Late evening in Texas is already tomorrow in UTC. The period still ends on the Texas day.
    expect(resolveRange({ range: '30' }, new Date('2026-11-22T03:30:00.000Z')).to).toBe('2026-11-21');
  });
  it('accepts sensible custom dates and falls back, with a reason, on anything else', () => {
    expect(resolveRange({ range: 'custom', from: '2026-03-01', to: '2026-05-31' }, now)).toMatchObject({ preset: 'custom', from: '2026-03-01', to: '2026-05-31', error: null });
    for (const q of [{ from: '2026-05-31', to: '2026-03-01' }, { from: 'soon', to: '2026-03-01' }, { from: '2026-02-30', to: '2026-03-01' }, { from: '2010-01-01', to: '2026-03-01' }]) {
      const r = resolveRange({ range: 'custom', ...q }, now);
      expect(r.preset).toBe('90');
      expect(r.error).toBeTruthy();
    }
  });
});

describe('the download', () => {
  it('holds totals and definitions only, and cannot run as a formula', () => {
    const { store, ids } = finished(2);
    store.listings[0].training.title = '=HYPERLINK("http://x","Click")';
    saveReport(store, director, entry(ids[0], { centerCounts: { 'sugar-land': '10', katy: '7', pearland: '3' } }), at(AFTER));
    const d = buildDashboard(store, director, july, new Date(AFTER))!;
    const csv = dashboardCsv(d, { period: 'July 2026', filters: 'All topics', banner: 'Illustrative demo data — not actual caregiver attendance', generatedOn: 'Jul 20, 2026' });
    expect(csv).toContain('"Illustrative demo data — not actual caregiver attendance"');
    expect(csv).toContain(`"'=HYPERLINK(""http://x"",""Click"")"`);
    expect(csv).toContain('"Registrations submitted",20,"from 1 of 2 trainings"');
    expect(csv).toContain('"Training 2","2026-07-02","Routines & Daily Living","Held, numbers not entered yet","Not yet available","Not yet available","Not yet available"');
    expect(csv).toContain('"Other / not displayed",10');
    expect(csv).toContain('"Pearland","None, or too few to show"');
    expect(csv).not.toMatch(/,3[,\r]/);
    expect(csv).toContain('"Attendances","The attendee count');
  });
});

describe('the seeded demo', () => {
  it('builds example listings around the reset day, each labelled as an example', () => {
    const now = new Date('2026-11-21T15:00:00.000Z');
    const { store } = buildDemoStaffStore(now);
    expect(store.listings).toHaveLength(8);
    expect(store.listings.every((l) => l.training.isExample && l.training.presenterLabel === null && l.training.registrationUrl === null)).toBe(true);
    const d = buildDashboard(store, director, { from: '2026-01-01', to: '2026-11-21' }, now)!;
    expect([d.held, d.notHeld, d.awaiting]).toEqual([4, 1, 1]);
    expect(d.registrations).toEqual({ value: 109, counted: 5, of: 6 });
    expect(d.approved).toEqual({ value: 74, counted: 3, of: 6 });
    expect(d.attendances).toEqual({ value: 72, counted: 4, of: 5 });
    expect(d.rate).toMatchObject({ attended: 58, approved: 74, counted: 3, of: 4 });
    // The corrected training uses its second entry.
    expect(d.rows.find((r) => r.trainingId === 'seed-training-communication')).toMatchObject({ attendancesTotal: 19, revision: 2 });
    for (const r of d.byCenter!.rows) expect(r.count === null || r.count >= LC_SMALL_CELL_MINIMUM).toBe(true);
  });
});
