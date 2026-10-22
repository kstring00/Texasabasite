import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getLocation } from '@/data/locations';

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorTitle?: string;
  center?: string; // display name
  centerSlug?: string;
  category: string;
  date: string;
  dateLabel: string;
  content: string;
};

const DIR = path.join(process.cwd(), 'content', 'blog');

export function getAllPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => readPost(f.replace(/\.mdx$/, '')))
    .filter((p): p is Post => Boolean(p))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | null {
  return readPost(slug);
}

function readPost(slug: string): Post | null {
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  const centerSlug = typeof data.center === 'string' ? data.center : undefined;
  const center = centerSlug ? getLocation(centerSlug)?.name : undefined;
  const date = String(data.date ?? '1970-01-01');
  return {
    slug,
    title: String(data.title ?? slug),
    excerpt: String(data.excerpt ?? ''),
    author: String(data.author ?? 'Texas ABA Centers'),
    authorTitle: data.authorTitle ? String(data.authorTitle) : undefined,
    center,
    centerSlug,
    category: String(data.category ?? 'Families'),
    date,
    dateLabel: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    content,
  };
}
