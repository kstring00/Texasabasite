import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { lcCategories, type LcCast, type LcIconName } from '@/data/learn/categories';
import { LcIconTile } from './LcIcon';
import { LcOrb } from './LcOrb';

const PATHS: { href: string; cast: LcCast; icon: LcIconName; title: string; text: string; cta: string }[] = [
  { href: '/learn/library', cast: 'teal', icon: 'book-open', title: 'Explore Learning Modules', text: 'Short, interactive lessons you can complete anytime.', cta: 'Explore modules' },
  { href: '/learn/trainings', cast: 'coral', icon: 'video', title: 'Upcoming Live Trainings', text: 'Virtual group sessions for currently enrolled families.', cta: 'View trainings' },
];

const STEPS: { icon: LcIconName; title: string; text: string }[] = [
  { icon: 'search', title: 'Choose a topic', text: 'Pick something you want to understand better. There is no wrong place to start.' },
  { icon: 'list-checks', title: 'Follow simple steps', text: 'Each lesson is one small step at a time. You can stop anywhere and come back.' },
  { icon: 'video', title: 'Explore live training options', text: 'Currently enrolled families can join virtual group trainings with the clinical team.' },
];

/** The hero: one glass panel, the orb cropped by its corner, and the two equal paths inside it. */
export function LcHero() {
  return (
    <section className="lc-glass lc-hero" aria-labelledby="lc-hero-title">
      <div className="lc-hero-orb">
        <LcOrb />
      </div>
      <div className="lc-hero-copy">
        <p className="lc-eyebrow">Sugar Land pilot</p>
        <h1 id="lc-hero-title" className="lc-h-hero">
          Practical learning for <span className="lc-text-light">everyday life.</span>
        </h1>
        <p className="lc-lead">Build understanding at your own pace or join a live caregiver training with your clinical team.</p>
      </div>
      <div className="lc-hero-choices">
        {PATHS.map((p) => (
          <Link key={p.href} href={p.href} className="lc-surface lc-choice lc-lift" data-cast={p.cast}>
            <LcIconTile name={p.icon} size="lg" />
            <span className="lc-choice-text">
              <span className="lc-choice-title">{p.title}</span>
              <span className="lc-choice-sub">{p.text}</span>
            </span>
            <span className="lc-btn lc-btn-primary lc-choice-cta">
              {p.cta} <ArrowRight width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Six topics, six hues. The whole tile is the target. */
export function LcTopicGrid() {
  return (
    <section aria-labelledby="lc-topics-title" className="lc-section">
      <h2 id="lc-topics-title" className="lc-h2">Browse by topic</h2>
      <ul className="lc-topic-grid">
        {lcCategories.map((c) => (
          <li key={c.id}>
            <Link href={`/learn/topics/${c.slug}`} className="lc-surface lc-topic lc-lift" data-cast={c.cast}>
              <LcIconTile name={c.icon} />
              <span className="lc-topic-name">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LcHowItWorks() {
  return (
    <section aria-labelledby="lc-how-title" className="lc-section">
      <h2 id="lc-how-title" className="lc-h2">How learning works</h2>
      <ol className="lc-how-grid" data-cast="slate">
        {STEPS.map((s, i) => (
          <li key={s.title} className="lc-surface lc-how">
            <LcIconTile name={s.icon} size="sm" />
            <div>
              <h3 className="lc-h3">
                <span className="lc-sr-only">Step {i + 1}: </span>
                {s.title}
              </h3>
              <p className="lc-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
