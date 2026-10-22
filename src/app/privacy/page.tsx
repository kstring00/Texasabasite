import type { Metadata } from 'next';
import { site } from '@/data/site';
import { Section } from '@/components/site/Section';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Texas ABA Centers handles the information you share on this website.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <Section titleAs="h1" eyebrow="Privacy" title="What we collect on this site, and why.">
      <div className="prose-site max-w-3xl">
        <p>
          <strong>Draft for review.</strong> This policy covers the website only. It is a plain-language draft for Texas ABA Centers&rsquo; legal and compliance team to finalize before launch.
        </p>
        <h2>What you give us</h2>
        <p>
          When you request a tour or a benefits check, we ask for your first name, a phone number, your preferred center, times that work, and optionally your email, your child&rsquo;s age range, your preferred language, and a short note. We ask you not to include medical details in the note. We do not collect diagnosis information, medical history, or insurance identifiers through this website.
        </p>
        <h2>What we do with it</h2>
        <p>We use it to contact you about the tour or benefits check you asked for. It is sent to our admissions team by email and stored in our systems. We do not sell it.</p>
        <h2>What we collect automatically</h2>
        <p>
          We use privacy-respecting analytics to count page views and which buttons are tapped, so we can see which pages help families. We record the campaign tags (utm) and the referring site that brought you here. We do not use advertising cookies on this site.
        </p>
        <h2>Common Ground</h2>
        <p>
          Common Ground, our parent support area, saves your check-ins and plans in your own browser. Nothing you enter there is sent to Texas ABA Centers unless you choose to email it to yourself or share it with your care team.
        </p>
        <h2>Your choices</h2>
        <p>
          You can ask us to delete your tour request at any time by calling {site.phone.display}.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about privacy: call {site.phone.display}, {site.phoneHours.toLowerCase()}.
        </p>
        <p className="text-sm text-soft">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
      </div>
    </Section>
  );
}
