'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { site } from '@/data/site';
import { firstName, marcie } from '@/data/people';
import { track } from '@/lib/site/analytics';
import { Ticker } from '@/components/site/Ticker';
import styles from './OneNextStep.module.css';

/**
 * The photo in the arch. To change it, replace this one file and keep the name:
 *   public/images/home/next-step-door.jpg
 * Best size: 1200 x 1500 pixels, upright (4 wide by 5 tall), JPEG. The top corners are rounded
 * into an arch, so keep anything important away from the top-left and top-right corners.
 * Update `alt` to describe the new photo, and `position` if its subject is not near the middle.
 */
const DOOR_PHOTO = {
  src: '/images/home/next-step-door.jpg',
  alt: 'A Texas ABA Centers therapist and a young girl sorting colorful emotion plush toys at a blue table while a second team member works on a tablet beside them, under an “IN YOU” wall mural',
  position: '42% 50%',
};

/** The sentence under the headline, in its original order. The four middle parts are shown as cards. */
const BETWEEN = ['the pediatrician’s word,', 'the waitlist,', 'the acronyms,', 'and the advice from everyone who means well,'];

/** The reassurances, shortened for the moving line. */
const REASSURANCES = ['No diagnosis needed to visit', 'No need to know what ABA is yet', 'Nothing to bring', 'Nothing to sign', 'No decision that day', 'Forty-five minutes'];

const TILES = [
  { n: '45', label: 'minutes, start to finish' },
  { n: '0', label: 'forms to fill out' },
  { n: '0', label: 'decisions that day' },
];

const PATHS = [
  { n: '01', label: 'A doctor said a word and we’re still figuring out what it means', dest: 'What an evaluation involves', href: '/services/autism-diagnosis' },
  { n: '02', label: 'We have a diagnosis and want to understand the process', dest: 'The five steps from first call to first day', href: '/getting-started' },
  { n: '03', label: 'We need support for us, not just therapy for our child', dest: 'Open Common Ground (free, no enrollment needed)', href: '/families' },
];

/** Adds `in` once the element is 20% into view. Instant under reduced motion. */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && (setInView(true), io.disconnect()), { threshold: 0.2 });
    io.observe(el);
    // Never leave content hidden if the observer never fires.
    const safety = window.setTimeout(() => setInView(true), 3500);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);
  return [ref, inView] as const;
}

function Words({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i}>
          <span className={styles.w} style={{ transitionDelay: `${(start + i) * 60}ms` }}>
            {w}
          </span>{' '}
        </span>
      ))}
    </>
  );
}

/**
 * "One next step": the section after the hero, in four full-width bands.
 * Its only job is to make the tour feel small, safe and obviously right:
 * name the feeling, reassure, make the one ask, then offer three quieter ways in.
 */
export function OneNextStep() {
  const [headRef, headIn] = useInView<HTMLHeadingElement>();
  const [doorRef, doorIn] = useInView<HTMLDivElement>();

  return (
    <section className={styles.section} aria-labelledby="one-step-title">
      {/* Band 1: name the feeling */}
      <div className={styles.feelBand}>
        <div className={`wrap ${styles.feel}`}>
          <h2 id="one-step-title" ref={headRef} className={`${styles.feelHead} ${styles.rise} ${headIn ? styles.in : ''}`}>
            <span className={styles.ln}><Words text="You don’t need every answer" /></span>
            <span className={styles.ln}>
              <Words text="to take the" start={5} />
              <em className={styles.w} style={{ transitionDelay: `${8 * 60}ms` }}>next step.</em>
            </span>
          </h2>
          <div className={styles.carry}>
            {/* One sentence, same words and order as before. A screen reader hears it straight through. */}
            <p className={styles.between}>
              <span className={styles.betweenLabel}>Somewhere between</span>{' '}
              <span className={styles.stack}>
                {BETWEEN.map((t) => (
                  <span key={t} className={styles.chip}>
                    {t}{' '}
                  </span>
                ))}
              </span>
              <span className={styles.betweenRest}>you&rsquo;re supposed to figure out what&rsquo;s right for your child.</span>
            </p>
            <p className={styles.carryA}>That&rsquo;s a lot to carry.</p>
            <p className={styles.carryB}>You don&rsquo;t have to carry it in here.</p>
          </div>
        </div>
      </div>

      {/* Band 2: the reassurances, gliding past */}
      <Ticker tone="cobalt" phrases={REASSURANCES} seconds={40} control />

      {/* Band 3: the one ask */}
      <div className={styles.askBand}>
        <div className={`wrap ${styles.ask}`}>
          <div ref={doorRef} className={`${styles.door} ${doorIn ? styles.in : ''}`}>
            <Image src={DOOR_PHOTO.src} alt={DOOR_PHOTO.alt} fill sizes="(min-width: 1024px) 40vw, 92vw" className="object-cover" style={{ objectPosition: DOOR_PHOTO.position }} />
          </div>
          <div className={styles.askCopy}>
            <p className={styles.eyebrow}>The only thing we&rsquo;re asking</p>
            <h2 className={styles.askHead}>Come see a center.</h2>
            <ul className={styles.tiles}>
              {TILES.map((t) => (
                <li key={t.label}>
                  <span className={styles.tileN}>{t.n}</span> <span className={styles.tileLabel}>{t.label}</span>
                </li>
              ))}
            </ul>
            <p className={styles.askBody}>
              Walk the rooms where your child would spend their mornings, meet the people who&rsquo;d be beside them, and ask every question you&rsquo;ve been holding. Then go home and think about it.
            </p>
            <div className={styles.ctas}>
              <Link href="/request-a-tour" className={`btn-primary ${styles.primary}`}>
                Request a tour <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <a href={`tel:${site.phone.tel}`} className={styles.call} onClick={() => track({ name: 'call_tap', center: 'main', place: 'one-next-step' })}>
                <Phone aria-hidden /> Or just call {firstName(marcie)}: <b>{site.phone.display}</b>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Band 4: three quieter ways in */}
      <div className={styles.pathsBand}>
        <div className="wrap">
          <div className={styles.pathsHead}>
            <div>
              <p className={styles.pathsEyebrow}>Not ready to visit yet?</p>
              <h2 className={styles.pathsTitle}>Start where you are.</h2>
            </div>
            <p className={styles.pathsAside}>Three ways in. Pick the one that sounds like you.</p>
          </div>
          <ul className={styles.cards}>
            {PATHS.map((p) => (
              <li key={p.n}>
                <Link href={p.href} className={styles.card} aria-label={`${p.label}: ${p.dest}`}>
                  <span className={styles.num} aria-hidden>{p.n}</span>
                  <span className={styles.label}>{p.label}</span>
                  <span className={styles.foot}>
                    <span className={styles.dest}>{p.dest}</span>
                    <span className={styles.go} aria-hidden>
                      <ArrowRight />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Decoration only. The same words are the heading just above, so they are not repeated for screen readers. */}
        <Ticker tone="outline" size="giant" direction="right" phrases={['Start where you are']} seconds={26} srText={false} />
      </div>
    </section>
  );
}
