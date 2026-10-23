import type { Metadata } from 'next';
import { insurance } from '@/data/insurance';
import { Section } from '@/components/site/Section';
import { InsuranceExplainer } from '@/components/site/acts/InsuranceExplainer';
import { Closing } from '@/components/site/acts/Closing';
import { RevealGroup, RevealItem } from '@/components/site/motion';

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
          <ul className="mb-10 flex flex-wrap gap-2" aria-label="Plans we work with">
            {insurance.plans.map((p) => (
              <li key={p.name} className="chip">
                {p.name}
              </li>
            ))}
          </ul>
        )}
        <InsuranceExplainer />
      </Section>
      <Section tone="sage" eyebrow="What Texas law says" title="Two things that are true in Texas.">
        <div className="grid gap-4 md:grid-cols-2">
          <p className="rounded-[var(--radius)] bg-paper/70 p-6 font-sans text-[length:var(--t-base)] text-ink">{insurance.mandate}</p>
          <p className="rounded-[var(--radius)] bg-paper/70 p-6 font-sans text-[length:var(--t-base)] text-ink">{insurance.medicaidNote}</p>
        </div>
      </Section>
      <Section eyebrow="After you submit" title={<>What happens <span className="editorial text-cobalt">next.</span></>}>
        <RevealGroup as="ol" className="grid gap-4 md:grid-cols-4">
          {insurance.afterYouSubmit.map((a, i) => (
            <RevealItem as="li" key={a} className="border-t border-ink/15 pt-5">
              <span className="num text-[length:var(--t-3xl)] leading-none text-cobalt">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-3 font-sans text-[length:var(--t-base)] text-body">{a}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
      <Closing title={<>Want the numbers <span className="editorial text-butter">first?</span></>} text="Start with a free benefits check. Add the tour on the same call if you like." />
    </>
  );
}
