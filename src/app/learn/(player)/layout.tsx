import { connection } from 'next/server';
import { learnFlags } from '@/lib/learn/flags';

/**
 * The lesson player: focus mode. No sub-nav, and learn.css hides the site footer while
 * the data-lc-chrome="focus" marker is on the page. The site header stays and hides itself on scroll.
 */
export default async function LearnPlayerLayout({ children }: { children: React.ReactNode }) {
  if (learnFlags.demoStaff) await connection();
  return (
    <div data-lc-chrome="focus" data-lc-scene="reading" className="lc-player-page">
      {children}
    </div>
  );
}
