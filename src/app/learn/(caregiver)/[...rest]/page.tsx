import { notFound } from 'next/navigation';

/**
 * Any address under /learn that is not a real page. Sending it to the Learning Center's own
 * "not available" page keeps a lost caregiver inside the Learning Center, with a way back to the
 * library, instead of dropping them on the main site's error page.
 */
export default function LearnUnknownPage() {
  notFound();
}
