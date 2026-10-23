import type { Metadata } from 'next';
import { steps } from '@/data/steps';
import { getLocation } from '@/data/locations';
import { peopleForRegion, centerIdFromSlug } from '@/data/people';
import { Section } from '@/components/site/Section';
import { TourForm } from '@/components/site/TourForm';
import { PeopleCards } from '@/components/site/PeopleCards';

export const metadata: Metadata = {
  title: 'Request a Tour of a Texas ABA Center',
  description: 'Request a tour at Austin, Cedar Hill, Katy, Pearland, Plano or Sugar Land. A real person texts you within one business day to confirm a time. No medical details needed.',
  alternates: { canonical: '/request-a-tour' },
};

export default async function RequestTourPage({ searchParams }: { searchParams: Promise<{ center?: string; about?: string; contact?: string }> }) {
  const sp = await searchParams;
  const center = sp.center ? getLocation(sp.center) : null;
  const tour = steps.find((s) => s.slug === 'tour')!;
  const people = peopleForRegion(center?.region ?? 'all');
  const isCoverage = sp.about === 'coverage';
  return (
    <Section
      titleAs="h1"
      eyebrow={isCoverage ? 'Free benefits check' : 'Request a tour'}
      title={isCoverage ? 'Find out what your plan covers.' : center ? `Come see ${center.name}.` : 'Come see a center.'}
      lede={isCoverage ? 'We call your insurance so you do not have to, and come back with plain numbers. Nothing to pay, nothing to commit to.' : 'Four quick questions. Then a real person texts you to set a time.'}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <TourForm defaultCenter={center?.slug} about={sp.about} contact={sp.contact} />
        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="arch bg-butter p-7 pt-12">
            <p className="eyebrow text-ink/70">What happens on a tour</p>
            <ol className="mt-3 space-y-3">
              {[`You arrive. ${tour.whatToBring}`, ...tour.whatHappens, tour.whatsNext].map((t, i) => (
                <li key={t} className="flex gap-3 text-base text-body">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-paper">{i + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 font-sans text-[length:var(--t-sm)] text-ink/70">{tour.howLong}</p>
          </div>
          {people.length > 0 && (
            <div>
              <p className="eyebrow mb-3">Who replies</p>
              <PeopleCards people={people.slice(0, 1)} compact centerId={center ? centerIdFromSlug(center.slug) : null} place="request-a-tour" />
            </div>
          )}
        </aside>
      </div>
    </Section>
  );
}
