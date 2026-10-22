import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPost } from '@/lib/site/blog';
import { FinalCta } from '@/components/site/FinalCta';
import { BlogReadTracker } from '@/components/site/BlogReadTracker';

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return { title: p.title, description: p.excerpt, alternates: { canonical: `/blog/${p.slug}` } };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  return (
    <>
      <BlogReadTracker slug={p.slug} />
      <article className="wrap max-w-3xl py-14 sm:py-20">
        <p className="eyebrow">
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>{' '}
          · {p.category}
        </p>
        <h1 className="h1 mt-3">{p.title}</h1>
        <p className="mt-4 text-base text-soft">
          By <span className="font-semibold text-ink">{p.author}</span>
          {p.authorTitle ? `, ${p.authorTitle}` : ''}
          {p.center && p.centerSlug ? (
            <>
              {' '}
              ·{' '}
              <Link href={`/locations/${p.centerSlug}`} className="underline-offset-4 hover:underline">
                {p.center}
              </Link>
            </>
          ) : null}{' '}
          · {p.dateLabel}
        </p>
        <div className="prose-site mt-10 text-lg">
          <MDXRemote source={p.content} />
        </div>
      </article>
      <FinalCta />
    </>
  );
}
