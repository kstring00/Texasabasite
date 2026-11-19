import { describe, expect, it } from 'vitest';
import { isPubliclyListed, sortTrainings, trainingView, type LcTraining } from './trainings';

const base: LcTraining = {
  id: 't', slug: 't', title: 'T', summary: 's', description: ['d'], objectives: [], startAtUtc: '2026-07-15T23:00:00Z', endAtUtc: '2026-07-16T00:00:00Z',
  timeZone: 'America/Chicago', presenterLabel: null, categoryId: 'c', relatedModuleIds: [], registrationUrl: 'https://events.teams.microsoft.com/event/1', listingStatus: 'scheduled', isExample: false, lastUpdated: null,
};
const before = new Date('2026-07-01T00:00:00Z');
const after = new Date('2026-07-20T00:00:00Z');

describe('training listings', () => {
  it('is open only when scheduled, ahead, and carrying a checked registration link', () => {
    expect(trainingView(base, before)).toBe('open');
    expect(trainingView({ ...base, registrationUrl: null }, before)).toBe('details_soon');
    expect(trainingView({ ...base, registrationUrl: 'https://teams.microsoft.com/l/meetup-join/x' }, before)).toBe('details_soon');
    expect(trainingView({ ...base, registrationUrl: 'javascript:alert(1)' }, before)).toBe('details_soon');
  });
  it('never offers registration once a training is over, closed or cancelled', () => {
    expect(trainingView(base, after)).toBe('completed');
    expect(trainingView({ ...base, listingStatus: 'completed' }, before)).toBe('completed');
    expect(trainingView({ ...base, listingStatus: 'registration_closed' }, before)).toBe('closed');
    expect(trainingView({ ...base, listingStatus: 'cancelled' }, before)).toBe('cancelled');
    expect(trainingView({ ...base, listingStatus: 'cancelled' }, after)).toBe('cancelled');
  });
  it('keeps drafts and archived listings off public pages', () => {
    expect(isPubliclyListed({ ...base, listingStatus: 'draft' })).toBe(false);
    expect(isPubliclyListed({ ...base, listingStatus: 'archived' })).toBe(false);
    expect(isPubliclyListed(base)).toBe(true);
  });
  it('sorts upcoming by date, undated last, then cancelled, then finished', () => {
    const list = [
      { ...base, id: 'done', listingStatus: 'completed' as const },
      { ...base, id: 'later', startAtUtc: '2026-08-01T23:00:00Z', endAtUtc: '2026-08-02T00:00:00Z' },
      { ...base, id: 'undated', startAtUtc: null, endAtUtc: null },
      { ...base, id: 'cancelled', listingStatus: 'cancelled' as const },
      { ...base, id: 'soon' },
    ];
    expect(sortTrainings(list, before).map((t) => t.id)).toEqual(['soon', 'later', 'undated', 'cancelled', 'done']);
  });
});
