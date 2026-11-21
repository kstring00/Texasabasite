import type { Metadata } from 'next';
import { LcCatalog } from '@/components/learn/LcCatalog';
import { LcEmpty } from '@/components/learn/LcEmpty';
import { LcPageHead } from '@/components/learn/LcPageHead';
import { lcCategories } from '@/data/learn/categories';
import { listModuleSummaries } from '@/lib/learn/content';

export const metadata: Metadata = { title: 'Learning Library', alternates: { canonical: '/learn/library' } };

export default function LearnLibraryPage() {
  const modules = listModuleSummaries();
  const categories = lcCategories.map(({ id, slug, name, cast, icon }) => ({ id, slug, name, cast, icon }));
  return (
    <>
      <LcPageHead title="Learning Library" lead="Short lessons you can do in your own time, one small step at a time. No account needed." />
      <div className="lc-section-tight">
        {modules.length > 0 ? (
          <LcCatalog modules={modules} categories={categories} />
        ) : (
          <LcEmpty title="Modules are on the way" text="Resources are being prepared for clinical review. Check back for new learning materials." action={{ href: '/learn/trainings', label: 'View trainings' }} />
        )}
      </div>
    </>
  );
}
