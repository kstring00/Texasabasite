import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CG_HOME, cgPages } from '@/data/commonGround';

const PICKS = ['/families/while-you-wait', '/families/caregiver', '/families/connect'];

/** Common Ground in one slim strip: the headline, three link pills, and the way in. */
export function CommonGroundStrip() {
  const picks = PICKS.map((href) => cgPages.find((p) => p.href === href)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <section id="common-ground" className="bg-lavender/45" aria-labelledby="cg-strip-title">
      <div className="wrap flex flex-col gap-5 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-10">
        <div>
          <p className="eyebrow">Common Ground</p>
          <h2 id="cg-strip-title" className="h2 mt-2">
            Support for you, not just <span className="editorial text-cobalt">your child.</span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {picks.map((p) => (
            <Link key={p.href} href={p.href} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/25 bg-card px-4 font-sans text-[15px] font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper">
              <p.icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
              {p.label}
            </Link>
          ))}
          <Link href={CG_HOME} className="btn-primary min-h-11">
            Open Common Ground <ArrowUpRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
