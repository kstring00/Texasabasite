'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CG_HOME, cgLocate } from '@/data/commonGround';

/** Home / Common Ground / Page. Site style: 14px, muted, links. Hidden on the landing page. */
export function Breadcrumb() {
  const pathname = usePathname();
  const { title } = cgLocate(pathname);
  if (pathname === CG_HOME || !title) return null;
  const link = 'text-soft underline-offset-4 hover:text-ink hover:underline';
  return (
    <nav aria-label="Breadcrumb" className="font-sans text-[14px] text-soft">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li>
          <Link href="/" className={link}>Home</Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link href={CG_HOME} className={link}>Common Ground</Link>
        </li>
        <li aria-hidden>/</li>
        <li aria-current="page" className="text-ink">{title}</li>
      </ol>
    </nav>
  );
}
