import type { Metadata } from 'next';
import { insurance } from '@/data/insurance';
import { Section } from '@/components/site/Section';
import { InsuranceExplainer } from '@/components/site/acts/InsuranceExplainer';
import { Closing } from '@/components/site/acts/Closing';
import { DrawnRow } from '@/components/site/acts/DrawnRow';

export const metadata: Metadata = {
  title: 'Insurance & Cost of ABA Therapy in Texas',
  description: 'We verify your benefits for free before you commit. Plain-English guide to deductibles, copays, coinsurance and out-of-pocket max, plus the Texas autism insurance mandate and Medicaid.',
  alternates: { canonical: '/insurance' },
};

export default function InsurancePage() {
  return (
    <>
      <Section titleAs="h1" eyebrow="Insurance & cost" title={<>Know the cost <span className="editorial text-cobalt">before</span> you commit.</>} lede={insurance.freeVerification}>
        {insurance.plans.length > 0 && (
          <ul className="mb-6 flex flex-wrap gap-2" aria-label="Plans we work with">
            {insurance.plans.map((p) => (
              <li key={p.name} className="chip">
                {p.name}
              </li>
            ))}
          </ul>
        )}
        <InsuranceExplainer repeatNote={false} />
      </Section>
      {/* Slim band: the two statements side by side, at half the usual padding. The wording is the law's summary, word for word. */}
      <section className="bg-sage text-ink" aria-labelledby="tx-law-title">
        <div className="wrap grid gap-x-10 gap-y-5 py-[calc(var(--s-5)/2)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <p className="eyebrow !text-ink">What Texas law says</p>
            <h2 id="tx-law-title" className="h3 mt-2">Two things that are true in Texas.</h2>
          </div>
          <p className="border-t border-ink/25 pt-4 font-sans text-[length:var(--t-base)] leading-snug text-ink lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">{insurance.mandate}</p>
          <p className="border-t border-ink/25 pt-4 font-sans text-[length:var(--t-base)] leading-snug text-ink lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">{insurance.medicaidNote}</p>
        </div>
      </section>
      <section aria-labelledby="next-title">
        <div className="wrap py-8 lg:py-9">
          <div className="mb-5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <p className="eyebrow">After you submit</p>
            <h2 id="next-title" className="h3">
              What happens <span className="editorial text-cobalt">next.</span>
            </h2>
          </div>
          <DrawnRow items={insurance.afterYouSubmit} label="What happens after you submit, in order" />
        </div>
      </section>
      <Closing title={<>Want the numbers <span className="editorial text-butter">first?</span></>} />
    </>
  );
}
