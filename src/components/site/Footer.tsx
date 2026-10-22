import Link from 'next/link';
import { Logo } from './Logo';
import { site } from '@/data/site';
import { locations } from '@/data/locations';
import { services } from '@/data/services';

export function Footer() {
  return (
    <footer className="border-t border-line bg-card pb-24 pt-14 md:pb-14">
      <div className="wrap grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-base text-body">{site.tagline}</p>
          <p className="mt-4 text-base">
            <a href={`tel:${site.phone.tel}`} className="font-semibold text-ink underline-offset-4 hover:underline">
              {site.phone.display}
            </a>
            <span className="text-soft"> · {site.phoneHours}</span>
          </p>
          <Link href="/families" className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-ink underline-offset-4 hover:underline">
            Common Ground, for families
          </Link>
        </div>
        <nav aria-label="Centers">
          <p className="eyebrow mb-3">Centers</p>
          <ul className="space-y-2">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link href={`/locations/${l.slug}`} className="text-base text-body hover:text-ink hover:underline underline-offset-4">
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Services">
          <p className="eyebrow mb-3">Services</p>
          <ul className="space-y-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="text-base text-body hover:text-ink hover:underline underline-offset-4">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="More">
          <p className="eyebrow mb-3">More</p>
          <ul className="space-y-2 text-base">
            {[
              ['/getting-started', 'Getting started'],
              ['/request-a-tour', 'Request a tour'],
              ['/insurance', 'Insurance & cost'],
              ['/team', 'Your team'],
              ['/events', 'Events'],
              ['/blog', 'Blog'],
              ['/providers', 'For providers'],
              ['/contact', 'Contact'],
              ['/privacy', 'Privacy policy'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-body hover:text-ink hover:underline underline-offset-4">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a href={site.careersUrl} className="text-body hover:text-ink hover:underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                Careers
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="wrap mt-10 border-t border-line pt-6 text-sm text-soft">
        <p>
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
