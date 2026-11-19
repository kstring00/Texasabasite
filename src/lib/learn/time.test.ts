import { describe, expect, it } from 'vitest';
import { ctDateParts, formatCtDate, formatCtTimeRange, minutesBetween } from './time';

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
