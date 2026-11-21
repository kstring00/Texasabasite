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

/** "Nov 5, 2026, 1:30 PM CT", for staff history and status lines. */
export function formatCtDateTime(iso: string): string {
  return `${fmt({ month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))} CT`;
}

/** "Nov 5, 2026" */
export function formatCtShortDate(iso: string): string {
  return fmt({ month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

/* ── Central Time form input ─────────────────────────────────────────────── */

const wall = (d: Date) => {
  const parts = fmt({ year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
};

/** The date and time a form shows for a stored instant, in Central Time: "2026-03-12" and "18:00". */
export function ctInputParts(iso: string): { date: string; time: string } {
  return wall(new Date(iso));
}

/**
 * Turn a Central Time date and clock time from a form into a stored instant.
 * Daylight saving is handled by asking the calendar, not by assuming an offset:
 * a time that does not exist (the hour skipped in March) comes back as null, and a time
 * that happens twice (the repeated hour in November) resolves to the first of the two.
 */
export function ctWallTimeToUtc(date: string, time: string): string | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!d || !t) return null;
  const [y, mo, day, h, mi] = [Number(d[1]), Number(d[2]), Number(d[3]), Number(t[1]), Number(t[2])];
  if (mo < 1 || mo > 12 || day < 1 || day > 31 || h > 23 || mi > 59) return null;
  // Central Time is five hours behind UTC in summer and six in winter. Try both and keep the one that reads back correctly.
  for (const offsetHours of [5, 6]) {
    const candidate = new Date(Date.UTC(y, mo - 1, day, h + offsetHours, mi));
    const back = wall(candidate);
    if (back.date === date && back.time === time) return candidate.toISOString();
  }
  return null;
}

/** The Central Time calendar day of an instant: "2026-03-12". */
export function ctDay(iso: string): string {
  return wall(new Date(iso)).date;
}

/** "March 2026", for grouping by month. */
export function formatCtMonth(iso: string): string {
  return fmt({ month: 'long', year: 'numeric' }).format(new Date(iso));
}

/** "2026-03", a sortable month key in Central Time. */
export function ctMonthKey(iso: string): string {
  return ctDay(iso).slice(0, 7);
}
