import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LcEmpty } from '@/components/learn/LcEmpty';
import { LcIconTile } from '@/components/learn/LcIcon';
import { LcModuleCard } from '@/components/learn/LcModuleCard';
import { LcBack } from '@/components/learn/LcPageHead';
import { getLcCategory, lcCategories } from '@/data/learn/categories';
import { listModuleSummaries } from '@/lib/learn/content';

type Params = { params: Promise<{ categorySlug: string }> };

export function generateStaticParams() {
  return lcCategories.map((c) => ({ categorySlug: c.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = getLcCategory((await params).categorySlug);
  return c ? { title: c.name, description: c.intro, alternates: { canonical: `/learn/topics/${c.slug}` } } : {};
}

export default async function LearnTopicPage({ params }: Params) {
  const category = getLcCategory((await params).categorySlug);
  if (!category) notFound();
  const modules = listModuleSummaries().filter((m) => m.categoryId === category.id);
  const others = lcCategories.filter((c) => c.id !== category.id);
  return (
    <div data-cast={category.cast}>
      <LcBack href="/learn/library" label="Learning Library" />
      <header className="lc-surface lc-pagehead lc-pagehead-topic">
        <LcIconTile name={category.icon} />
        <div>
          <p className="lc-eyebrow">Topic</p>
          <h1 className="lc-h1">{category.name}</h1>
          <p className="lc-lead lc-pagehead-lead">{category.intro}</p>
        </div>
      </header>

      <section aria-labelledby="lc-topic-modules" className="lc-section-tight">
        <h2 id="lc-topic-modules" className="lc-h2">
          Modules in this topic
        </h2>
        {modules.length > 0 ? (
          <ul className="lc-card-grid">
            {modules.map((m) => (
              <li key={m.id}>
                <LcModuleCard module={m} category={{ name: category.name, cast: category.cast, icon: category.icon }} />
              </li>
            ))}
          </ul>
        ) : (
          <LcEmpty title="Nothing here yet" text="Resources are being prepared for clinical review. Check back for new learning materials." action={{ href: '/learn/library', label: 'Browse all modules' }} />
        )}
      </section>

      <section aria-labelledby="lc-topic-others" className="lc-section">
        <h2 id="lc-topic-others" className="lc-h2">
          Other topics
        </h2>
        <ul className="lc-inline-links lc-inline-links-lg">
          {others.map((c) => (
            <li key={c.id}>
              <Link href={`/learn/topics/${c.slug}`}>{c.name}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
