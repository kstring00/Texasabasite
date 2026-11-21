import type { Metadata } from 'next';
import Link from 'next/link';
import { LcDemoStrip } from '@/components/learn/LcDemo';
import { LcPageHead } from '@/components/learn/LcPageHead';

export const metadata: Metadata = { title: 'Privacy for the Learning Center', alternates: { canonical: '/learn/privacy' } };

export default function LearnPrivacyPage() {
  return (
    <div data-lc-scene="reading">
      <LcPageHead title="Privacy for the Learning Center" lead="A plain description of what the Caregiver Learning Center does and does not keep." />
      <div className="lc-section-tight lc-doc">
        <LcDemoStrip>Draft. This note is waiting for review by the organization and is not an official privacy notice.</LcDemoStrip>
        <section className="lc-surface lc-panel">
          <div className="lc-prose">
            <h2 className="lc-h2">What we do not ask for</h2>
            <p>You do not need an account to read lessons or look at trainings. The Learning Center does not ask for your name, your child’s name, a diagnosis, or anything else about your family.</p>

            <h2 className="lc-h2">Lesson progress stays on your device</h2>
            <p>When you move through a lesson, your place is saved in this browser so you can come back to it. It records which step of which module you reached and the last answer you chose. It is not sent to us, and it is not linked to a name. Clearing your browser data removes it, and so does “Reset progress” on any module page.</p>

            <h2 className="lc-h2">Page visits</h2>
            <p>The Texas ABA Centers website counts page visits without identifying visitors, and that includes pages in the Learning Center. The Learning Center does not record which lessons a person starts, the answers they choose, or whether they open a registration link.</p>

            <h2 className="lc-h2">Registering for a live training</h2>
            <p>Registration happens in Microsoft Teams, not on this website. What you type there goes to Microsoft Teams and to the staff who run the training. This website does not receive it and does not keep lists of who registered or attended.</p>

            <h2 className="lc-h2">The rest of the website</h2>
            <p>
              This note covers the Learning Center only. For everything else, see the{' '}
              <Link href="/privacy" className="lc-link">
                Texas ABA Centers privacy policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
