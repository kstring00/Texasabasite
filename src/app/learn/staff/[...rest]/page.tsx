import { notFound } from 'next/navigation';
import { getStaffActor } from '@/lib/learn/staff/guard';

/**
 * Any other staff address. Signed out or switched off, the layout answers with the closed page
 * or the role picker, so the address tells a visitor nothing. Signed in, it is simply not found.
 */
export default async function LearnStaffUnknownPage() {
  if (await getStaffActor()) notFound();
  return null;
}
