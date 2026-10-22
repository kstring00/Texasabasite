import type { Metadata } from 'next';
import { insurance } from '@/data/insurance';
import { Section } from '@/components/site/Section';
import { CoverageButton } from '@/components/site/Buttons';
import { FinalCta } from '@/components/site/FinalCta';

export const metadata: Metadata = {
  title: 'Insurance & Cost of ABA Therapy in Texas',
  description: 'We verify your benefits for free before you commit. Plain-English guide to deductibles, copays, coinsurance and out-of-pocket max, plus the Texas autism insurance mandate and Medicaid.',
  alternates: { canonical: '/insurance' },
};

export default function InsurancePage() {
  return (
    <>
      <Section titleAs="h1" eyebrow="Insurance & cost" title="Know the cost before you commit." lede={insurance.freeVerification}>
        {insurance.plans.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Plans we work with">
            {insurance.plans.map((p) => (
              <li key={p.name} className="chip">
                {p.name}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6">
          <CoverageButton place="insurance-page" className="btn-primary" />
        </div>
      </Section>
      <Section tone="tint" title="The words on your insurance card, in plain English">
        <dl className="grid gap-4 md:grid-cols-2">
          {insurance.costTerms.map((t) => (
            <div key={t.term} className="card">
              <dt className="font-semibold text-ink">{t.term}</dt>
              <dd className="text-base text-body">{t.plain}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section title="What Texas law says">
        <div className="grid gap-4 md:grid-cols-2">
          <p className="card text-base text-body">{insurance.mandate}</p>
          <p className="card text-base text-body">{insurance.medicaidNote}</p>
        </div>
      </Section>
      <Section tone="card" title="What happens after you submit">
        <ol className="grid gap-4 md:grid-cols-4">
          {insurance.afterYouSubmit.map((a, i) => (
            <li key={a} className="card">
              <span className="font-serif text-3xl text-plum">{i + 1}</span>
              <p className="mt-2 text-base text-body">{a}</p>
            </li>
          ))}
        </ol>
      </Section>
      <FinalCta title="Want the numbers first?" text="Start with a free benefits check. Add the tour on the same call if you like." />
    </>
  );
}
