/**
 * The only place the Learning Center formats dates and times.
 * Everything is shown in Central Time, whatever time zone the server or the reader is in.
 */
export const LC_TIME_ZONE = 'America/Chicago';

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { timeZone: LC_TIME_ZONE, ...opts });
const part = (d: Date, opts: Intl.DateTimeFormatOptions, type: Intl.DateTimeFormatPartTypes) => fmt(opts).formatToParts(d).find((p) => p.type === type)?.value ?? '';

function clock(d: Date): { time: string; period: string } {
  const parts = fmt({ hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? '';
  return { time: `${get('hour')}:${get('minute')}`, period: get('dayPeriod').toUpperCase() };
}

/** "Thursday, March 12, 2026" */
export function formatCtDate(iso: string): string {
  return fmt({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

/** "6:00 to 7:00 PM CT", or "11:30 AM to 12:30 PM CT" when the range crosses noon. */
export function formatCtTimeRange(startIso: string, endIso: string): string {
  const a = clock(new Date(startIso));
  const b = clock(new Date(endIso));
  return a.period === b.period ? `${a.time} to ${b.time} ${b.period} CT` : `${a.time} ${a.period} to ${b.time} ${b.period} CT`;
}

/** The pieces a date block shows: "MAR", "12", "Thu". */
export function ctDateParts(iso: string): { month: string; day: string; weekday: string; year: string } {
  const d = new Date(iso);
  return {
    month: part(d, { month: 'short' }, 'month').toUpperCase(),
    day: part(d, { day: 'numeric' }, 'day'),
    weekday: part(d, { weekday: 'short' }, 'weekday'),
    year: part(d, { year: 'numeric' }, 'year'),
  };
}

/** Whole minutes between two instants. */
export function minutesBetween(startIso: string, endIso: string): number {
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
}
