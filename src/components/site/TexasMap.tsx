import Link from 'next/link';
import { locations } from '@/data/locations';

/** A simple illustrated Texas with the six centers. Positions are approximate by design. */
export function TexasMap() {
  return (
    <figure className="card p-4">
      <svg viewBox="0 0 100 90" className="h-auto w-full" role="img" aria-labelledby="txmap-title">
        <title id="txmap-title">Map of Texas showing six centers: Plano and Cedar Hill near Dallas, Austin, and Katy, Sugar Land and Pearland near Houston</title>
        <path
          d="M22 2 L40 3 L41 24 L58 25 L72 22 L80 30 L92 34 L96 44 L88 50 L84 60 L82 72 L76 84 L66 88 L60 78 L52 74 L46 66 L36 62 L30 70 L22 62 L10 52 L2 48 L6 40 L18 36 L20 24 Z"
          fill="rgb(var(--ink) / 0.06)"
          stroke="rgb(var(--ink) / 0.25)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        {locations.map((l) => (
          <g key={l.slug}>
            <circle cx={l.map.x} cy={l.map.y} r="2.4" fill="rgb(var(--rose))" stroke="rgb(var(--paper))" strokeWidth="0.8" />
          </g>
        ))}
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-soft">
        {locations.map((l) => (
          <Link key={l.slug} href={`/locations/${l.slug}`} className="font-semibold text-ink underline-offset-4 hover:underline">
            {l.name}
          </Link>
        ))}
      </figcaption>
    </figure>
  );
}
