import { cn } from '@/lib/site/utils';

export function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
  className,
  tone = 'paper',
  align = 'left',
  as: Tag = 'section',
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
  children?: React.ReactNode;
  className?: string;
  tone?: 'paper' | 'card' | 'ink' | 'tint';
  align?: 'left' | 'center';
  as?: 'section' | 'div';
}) {
  const tones = {
    paper: '',
    card: 'bg-card',
    ink: 'bg-ink text-paper [&_h2]:text-paper [&_h3]:text-paper [&_.lede]:text-paper/80',
    tint: 'bg-ink/[0.04]',
  };
  return (
    <Tag id={id} className={cn('py-16 sm:py-20 lg:py-24', tones[tone], className)}>
      <div className="wrap">
        {(eyebrow || title || lede) && (
          <header className={cn('mb-10 max-w-3xl sm:mb-12', align === 'center' && 'mx-auto text-center')}>
            {eyebrow && <p className={cn('eyebrow mb-3', tone === 'ink' && 'text-sun')}>{eyebrow}</p>}
            {title && <h2 className="h2">{title}</h2>}
            {lede && <p className="lede mt-4">{lede}</p>}
          </header>
        )}
        {children}
      </div>
    </Tag>
  );
}
