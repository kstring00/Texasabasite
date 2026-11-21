import { Ban, CheckCheck, ClipboardCheck, EyeOff, Globe, MessageSquareWarning, PencilLine, type LucideIcon } from 'lucide-react';
import type { LcModuleStatus } from '@/lib/learn/staff/submissions';

export const LC_MODULE_STATUS: Record<LcModuleStatus, { label: string; cast: 'slate' | 'iris' | 'coral' | 'rose' | 'teal' | 'solid'; icon: LucideIcon }> = {
  draft: { label: 'Module draft', cast: 'slate', icon: PencilLine },
  final_review: { label: 'Final review', cast: 'iris', icon: ClipboardCheck },
  changes_requested: { label: 'Changes requested', cast: 'coral', icon: MessageSquareWarning },
  rejected: { label: 'Rejected', cast: 'rose', icon: Ban },
  final_approved: { label: 'Final approved', cast: 'teal', icon: CheckCheck },
  published: { label: 'Published', cast: 'solid', icon: Globe },
  withdrawn: { label: 'Withdrawn', cast: 'slate', icon: EyeOff },
};

/** The state of one module version. A double check means the final approval. Published is the only solid chip. */
export function LcModuleChip({ status }: { status: LcModuleStatus }) {
  const s = LC_MODULE_STATUS[status];
  return (
    <span className={s.cast === 'solid' ? 'lc-chip lc-chip-solid' : 'lc-chip'} data-cast={s.cast === 'solid' ? undefined : s.cast}>
      <s.icon width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
      {s.label}
    </span>
  );
}
