import { describe, expect, it } from 'vitest';
import { demoStaff } from '@/data/learn/demo/staff';
import { trainingView } from '../trainings';
import { changeListingStatus, createListing, getListing, listListings, listingToInput, listingWarnings, publicTrainings, updateListing, type LcListingEnv } from './listings';
import { emptyStaffStore, type LcCtx } from './submissions';

const who = (id: string) => demoStaff.find((p) => p.id === id)!;
const director = who('demo-director');
const env: LcListingEnv = { takenSlugs: ['example-abcs-live-training'], publishedModuleIds: ['abcs-of-behavior'] };
let n = 0;
const at = (iso: string): LcCtx => ({ now: iso, newId: () => `id-${++n}` });
const NOW = '2026-06-01T15:00:00.000Z';

const good = {
  title: 'Understanding the ABCs of Behavior', summary: 'An example listing used by the tests, long enough to publish.', description: 'First paragraph.\n\nSecond paragraph.', objectives: 'Hear the ABC model explained.\n- Ask general questions.',
  date: '2026-07-15', startTime: '18:00', endTime: '19:00', categoryId: 'cat-understanding-behavior', relatedModuleIds: ['abcs-of-behavior'], presenterLabel: '', presenterApproved: false, registrationUrl: '',
};
const TEAMS = 'https://events.teams.microsoft.com/event/example-not-a-real-event';

function draft(overrides: Record<string, unknown> = {}) {
  const store = emptyStaffStore();
  const r = createListing(store, director, { ...good, ...overrides }, env, at(NOW));
  if (!r.ok) throw new Error(r.message);
  return { store, listing: r.value };
}

describe('who may manage listings', () => {
  it('lets only a role with the permission create, read or change a listing', () => {
    for (const id of ['demo-rbt', 'demo-apprentice', 'demo-bcba', 'demo-producer']) {
      const store = emptyStaffStore();
      const r = createListing(store, who(id), good, env, at(NOW));
      expect(r.ok, id).toBe(false);
      if (!r.ok) expect(r.code).toBe('forbidden');
      expect(store.listings).toHaveLength(0);
    }
    const { store, listing } = draft();
    expect(listListings(store, who('demo-bcba'))).toEqual([]);
    expect(getListing(store, who('demo-rbt'), listing.id)).toBeNull();
    expect(changeListingStatus(store, who('demo-producer'), listing.id, listing.rev, 'publish', at(NOW)).ok).toBe(false);
    expect(updateListing(store, null, listing.id, listing.rev, good, env, at(NOW)).ok).toBe(false);
    expect(listing.training.listingStatus).toBe('draft');
  });
});

