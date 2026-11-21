import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { tourResponder } from '@/data/people';
import type { Location } from '@/data/locations';
import { Reveal } from '../motion';
import { CallLink } from '../Buttons';

/**
 * The closing strip. One line, one gold button, two quiet links, one caption.
 * It sits on the footer's ink ground with rounded lower corners, so the strip and the
 * footer under it read as one closing piece.
 */
export function Closing({ location, title }: { location?: Location; title?: React.ReactNode }) {
  const r = tourResponder();
  return (
    <section className="bg-ink" aria-labelledby="closing-title">
      <div className="rounded-b-[1.75rem] bg-cobalt text-paper lg:rounded-b-[2.5rem]">
        <Reveal className="wrap flex flex-col gap-6 py-10 lg:min-h-[300px] lg:justify-center lg:gap-7 lg:py-12">
          <div>
            <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-paper/90">{location ? location.name : 'Whenever you are ready'}</p>
            <h2 id="closing-title" className="mt-3 font-display text-[length:var(--t-3xl)] leading-[1.02] tracking-[-0.03em] text-paper lg:whitespace-nowrap">
              {title ?? (
                <>
                  You can begin <span className="editorial text-butter">right here.</span>
                </>
              )}
            </h2>
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link href={location ? `/request-a-tour?center=${location.slug}` : '/request-a-tour'} className="btn-sun min-h-14 px-7">
                Request a tour <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link href={location ? `/locations/${location.slug}` : '/locations'} className="quiet-link inline-flex min-h-11 items-center gap-1.5 font-sans text-[length:var(--t-base)] font-semibold text-paper">
                {location ? `Directions to ${location.name}` : 'Find my center'} <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <CallLink location={location} place="closing" className="quiet-link inline-flex min-h-11 items-center gap-2 font-sans text-[length:var(--t-base)] font-semibold text-paper" />
            </div>
            <p className="font-sans text-[length:var(--t-sm)] text-paper/85 lg:text-right">{r ? `${r.name} will text you within one business day to confirm a time.` : 'A real person will text you within one business day.'}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
