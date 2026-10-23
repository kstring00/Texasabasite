import type { Metadata } from 'next';
import { site } from '@/data/site';
import { services } from '@/data/services';
import { visiblePeople } from '@/data/people';
import { Section } from '@/components/site/Section';
import { PeopleCards } from '@/components/site/PeopleCards';
import { CallButton } from '@/components/site/Buttons';

export const metadata: Metadata = {
  title: 'For Pediatricians & Therapists: Refer a Family',
  description: 'How to refer a family to Texas ABA Centers for an autism evaluation or ABA therapy: who to contact, what we need, and how fast we respond.',
  alternates: { canonical: '/providers' },
};

export default function ProvidersPage() {
  const contact = visiblePeople.filter((p) => p.title === 'Business Development Lead');
  return (
    <>
      <Section titleAs="h1" eyebrow="For providers" title="Refer a family in one call." lede="Pediatricians, therapists, ECI, and school teams: we take referrals directly and we do the diagnostic evaluation in-house, so a family you refer is not sent to a second waitlist.">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="card">
            <p className="eyebrow">Who to contact</p>
            <p className="mt-2 text-base text-body">{contact[0] ? `${contact[0].name}, ${contact[0].title}.` : 'Our admissions team.'} Call {site.phone.display}.</p>
          </div>
          <div className="card">
            <p className="eyebrow">What we need</p>
            <ul className="mt-2 list-disc pl-5 text-base text-body">
              <li>Family name and a phone number they have agreed to share</li>
              <li>Child&rsquo;s age and preferred center</li>
              <li>Any existing diagnosis or report, if you have one</li>
            </ul>
          </div>
          <div className="card">
            <p className="eyebrow">How fast</p>
            <p className="mt-2 text-base text-body">We reach the family within one business day and tell you when we have.</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <CallButton place="providers" variant="primary" label={`Call ${site.phone.display}`} />
        </div>
        {contact.length > 0 && (
          <div className="mt-10">
            <PeopleCards people={contact} compact />
          </div>
        )}
      </Section>
      <Section tone="tint" title="What we offer families you refer">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug} className="card">
              <p className="font-semibold text-ink">{s.name}</p>
              <p className="text-sm text-soft">{s.ages}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
