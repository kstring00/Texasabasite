import Link from 'next/link';
import { ArrowUpRight, Lock, Phone } from 'lucide-react';
import { CG_NEXT_STEP, CG_PHONE, cgGroups } from '@/data/commonGround';
import { Reveal, RevealGroup, RevealItem } from '@/components/site/motion';

/**
 * The Common Ground landing page, in the homepage's editorial style:
 * hero, then the four groups as sections of cards, then the parent-support note.
 */
export function CgLanding() {
  return (
    <div className="space-y-[var(--s-5)]">
      <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-8">
          <p className="eyebrow">Common Ground · The parent side</p>
          <h1 className="display mt-5 text-[length:var(--t-3xl)] lg:text-[length:var(--t-hero)]">
            Support for you, not just <span className="editorial text-cobalt">your child.</span>
          </h1>
          <p className="lede mt-6 max-w-[56ch]">
            Most places treat you as a lead until intake, then go quiet. Here, the parent side of care has its own front door, open before your child is enrolled anywhere. Free for every family. No account.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={CG_NEXT_STEP} className="btn-primary">
              Find my next step <ArrowUpRight className="h-5 w-5" aria-hidden />
            </Link>
            <a href={`tel:${CG_PHONE.tel}`} className="btn-secondary">
              <Phone className="h-4 w-4" aria-hidden /> Talk to someone
            </a>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-4" delay={0.1}>
          <div className="arch bg-ink p-8 text-paper">
            <p className="flex items-center gap-2 font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter">
              <Lock className="h-4 w-4" aria-hidden /> Private by design
            </p>
            <p className="mt-4 font-sans text-[length:var(--t-base)] text-paper/85">What you enter stays in your browser. Nothing is sent to your child&rsquo;s clinicians unless you choose to share it.</p>
          </div>
        </Reveal>
      </header>

      {cgGroups.map((g) => (
        <section key={g.id} id={g.id} className="scroll-mt-[calc(var(--header-h)+72px)]" aria-labelledby={`cg-${g.id}`}>
          <Reveal as="header" className="mb-8 max-w-3xl">
            <p className="eyebrow">{g.label}</p>
            <h2 id={`cg-${g.id}`} className="h2 mt-3">{g.blurb}</h2>
          </Reveal>
          <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
            {g.pages.map((p) => (
              <RevealItem as="li" key={p.href}>
                <Link href={p.href} className="card card-hover group flex h-full flex-col rounded-[28px] bg-transparent">
                  <p.icon className="h-6 w-6 text-cobalt" strokeWidth={1.8} aria-hidden />
                  <span className="mt-6 block font-display text-[length:var(--t-lg)] leading-tight text-ink">{p.label}</span>
                  <span className="mt-2 block font-sans text-[length:var(--t-base)] text-body">{p.description}</span>
                  <span className="mt-auto flex justify-end pt-6"><ArrowUpRight className="h-5 w-5 text-ink/50 transition group-hover:text-cobalt" aria-hidden /></span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      ))}

      <section aria-labelledby="cg-tour" className="arch bg-ink p-8 pt-16 text-paper sm:p-12 sm:pt-20">
        <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-butter">When you&rsquo;re ready</p>
        <h2 id="cg-tour" className="h2 mt-3 text-paper">Come see a center.</h2>
        <p className="mt-3 max-w-[52ch] font-sans text-[length:var(--t-base)] text-paper/85">Forty-five minutes. No paperwork. No decision that day.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/request-a-tour" className="btn-sun">
            Request a tour <ArrowUpRight className="h-5 w-5" aria-hidden />
          </Link>
          <a href={`tel:${CG_PHONE.tel}`} className="btn border border-paper/30 text-paper hover:bg-paper hover:text-ink">
            <Phone className="h-4 w-4" aria-hidden /> {CG_PHONE.display}
          </a>
        </div>
      </section>
    </div>
  );
}
