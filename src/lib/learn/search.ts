/** Library search: plain, forgiving matching over a module's title, summary and topic labels. */
export type LcSearchable = { title: string; summary: string; topics: string[]; categoryId: string };

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

export function matchesSearch(m: LcSearchable, query: string, categoryName = ''): boolean {
  const words = norm(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const hay = norm([m.title, m.summary, categoryName, ...m.topics].join(' '));
  return words.every((w) => hay.includes(w));
}

export function filterModules<T extends LcSearchable>(list: T[], query: string, categoryId: string | null, categoryName: (id: string) => string): T[] {
  return list.filter((m) => (!categoryId || m.categoryId === categoryId) && matchesSearch(m, query, categoryName(m.categoryId)));
}
