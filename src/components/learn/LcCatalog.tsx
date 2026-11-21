'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import type { LcCast, LcIconName } from '@/data/learn/categories';
import type { LcModuleSummary } from '@/lib/learn/content';
import { filterModules } from '@/lib/learn/search';
import { LcModuleCard } from './LcModuleCard';

export type LcCatalogCategory = { id: string; slug: string; name: string; cast: LcCast; icon: LcIconName };

/** The searchable library. Search is a labelled field, never an icon alone. */
export function LcCatalog({ modules, categories }: { modules: LcModuleSummary[]; categories: LcCatalogCategory[] }) {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const inputId = useId();
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const results = useMemo(() => filterModules(modules, query, categoryId, (id) => byId.get(id)?.name ?? ''), [modules, query, categoryId, byId]);
  const filtering = query.trim() !== '' || categoryId !== null;
  const clear = () => {
    setQuery('');
    setCategoryId(null);
  };

  return (
    <div className="lc-catalog">
      <div className="lc-surface lc-catalog-tools">
        <div className="lc-field">
          <label htmlFor={inputId} className="lc-label">
            Search learning topics
          </label>
          <div className="lc-search">
            <Search width={20} height={20} strokeWidth={1.75} aria-hidden="true" className="lc-search-icon" />
            <input
              id={inputId}
              type="search"
              className="lc-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="For example: routines"
              autoComplete="off"
              enterKeyHint="search"
            />
            {query ? (
              <button type="button" className="lc-search-clear" onClick={() => setQuery('')}>
                <X width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
                Clear
              </button>
            ) : null}
          </div>
        </div>
        <div role="group" aria-label="Filter by topic" className="lc-filters">
          <button type="button" className="lc-filter" aria-pressed={categoryId === null} onClick={() => setCategoryId(null)}>
            All topics
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" className="lc-filter" data-cast={c.cast} aria-pressed={categoryId === c.id} onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <p className="lc-catalog-count" role="status">
        {results.length === 0 ? 'No modules match.' : `${results.length} ${results.length === 1 ? 'module' : 'modules'}${filtering ? ' match' + (results.length === 1 ? 'es' : '') : ''}`}
      </p>

      {results.length > 0 ? (
        <ul className="lc-card-grid">
          {results.map((m) => {
            const c = byId.get(m.categoryId);
            return c ? (
              <li key={m.id}>
                <LcModuleCard module={m} category={c} headingLevel={2} />
              </li>
            ) : null;
          })}
        </ul>
      ) : (
        <div className="lc-surface lc-empty">
          <p className="lc-empty-title">Nothing matches that yet</p>
          <p className="lc-muted">Try a different word, or clear the search to see every module.</p>
          <button type="button" className="lc-btn lc-btn-primary" onClick={clear}>
            Clear search and filters
          </button>
          <ul className="lc-inline-links" aria-label="Browse a topic">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/learn/topics/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
