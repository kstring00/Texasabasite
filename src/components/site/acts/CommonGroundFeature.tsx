import Link from 'next/link';
import { ArrowUpRight, Lock } from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from '../motion';
import { OpenWorldMark } from '../OpenWorld';

const FEATURES = [
  { title: 'My Family Support Guide', text: 'A short, guided path to one useful next step for the week you are actually having.', href: '/families/care-plan' },
  { title: 'Parent Pulse', text: 'A one-minute check-in on you, not your child. Saved on your device. Never a score.', href: '/families/pulse' },
  { title: 'While You Wait', text: 'The weeks between the first call and the first day, with something to hold onto.', href: '/families/while-you-wait' },
  { title: 'Parent Circles', text: 'Moderated groups of parents a few steps ahead of you. Pilots forming now.', href: '/families/connect' },
  { title: 'Caregiver tools', text: 'Grounding for hard days, sleep, and the mental-health toolbox.', href: '/families/caregiver' },
  { title: 'Practical resources', text: 'Paying for care, finding local help, and what ABA is in plain words.', href: '/families/resources' },
  { title: 'Siblings and partners', text: 'Support for the brother, the sister, and the two of you.', href: '/families/siblings' },
];

/**
 * Act Six: Common Ground.
 * The lavender shift. Big editorial type, calm spacing, the product listed honestly.
 * Parent support, not clinical care. Stays on your device.
 */
export function CommonGroundFeature() {
  return (
    <section className="bg-lavender text-ink" aria-labelledby="cg-title">
      <div className="wrap py-[calc(var(--s-5)*1.2)]">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <Reveal className="col-span-12 lg:col-span-7">
            <p className="eyebrow mb-5 text-ink/70">Common Ground · The parent side</p>
            <h2 id="cg-title" className="display text-[length:var(--t-3xl)] lg:text-[length:var(--t-hero)]">
              You’re part of the team from <span className="editorial text-cobalt">day one.</span>
            </h2>
          </Reveal>
          <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9 lg:self-end" delay={0.1}>
            <OpenWorldMark className="mb-5 h-14 w-16" tone="ink" />
            <p className="font-sans text-[length:var(--t-lg)] leading-snug text-ink/85">
              Most places treat you as a lead until intake, then go quiet. Here, the parent side of care has its own front door, open before your child is enrolled anywhere.
            </p>
          </Reveal>
        </div>

        <RevealGroup as="ul" className="mt-[var(--s-4)] grid gap-px overflow-hidden rounded-[var(--radius)] border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {FEATURES.map((f, i) => (
            <RevealItem as="li" key={f.href} className={i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}>
              <Link href={f.href} className="group flex h-full min-h-[11rem] flex-col justify-between bg-lavender p-6 transition hover:bg-paper">
                <span>
                  <span className="block font-display text-[length:var(--t-lg)] leading-tight text-ink">{f.title}</span>
                  <span className="mt-2 block font-sans text-[length:var(--t-sm)] text-ink/75">{f.text}</span>
                </span>
                <ArrowUpRight className="mt-4 h-5 w-5 text-ink/50 transition group-hover:text-cobalt" aria-hidden />
              </Link>
            </RevealItem>
          ))}
          <RevealItem as="li" className="sm:col-span-2 lg:col-span-4">
            <div className="flex h-full min-h-[8rem] flex-col justify-between gap-4 bg-ink p-6 text-paper sm:flex-row sm:items-center">
              <p className="flex items-center gap-2 font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.18em] text-butter">
                <Lock className="h-4 w-4" aria-hidden /> Private by design
              </p>
              <p className="font-sans text-[length:var(--t-sm)] text-paper/85 sm:mt-0 sm:max-w-3xl">Common Ground is parent support, not clinical care. What you enter stays in your browser. Nothing is sent to your child’s clinicians unless you choose to share it.</p>
            </div>
          </RevealItem>
        </RevealGroup>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/families" className="btn-primary">
            Open Common Ground <ArrowUpRight className="h-5 w-5" aria-hidden />
          </Link>
          <p className="font-sans text-[length:var(--t-sm)] text-ink/70">Free for every family in Texas. No account.</p>
        </div>
      </div>
    </section>
  );
}
