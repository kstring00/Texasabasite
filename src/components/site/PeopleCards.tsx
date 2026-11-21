import { type Person } from '@/data/people';
import { PersonCard } from '@/components/people/PersonCard';

/** A grid of people. Renders nothing if there is nobody to show. */
/** `row` puts everyone on one row on laptops and makes the cards a row to swipe on phones. */
export function PeopleCards({ people, compact, row, centerId, place = 'people' }: { people: Person[]; compact?: boolean; row?: boolean; centerId?: string | null; place?: string }) {
  if (people.length === 0) return null;
  return (
    <ul className={`grid gap-5 ${row ? `max-md:snap-row md:grid-cols-2 ${people.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}` : compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {people.map((p) => (
        <li key={p.id}>
          <PersonCard person={p} centerId={centerId} place={place} compact={compact} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
