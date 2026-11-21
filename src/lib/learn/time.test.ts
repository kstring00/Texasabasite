import { describe, expect, it } from 'vitest';
import { ctDateParts, ctDay, ctInputParts, ctMonthKey, ctWallTimeToUtc, formatCtDate, formatCtTimeRange, minutesBetween } from './time';

describe('Central Time formatting', () => {
  it('shows standard time (CST, UTC-6) in winter', () => {
    // 6:00 PM CST on Jan 15 is midnight UTC on Jan 16.
    expect(formatCtDate('2026-01-16T00:00:00Z')).toBe('Thursday, January 15, 2026');
    expect(formatCtTimeRange('2026-01-16T00:00:00Z', '2026-01-16T01:00:00Z')).toBe('6:00 to 7:00 PM CT');
  });
  it('shows daylight time (CDT, UTC-5) in summer', () => {
    expect(formatCtDate('2026-07-15T23:00:00Z')).toBe('Wednesday, July 15, 2026');
    expect(formatCtTimeRange('2026-07-15T23:00:00Z', '2026-07-16T00:00:00Z')).toBe('6:00 to 7:00 PM CT');
  });
  it('handles the days either side of the spring change (March 8, 2026)', () => {
    expect(formatCtTimeRange('2026-03-08T00:00:00Z', '2026-03-08T01:00:00Z')).toBe('6:00 to 7:00 PM CT'); // Mar 7, still CST
    expect(formatCtTimeRange('2026-03-09T23:00:00Z', '2026-03-10T00:00:00Z')).toBe('6:00 to 7:00 PM CT'); // Mar 9, now CDT
    expect(ctDateParts('2026-03-08T00:00:00Z')).toMatchObject({ month: 'MAR', day: '7', weekday: 'Sat' });
  });
  it('handles the autumn change (November 1, 2026)', () => {
    expect(formatCtTimeRange('2026-10-31T23:00:00Z', '2026-11-01T00:00:00Z')).toBe('6:00 to 7:00 PM CT'); // CDT
    expect(formatCtTimeRange('2026-11-03T00:00:00Z', '2026-11-03T01:00:00Z')).toBe('6:00 to 7:00 PM CT'); // CST
  });
  it('names both halves when a session crosses noon', () => {
    expect(formatCtTimeRange('2026-07-15T16:30:00Z', '2026-07-15T17:30:00Z')).toBe('11:30 AM to 12:30 PM CT');
  });
  it('gives the pieces for a date block and the length in minutes', () => {
    expect(ctDateParts('2026-07-15T23:00:00Z')).toEqual({ month: 'JUL', day: '15', weekday: 'Wed', year: '2026' });
    expect(minutesBetween('2026-07-15T23:00:00Z', '2026-07-16T00:30:00Z')).toBe(90);
  });
});

describe('Central Time form input', () => {
  it('uses the summer offset in summer and the winter offset in winter', () => {
    expect(ctWallTimeToUtc('2026-07-15', '18:00')).toBe('2026-07-15T23:00:00.000Z');
    expect(ctWallTimeToUtc('2026-12-15', '18:00')).toBe('2026-12-16T00:00:00.000Z');
  });
  it('gets both sides of the March change right', () => {
    expect(ctWallTimeToUtc('2026-03-07', '18:00')).toBe('2026-03-08T00:00:00.000Z');
    expect(ctWallTimeToUtc('2026-03-08', '18:00')).toBe('2026-03-08T23:00:00.000Z');
  });
  it('refuses the hour that is skipped in March', () => {
    expect(ctWallTimeToUtc('2026-03-08', '02:30')).toBeNull();
  });
  it('resolves the repeated hour in November to the first one', () => {
    expect(ctWallTimeToUtc('2026-11-01', '01:30')).toBe('2026-11-01T06:30:00.000Z');
  });
  it('refuses dates and times that are not real', () => {
    expect(ctWallTimeToUtc('2026-02-30', '18:00')).toBeNull();
    expect(ctWallTimeToUtc('2026-13-01', '18:00')).toBeNull();
    expect(ctWallTimeToUtc('tomorrow', '6pm')).toBeNull();
  });
  it('reads a stored instant back as the same form values', () => {
    const iso = ctWallTimeToUtc('2026-03-12', '18:00')!;
    expect(ctInputParts(iso)).toEqual({ date: '2026-03-12', time: '18:00' });
    expect(ctDay('2026-12-16T00:00:00.000Z')).toBe('2026-12-15');
    expect(ctMonthKey('2026-12-01T03:00:00.000Z')).toBe('2026-11');
  });
});
