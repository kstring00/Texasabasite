import type { Metadata } from 'next';
import { ParentPulse } from '@/components/site/ParentPulse';

export const metadata: Metadata = {
  title: 'Parent Pulse',
  description: 'A one-minute weekly check-in on how you are doing, not just your child. Stays on your device. Never a score, never a diagnosis.',
};

export default function PulsePage() {
  return <ParentPulse />;
}
