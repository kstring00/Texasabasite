import type { Metadata } from 'next';
import { LcEmpty } from '@/components/learn/LcEmpty';
import { LcPageHead } from '@/components/learn/LcPageHead';
import { LcTrainingCard } from '@/components/learn/LcTraining';
import { listTrainings } from '@/lib/learn/content';
import { isPastTraining, sortTrainings, trainingView } from '@/lib/learn/trainings';

export const metadata: Metadata = { title: 'Live Trainings', alternates: { canonical: '/learn/trainings' } };
// What counts as upcoming depends on today's date.
export const revalidate = 300;

export default function LearnTrainingsPage() {
  const now = new Date();
  const all = sortTrainings(listTrainings(), now).map((training) => ({ training, view: trainingView(training, now), isPast: isPastTraining(training, now) }));
  const upcoming = all.filter((t) => !t.isPast);
  const past = all.filter((t) => t.isPast);
  return (
    <>
      <LcPageHead
        title="Live Trainings"
        lead="Virtual group sessions for currently enrolled families, held in Microsoft Teams. This training is available to currently enrolled families."
      >
        <p className="lc-muted">You’ll complete registration through Microsoft Teams. All times are Central Time (CT).</p>
      </LcPageHead>

      <section aria-labelledby="lc-trainings-upcoming" className="lc-section-tight">
        <h2 id="lc-trainings-upcoming" className="lc-h2">
          Upcoming
        </h2>
        {upcoming.length > 0 ? (
          <ul className="lc-training-list">
            {upcoming.map(({ training, view }) => (
              <li key={training.id}>
                <LcTrainingCard training={training} view={view} />
              </li>
            ))}
          </ul>
        ) : (
          <LcEmpty title="No live trainings are listed right now" text="There aren’t any live trainings listed right now. You can still explore our learning modules." action={{ href: '/learn/library', label: 'Explore modules' }} />
        )}
      </section>

      {past.length > 0 ? (
        <section aria-labelledby="lc-trainings-past" className="lc-section">
          <h2 id="lc-trainings-past" className="lc-h2">
            Past trainings
          </h2>
          <ul className="lc-training-list">
            {past.map(({ training, view }) => (
              <li key={training.id}>
                <LcTrainingCard training={training} view={view} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
