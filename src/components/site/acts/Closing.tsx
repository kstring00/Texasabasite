'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Phone } from 'lucide-react';
import { site } from '@/data/site';
import { tourResponder } from '@/data/people';
import type { Location } from '@/data/locations';
import { Reveal } from '../motion';
import { CallButton } from '../Buttons';
import { ArchDoor } from './ArchDoor';

/**
 * Act Nine: The Closing.
 * Full-bleed cobalt, one line, three doors. The end of the story is the start of theirs.
 */
export function Closing({ location, title, text }: { location?: Location; title?: React.ReactNode; text?: string }) {
  const r = tourResponder();
  const sectionRef = useRef<HTMLElement>(null);
  // One doorway per breakpoint, so the desktop page never loads the mobile copy of the video.
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setDesktop(mq.matches);
    const on = () => setDesktop(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-cobalt text-paper" aria-labelledby="closing-title">
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 hidden h-[120%] w-[40%] portal bg-paper/10 lg:block" />
      <div aria-hidden className="pointer-events-none absolute -right-4 bottom-0 hidden h-[80%] w-[26%] portal bg-butter/90 lg:block">
        {desktop && <ArchDoor sectionRef={sectionRef} mode="scrub" />}
      </div>
      <div className="wrap relative py-[calc(var(--s-5)*1.3)]">
        <Reveal>
          <p className="font-sans text-[length:var(--t-xs)] font-bold uppercase tracking-[0.2em] text-paper/90">{location ? location.name : 'Whenever you are ready'}</p>
          <h2 id="closing-title" className="display mt-5 max-w-4xl text-paper">
            {title ?? (
              <>
                You can begin <span className="editorial text-butter">right here.</span>
              </>
            )}
          </h2>
          <p className="mt-6 max-w-xl font-sans text-[length:var(--t-lg)] leading-snug text-paper/85">
            {text ?? 'A tour is about 30 to 45 minutes. You meet a BCBA, walk the rooms, and leave knowing whether this is the place. No commitment.'}
          </p>
          <p className="mt-3 font-sans text-[length:var(--t-sm)] text-paper/70">{r ? `${r.name} will text you within one business day to confirm a time.` : 'A real person will text you within one business day.'}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={location ? `/locations/${location.slug}` : '/locations'} className="btn-paper min-h-14 px-7">
              {location ? `Directions to ${location.name}` : 'Find my center'} <ArrowUpRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link href={location ? `/request-a-tour?center=${location.slug}` : '/request-a-tour'} className="btn-sun min-h-14 px-7" data-arch-play>
              Request a tour
            </Link>
            <CallButton location={location} place="closing" className="border-paper/40 text-paper hover:bg-paper hover:text-ink" label={`Call ${site.phone.display}`} />
          </div>
        </Reveal>
        {/* Phones: the doorway sits under the copy, after the buttons in DOM order. */}
        <div aria-hidden className="portal relative mt-12 h-[56svh] w-full bg-butter/90 lg:hidden">
          {desktop === false && <ArchDoor sectionRef={sectionRef} mode="play" />}
        </div>
      </div>
    </section>
  );
}
