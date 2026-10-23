import { ArrowDown } from 'lucide-react';
import { CenterFinder } from '../CenterFinder';
import { Reveal } from '../motion';
import { HeroPortal } from './HeroPortal';
import { CallButton } from '../Buttons';

/**
 * Act One: The Opening.
 * Monumental type on the left, the Open World portal on the right,
 * and the two practical actions visible without scrolling.
 */
export function Opening() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="wrap-wide grid min-h-[calc(100svh-var(--header-h))] grid-cols-12 items-end gap-x-6 pb-[var(--s-4)] pt-[var(--s-3)] lg:items-center lg:pb-[var(--s-5)]">
        <div className="col-span-12 lg:col-span-7">
          <Reveal>
            <p className="eyebrow mb-6">Texas ABA Centers</p>
            <h1 id="hero-title" className="display">
              A whole lot
              <br />
              of life
              <br />
              happens <span className="editorial text-cobalt">next.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede mt-8 max-w-xl">
              Autism evaluations and individualized ABA therapy across Texas. Real people, welcoming centers, and guidance from your first question onward.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#find" className="btn-primary min-h-14 px-7 text-[length:var(--t-base)]">
                Find a center <ArrowDown className="h-5 w-5" aria-hidden />
              </a>
              <CallButton place="hero" variant="secondary" label="Talk to someone" />
            </div>
          </Reveal>
        </div>
        <div className="col-span-12 mt-10 lg:col-span-5 lg:mt-0">
          <HeroPortal />
        </div>
        <div id="find" className="col-span-12 mt-10 scroll-mt-28 lg:col-span-8 lg:col-start-1">
          <Reveal delay={0.26}>
            <CenterFinder compact />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
