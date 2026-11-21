import { Archive, CalendarCheck, CalendarX, CircleCheck, Lock, PencilLine, type LucideIcon } from 'lucide-react';
import { LC_LISTING_STATUS } from '@/lib/learn/staff/listings';
import type { LcListingStatus } from '@/lib/learn/trainings';

const ICON: Record<LcListingStatus, LucideIcon> = { draft: PencilLine, scheduled: CalendarCheck, registration_closed: Lock, completed: CircleCheck, cancelled: CalendarX, archived: Archive };

/** A listing's status as an icon and a word. Colour is the third signal. */
export function LcListingChip({ status }: { status: LcListingStatus }) {
  const s = LC_LISTING_STATUS[status];
  const Icon = ICON[status];
  return (
    <span className="lc-chip" data-cast={s.cast}>
      <Icon width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
      {s.label}
    </span>
  );
}
