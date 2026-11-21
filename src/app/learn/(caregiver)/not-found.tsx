import { LcEmpty } from '@/components/learn/LcEmpty';

/** Shown for a module, lesson or training that is not published or does not exist. It reveals nothing else. */
export default function LearnNotFound() {
  return <LcEmpty pageTitle title="That page isn’t available" text="It may have moved, or it may not be published. You can still explore our learning modules." action={{ href: '/learn/library', label: 'Go to the Learning Library' }} />;
}
