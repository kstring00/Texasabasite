import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/site/blog';
import { Section } from '@/components/site/Section';
import { FinalCta } from '@/components/site/FinalCta';

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
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="card card-hover flex h-full flex-col">
                  <p className="eyebrow">{p.category}</p>
                  <h2 className="h3 mt-2">{p.title}</h2>
                  <p className="mt-2 flex-1 text-base text-body">{p.excerpt}</p>
                  <p className="mt-4 text-sm text-soft">
                    {p.author}
                    {p.center ? ` · ${p.center}` : ''} · {p.dateLabel}
                  </p>
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