describe('saving a listing', () => {
  it('stores Central Time correctly on both sides of a clock change', () => {
    expect(draft().listing.training.startAtUtc).toBe('2026-07-15T23:00:00.000Z');
    expect(draft({ date: '2026-12-15' }).listing.training.startAtUtc).toBe('2026-12-16T00:00:00.000Z');
  });
  it('reads back into the form unchanged', () => {
    const { listing } = draft();
    expect(listingToInput(listing)).toMatchObject({ date: '2026-07-15', startTime: '18:00', endTime: '19:00', objectives: 'Hear the ABC model explained.\nAsk general questions.' });
    expect(listing.training.description).toEqual(['First paragraph.', 'Second paragraph.']);
  });
  it('refuses an end time before the start, and a time that does not exist', () => {
    const store = emptyStaffStore();
    const a = createListing(store, director, { ...good, endTime: '17:00' }, env, at(NOW));
    const b = createListing(store, director, { ...good, date: '2026-03-08', startTime: '02:30', endTime: '03:30' }, env, at(NOW));
    expect(a.ok || !a.fieldErrors?.endTime).toBe(false);
    expect(b.ok || !b.fieldErrors?.startTime).toBe(false);
    expect(store.listings).toHaveLength(0);
  });
  it('never stores a link that is not a Teams registration page', () => {
    const bad = ['javascript:alert(1)', 'http://events.teams.microsoft.com/event/x', 'https://example.com/register', 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc', 'https://events.teams.microsoft.com.evil.example/event/x'];
    for (const registrationUrl of bad) {
      const store = emptyStaffStore();
      const r = createListing(store, director, { ...good, registrationUrl }, env, at(NOW));
      expect(r.ok, registrationUrl).toBe(false);
      if (!r.ok) expect(r.fieldErrors?.registrationUrl, registrationUrl).toBeTruthy();
      expect(store.listings).toHaveLength(0);
    }
    const { store, listing } = draft({ registrationUrl: TEAMS });
    const again = updateListing(store, director, listing.id, listing.rev, { ...good, registrationUrl: 'https://teams.microsoft.com/l/meetup-join/abc' }, env, at(NOW));
    expect(again.ok).toBe(false);
    expect(listing.training.registrationUrl).toBe(TEAMS);
  });
  it('names a presenter only when staff confirm the presenter agreed', () => {
    const store = emptyStaffStore();
    const r = createListing(store, director, { ...good, presenterLabel: 'Sample presenter' }, env, at(NOW));
    expect(r.ok).toBe(false);
    expect(draft({ presenterLabel: 'Sample presenter', presenterApproved: true }).listing.training.presenterLabel).toBe('Sample presenter');
    expect(draft().listing.training.presenterLabel).toBeNull();
  });
  it('links only published modules', () => {
    const store = emptyStaffStore();
    const r = createListing(store, director, { ...good, relatedModuleIds: ['not-published'] }, env, at(NOW));
    expect(r.ok).toBe(false);
  });
  it('gives each listing its own web address and keeps it once public', () => {
    const { store, listing } = draft();
    const second = createListing(store, director, good, env, at(NOW));
    expect(second.ok && second.value.training.slug).toBe('understanding-the-abcs-of-behavior-2');
    const renamed = updateListing(store, director, listing.id, listing.rev, { ...good, title: 'A new title for the draft' }, env, at(NOW));
    expect(renamed.ok && renamed.value.training.slug).toBe('a-new-title-for-the-draft');
    changeListingStatus(store, director, listing.id, listing.rev, 'publish', at(NOW));
    const after = updateListing(store, director, listing.id, listing.rev, { ...good, title: 'Renamed after going public' }, env, at(NOW));
    expect(after.ok && after.value.training.slug).toBe('a-new-title-for-the-draft');
  });
  it('refuses a save made from an out-of-date page', () => {
    const { store, listing } = draft();
    updateListing(store, director, listing.id, 1, { ...good, summary: `${good.summary} Edited.` }, env, at(NOW));
    const stale = updateListing(store, director, listing.id, 1, { ...good, title: 'Overwrite' }, env, at(NOW));
    expect(stale.ok).toBe(false);
    if (!stale.ok) expect(stale.code).toBe('stale');
    expect(listing.training.title).toBe(good.title);
  });
});

describe('the life of a listing', () => {
  it('keeps a draft off the public pages and puts a published one on them', () => {
    const { store, listing } = draft();
    expect(publicTrainings(store)).toHaveLength(0);
    expect(changeListingStatus(store, director, listing.id, listing.rev, 'publish', at(NOW)).ok).toBe(true);
    expect(publicTrainings(store).map((t) => t.id)).toEqual([listing.id]);
    expect(listing.publishedAt).toBe(NOW);
  });
  it('will not publish an unfinished listing or one in the past', () => {
    const a = draft({ summary: '', description: '', objectives: '', date: '', startTime: '', endTime: '', categoryId: '' });
    const r = changeListingStatus(a.store, director, a.listing.id, a.listing.rev, 'publish', at(NOW));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problems?.length).toBe(5);
    const b = draft({ date: '2026-05-01' });
    const past = changeListingStatus(b.store, director, b.listing.id, b.listing.rev, 'publish', at(NOW));
    expect(past.ok).toBe(false);
    expect(publicTrainings(b.store)).toHaveLength(0);
  });
  it('publishes without a link, warns staff, and shows caregivers no registration button', () => {
    const { store, listing } = draft();
    changeListingStatus(store, director, listing.id, listing.rev, 'publish', at(NOW));
    expect(listingWarnings(listing.training)).toHaveLength(1);
    expect(trainingView(listing.training, new Date(NOW))).toBe('details_soon');
    updateListing(store, director, listing.id, listing.rev, { ...good, registrationUrl: TEAMS }, env, at(NOW));
    expect(listingWarnings(listing.training)).toHaveLength(0);
    expect(trainingView(listing.training, new Date(NOW))).toBe('open');
  });
  it('closes, reopens, cancels and archives', () => {
    const { store, listing } = draft({ registrationUrl: TEAMS });
    const go = (action: Parameters<typeof changeListingStatus>[4], iso = NOW) => changeListingStatus(store, director, listing.id, listing.rev, action, at(iso));
    go('publish');
    expect(go('close_registration').ok).toBe(true);
    expect(trainingView(listing.training, new Date(NOW))).toBe('closed');
    expect(go('reopen_registration').ok).toBe(true);
    expect(go('archive').ok).toBe(false);
    expect(go('cancel').ok).toBe(true);
    expect(trainingView(listing.training, new Date(NOW))).toBe('cancelled');
    expect(publicTrainings(store)).toHaveLength(1);
    expect(go('reopen_registration').ok).toBe(false);
    expect(go('archive').ok).toBe(true);
    expect(publicTrainings(store)).toHaveLength(0);
    expect(updateListing(store, director, listing.id, listing.rev, good, env, at(NOW)).ok).toBe(false);
  });
  it('marks a training completed only after it has ended, and cannot cancel a finished one', () => {
    const { store, listing } = draft();
    changeListingStatus(store, director, listing.id, listing.rev, 'publish', at(NOW));
    expect(changeListingStatus(store, director, listing.id, listing.rev, 'complete', at(NOW)).ok).toBe(false);
    const after = '2026-07-16T02:00:00.000Z';
    expect(trainingView(listing.training, new Date(after))).toBe('completed');
    expect(changeListingStatus(store, director, listing.id, listing.rev, 'cancel', at(after)).ok).toBe(false);
    expect(changeListingStatus(store, director, listing.id, listing.rev, 'complete', at(after)).ok).toBe(true);
    expect(listing.training.listingStatus).toBe('completed');
  });
  it('keeps a public listing complete when it is edited', () => {
    const { store, listing } = draft();
    changeListingStatus(store, director, listing.id, listing.rev, 'publish', at(NOW));
    const r = updateListing(store, director, listing.id, listing.rev, { ...good, objectives: '' }, env, at(NOW));
    expect(r.ok).toBe(false);
    expect(listing.training.objectives).toHaveLength(2);
  });
  it('records each change in the history without storing anything about families', () => {
    const { store, listing } = draft();
    changeListingStatus(store, director, listing.id, listing.rev, 'publish', at(NOW));
    expect(store.audit.map((a) => a.action)).toEqual(['listing_created', 'listing_published']);
    expect(Object.keys(listing.training).sort()).toEqual(['categoryId', 'description', 'endAtUtc', 'id', 'isExample', 'lastUpdated', 'listingStatus', 'objectives', 'presenterLabel', 'registrationUrl', 'relatedModuleIds', 'slug', 'startAtUtc', 'summary', 'timeZone', 'title']);
  });
});
