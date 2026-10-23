import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllPosts } from '@/lib/site/blog';
import { Section } from './Section';

export function FromTheBlog() {
  const posts = getAllPosts().slice(0, 3);
  if (posts.length === 0) return null;
  return (
    <Section tone="card" eyebrow="From the blog" title="Written by the people at the centers." lede="Short, practical, with a name on every post.">
      <ul className="grid gap-4 md:grid-cols-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="card card-hover flex h-full flex-col">
              <p className="eyebrow">{p.category}</p>
              <h3 className="h3 mt-2">{p.title}</h3>
              <p className="mt-2 flex-1 text-base text-body">{p.excerpt}</p>
              <p className="mt-4 text-sm text-soft">
                {p.author}
                {p.center ? ` · ${p.center}` : ''} · {p.dateLabel}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/blog" className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-ink underline-offset-4 hover:underline">
        All posts <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </Section>
  );
}
