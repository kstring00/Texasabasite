import type { Metadata } from 'next';
import { LcEmpty } from '@/components/learn/LcEmpty';

export const metadata: Metadata = { title: 'Staff sign-in', robots: { index: false, follow: false } };

/**
 * Every staff address answers with this one closed page until real staff sign-in exists.
 * Nothing behind it is reachable, on any deployment.
 */
export default function LearnStaffClosedPage() {
  return (
    <LcEmpty
      title="Staff sign-in is not set up yet"
      text="The staff workspace needs the organization’s approved sign-in before it can open. Nothing is available here yet."
      action={{ href: '/learn', label: 'Back to the Learning Center' }}
    />
  );
}
