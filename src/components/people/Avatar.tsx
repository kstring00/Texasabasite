import Image from 'next/image';
import { initials, type Person } from '@/data/people';
import { cn } from '@/lib/site/utils';

/** Photo if one exists, else initials. Yellow circle for Marcie, brand blue for everyone else. */
export function Avatar({ person, size = 48, className }: { person: Person; size?: number; className?: string }) {
  const tone = person.id === 'marcie' ? 'bg-butter text-ink' : 'bg-cobalt text-white';
  const font = size >= 64 ? 'text-[22px]' : size >= 44 ? 'text-[16px]' : 'text-[12px]';
  return (
    <span className={cn('inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-sans font-bold', tone, font, className)} style={{ width: size, height: size }} aria-hidden="true">
      {person.photo ? <Image src={person.photo} alt="" width={size} height={size} className="h-full w-full object-cover" /> : initials(person)}
    </span>
  );
}
