/**
 * The lesson player: focus mode. No sub-nav, and learn.css hides the site footer while
 * the data-lc-chrome="focus" marker is on the page. The site header stays and hides itself on scroll.
 */
export default function LearnPlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-lc-chrome="focus" data-lc-scene="reading" className="lc-player-page">
      {children}
    </div>
  );
}
