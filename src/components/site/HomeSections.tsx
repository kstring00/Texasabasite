import Link from 'next/link';
import { ArrowRight, HeartHandshake, Users, Activity, ShieldCheck } from 'lucide-react';
import { services } from '@/data/services';
import { insurance } from '@/data/insurance';
import { circles, whileYouWait } from '@/data/circles';
import { CoverageButton } from './Buttons';
import { Section } from './Section';
import { cn } from '@/lib/site/utils';

export function ServicesStrip({ title = 'What we offer', lede }: { title?: string; lede?: string }) {
  return (
    <Section eyebrow="Services" title={title} lede={lede ?? 'From the first evaluation to a teen planning what comes after school. One team, one plan, you in it.'}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <li key={s.slug}>
            <Link href={`/services/${s.slug}`} className="card card-hover flex h-full flex-col">
              <p className="eyebrow">{s.ages}</p>
              <h3 className="h3 mt-2">{s.name}</h3>
              <p className="mt-2 flex-1 text-base text-body">{s.short}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-base font-semibold text-ink">
                Learn more <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function InsuranceStrip({ center }: { center?: string }) {
  return (
    <Section id="insurance" tone="card" eyebrow="Insurance & cost" title="Know what it costs before you commit.">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <p className="lede">{insurance.freeVerification}</p>
          <p className="text-base text-body">{insurance.mandate}</p>
          <p className="text-base text-body">{insurance.medicaidNote}</p>
          {insurance.plans.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-2" aria-label="Plans we work with">
              {insurance.plans.map((p) => (
                <li key={p.name} className="chip">
                  {p.name}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <CoverageButton place="home-insurance" center={center} />
            <Link href="/insurance" className="btn-ghost">
              How the cost works
            </Link>
          </div>
        </div>
        <dl className="card grid gap-3 self-start">
          <p className="eyebrow">Plain words</p>
          {insurance.costTerms.slice(0, 4).map((t) => (
            <div key={t.term}>
              <dt className="font-semibold text-ink">{t.term}</dt>
              <dd className="text-base text-body">{t.plain}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

export function CommonGroundBridge({ className }: { className?: string }) {
  const pillars = [
    { icon: HeartHandshake, title: 'Parent training in every plan', text: 'Not an add-on. You learn what your child\'s RBT does so it keeps working at home.' },
    { icon: Users, title: 'Circles you can join before day one', text: `${circles.map((c) => c.name).join(' and ')}: parents a few steps ahead of you.` },
    { icon: Activity, title: 'Parent Pulse', text: 'A one-minute weekly check-in on how you are doing, not just your child. Your team sees the pattern, never a score.' },
    { icon: ShieldCheck, title: 'Private by design', text: 'Common Ground is parent support, not clinical care. Nothing you share there goes in your child\'s chart.' },
  ];
  return (
    <section className={cn('relative overflow-hidden bg-ink py-16 text-paper sm:py-20 lg:py-24', className)}>
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sun/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-plum/40 blur-3xl" aria-hidden />
      <div className="wrap relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow text-sun">Common Ground</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-paper sm:text-4xl lg:text-5xl">You&rsquo;re part of the team from day one.</h2>
          <p className="mt-5 max-w-xl text-lg text-paper/80">
            Most places treat you as a lead until intake, then go quiet. Here, the parent side of care has its own front door: resources for the waiting weeks, circles of other parents, and a weekly check-in on you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/families" className="btn-sun">
              See what families get <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </div>
          <ul className="mt-8 grid gap-2 text-sm text-paper/70 sm:grid-cols-2">
            {whileYouWait.map((w) => (
              <li key={w.href}>
                <Link href={w.href} className="underline-offset-4 hover:text-paper hover:underline">
                  {w.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <li key={p.title} className="rounded-3xl border border-paper/15 bg-paper/5 p-5 backdrop-blur-sm">
              <p.icon className="h-6 w-6 text-sun" aria-hidden />
              <h3 className="mt-3 font-sans text-lg font-bold text-paper">{p.title}</h3>
              <p className="mt-1 text-base text-paper/75">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
