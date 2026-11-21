import type { Metadata } from 'next';
import Link from 'next/link';
import { LcPageHead } from '@/components/learn/LcPageHead';
import { site } from '@/data/site';

export const metadata: Metadata = { title: 'Help & FAQ', alternates: { canonical: '/learn/help' } };

type Faq = { q: string; a: React.ReactNode };
const GROUPS: { id: string; title: string; items: Faq[] }[] = [
  {
    id: 'lessons',
    title: 'Using the lessons',
    items: [
      { q: 'Do I need an account?', a: <p>No. The learning modules are open to read. There is no sign-in for caregivers and nothing to install.</p> },
      { q: 'How do the lessons work?', a: <p>Each module has a few short lessons. A lesson shows one small step at a time. Use Next to go forward and Back to go back. Nothing is timed.</p> },
      { q: 'Are the questions a test?', a: <p>No. The short questions help the ideas stick. There is no score, you can try as many times as you like, and you can always move on.</p> },
      { q: 'Where is my progress saved?', a: <p>Your progress is saved on this device, in this browser only. There is no account behind it. If you clear your browser data, or use a different phone or computer, it starts over. You can also clear it yourself with “Reset progress” on any module page.</p> },
      { q: 'Can these lessons tell me what to do for my child?', a: <p>No. These educational resources support general learning. Your child’s supervising <abbr title="Board Certified Behavior Analyst">BCBA</abbr> is responsible for individualized recommendations and treatment planning.</p> },
    ],
  },
  {
    id: 'teams',
    title: 'Live trainings in Microsoft Teams',
    items: [
      { q: 'Who can attend a live training?', a: <p>Live trainings are for currently enrolled families. Clinic staff confirm enrollment after you ask to register.</p> },
      { q: 'How do I register?', a: <p>Open a training on the <Link href="/learn/trainings" className="lc-link">Live Trainings</Link> page and choose “Register through Microsoft Teams.” You will continue to Microsoft Teams to register. This website does not have its own registration form.</p> },
      { q: 'What do I need to join?', a: <p>A phone, tablet or computer with a speaker or headphones. You can join in a web browser or in the free Microsoft Teams app. Joining a few minutes early gives you time to check your sound.</p> },
      { q: 'Why is there no joining link on this website?', a: <p>Joining details come only from Microsoft Teams, by email, after your registration is approved. That keeps group sessions limited to the families they are meant for.</p> },
    ],
  },
  {
    id: 'registration-email',
    title: 'Your registration email',
    items: [
      { q: 'Where does the email come from?', a: <p>It is sent by Microsoft Teams to the email address you typed when you registered. It may arrive after staff have approved your registration, not straight away.</p> },
      { q: 'I can’t find it. What should I do?', a: <p>Look in your junk or spam folder, and check that you are looking in the same email account you registered with. If it is still missing, ask your clinical team, who can check with the training organizer.</p> },
    ],
  },
];

export default function LearnHelpPage() {
  return (
    <>
      <LcPageHead title="Help & FAQ" lead="Short answers about the lessons, live trainings and who to ask." />

      {GROUPS.map((g) => (
        <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="lc-section-tight lc-anchor">
          <h2 id={`${g.id}-title`} className="lc-h2">
            {g.title}
          </h2>
          <div className="lc-faq">
            {g.items.map((f) => (
              <details key={f.q} className="lc-surface">
                <summary>{f.q}</summary>
                <div className="lc-prose">{f.a}</div>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section id="contact" aria-labelledby="contact-title" className="lc-section-tight lc-anchor">
        <h2 id="contact-title" className="lc-h2">
          Talking with your clinical team
        </h2>
        <div className="lc-surface lc-panel">
          <div className="lc-prose">
            <p>For anything about your own child, the best person to ask is your child’s supervising BCBA, at your next session or the way you usually reach them.</p>
            <p>
              You can also call {site.name} on{' '}
              <a href={`tel:${site.phone.tel}`} className="lc-link">
                {site.phone.display}
              </a>
              . {site.phoneHours}.
            </p>
            <p>Please do not send details about your child through this website. It has no way to receive them.</p>
          </div>
        </div>
      </section>

      <p className="lc-staff-entry">
        Texas ABA Centers staff:{' '}
        <Link href="/learn/staff" className="lc-link">
          Staff sign-in
        </Link>
      </p>
    </>
  );
}
