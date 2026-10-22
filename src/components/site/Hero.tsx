import { FlowerMark } from './Logo';

export function Hero({ children, art = true }: { children: React.ReactNode; art?: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-sun/25 blur-3xl" />
        <div className="absolute -left-32 top-64 h-80 w-80 rounded-full bg-plum/15 blur-3xl" />
      </div>
      <div className="wrap relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:py-28">
        <div>{children}</div>
        {art && (
          <div className="hidden items-center justify-center lg:flex" aria-hidden>
            <FlowerMark className="h-72 w-72 drop-shadow-[0_30px_60px_rgba(26,46,82,0.25)]" id="hero-mark" title="" />
          </div>
        )}
      </div>
    </section>
  );
}
