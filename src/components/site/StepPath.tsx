import Link from 'next/link';
import { steps } from '@/data/steps';
import { cn } from '@/lib/site/utils';

export function StepPath({ compact = false }: { compact?: boolean }) {
  return (
    <ol className="relative grid gap-6 md:grid-cols-5 md:gap-4" aria-label="Your path from first worry to first day">
      <span aria-hidden className="absolute left-5 top-6 hidden h-0.5 w-[calc(100%-2.5rem)] bg-line md:block" data-path-line />
      {steps.map((s) => (
        <li key={s.slug} className="relative flex gap-4 md:flex-col md:gap-3">
          <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-lg font-semibold text-paper ring-4 ring-paper">
            {s.n}
          </span>
          <div className="min-w-0">
            <h3 className="font-sans text-lg font-bold text-ink">
              <Link href={`/getting-started#${s.slug}`} className="underline-offset-4 hover:underline">
                {s.title}
              </Link>
            </h3>
            <p className="mt-1 text-base text-body">{s.short}</p>
            {!compact && (
              <dl className="mt-2 space-y-1 text-sm text-soft">
                <div>
                  <dt className="inline font-semibold text-ink">Who: </dt>
                  <dd className="inline">{s.whoYouMeet}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-ink">How long: </dt>
                  <dd className={cn('inline')}>{s.howLong}</dd>
                </div>
              </dl>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
