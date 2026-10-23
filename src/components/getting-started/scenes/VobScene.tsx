import { DocIcon, TickIcon } from '../icons';
import styles from '../GettingStarted.module.css';

const checks = ['ABA therapy coverage', 'Deductible and copay', 'Prior authorization', 'What you may owe'];

/** Step 3: a SAMPLE insurance card (fictional numbers) is scanned and four checks draw in. */
export function VobScene({ play }: { play: boolean }) {
  return (
    <div className={`${styles.sc} ${styles.vob} ${play ? styles.play : ''}`}>
      <div>
        <span className={styles.free}>FREE · NO OBLIGATION</span>
        <div className={styles.ins}>
          <span className={styles.scan} />
          <div className={styles.tag}>
            <span>HEALTH PLAN</span>
            <span>SAMPLE</span>
          </div>
          <span className={styles.chipGold} />
          <div className={styles.insNum}>XJD 4821 0093</div>
          <div className={styles.meta}>
            <span>
              MEMBER<b>Your child</b>
            </span>
            <span>
              GROUP<b>70412</b>
            </span>
          </div>
        </div>
      </div>
      <ul className={styles.checks}>
        {checks.map((c) => (
          <li key={c}>
            <TickIcon />
            {c}
          </li>
        ))}
      </ul>
      <div className={styles.summary}>
        <DocIcon />
        <span>
          <b>Plain-English summary</b> sent to you before anything starts.
        </span>
      </div>
    </div>
  );
}
