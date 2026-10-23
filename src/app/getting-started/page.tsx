import type { Metadata } from 'next';
import { steps } from '@/data/steps';
import { Section } from '@/components/site/Section';
import { StepPath } from '@/components/site/StepPath';
import { FinalCta } from '@/components/site/FinalCta';
import { CommonGroundBridge } from '@/components/site/HomeSections';

export const metadata: Metadata = {
  title: 'Getting Started with ABA Therapy in Texas: The 5 Steps',
  description: 'From first worry to first day in five steps: talk to a person, evaluation if needed, free benefits check, tour, first day. Who you meet, what to bring, how long each takes.',
  alternates: { canonical: '/getting-started' },
};

export default function GettingStartedPage() {
  return (
    <>
      <Section titleAs="h1" eyebrow="Getting started" title="From first worry to first day." lede="Nobody should have to guess what happens next. Here is every step, who you meet, what to bring, and how long it usually takes.">
        <StepPath compact />
      </Section>
      {steps.map((s, i) => (
        <Section key={s.slug} id={s.slug} tone={i % 2 ? 'tint' : 'paper'} className="py-12 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow">Step {s.n}</p>
              <h2 className="h2 mt-2">{s.title}</h2>
              <p className="lede mt-3">{s.short}</p>
              <p className="mt-4 text-sm text-soft">Answers: {s.answers}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Fact label="Who you meet" text={s.whoYouMeet} />
              <Fact label="What to bring" text={s.whatToBring} />
              <Fact label="How long" text={s.howLong} />
              <Fact label="What happens next" text={s.whatsNext} />
              <div className="card sm:col-span-2">
                <p className="label">What happens</p>
                <ol className="list-decimal space-y-1 pl-5 text-base text-body">
                  {s.whatHappens.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </Section>
      ))}
      <CommonGroundBridge />
      <FinalCta title="Ready for step one?" text="Request a tour or call. Either way a real person replies, and you can stop at any step." />
    </>
  );
}

function Fact({ label, text }: { label: string; text: string }) {
  return (
    <div className="card">
      <p className="label">{label}</p>
      <p className="text-base text-body">{text}</p>
    </div>
  );
}
