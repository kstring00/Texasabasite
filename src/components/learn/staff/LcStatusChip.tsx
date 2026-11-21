import { Archive, Ban, CheckCheck, CircleCheck, ClipboardCheck, Clock, Eye, EyeOff, Globe, Loader, MessageSquareWarning, PencilLine, type LucideIcon } from 'lucide-react';
import { LC_STATUS, type LcWorkflowStatus } from '@/lib/learn/staff/submissions';

const ICON: Record<LcWorkflowStatus, LucideIcon> = {
  draft: PencilLine, submitted: Clock, in_review: Eye, changes_requested: MessageSquareWarning, declined: Ban, source_approved: CircleCheck,
  awaiting_production: Loader, in_production: Loader, final_review: ClipboardCheck, final_approved: CheckCheck, published: Globe, withdrawn: EyeOff, archived: Archive,
};

/** A status is always an icon and a word. Colour is the third signal. Published is the only solid chip. */
export function LcStatusChip({ status }: { status: LcWorkflowStatus }) {
  const s = LC_STATUS[status];
  const Icon = ICON[status];
  return (
    <span className={s.cast === 'solid' ? 'lc-chip lc-chip-solid' : 'lc-chip'} data-cast={s.cast === 'solid' ? undefined : s.cast}>
      <Icon width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
      {s.label}
    </span>
  );
}
