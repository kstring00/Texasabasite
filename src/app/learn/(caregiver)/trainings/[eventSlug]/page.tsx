import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { LcBack } from '@/components/learn/LcPageHead';
import { LcDateBlock, LcRegistrationCta, LcTrainingChips, LcTrainingWhen } from '@/components/learn/LcTraining';
import { getModuleById, getTrainingBySlug, listTrainings } from '@/lib/learn/content';
import { formatCtDate, minutesBetween } from '@/lib/learn/time';
import { trainingView } from '@/lib/learn/trainings';

type Params = { params: Promise<{ eventSlug: string }> };

export function generateStaticParams() {
  return listTrainings().map((t) => ({ eventSlug: t.slug }));
}
export const revalidate = 300;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = getTrainingBySlug((await params).eventSlug);
  return t ? { title: t.title, description: t.summary, alternates: { canonical: `/learn/trainings/${t.slug}` } } : {};
}

export default async function LearnTrainingPage({ params }: Params) {
  const t = getTrainingBySlug((await params).eventSlug);
  if (!t) notFound();
  const view = trainingView(t, new Date());
  const modules = t.relatedModuleIds.map(getModuleById).filter((m) => m !== null);
  const minutes = t.startAtUtc && t.endAtUtc ? minutesBetween(t.startAtUtc, t.endAtUtc) : null;

  return (
    <div data-cast="coral">
      <LcBack href="/learn/trainings" label="Live Trainings" />
      <header className="lc-surface lc-pagehead lc-pagehead-training">
        <LcDateBlock training={t} view={view} />
        <div>
          <p className="lc-eyebrow">Live training</p>
          <h1 className="lc-h1">{t.title}</h1>
          <LcTrainingWhen training={t} />
          {minutes ? <p className="lc-muted">About {minutes} minutes</p> : null}
          {t.presenterLabel ? <p className="lc-muted">Presented by {t.presenterLabel}</p> : null}
          <LcTrainingChips training={t} view={view} />
        </div>
      </header>

      {view === 'cancelled' ? (
        <p className="lc-note lc-note-wide" data-cast="rose" role="status">
          <span>This training was cancelled. It will not take place. If you had registered, you do not need to do anything.</span>
        </p>
      ) : null}

      <div className="lc-module-layout">
        <div className="lc-module-main">
          <section aria-labelledby="lc-training-about" className="lc-surface lc-panel">
            <h2 id="lc-training-about" className="lc-h2">
              About this training
            </h2>
            <div className="lc-prose">
              {t.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {t.objectives.length > 0 ? (
              <>
                <h3 className="lc-h3">What it covers</h3>
                <ul className="lc-takeaways">
                  {t.objectives.map((o, i) => (
                    <li key={i}>
                      <Check width={20} height={20} strokeWidth={2} aria-hidden="true" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <section aria-labelledby="lc-training-expect" className="lc-surface lc-panel">
            <h2 id="lc-training-expect" className="lc-h2">
              What to expect
            </h2>
            <div className="lc-prose">
              <h3 className="lc-h3">Who can attend</h3>
              <p>This training is available to currently enrolled families. Clinic staff confirm enrollment after you ask to register. You do not need to share anything about your child on this website.</p>
              <h3 className="lc-h3">How a group session works</h3>
              <p>It is a group, so the presenter teaches general ideas and answers general questions. For questions about your own child, talk with your child’s supervising BCBA.</p>
              <h3 className="lc-h3">Joining</h3>
              <p>After your registration is approved, Microsoft Teams sends your joining details by email. This website never shows a joining link.</p>
              <h3 className="lc-h3">Accessibility</h3>
              <p>Microsoft Teams has live captions you can turn on during the session. If you need something else to take part, tell your clinical team before the training.</p>
            </div>
          </section>
        </div>

        <aside className="lc-module-side" aria-label="Registration">
          <section aria-labelledby="lc-training-register" className="lc-surface lc-panel">
            <h2 id="lc-training-register" className="lc-h3">
              Registration
            </h2>
            <LcRegistrationCta training={t} view={view} label="Register through Microsoft Teams" />
            <p className="lc-muted">
              <Link href="/learn/help#registration-email" className="lc-link">
                Help with registration and email
              </Link>
            </p>
          </section>
          {modules.length > 0 ? (
            <section aria-labelledby="lc-training-modules" className="lc-surface lc-panel">
              <h2 id="lc-training-modules" className="lc-h3">
                Learn at your own pace
              </h2>
              <ul className="lc-link-list">
                {modules.map((m) => (
                  <li key={m.manifest.id}>
                    <Link href={`/learn/modules/${m.manifest.slug}`} className="lc-link">
                      {m.manifest.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {t.lastUpdated ? <p className="lc-muted lc-updated">Listing last updated {formatCtDate(t.lastUpdated)}.</p> : null}
        </aside>
      </div>
    </div>
  );
}
