'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import styles from './VideoHero.module.css';

const POSTER = '/hero/hero-poster.jpg';
const POSTER_WEBP = '/hero/hero-poster.webp';
const POSTER_MOBILE = '/hero/hero-poster-mobile.jpg';
const POSTER_MOBILE_WEBP = '/hero/hero-poster-mobile.webp';
const MOBILE = '(max-width: 768px)';
const SEAM = 0.6; // seconds of crossfade at the loop point

/**
 * Full-viewport video hero with a scroll parallax and a soft loop crossfade.
 * Two stacked <video> elements take turns: when the live one is 600ms from its end, the other
 * starts from zero and fades in over it, so the restart never jumps. The video is decorative.
 */
export function VideoHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const vids = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const [live, setLive] = useState<0 | 1 | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false);
  const swapping = useRef(false);

  // Parallax: transform/opacity only, on wrappers.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const vScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const vY = useTransform(scrollYProgress, [0, 1], ['0vh', '12vh']);
  const scrimO = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0vh', '-8vh']);
  const copyO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const ctaY = useTransform(scrollYProgress, [0, 1], ['0vh', '-4vh']);
  const still = reduce || fallback;

  useEffect(() => {
    setMobile(window.matchMedia(MOBILE).matches);
    setMounted(true);
  }, []);

  // Reduced motion: poster only, no autoplay. Otherwise attach sources and play the first video.
  useEffect(() => {
    if (!mounted || reduce) {
      if (reduce) setReady(true);
      return;
    }
    const v = vids[0].current;
    if (!v) return;
    let cancelled = false;
    const onCanPlay = () => {
      if (cancelled) return;
      v.play()
        .then(() => {
          setLive(0);
          setReady(true);
        })
        .catch(() => {
          setFallback(true);
          setReady(true);
        });
    };
    v.addEventListener('canplay', onCanPlay, { once: true });
    v.load();
    // The headline never waits more than 1.2s for the video: the poster is already on screen.
    const safety = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 1200);
    return () => {
      cancelled = true;
      v.removeEventListener('canplay', onCanPlay);
      window.clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, reduce]);

  // Loop seam: 600ms before the live video ends, start the other and crossfade.
  const onTime = useCallback(
    (i: 0 | 1) => {
      const v = vids[i].current;
      const other = vids[i === 0 ? 1 : 0].current;
      if (!v || !other || live !== i || swapping.current || !v.duration) return;
      if (v.duration - v.currentTime <= SEAM) {
        swapping.current = true;
        other.currentTime = 0;
        other
          .play()
          .then(() => {
            setLive(i === 0 ? 1 : 0);
            window.setTimeout(() => {
              v.pause();
              swapping.current = false;
            }, SEAM * 1000 + 50);
          })
          .catch(() => {
            swapping.current = false;
            v.currentTime = 0;
            v.play().catch(() => setFallback(true));
          });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [live],
  );

  const sources = (
    <>
      {mobile ? (
        <>
          {/* Phones: the 600KB H.264 first; the VP9 cut only for browsers without H.264. */}
          <source src="/hero/hero-mobile.mp4" type="video/mp4" />
          <source src="/hero/hero-mobile.webm" type="video/webm" />
        </>
      ) : (
        <>
          <source src="/hero/hero.webm" type="video/webm" />
          <source src="/hero/hero-web.mp4" type="video/mp4" />
        </>
      )}
    </>
  );

  return (
    <section ref={ref} id="hero" className={`${styles.hero} ${ready ? styles.ready : ''} ${still ? styles.still : ''}`} aria-labelledby="hero-title">
      <link rel="preload" as="image" href={POSTER_WEBP} type="image/webp" media="(min-width: 769px)" />
      <link rel="preload" as="image" href={POSTER_MOBILE_WEBP} type="image/webp" media={MOBILE} />

      <motion.div className={styles.media} style={reduce ? undefined : { scale: vScale, y: vY }} aria-hidden="true">
        <picture>
          <source srcSet={POSTER_MOBILE_WEBP} type="image/webp" media={MOBILE} />
          <source srcSet={POSTER_MOBILE} media={MOBILE} />
          <source srcSet={POSTER_WEBP} type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSTER} alt="" className={styles.poster} width={1600} height={907} decoding="async" fetchPriority="high" />
        </picture>
        {!reduce && !fallback && (
          <>
            <video ref={vids[0]} className={`${styles.video} ${live === 0 ? styles.live : ''}`} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} disablePictureInPicture onTimeUpdate={() => onTime(0)}>
              {mounted && sources}
            </video>
            <video ref={vids[1]} className={`${styles.video} ${live === 1 ? styles.live : ''}`} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} disablePictureInPicture onTimeUpdate={() => onTime(1)}>
              {live !== null && sources}
            </video>
          </>
        )}
      </motion.div>

      <motion.div className={styles.scrim} style={reduce ? undefined : { opacity: scrimO }} aria-hidden="true" />

      <motion.div className={styles.copy} style={reduce ? undefined : { y: copyY, opacity: copyO }}>
        <div className={styles.inner}>
          <h1 id="hero-title" className={styles.h1}>
            <span className={styles.word}>A</span> <span className={styles.word}>brighter</span>
            <br />
            <span className={styles.next}>next.</span>
          </h1>
          <p className={styles.sub}>ABA therapy for children with autism — centers across Texas.</p>
          <motion.div style={reduce ? undefined : { y: ctaY }}>
            <Link href="/locations" className={styles.cta}>
              <span className={styles.circle} aria-hidden="true">
                <ArrowRight strokeWidth={1.8} />
              </span>
              Find a center
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
