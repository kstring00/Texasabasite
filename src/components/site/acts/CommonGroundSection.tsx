import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Section } from '../Section';
import { RevealGroup, RevealItem } from '../motion';
import { CG_HOME, cgPages } from '@/data/commonGround';

const PICKS = ['/families/while-you-wait', '/families/pulse', '/families/connect'];

/** Homepage: Common Ground, right after Getting Started. Three doors in, in the site card style. */
export function CommonGroundSection() {
  const cards = PICKS.map((href) => cgPages.find((p) => p.href === href)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <Section id="common-ground" eyebrow="Common Ground" title={<>Support for you, not just <span className="editorial text-cobalt">your child.</span></>} lede="The parent side of care has its own front door, open before your child is enrolled anywhere. Free for every family. No account.">
      <RevealGroup as="ul" className="grid gap-5 md:grid-cols-3" stagger={0.06}>
        {cards.map((p) => (
          <RevealItem as="li" key={p.href}>
            <Link href={p.href} className="card card-hover group flex h-full flex-col rounded-[28px] bg-transparent p-7">
              <p.icon className="h-6 w-6 text-cobalt" strokeWidth={1.8} aria-hidden />
              <span className="mt-6 block font-display text-[length:var(--t-xl)] leading-tight text-ink">{p.label}</span>
              <span className="mt-3 block font-sans text-[length:var(--t-base)] text-body">{p.description}</span>
              <span className="mt-auto flex justify-end pt-6"><ArrowUpRight className="h-5 w-5 text-ink/50 transition group-hover:text-cobalt" aria-hidden /></span>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
      <div className="mt-8">
        <Link href={CG_HOME} className="btn-secondary">
          Open Common Ground <ArrowUpRight className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </Section>
  );
}
