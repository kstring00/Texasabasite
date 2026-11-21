import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/site/blog';
import { cgPages } from '@/data/commonGround';
import { BlogHero } from '@/components/site/acts/BlogHero';
import { Closing as FinalCta } from '@/components/site/acts/Closing';

export const metadata: Metadata = {
  title: 'Blog: Plain Answers for Texas Autism Families',
  description: 'Short, practical posts from the people at Texas ABA Centers: what a first day looks like, how insurance works, and what to do while you wait.',
  alternates: { canonical: '/blog' },
};

const describe = (href: string) => cgPages.find((p) => p.href === href)?.description ?? '';

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <>
      <BlogHero
        panels={[
          { eyebrow: 'Latest', headline: 'Plain answers, with a name on every post.', description: 'Short and practical. Written by the people at the centers, not a content farm.', cta: 'Read the latest', href: posts[0] ? `/blog/${posts[0].slug}` : '#posts' },
          { eyebrow: 'Clinical perspective', headline: 'Supporting behavioral growth.', description: describe('/families/at-home'), cta: 'Explore strategies', href: '/families/at-home' },
          { eyebrow: 'Family & caregiver resources', headline: 'Tools for everyday success.', description: describe('/families/resources'), cta: 'Browse resources', href: '/families/resources' },
        ]}
      />
      <section id="posts" className="scroll-mt-24 py-[calc(var(--s-5)*0.8)]" aria-labelledby="posts-title">
        <div className="wrap">
          <h2 id="posts-title" className="eyebrow mb-3">
            All posts
          </h2>
          {posts.length === 0 ? (
            <p className="text-base text-body">First posts are on the way.</p>
          ) : (
            <ul className="divide-y divide-ink/15 border-y border-ink/15">
              {posts.map((p, i) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="group grid gap-x-6 gap-y-1.5 py-5 md:grid-cols-12 md:items-baseline">
                    <span className="num text-[length:var(--t-xl)] leading-none text-cobalt md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                    <span className="md:col-span-8">
                      <span className="eyebrow">{p.category}</span>
                      <h3 className="h3 mt-1.5 underline-offset-8 group-hover:underline">{p.title}</h3>
                      <p className="mt-1.5 max-w-2xl font-sans text-[length:var(--t-base)] leading-snug text-body">{p.excerpt}</p>
                    </span>
                    <span className="font-sans text-[length:var(--t-sm)] text-soft md:col-span-3 md:text-right">
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
        </div>
      </section>
      <FinalCta />
    </>
  );
}
