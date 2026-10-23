import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from '../motion';
import { OpenWorldMark } from '../OpenWorld';

/**
 * Act Two: The feeling of being understood.
 * Three doors. Each one goes somewhere useful. No quiz, no data collection.
 */
const PATHS = [
  {
    n: '01',
    title: 'We’re looking for answers.',
    text: 'A pediatrician said a word. You are not sure what it means yet. Start with what an evaluation is and what ABA is, in plain words.',
    href: '/services/autism-diagnosis',
    cta: 'What an evaluation involves',
    tone: 'bg-butter',
  },
  {
    n: '02',
    title: 'We’re ready to explore care.',
    text: 'You have a diagnosis, or you are close. See the five steps from the first call to the first day, who you meet at each one, and how long each takes.',
    href: '/getting-started',
    cta: 'See the five steps',
    tone: 'bg-sage',
  },
  {
    n: '03',
    title: 'We need support for our family.',
    text: 'Not therapy. Support for you: the waiting weeks, the hard days, siblings, partners, and parents a few steps ahead. Free, before you are enrolled anywhere.',
    href: '/families',
    cta: 'Open Common Ground',
    tone: 'bg-lavender',
  },
];

export function Paths() {
  return (
    <section className="section-pad" aria-labelledby="paths-title">
      <div className="wrap">
        <div className="grid grid-cols-12 gap-x-6 gap-y-8">
          <Reveal className="col-span-12 lg:col-span-5">
            <OpenWorldMark className="mb-8 h-14 w-16" />
            <h2 id="paths-title" className="h1">
              You don’t need every answer to take the <span className="editorial text-cobalt">next step.</span>
            </h2>
          </Reveal>
          <Reveal className="col-span-12 lg:col-span-6 lg:col-start-7 lg:self-end" delay={0.1}>
            <p className="lede">Most families arrive somewhere in the middle: a worry, a word, a referral, a diagnosis. Pick the door that is closest to where you are.</p>
          </Reveal>
        </div>
        <RevealGroup as="ul" className="mt-[var(--s-4)] grid gap-4 md:grid-cols-3" stagger={0.12}>
          {PATHS.map((p, i) => (
            <RevealItem as="li" key={p.n} className={i === 1 ? 'md:translate-y-10' : ''}>
              <Link href={p.href} className={`group flex h-full min-h-[22rem] flex-col justify-between arch ${p.tone} p-7 pt-14 text-ink transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-cobalt/40 sm:p-8 sm:pt-16`}>
                <div>
                  <p className="num text-[length:var(--t-2xl)] leading-none text-ink/50">{p.n}</p>
                  <h3 className="h3 mt-4">{p.title}</h3>
                  <p className="mt-4 font-sans text-[length:var(--t-base)] text-ink/80">{p.text}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 font-sans text-[length:var(--t-sm)] font-bold uppercase tracking-[0.14em]">
                  {p.cta} <ArrowUpRight className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
