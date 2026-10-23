import type { CSSProperties } from 'react';
import { contact, firstName } from '../data/gettingStarted';
import styles from '../GettingStarted.module.css';

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const tops = [10, 44, 10, 30, 10];
const labels = ['Session', 'Parent check-in', 'Session', 'Session', 'Session'];

/** Step 4: a SAMPLE first week, then the care team. */
export function StartScene({ play }: { play: boolean }) {
  return (
    <div className={`${styles.sc} ${styles.start} ${play ? styles.play : ''}`}>
      <div className={styles.wkHead}>
        <b>Your child’s first week</b>
        <small>SAMPLE</small>
      </div>
      <div className={styles.wk}>
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
        {days.map((d, i) => (
          <div key={`day-${d}`} className={styles.day}>
            <div className={`${styles.ses} ${i === 1 ? styles.y : ''}`} style={{ top: tops[i] } as CSSProperties}>
              {labels[i]}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.team}>
        <div className={styles.faces}>
          <span className={`${styles.face} ${styles.faceA}`}>BCBA</span>
          <span className={`${styles.face} ${styles.faceB}`}>RBT</span>
          <span className={`${styles.face} ${styles.faceC}`}>{contact.initials}</span>
        </div>
        <p>
          <b>Your care team.</b> A BCBA plans the goals, a therapist works with your child, and {firstName} stays your point of contact.
        </p>
      </div>
    </div>
  );
}
