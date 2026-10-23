import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCenterModelBySlug } from '@/data/centerModels';
import { getLocation } from '@/data/locations';
import { StepInsideExperience } from '@/components/step-inside/StepInsideExperience';
import { RememberCenter } from '@/lib/site/myCenter';

export const metadata: Metadata = {
  title: 'Step Inside the Sugar Land Center',
  description: 'An illustrative, explorable miniature of the Sugar Land center: eight rooms, a guided tour, and the path to progress. Rooms and sizes are placeholders until the verified floor plan is added.',
  alternates: { canonical: '/locations/sugar-land/inside' },
};

export default function StepInsidePage() {
  const model = getCenterModelBySlug('sugar-land');
  const l = getLocation('sugar-land');
  if (!model || !l) notFound();
  const link = 'text-soft underline-offset-4 hover:text-ink hover:underline';
  return (
    <div className="wrap pb-[var(--s-5)] pt-6">
      <RememberCenter centerId={model.centerId} />
      <nav aria-label="Breadcrumb" className="font-sans text-[14px] text-soft">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li><Link href="/" className={link}>Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/locations" className={link}>Locations</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/locations/${l.slug}`} className={link}>{l.name}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">Step inside</li>
        </ol>
      </nav>

      <header className="mt-8 max-w-4xl">
        <p className="eyebrow">{l.name} · Step inside</p>
        <h1 className="display mt-5 text-[length:var(--t-3xl)] lg:text-[length:var(--t-hero)]">
          Step inside{' '}
          <span className="relative inline-block">
            <span className="editorial text-cobalt">the journey.</span>
            <svg className="absolute -bottom-1 left-0 h-[0.22em] w-full" viewBox="0 0 220 22" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d="M4 18 C 50 10, 120 22, 216 4" fill="none" stroke="rgb(var(--butter))" strokeWidth="9" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="lede mt-6 max-w-[36ch]">Discover the spaces, experiences, and everyday moments that help children learn, connect, and grow.</p>
      </header>
      <StepInsideExperience model={model} poster="/step-inside/sugarland-poster.webp" />
    </div>
  );
}
