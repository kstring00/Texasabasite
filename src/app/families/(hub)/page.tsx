import type { Metadata } from 'next';
import { CgLanding } from '@/components/common-ground/CgLanding';

export const metadata: Metadata = {
  title: { absolute: 'Common Ground, for families | Texas ABA Centers' },
};

export default function SupportHome() {
  return <CgLanding />;
}
