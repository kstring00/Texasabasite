'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Phone } from 'lucide-react';
import { site } from '@/data/site';
import { firstName, marcie } from '@/data/people';
import { track } from '@/lib/site/analytics';
import { heroContent } from '@/components/hero/hero.content';
import styles from './OneNextStep.module.css';

const ISNT = [
  'You don’t need a diagnosis to visit.',
  'You don’t need to know what ABA is yet.',
  'You don’t need to bring anything.',
  'You won’t be asked to sign anything.',
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
 * "One next step": the section after the hero. Its only job is to make the tour feel small,
 * safe and obviously right. One ask (Request a tour), one fallback (call Marcie), three quiet paths.
 */
export function OneNextStep() {
  const [headRef, headIn] = useInView<HTMLHeadingElement>();
  const [doorRef, doorIn] = useInView<HTMLDivElement>();
  const [listRef, listIn] = useInView<HTMLUListElement>();
  const photo = heroContent.photos.a;

  return (
    <section className={`wrap ${styles.section}`} aria-labelledby="one-step-title">
      {/* Block 1: name the feeling */}
      <div className={`${styles.block} ${styles.feel}`}>
        <h2 id="one-step-title" ref={headRef} className={`${styles.feelHead} ${styles.rise} ${headIn ? styles.in : ''}`}>
          <span className={styles.ln}><Words text="You don’t need every answer" /></span>
          <span className={styles.ln}>
            <Words text="to take the" start={5} />
            <em className={styles.w} style={{ transitionDelay: `${8 * 60}ms` }}>next step.</em>
          </span>
        </h2>
        <p className={styles.feelBody}>
          Somewhere between the pediatrician&rsquo;s word, the waitlist, the acronyms, and the advice from everyone who means well, you&rsquo;re supposed to figure out what&rsquo;s right for your child. That&rsquo;s a lot to carry. You don&rsquo;t have to carry it in here.
        </p>
      </div>

      {/* Block 2: the one ask */}
      <div className={`${styles.block} ${styles.ask}`}>
        <div ref={doorRef} className={`${styles.door} ${doorIn ? styles.in : ''}`}>
          <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 40vw, 92vw" className="object-cover" style={{ objectPosition: '42% 50%' }} />
        </div>
        <div className={styles.askCopy}>
          <p className={styles.eyebrow}>The only thing we&rsquo;re asking</p>
          <h2 className={styles.askHead}>Come see a center.</h2>
          <p className={styles.askBody}>
            Forty-five minutes. No paperwork. No decision that day. Walk the rooms where your child would spend their mornings, meet the people who&rsquo;d be beside them, and ask every question you&rsquo;ve been holding. Then go home and think about it.
          </p>
          <div className={styles.ctas}>
            <Link href="/request-a-tour" className={`btn-primary ${styles.primary}`}>
              Request a tour <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <a href={`tel:${site.phone.tel}`} className={styles.call} onClick={() => track({ name: 'call_tap', center: 'main', place: 'one-next-step' })}>
              <Phone aria-hidden /> Or just call {firstName(marcie)}: <b>{site.phone.display}</b>
            </a>
          </div>
          <ul ref={listRef} className={`${styles.isnt} ${listIn ? styles.in : ''}`} aria-label="What a tour is not">
            {ISNT.map((t, i) => (
              <li key={t} style={{ transitionDelay: `${i * 120}ms` }}>
                <Check aria-hidden strokeWidth={2.4} /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Block 3: quiet paths */}
      <div className={styles.block}>
        <p className={styles.quietHead}>Not ready to visit yet? Start where you are.</p>
        <ul className={styles.rows}>
          {PATHS.map((p) => (
            <li key={p.n}>
              <Link href={p.href} className={styles.row} aria-label={`${p.label}: ${p.dest}`}>
                <span className={styles.num} aria-hidden>{p.n}</span>
                <span className={styles.label}>{p.label}</span>
                <span className={styles.dest} aria-hidden>{p.dest}</span>
                <ArrowRight className={styles.arrow} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
