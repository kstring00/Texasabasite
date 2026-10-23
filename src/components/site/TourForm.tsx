'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, ArrowRight, Users, Check } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { submitTourRequest, type TourRequestResult } from '@/app/request-a-tour/actions';
import { locations, getLocation } from '@/data/locations';
import { firstName, tourResponder, visiblePeople } from '@/data/people';
import { circles } from '@/data/circles';
import { upcomingEvents } from '@/data/events';
import { captureAttribution, track } from '@/lib/site/analytics';
import { cn } from '@/lib/site/utils';
import { CallButton } from './Buttons';

const TIME_CHIPS = [
  ['mornings', 'Mornings'],
  ['afternoons', 'Afternoons'],
  ['evenings', 'Evenings'],
  ['weekends', 'Weekends'],
] as const;

const AGE_CHIPS = [
  ['under-3', 'Under 3'],
  ['3-6', '3 to 6'],
  ['7-12', '7 to 12'],
  ['13-plus', '13 and up'],
] as const;

export function TourForm({ defaultCenter, about, compact, contact }: { defaultCenter?: string; about?: string; compact?: boolean; contact?: string }) {
  const contactPerson = contact ? visiblePeople.find((p) => p.id === contact) ?? null : null;
  const [state, action, pending] = useActionState<TourRequestResult | null, FormData>(submitTourRequest, null);
  const [center, setCenter] = useState(defaultCenter ?? '');
  const [attribution, setAttribution] = useState('');
  const responder = tourResponder();

  useEffect(() => {
    setAttribution(JSON.stringify(captureAttribution()));
  }, []);

  useEffect(() => {
    if (state?.ok) track({ name: 'tour_request_submit', center: state.center, source: about ?? 'tour' });
  }, [state, about]);

  const chosen = useMemo(() => getLocation(center), [center]);

  if (state?.ok) return <Confirmation name={state.name} centerSlug={state.center} />;

  const err = state && !state.ok ? state.fields ?? {} : {};
  const isCoverage = about === 'coverage';
  const isMessage = about === 'message';

  return (
    <form action={action} className={cn('rounded-[var(--radius)] border border-ink/15 bg-card space-y-6', compact ? 'p-5' : 'p-6 sm:p-8')} noValidate aria-describedby="tour-form-note">
      <div>
        <h2 className="h3">{isMessage ? (contactPerson ? `Send a message to ${firstName(contactPerson)}` : 'Send a message') : isCoverage ? 'Check my coverage' : 'Request a tour'}</h2>
        <p id="tour-form-note" className="mt-1 text-base text-body">
          {isMessage
            ? `Tell us where to reach you${contactPerson ? ` and we pass it to ${firstName(contactPerson)}` : ''}. A real person texts you back within one business day.`
            : isCoverage
              ? 'Tell us where to reach you. We verify benefits for free and come back with plain numbers. You can add a tour on the same call.'
              : 'Four quick things. A real person texts you back to confirm a time.'}
        </p>
      </div>

      {state && !state.ok && (
        <p role="alert" className="rounded-2xl border border-rose/30 bg-rose/5 px-4 py-3 text-base text-ink">
          {state.error}
        </p>
      )}

      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="attribution" value={attribution} />
      <input type="hidden" name="about" value={about ?? 'tour'} />
      {contactPerson && <input type="hidden" name="contact" value={contactPerson.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your first name" id="firstName" error={err.firstName} required>
          <input id="firstName" name="firstName" className="input-field" autoComplete="given-name" required aria-invalid={!!err.firstName} />
        </Field>
        <Field label="Phone (we text)" id="phone" error={err.phone} required>
          <input id="phone" name="phone" type="tel" className="input-field" autoComplete="tel" inputMode="tel" required aria-invalid={!!err.phone} />
        </Field>
      </div>

      <Field label="Preferred center" id="center" error={err.center} required>
        <select id="center" name="center" className="input-field" value={center} onChange={(e) => setCenter(e.target.value)} required aria-invalid={!!err.center}>
          <option value="">Choose a center</option>
          {locations.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name} · {l.address.city}, TX
            </option>
          ))}
        </select>
        {chosen && (
          <p className="mt-2 text-sm text-soft">
            {chosen.address.street}
            {chosen.address.suite ? `, ${chosen.address.suite}` : ''}, {chosen.address.city}
          </p>
        )}
      </Field>

      <fieldset>
        <legend className="label">
          Days and times that usually work <span className="text-rose">*</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {TIME_CHIPS.map(([v, l]) => (
            <Chip key={v} name="times" value={v} label={l} />
          ))}
        </div>
        {err.times && <p className="mt-2 text-sm text-rose">{err.times}</p>}
      </fieldset>

      <details className="group rounded-2xl border border-line p-4 open:bg-ink/[0.02]">
        <summary className="cursor-pointer list-none text-base font-semibold text-ink">
          Optional: a few more things that help <span className="ml-1 text-soft group-open:hidden">(tap to open)</span>
        </summary>
        <div className="mt-5 space-y-5">
          <Field label="Email" id="email" error={err.email}>
            <input id="email" name="email" type="email" className="input-field" autoComplete="email" />
          </Field>
          <fieldset>
            <legend className="label">Your child&rsquo;s age</legend>
            <div className="flex flex-wrap gap-2">
              {AGE_CHIPS.map(([v, l]) => (
                <Chip key={v} name="age" value={v} label={l} type="radio" />
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="label">Preferred language</legend>
            <div className="flex flex-wrap gap-2">
              <Chip name="language" value="en" label="English" type="radio" defaultChecked />
              <Chip name="language" value="es" label="Español" type="radio" />
            </div>
          </fieldset>
          <Field label="Anything you'd like us to know" id="note" hint="Please leave out medical details. Save those for the visit.">
            <textarea id="note" name="note" className="input-field min-h-24" maxLength={500} defaultValue={contactPerson ? `Ask for ${firstName(contactPerson)}. ` : undefined} />
          </Field>
        </div>
      </details>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" className="btn-primary min-h-14 px-8 text-lg" disabled={pending}>
          <CalendarCheck className="h-5 w-5" aria-hidden />
          {pending ? 'Sending…' : isCoverage ? 'Check my coverage' : 'Request a tour'}
        </button>
        <p className="text-sm text-soft">
          {responder ? `${responder.name} will text you within one business day to confirm a time.` : 'We will text you within one business day to confirm a time.'}
        </p>
      </div>
      <p className="text-xs text-soft">
        We only ask for what we need to reach you. No diagnosis, medical history, or insurance IDs here. See our{' '}
        <Link href="/privacy" className="underline underline-offset-4">
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}

function Field({ label, id, error, hint, required, children }: { label: string; id: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {required && <span className="text-rose">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-sm text-soft">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-sm text-rose" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function Chip({ name, value, label, type = 'checkbox', defaultChecked }: { name: string; value: string; label: string; type?: 'checkbox' | 'radio'; defaultChecked?: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type={type} name={name} value={value} className="peer sr-only" defaultChecked={defaultChecked} />
      <span className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-base font-semibold text-ink transition peer-checked:border-cobalt peer-checked:bg-cobalt peer-checked:text-paper peer-focus-visible:ring-4 peer-focus-visible:ring-cobalt/40">
        {label}
      </span>
    </label>
  );
}

export function Confirmation({ name, centerSlug }: { name: string; centerSlug: string }) {
  const center = getLocation(centerSlug);
  const nextEvent = upcomingEvents(centerSlug)[0];
  const circle = circles[0];
  const reduce = useReducedMotion();
  const item = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.25 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } });
  return (
    <div className="arch border border-ink/15 bg-card p-6 pt-12 sm:p-8 sm:pt-14" role="status" aria-live="polite">
      <motion.span
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-butter text-ink"
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        aria-hidden
      >
        <Check className="h-7 w-7" strokeWidth={3} />
      </motion.span>
      <motion.p className="eyebrow mt-5" {...item(0)}>Got it</motion.p>
      <motion.h2 className="h2 mt-2" {...item(1)}>Thanks, {name}.</motion.h2>
      <motion.p className="lede mt-3" {...item(2)}>
        {center ? `${center.name} will text you within one business day.` : 'We will text you within one business day.'} While you wait, here are two things families find helpful:
      </motion.p>
      <motion.div className="mt-8 grid gap-4 sm:grid-cols-2" {...item(3)}>
        <Link href={`/families/while-you-wait?center=${centerSlug}`} className="card card-hover block">
          <p className="eyebrow">While you wait</p>
          <p className="h3 mt-2">What to do between now and day one</p>
          <p className="mt-2 text-base text-body">A next step, plain answers about ABA, help at home, and parents to talk to. Free, starting now.</p>
          <span className="mt-4 inline-flex items-center gap-1 font-semibold text-ink">
            Open Common Ground <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>
        {nextEvent ? (
          <a
            href={nextEvent.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card card-hover block"
            onClick={() => track({ name: 'event_rsvp_click', event: nextEvent.id, center: centerSlug })}
          >
            <p className="eyebrow">Next event {center ? `in ${center.name}` : ''}</p>
            <p className="h3 mt-2">{nextEvent.title}</p>
            <p className="mt-2 text-base text-body">{new Date(nextEvent.startsAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <span className="mt-4 inline-flex items-center gap-1 font-semibold text-ink">
              RSVP <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </a>
        ) : (
          <Link href={circle.href} className="card card-hover block" onClick={() => track({ name: 'circle_join_click', circle: circle.id })}>
            <p className="eyebrow">Parent circle</p>
            <p className="h3 mt-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-plum" aria-hidden /> {circle.name}
            </p>
            <p className="mt-2 text-base text-body">{circle.who}</p>
            <span className="mt-4 inline-flex items-center gap-1 font-semibold text-ink">
              See the circle <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </Link>
        )}
      </motion.div>
      <div className="mt-8 flex flex-wrap gap-3">
        <CallButton location={center} place="confirmation" label={center ? `Call ${center.name} now` : undefined} />
        <Link href="/getting-started" className="btn-ghost">
          See what happens next
        </Link>
      </div>
    </div>
  );
}
