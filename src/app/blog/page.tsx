import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/site/blog';
import { Section } from '@/components/site/Section';
import { Closing as FinalCta } from '@/components/site/acts/Closing';

export const metadata: Metadata = {
  title: 'Blog: Plain Answers for Texas Autism Families',
  description: 'Short, practical posts from the people at Texas ABA Centers: what a first day looks like, how insurance works, and what to do while you wait.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <>
      <Section titleAs="h1" eyebrow="Blog" title="Plain answers, with a name on every post." lede="Short and practical. Written by the people at the centers, not a content farm.">
        {posts.length === 0 ? (
          <p className="text-base text-body">First posts are on the way.</p>
        ) : (
          <ul className="divide-y divide-ink/15 border-t border-ink/15">
            {posts.map((p, i) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group grid gap-3 py-8 md:grid-cols-12 md:gap-6">
                  <span className="num text-[length:var(--t-2xl)] leading-none text-cobalt md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                  <span className="md:col-span-7">
                    <span className="eyebrow">{p.category}</span>
                    <h2 className="h2 mt-2 group-hover:underline underline-offset-8">{p.title}</h2>
                    <p className="mt-3 max-w-2xl font-sans text-[length:var(--t-base)] text-body">{p.excerpt}</p>
                  </span>
                  <span className="font-sans text-[length:var(--t-sm)] text-soft md:col-span-4 md:text-right">
                    {p.author}
                    {p.center ? ` · ${p.center}` : ''}
                    <br />
                    {p.dateLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <FinalCta />
    </>
  );
}
