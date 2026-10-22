import { TourButton, CallButton } from './Buttons';
import { tourResponder } from '@/data/people';
import type { Location } from '@/data/locations';

export function FinalCta({ location, title, text }: { location?: Location; title?: string; text?: string }) {
  const r = tourResponder();
  return (
    <section className="bg-ink py-16 text-paper sm:py-20">
      <div className="wrap grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <h2 className="font-serif text-3xl leading-tight text-paper sm:text-4xl">
            {title ?? (location ? `Come see the ${location.name} center.` : 'Come see a center. Bring every question.')}
          </h2>
          <p className="mt-4 max-w-xl text-lg text-paper/80">
            {text ?? 'A tour is about 30 to 45 minutes. You meet a BCBA, walk the rooms, and leave knowing whether this is the place. No commitment.'}
          </p>
          <p className="mt-3 text-sm text-paper/70">
            {r ? `${r.name} will text you within one business day to confirm a time.` : 'We will text you within one business day to confirm a time.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <TourButton center={location?.slug} size="lg" className="bg-sun text-ink hover:bg-sun/90" />
          <CallButton location={location} place="final-cta" className="border-paper/30 bg-transparent text-paper hover:bg-paper/10" />
        </div>
      </div>
    </section>
  );
}
