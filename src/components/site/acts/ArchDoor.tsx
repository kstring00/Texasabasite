'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import styles from './ArchDoor.module.css';

const WEBM = '/video/begin-arch.webm';
const MP4 = '/video/begin-arch.mp4';
const POSTER = '/video/begin-arch-poster.jpg';
const END = 4.9; // seconds: the scrub never seeks past this

type Props = {
  /** The section the scroll is measured against. */
  sectionRef: React.RefObject<HTMLElement | null>;
  /** 'scrub' (desktop) seeks with scroll; 'play' (mobile) plays once when half in view. */
  mode: 'scrub' | 'play';
};

/**
 * The gold arch in the closing section, now a doorway: the classroom video sits inside the arch.
 * Desktop: scroll scrubs the video forward (camera moves through the arch), the gold frame fades
 * past 70% and the inner edge softens into the blue. Mobile: plays once, holds the last frame.
 * Reduced motion, missing files, or refused autoplay: poster, and the gold fill behind it.
 */
export function ArchDoor({ sectionRef, mode }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduce, setReduce] = useState(false);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterOk, setPosterOk] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Mount the video only within 1.5 viewports of the section.
  useEffect(() => {
    const el = hostRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && (setNear(true), io.disconnect()), { rootMargin: '150% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ---- desktop: scroll scrub ---- */
  // Measured on the arch itself (it sits at the bottom of the section): 0 once about half of it is
  // on screen, 1 as it settles fully into view, so the push through the doorway is actually seen.
  const { scrollYProgress } = useScroll({ target: hostRef, offset: ['start 70%', 'end 95%'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.8, restDelta: 0.0005 }); // ≈ scrub 0.8
  const frameO = useTransform(smooth, [0.7, 0.92], [1, 0]);
  const softO = useTransform(smooth, [0.7, 0.92], [0, 1]);
  const { scrollYProgress: pass } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const drift = useTransform(pass, [0, 1], [0, 40]); // 0.85x speed, capped at 40px

  const target = useRef(0);
  const seeking = useRef(false);
  const lastSeek = useRef(0);
  const hoverPlaying = useRef(false);
  const lastScroll = useRef(0);

  const seek = () => {
    const v = videoRef.current;
    if (!v || seeking.current || hoverPlaying.current || !v.duration) return;
    const now = performance.now();
    if (now - lastSeek.current < 1000 / 24) {
      window.requestAnimationFrame(seek);
      return;
    }
    if (Math.abs(v.currentTime - target.current) < 1 / 48) return;
    seeking.current = true;
    lastSeek.current = now;
    v.currentTime = target.current;
  };

  // Real scrolling (not the spring settling) takes back control from a hover play.
  useMotionValueEvent(scrollYProgress, 'change', () => {
    if (mode !== 'scrub' || reduce) return;
    lastScroll.current = performance.now();
    const v = videoRef.current;
    if (hoverPlaying.current && v) {
      hoverPlaying.current = false;
      v.pause();
    }
  });

  useMotionValueEvent(smooth, 'change', (p) => {
    if (mode !== 'scrub' || reduce || hoverPlaying.current) return;
    target.current = Math.min(END, Math.max(0, p * END));
    seek();
  });

  useEffect(() => {
    const v = videoRef.current;
    if (!v || mode !== 'scrub') return;
    const onSeeked = () => {
      seeking.current = false;
      // Catch up if the target moved while this seek was in flight.
      const rvfc = (v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback;
      if (rvfc) rvfc.call(v, () => seek());
      else window.requestAnimationFrame(seek);
    };
    v.addEventListener('seeked', onSeeked);
    return () => v.removeEventListener('seeked', onSeeked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, mode]);

  // Hover on "Request a tour": if the video is at rest, play forward to the end and hold.
  useEffect(() => {
    if (mode !== 'scrub' || reduce) return;
    const btn = sectionRef.current?.querySelector<HTMLElement>('[data-arch-play]');
    if (!btn) return;
    const onEnter = () => {
      const v = videoRef.current;
      if (!v || !ready || performance.now() - lastScroll.current < 300 || v.currentTime >= END) return;
      hoverPlaying.current = true;
      v.play().catch(() => (hoverPlaying.current = false));
    };
    btn.addEventListener('mouseenter', onEnter);
    return () => btn.removeEventListener('mouseenter', onEnter);
  }, [mode, reduce, ready, sectionRef]);

  /* ---- mobile: play once when half in view ---- */
  useEffect(() => {
    if (mode !== 'play' || reduce || !near) return;
    const el = hostRef.current;
    const v = videoRef.current;
    if (!el || !v) return;
    let done = false;
    const io = new IntersectionObserver(
      (es) => {
        if (done || !es.some((e) => e.intersectionRatio >= 0.5)) return;
        done = true;
        v.play().catch(() => setFailed(true));
        io.disconnect();
      },
      { threshold: [0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, reduce, near, ready]);

  const showVideo = near && !reduce && !failed;

  return (
    <motion.div ref={hostRef} className={styles.door} style={mode === 'scrub' && !reduce ? { y: drift } : undefined} aria-hidden="true">
      {posterOk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={POSTER} alt="" className={styles.media} decoding="async" loading="lazy" onError={() => setPosterOk(false)} />
      )}
      {showVideo && (
        <video
          ref={videoRef}
          className={`${styles.media} ${styles.video} ${ready ? styles.ready : ''}`}
          muted
          playsInline
          preload="metadata"
          poster={posterOk ? POSTER : undefined}
          tabIndex={-1}
          disablePictureInPicture
          onLoadedData={() => setReady(true)}
          onEnded={(e) => e.currentTarget.pause()}
          onError={() => setFailed(true)}
        >
          <source src={WEBM} type="video/webm" />
          <source src={MP4} type="video/mp4" onError={() => setFailed(true)} />
        </video>
      )}
      <motion.span className={styles.frame} style={mode === 'scrub' && !reduce ? { opacity: frameO } : undefined} />
      {mode === 'scrub' && !reduce && <motion.span className={styles.soften} style={{ opacity: softO }} />}
    </motion.div>
  );
}
