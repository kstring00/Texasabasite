import { type Person } from '@/data/people';
import { PersonCard } from '@/components/people/PersonCard';

/** A grid of people. Renders nothing if there is nobody to show. */
export function PeopleCards({ people, compact, centerId, place = 'people' }: { people: Person[]; compact?: boolean; centerId?: string | null; place?: string }) {
  if (people.length === 0) return null;
  return (
    <ul className={`grid gap-5 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {people.map((p) => (
        <li key={p.id}>
          <PersonCard person={p} centerId={centerId} place={place} compact={compact} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
