import { contact, firstName } from '../data/gettingStarted';
import styles from '../GettingStarted.module.css';

/** Step 1: a text thread with the family contact. Decorative; the copy carries the meaning. */
export function ChatScene({ play }: { play: boolean }) {
  return (
    <div className={`${styles.sc} ${styles.chat} ${play ? styles.play : ''}`}>
      <div className={styles.chatHead}>
        <span className={styles.chatAv}>{contact.initials}</span>
        <div>
          <b>{firstName}</b>
          <small>Texas ABA Centers</small>
        </div>
        <span className={styles.live}>REAL PERSON</span>
      </div>
      <div className={styles.msgs}>
        <div className={`${styles.msg} ${styles.me}`}>Hi, I’d like to learn about ABA for my son.</div>
        <div className={`${styles.msg} ${styles.them} ${styles.typing}`}>
          <i />
          <i />
          <i />
        </div>
        <div className={`${styles.msg} ${styles.them}`}>Hi! I’m {firstName} with Texas ABA Centers. I’d love to help. Is today or tomorrow better for a quick call?</div>
        <div className={`${styles.msg} ${styles.me}`}>Tomorrow after 3 works.</div>
        <div className={`${styles.msg} ${styles.them}`}>Perfect. I’ll call you then and walk you through every step.</div>
      </div>
    </div>
  );
}
