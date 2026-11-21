import Link from 'next/link';
import { CalendarDays, CalendarX, CircleCheck, ExternalLink, Lock, Users } from 'lucide-react';
import { checkRegistrationUrl } from '@/lib/learn/registration';
import { ctDateParts, formatCtDate, formatCtTimeRange } from '@/lib/learn/time';
import type { LcTraining, LcTrainingView } from '@/lib/learn/trainings';
import { LcDemoChip } from './LcDemo';

/** The date block. With no real date it says "Example" or "Date to come". A date is never made up. */
export function LcDateBlock({ training: t, view }: { training: LcTraining; view: LcTrainingView }) {
  if (!t.startAtUtc) {
    return (
      <div className="lc-date" data-state="none">
        <CalendarDays width={26} height={26} strokeWidth={1.75} aria-hidden="true" />
        <span className="lc-date-word">{t.isExample ? 'Example' : 'Date to come'}</span>
      </div>
    );
  }
  const p = ctDateParts(t.startAtUtc);
  return (
    <div className="lc-date" data-state={view === 'cancelled' ? 'cancelled' : 'set'}>
      <span className="lc-date-month">{p.month}</span>
      <span className="lc-date-day">{p.day}</span>
      <span className="lc-date-weekday">{p.weekday}</span>
      {view === 'cancelled' ? <span className="lc-date-word">Cancelled</span> : null}
      <span className="lc-sr-only">{formatCtDate(t.startAtUtc)}</span>
    </div>
  );
}

export function LcTrainingWhen({ training: t }: { training: LcTraining }) {
  if (!t.startAtUtc || !t.endAtUtc) return <p className="lc-muted">{t.isExample ? 'No date. This is an example listing.' : 'Date and time to be announced.'}</p>;
  return (
    <p className="lc-training-when">
      <span>{formatCtDate(t.startAtUtc)}</span>
      <span>{formatCtTimeRange(t.startAtUtc, t.endAtUtc)}</span>
    </p>
  );
}

/** Status in words and an icon. Colour is only the third signal. */
export function LcTrainingChips({ training: t, view }: { training: LcTraining; view: LcTrainingView }) {
  return (
    <p className="lc-chips">
      {t.isExample ? <LcDemoChip label="Example listing" /> : null}
      {view === 'cancelled' ? (
        <span className="lc-chip" data-cast="rose">
          <CalendarX width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
          Cancelled
        </span>
      ) : null}
      {view === 'completed' ? (
        <span className="lc-chip" data-cast="slate">
          <CircleCheck width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
          Completed
        </span>
      ) : null}
      {view === 'closed' ? (
        <span className="lc-chip" data-cast="amber">
          <Lock width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
          Registration closed
        </span>
      ) : null}
      <span className="lc-chip" data-cast="slate">
        <Users width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
        Currently enrolled families only
      </span>
    </p>
  );
}

/**
 * The registration handoff. An active button appears only for a checked Microsoft Teams registration
 * link on an open listing. Every other state shows why there is no button. There is never a join link.
 */
export function LcRegistrationCta({ training: t, view, label = 'Request registration' }: { training: LcTraining; view: LcTrainingView; label?: string }) {
  const link = checkRegistrationUrl(t.registrationUrl);
  if (view === 'open' && link.ok) {
    return (
      <div className="lc-reg">
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="lc-btn lc-btn-primary">
          {label}
          <span className="lc-sr-only">: {t.title}</span>
          <ExternalLink width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
        </a>
        <p className="lc-reg-note">You will continue to Microsoft Teams to register. It opens in a new tab.</p>
      </div>
    );
  }
  const reason =
    view === 'cancelled' ? 'This training was cancelled, so registration is not available.'
    : view === 'completed' ? 'This training has finished.'
    : view === 'closed' ? 'Registration for this training has closed.'
    : t.isExample ? 'This is an example listing, so there is nothing to register for.'
    : 'A registration link has not been added yet. Please check back.';
  const text = view === 'details_soon' ? 'Registration details coming soon' : view === 'closed' ? 'Registration closed' : null;
  return (
    <div className="lc-reg">
      {text ? (
        <button type="button" className="lc-btn lc-btn-disabled" disabled>
          {text}
        </button>
      ) : null}
      <p className="lc-reg-note">{reason}</p>
    </div>
  );
}

/** A training in a list. */
export function LcTrainingCard({ training: t, view, headingLevel = 3 }: { training: LcTraining; view: LcTrainingView; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  const href = `/learn/trainings/${t.slug}`;
  return (
    <article className="lc-surface lc-tcard" data-cast="coral">
      <LcDateBlock training={t} view={view} />
      <div className="lc-tcard-body">
        <H className="lc-h3">
          <Link href={href} className="lc-mcard-title">
            {t.title}
          </Link>
        </H>
        <LcTrainingWhen training={t} />
        {t.presenterLabel ? <p className="lc-muted">Presented by {t.presenterLabel}</p> : null}
        <p className="lc-muted lc-clamp-2">{t.summary}</p>
        <LcTrainingChips training={t} view={view} />
        <div className="lc-tcard-actions">
          <Link href={href} className="lc-btn lc-btn-secondary">
            View details
            <span className="lc-sr-only">: {t.title}</span>
          </Link>
          {view === 'open' ? <LcRegistrationCta training={t} view={view} /> : null}
        </div>
      </div>
    </article>
  );
}
