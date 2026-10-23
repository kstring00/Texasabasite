import { cn } from '@/lib/site/utils';
import { Reveal } from './motion';

/**
 * Section primitive. Tones give each act its own ground;
 * `shape` adds the Open World rhythm (an arch cut at the top).
 */
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
  titleAs: TitleTag = 'h2',
  size = 'md',
  headerClassName,
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  tone?: 'paper' | 'card' | 'ink' | 'cobalt' | 'lavender' | 'sage' | 'butter' | 'tint';
  align?: 'left' | 'center';
  as?: 'section' | 'div';
  titleAs?: 'h1' | 'h2';
  size?: 'sm' | 'md' | 'lg';
  headerClassName?: string;
}) {
  const tones = {
    paper: '',
    card: 'bg-card',
    tint: 'bg-ink/[0.04]',
    ink: 'bg-ink text-paper [&_h1]:text-paper [&_h2]:text-paper [&_h3]:text-paper [&_.lede]:text-paper/80 [&_.eyebrow]:text-butter',
    cobalt: 'bg-cobalt text-paper [&_h1]:text-paper [&_h2]:text-paper [&_h3]:text-paper [&_.lede]:text-paper/85 [&_.eyebrow]:text-butter',
    lavender: 'bg-lavender text-ink',
    sage: 'bg-sage text-ink',
    butter: 'bg-butter text-ink [&_.eyebrow]:text-ink',
  };
  const pad = { sm: 'py-[var(--s-4)]', md: 'py-[var(--s-5)]', lg: 'py-[calc(var(--s-5)*1.3)]' }[size];
  return (
    <Tag id={id} className={cn(pad, tones[tone], className)}>
      <div className="wrap">
        {(eyebrow || title || lede) && (
          <Reveal as="header" className={cn('mb-[var(--s-4)] max-w-4xl', align === 'center' && 'mx-auto text-center', headerClassName)}>
            {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            {title && <TitleTag className={TitleTag === 'h1' ? 'h1' : 'h2'}>{title}</TitleTag>}
            {lede && <p className="lede mt-5 max-w-2xl">{lede}</p>}
          </Reveal>
        )}
        {children}
      </div>
    </Tag>
  );
}
