import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { services, getService } from '@/data/services';
import { locations } from '@/data/locations';
import { Section } from '@/components/site/Section';
import { FinalCta } from '@/components/site/FinalCta';
import { TourButton } from '@/components/site/Buttons';

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
  const where = locations.filter((l) => l.services.includes(s.slug));
  const others = services.filter((o) => o.slug !== s.slug);
  return (
    <>
      <Section eyebrow={`Services · ${s.ages}`} title={s.name} lede={s.intro}>
        <div className="flex flex-wrap gap-2">
          <span className="chip">{s.ages}</span>
          <span className="chip">{s.where}</span>
        </div>
        <div className="mt-8">
          <TourButton size="lg" />
        </div>
      </Section>
      <Section tone="tint" title="What happens">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <ol className="space-y-4">
            {s.whatHappens.map((w, i) => (
              <li key={w} className="card flex gap-4">
                <span className="font-serif text-3xl text-plum">{i + 1}</span>
                <p className="text-base text-body">{w}</p>
              </li>
            ))}
          </ol>
          <div className="card self-start">
            <p className="eyebrow">Who you meet</p>
            <ul className="mt-3 space-y-2 text-base text-body">
              {s.whoYouMeet.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      {s.faq.length > 0 && (
        <Section title="Questions parents ask">
          <div className="grid gap-4 md:grid-cols-2">
            {s.faq.map((f) => (
              <div key={f.q} className="card">
                <h3 className="font-sans text-lg font-bold text-ink">{f.q}</h3>
                <p className="mt-2 text-base text-body">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
      <Section tone="card" title={`Where we offer ${s.name.toLowerCase()}`}>
        <ul className="flex flex-wrap gap-2">
          {where.map((l) => (
            <li key={l.slug}>
              <Link href={`/locations/${l.slug}`} className="chip hover:border-ink/40">
                {l.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-soft">
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
      <FinalCta />
    </>
  );
}
