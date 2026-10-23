'use client';

import { useEffect } from 'react';
import { track } from '@/lib/site/analytics';

export function BlogReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    track({ name: 'blog_read', slug });
  }, [slug]);
  return null;
}
