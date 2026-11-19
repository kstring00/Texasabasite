import type { Metadata } from 'next';
import Link from 'next/link';
import { LcDemoStrip } from '@/components/learn/LcDemo';
import { LcPageHead } from '@/components/learn/LcPageHead';

export const metadata: Metadata = { title: 'Accessibility', alternates: { canonical: '/learn/accessibility' } };

export default function LearnAccessibilityPage() {
  return (
    <div data-lc-scene="reading">
      <LcPageHead title="Accessibility" lead="How the Caregiver Learning Center is built to be usable by as many people as possible." />
      <div className="lc-section-tight lc-doc">
        <LcDemoStrip>Draft. This statement is waiting for review by the organization. It describes what we are aiming for, not a certified result.</LcDemoStrip>
        <section className="lc-surface lc-panel">
          <div className="lc-prose">
            <h2 className="lc-h2">What we are aiming for</h2>
            <p>We are building the Learning Center to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. It has not yet had an independent review, and it has not yet been tested with a range of screen readers on real devices.</p>

            <h2 className="lc-h2">What is built in</h2>
            <ul>
              <li>Every lesson works with a keyboard alone, and shows clearly where you are on the page.</li>
              <li>Lesson slides are real text, with a description, not pictures of text.</li>
              <li>Nothing is timed, nothing plays by itself, and no lesson needs you to drag or swipe.</li>
              <li>Feedback on questions is given in words and is read out by screen readers.</li>
              <li>Pages work on a small phone and when text is enlarged.</li>
              <li>Movement on the page is switched off when your device asks for reduced motion.</li>
            </ul>

            <h2 className="lc-h2">Live trainings</h2>
            <p>Live trainings are held in Microsoft Teams, which has its own accessibility features, including live captions. If you need something else to take part, tell your clinical team before the training.</p>

            <h2 className="lc-h2">If something does not work for you</h2>
            <p>
              Please tell your clinical team, or use the contact details on the{' '}
              <Link href="/learn/help#contact" className="lc-link">
                Help page
              </Link>
              . Say which page you were on and what happened, and we will look into it.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
