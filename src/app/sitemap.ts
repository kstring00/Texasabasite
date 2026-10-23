import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
import { locations } from '@/data/locations';
import { services } from '@/data/services';
import { getAllPosts } from '@/lib/site/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, '');
  const now = new Date();
  const fixed = ['', '/locations', '/services', '/getting-started', '/request-a-tour', '/insurance', '/team', '/events', '/blog', '/providers', '/contact', '/privacy', '/es', '/families', '/families/connect', '/families/what-is-aba', '/families/resources', '/families/caregiver'];
  return [
    ...fixed.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 })),
    ...locations.map((l) => ({ url: `${base}/locations/${l.slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.9 })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...getAllPosts().map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.date), changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}
