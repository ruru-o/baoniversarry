import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';

interface ScrollLitWordProps {
  word: string;
  index: number;
  totalWords: number;
  progress: MotionValue<number>;
  sweepStart: number;
  sweepEnd: number;
}

/** Proportional scroll runway per word (~17vh ≈ 1.5 wheel scrolls on desktop) for unhurried reading. */
const VH_PER_WORD = 17;
const MIN_BEAT_WEIGHT = 3.5;

interface BeatRange {
  start: number;
  end: number;
  weight: number;
}

function getBeatWordWeight(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(MIN_BEAT_WEIGHT, words);
}

interface BeatLayoutResult {
  ranges: BeatRange[];
  totalWeight: number;
}

function computeBeatRanges(beats: readonly string[]): BeatLayoutResult {
  const weights = beats.map(getBeatWordWeight);
  const totalWeight = Math.max(1, weights.reduce((acc, w) => acc + w, 0));
  let cursor = 0;

  const ranges = weights.map((weight) => {
    const start = cursor;
    const end = cursor + weight / totalWeight;

    cursor = end;

    return { start, end, weight };
  });

  return { ranges, totalWeight };
}

/** Single word that illuminates sequentially in place (~1.5 scrolls per word) without rushing ahead. */
function ScrollLitWord({
  word,
  index,
  totalWords,
  progress,
  sweepStart,
  sweepEnd,
}: ScrollLitWordProps) {
  const safeSpan = Math.max(0.04, sweepEnd - sweepStart);
  const wordSpanRatio = 1.08;
  const step = safeSpan / Math.max(1, Math.max(1, totalWords) - 1 + wordSpanRatio);

  const rawStart = sweepStart + index * step;
  const rawPeak = rawStart + step * wordSpanRatio;

  const wStart = Math.max(0.002, Math.min(0.985, rawStart));
  const wPeak = Math.max(wStart + 0.006, Math.min(0.996, rawPeak));
  const wMid = (wStart + wPeak) / 2;

  const opacity = useTransform(progress, [0, wStart, wMid, wPeak, 1], [0.3, 0.3, 0.72, 1, 1]);

  return (
    <motion.span
      style={{ opacity, willChange: 'opacity' }}
      className="inline-block text-[#F5FAFF]"
    >
      {word}
    </motion.span>
  );
}

interface ScrollLitSentenceProps {
  text: string;
  progress: MotionValue<number>;
  sweepStart: number;
  sweepEnd: number;
}

/** Wraps each word in a GPU-composited scroll illumination wave with natural wrapping. */
export function ScrollLitSentence({
  text,
  progress,
  sweepStart,
  sweepEnd,
}: ScrollLitSentenceProps) {
  const words = text.split(' ');

  return (
    <span
      className="inline-flex flex-wrap items-baseline justify-center gap-x-[0.27em] gap-y-[0.06em]"
      style={{
        textShadow: '0 0 26px rgba(187, 210, 239, 0.36), 0 2px 10px rgba(8, 14, 32, 0.6)',
      }}
    >
      {words.map((word, idx) => (
        <span key={`${word}-${idx}`} className="contents">
          <ScrollLitWord
            word={word}
            index={idx}
            totalWords={words.length}
            progress={progress}
            sweepStart={sweepStart}
            sweepEnd={sweepEnd}
          />
          {idx < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  );
}

interface StoryBeatProps {
  text: string;
  rangeStart: number;
  rangeEnd: number;
  isSingle: boolean;
  progress: MotionValue<number>;
  textClassName: string;
}

/** Single scroll-linked story title that holds static during the reading delay with word illumination. */
function StoryBeat({
  text,
  rangeStart,
  rangeEnd,
  isSingle,
  progress,
  textClassName,
}: StoryBeatProps) {
  const slice = Math.max(0.05, rangeEnd - rangeStart);
  const fadeWindow = isSingle ? 0.12 : Math.min(0.022, slice * 0.11);

  const enterEnd = rangeStart + fadeWindow;
  const exitStart = rangeEnd - fadeWindow;

  const sweepStart = isSingle ? 0.16 : rangeStart + fadeWindow + Math.min(0.005, slice * 0.025);
  const sweepEnd = isSingle ? 0.76 : exitStart - Math.min(0.01, slice * 0.045);

  const opacity = useTransform(progress, [rangeStart, enterEnd, exitStart, rangeEnd], [0, 1, 1, 0]);
  const y = useTransform(progress, [rangeStart, enterEnd, exitStart, rangeEnd], [12, 0, 0, -12]);

  const scale = useTransform(
    progress,
    [rangeStart, enterEnd, exitStart, rangeEnd],
    [0.985, 1, 1, 0.99]
  );

  return (
    <motion.div
      style={{ opacity, y, scale, willChange: 'transform, opacity' }}
      className="absolute inset-0 flex items-center justify-center px-6 text-center pointer-events-none"
    >
      <p
        className={`font-display italic tracking-tight text-balance leading-[1.2] max-w-4xl mx-auto ${textClassName}`}
      >
        <ScrollLitSentence
          text={text}
          progress={progress}
          sweepStart={sweepStart}
          sweepEnd={sweepEnd}
        />
      </p>
    </motion.div>
  );
}

interface ScrollStorySequenceProps {
  id?: string;
  beats: readonly string[];
  beatHeightVh?: number;
  variant?: 'editorial' | 'intimate';
}

/**
 * Sticky scroll-delay storytelling sequence that holds each narrative title
 * still on screen to be read while scrolling illuminates words as a live indicator.
 */
export function ScrollStorySequence({
  id,
  beats,
  beatHeightVh = 95,
  variant = 'editorial',
}: ScrollStorySequenceProps) {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isSingle = beats.length === 1;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: isSingle ? ['start 0.24', 'end 0.76'] : ['start 0.10', 'end 0.90'],
  });

  const textClassName =
    variant === 'editorial'
      ? 'text-[clamp(1.7rem,4.1vw,3.1rem)]'
      : 'text-[clamp(1.55rem,3.6vw,2.75rem)]';

  if (prefersReducedMotion) {
    return (
      <section
        id={id}
        className="relative py-20 sm:py-28 px-6 max-w-4xl mx-auto z-10 text-center space-y-16 select-none"
      >
        {beats.map((line) => (
          <p
            key={line}
            className={`font-display italic tracking-tight heading-luminous text-balance leading-[1.2] ${textClassName}`}
          >
            {line}
          </p>
        ))}
      </section>
    );
  }

  const { ranges, totalWeight } = computeBeatRanges(beats);

  const wordPacedHoldVh = isSingle
    ? Math.round((totalWeight * VH_PER_WORD) / 0.6 - 48)
    : Math.round((totalWeight * VH_PER_WORD) / 0.71 - 20);

  const floorHoldVh = isSingle ? beatHeightVh + 25 : beats.length * beatHeightVh + 15;
  const stickyHoldVh = Math.max(wordPacedHoldVh, floorHoldVh);
  const totalHeightVh = stickyHoldVh + 100;

  return (
    <section
      id={id}
      ref={containerRef}
      className="relative z-10 select-none"
      style={{ height: `${totalHeightVh}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="relative w-full max-w-5xl mx-auto h-72 sm:h-80">
          {beats.map((text, idx) => (
            <StoryBeat
              key={text}
              text={text}
              rangeStart={ranges[idx].start}
              rangeEnd={ranges[idx].end}
              isSingle={isSingle}
              progress={scrollYProgress}
              textClassName={textClassName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
