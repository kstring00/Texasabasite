import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { services, getService } from '@/data/services';
import { locations } from '@/data/locations';
import { Section } from '@/components/site/Section';
import { Closing } from '@/components/site/acts/Closing';
import { TourButton } from '@/components/site/Buttons';
import { Reveal, RevealGroup, RevealItem } from '@/components/site/motion';
import { Doorway } from '@/components/site/OpenWorld';

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: `${s.name} in Texas: Houston, Dallas–Fort Worth, Austin`,
    description: `${s.short} ${s.ages}. Offered at all six Texas ABA Centers locations. Request a tour.`,
    alternates: { canonical: `/services/${s.slug}` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const idx = services.indexOf(s);
  const where = locations.filter((l) => l.services.includes(s.slug));
  const others = services.filter((o) => o.slug !== s.slug);
  return (
    <>
      <section className="wrap-wide grid grid-cols-12 gap-x-6 gap-y-10 pb-[var(--s-4)] pt-[var(--s-3)] lg:items-end">
        <Reveal className="col-span-12 lg:col-span-8">
          <p className="eyebrow">
            <Link href="/services" className="hover:underline">
              Services
            </Link>{' '}
            · {String(idx + 1).padStart(2, '0')} of {String(services.length).padStart(2, '0')}
          </p>
          <h1 className="display mt-5">{s.name}</h1>
          <p className="lede mt-6 max-w-2xl">{s.intro}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="chip">{s.ages}</span>
            <span className="chip">{s.where}</span>
          </div>
          <div className="mt-8">
            <TourButton size="lg" />
          </div>
        </Reveal>
        <Reveal className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-10" delay={0.1}>
          <Doorway seed={idx} label={s.name} className="aspect-[4/5]" />
        </Reveal>
      </section>

      <Section tone="tint" eyebrow="What happens" title={<>Step by <span className="editorial text-cobalt">step.</span></>}>
        <div className="grid grid-cols-12 gap-x-6 gap-y-8">
          <RevealGroup as="ol" className="col-span-12 space-y-4 lg:col-span-7">
            {s.whatHappens.map((w, i) => (
              <RevealItem as="li" key={w} className="flex gap-5 border-t border-ink/15 pt-5">
                <span className="num text-[length:var(--t-2xl)] leading-none text-cobalt">{String(i + 1).padStart(2, '0')}</span>
                <p className="font-sans text-[length:var(--t-lg)] leading-snug text-ink">{w}</p>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9">
            <div className="arch bg-ink p-6 pt-10 text-paper">
              <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.18em] text-butter">Who you meet</p>
              <ul className="mt-3 space-y-2 font-sans text-[length:var(--t-base)]">
                {s.whoYouMeet.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {s.faq.length > 0 && (
        <Section eyebrow="Questions parents ask" title={s.answers}>
          <div className="max-w-3xl">
            {s.faq.map((f) => (
              <details key={f.q} className="group border-t border-ink/15 py-5 last:border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[length:var(--t-xl)] leading-tight text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="relative h-8 w-8 shrink-0 rounded-full border border-ink/30 transition group-open:rotate-45">
                    <span className="absolute left-1/2 top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-ink" />
                    <span className="absolute left-1/2 top-1/2 h-0.5 w-3.5 -translate-x-1/2 -translate-y-1/2 bg-ink" />
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl font-sans text-[length:var(--t-base)] text-body">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>
      )}

      <Section tone="card" size="sm" eyebrow="Where" title={`Offered at ${where.length === locations.length ? 'every center' : `${where.length} centers`}.`}>
        <ul className="flex flex-wrap gap-2">
          {where.map((l) => (
            <li key={l.slug}>
              <Link href={`/locations/${l.slug}`} className="chip min-h-11 hover:bg-ink hover:text-paper">
                {l.name} <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 font-sans text-[length:var(--t-sm)] text-soft">
          Other services:{' '}
          {others.map((o, i) => (
            <span key={o.slug}>
              <Link href={`/services/${o.slug}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                {o.name}
              </Link>
              {i < others.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </p>
      </Section>
      <Closing />
    </>
  );
}
