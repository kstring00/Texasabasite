import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { whileYouWait, circles } from '@/data/circles';
import { upcomingEvents } from '@/data/events';
import { getLocation, locations } from '@/data/locations';
import { steps } from '@/data/steps';
import { CircleLink } from '@/components/site/CircleLink';
import { EventCard } from '@/components/site/EventCard';

export const metadata: Metadata = {
  title: 'While You Wait',
  description: 'What to do between the first call and the first day: a next step, plain answers about ABA, help at home, and parents to talk to. Free, before you are enrolled anywhere.',
};

export default async function WhileYouWaitPage({ searchParams }: { searchParams: Promise<{ center?: string }> }) {
  const { center: slug } = await searchParams;
  const center = slug ? getLocation(slug) : null;
  const nextEvents = upcomingEvents(center?.slug).slice(0, 2);
  const waiting = steps.filter((s) => s.n <= 3);
  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow">While you wait</p>
        <h1 className="h2">The weeks between the call and the first day.</h1>
        <p className="page-description text-base">
          Waiting for an evaluation, an authorization, or a start date is the hardest part. These are the things families tell us helped. All free, all yours before you are enrolled anywhere.
        </p>
      </header>

      <section aria-labelledby="wyw-now">
        <h2 id="wyw-now" className="section-title">Start with one of these</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {whileYouWait.map((w) => (
            <li key={w.href}>
              <Link href={w.href} className="card card-hover block h-full">
                <p className="font-sans text-lg font-bold text-ink">{w.title}</p>
                <p className="mt-1 text-base text-body">{w.text}</p>
                <span className="mt-3 inline-flex items-center gap-1 font-semibold text-ink">
                  Open <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="wyw-circles" className="grid gap-5 lg:grid-cols-2">
        <div className="card">
          <h2 id="wyw-circles" className="section-title">Parents to talk to</h2>
          <ul className="mt-4 space-y-3">
            {circles.map((c) => (
              <li key={c.id}>
                <CircleLink circle={c} />
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="section-title">{nextEvents.length > 0 ? `Coming up${center ? ` in ${center.name}` : ''}` : 'Where things stand'}</h2>
          {nextEvents.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {nextEvents.map((e) => (
                <li key={e.id}>
                  <EventCard event={e} />
                </li>
              ))}
            </ul>
          ) : (
            <ol className="mt-4 space-y-3">
              {waiting.map((s) => (
                <li key={s.slug} className="flex gap-3">
                  <Clock className="mt-1 h-4 w-4 shrink-0 text-soft" aria-hidden />
                  <span>
                    <span className="font-semibold text-ink">{s.title}: </span>
                    <span className="text-body">{s.howLong}</span>
                  </span>
                </li>
              ))}
              <li className="pt-2 text-sm text-soft">
                <Link href="/getting-started" className="font-semibold text-ink underline-offset-4 hover:underline">
                  Every step in detail
                </Link>
              </li>
            </ol>
          )}
        </div>
      </section>

      {!center && (
        <p className="text-sm text-soft">
          Waiting on a specific center?{' '}
          {locations.map((l, i) => (
            <span key={l.slug}>
              <Link href={`/families/while-you-wait?center=${l.slug}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                {l.name}
              </Link>
              {i < locations.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
