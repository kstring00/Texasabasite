import type { ReactNode } from 'react';
import { BlocksIcon, ClipIcon, DoorIcon, TalkIcon } from '../icons';
import styles from '../GettingStarted.module.css';

// TODO: confirm the four evaluation-visit moments with the clinical team
const moments: { icon: ReactNode; title: string; text: string }[] = [
  { icon: <DoorIcon />, title: 'Welcome and settle in', text: 'Meet your evaluator. Your child gets time to explore the room.' },
  { icon: <BlocksIcon />, title: 'Play-based observation', text: 'Your child plays while the evaluator watches and joins in.' },
  { icon: <TalkIcon />, title: 'Your turn to talk', text: 'Share what you see at home: strengths, worries, routines.' },
  { icon: <ClipIcon />, title: 'Results, together', text: 'We go over findings and next steps in plain language.' },
];

/** Step 2: the four moments of an evaluation visit, lit in sequence as a line runs down the timeline. */
export function EvalScene({ play }: { play: boolean }) {
  return (
    <div className={`${styles.sc} ${play ? styles.play : ''}`}>
      <div className={styles.evHead}>
        <b>Your evaluation visit</b>
        <small>IN-HOUSE</small>
      </div>
      <ol className={styles.evList}>
        <span className={styles.evRun} />
        {moments.map((m) => (
          <li key={m.title}>
            <span className={styles.evIc}>{m.icon}</span>
            <div>
              <b>{m.title}</b>
              <p>{m.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
