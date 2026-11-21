import { Activity, Blocks, BookOpen, CalendarDays, HeartHandshake, ListChecks, MessageCircle, Search, ShieldCheck, Video, type LucideIcon } from 'lucide-react';
import type { LcIconName } from '@/data/learn/categories';

const ICONS: Record<LcIconName, LucideIcon> = {
  blocks: Blocks,
  activity: Activity,
  'message-circle': MessageCircle,
  'calendar-days': CalendarDays,
  'shield-check': ShieldCheck,
  'heart-handshake': HeartHandshake,
  'book-open': BookOpen,
  video: Video,
  search: Search,
  'list-checks': ListChecks,
};

/** Lucide only, stroke 1.75. Icons are decorative here; the text beside them carries the meaning. */
export function LcIcon({ name, size = 24, className }: { name: LcIconName; size?: number; className?: string }) {
  const Icon = ICONS[name];
  return <Icon width={size} height={size} strokeWidth={1.75} className={className} aria-hidden="true" focusable="false" />;
}

/** The one coloured object most cards carry. Takes its hue from the nearest data-cast. */
export function LcIconTile({ name, size = 'md' }: { name: LcIconName; size?: 'sm' | 'md' | 'lg' }) {
  const px = size === 'lg' ? 30 : size === 'sm' ? 20 : 26;
  return (
    <span className="lc-icon-tile" data-size={size} aria-hidden="true">
      <LcIcon name={name} size={px} />
    </span>
  );
}
