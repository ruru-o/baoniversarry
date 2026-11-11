import { useId, useRef, useState, useCallback, useEffect } from 'react';
import {
  motion,
  animate,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';

// Synthesize gentle paper rustle and crystal chime on envelope open / fold
export function playEnvelopeAudio(kind: 'open' | 'close' | 'tap') {
  try {
    const AudioCtx = window.AudioContext;

    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Soft textured paper rustle
    const dur = kind === 'open' ? 0.24 : 0.14;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.65;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(kind === 'open' ? 1400 : 880, now);
    filter.Q.setValueAtTime(1.1, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(kind === 'tap' ? 0.03 : 0.055, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0008, now + dur);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // Subtle bell-like powder-blue sparkle chime on full open
    if (kind === 'open') {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now + 0.04); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.22); // A5
      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(0.035, now + 0.08);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now + 0.03);
      osc.stop(now + 0.46);
    }

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 550);
  } catch {
    // Silent fallback when browser autoplay blocks Web Audio
  }
}

interface BlueHeartStampProps {
  className?: string;
}

/** Simple blue magical heart postage stamp */
export function BlueHeartStamp({ className = '' }: BlueHeartStampProps) {
  const uid = useId().replace(/:/g, '');
  const maskId = `stampPerf-${uid}`;
  const bgId = `stampPaper-${uid}`;
  const auraId = `stampAura-${uid}`;
  const heartId = `stampHeart-${uid}`;

  return (
    <div
      className={`relative select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 76 88"
        fill="none"
        className="w-[60px] h-[70px] sm:w-[66px] sm:h-[76px] drop-shadow-[0_4px_14px_rgba(8,14,32,0.72)]"
      >
        <defs>
          {/* Perforated stamp silhouette mask */}
          <mask id={maskId}>
            <rect x="4" y="4" width="68" height="80" rx="3" fill="white" />
            {[10, 20, 30, 40, 50, 60, 66].map((x) => (
              <g key={`tb-${x}`}>
                <circle cx={x} cy="4" r="2.7" fill="black" />
                <circle cx={x} cy="84" r="2.7" fill="black" />
              </g>
            ))}
            {[12, 22, 32, 42, 52, 62, 72, 76].map((y) => (
              <g key={`lr-${y}`}>
                <circle cx="4" cy={y} r="2.7" fill="black" />
                <circle cx="72" cy={y} r="2.7" fill="black" />
              </g>
            ))}
          </mask>

          <linearGradient id={bgId} x1="8" y1="8" x2="68" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#142B5E" />
            <stop offset="55%" stopColor="#0D1D44" />
            <stop offset="100%" stopColor="#08122B" />
          </linearGradient>

          <radialGradient id={auraId} cx="50%" cy="48%" r="48%">
            <stop offset="0%" stopColor="#BBD2EF" stopOpacity="0.48" />
            <stop offset="65%" stopColor="#7186A9" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0D1D44" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={heartId} x1="20" y1="26" x2="56" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EDF4FF" />
            <stop offset="45%" stopColor="#BBD2EF" />
            <stop offset="100%" stopColor="#7DA7DF" />
          </linearGradient>
        </defs>

        {/* Serrated parchment backing */}
        <g mask={`url(#${maskId})`}>
          <rect x="4" y="4" width="68" height="80" fill={`url(#${bgId})`} />
          <rect
            x="9"
            y="9"
            width="58"
            height="70"
            rx="1.5"
            stroke="#BBD2EF"
            strokeOpacity="0.34"
            strokeWidth="1"
          />
          <rect
            x="11.5"
            y="11.5"
            width="53"
            height="65"
            rx="1"
            stroke="#EDF4FF"
            strokeOpacity="0.12"
            strokeWidth="0.7"
          />
        </g>

        {/* Soft celestial aura behind heart */}
        <circle cx="38" cy="44" r="24" fill={`url(#${auraId})`} />

        {/* Simple clean blue magical heart with crisp starlight glow */}
        <path
          d="M38 59.5 C38 59.5 21 48.2 21 36.8 C21 31.1 25.4 27 30.6 27 C34 27 36.6 28.9 38 31.4 C39.4 28.9 42 27 45.4 27 C50.6 27 55 31.1 55 36.8 C55 48.2 38 59.5 38 59.5 Z"
          fill={`url(#${heartId})`}
          stroke="#EDF4FF"
          strokeOpacity="0.88"
          strokeWidth="1.35"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(187, 210, 239, 0.7))' }}
        />

        {/* Delicate inner glass sheen */}
        <path
          d="M25.5 35.5 C25.8 32.5 28.2 30.6 31 30.8"
          stroke="#FFFFFF"
          strokeOpacity="0.78"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 3 tiny four-point magical glints */}
        <path
          d="M52 22 L53 24.8 L55.8 25.8 L53 26.8 L52 29.6 L51 26.8 L48.2 25.8 L51 24.8 Z"
          fill="#EDF4FF"
          fillOpacity="0.92"
        />
        <circle cx="23.5" cy="24.5" r="1.35" fill="#D7E6F8" fillOpacity="0.85" />
        <circle cx="53.5" cy="61.5" r="1.2" fill="#BBD2EF" fillOpacity="0.8" />
      </svg>
    </div>
  );
}

interface SparkleSpec {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  delay: number;
}

const OPEN_SPARKLES: SparkleSpec[] = [
  { id: 1, x: 50, y: 42, dx: -36, dy: -68, size: 7, delay: 0.05 },
  { id: 2, x: 52, y: 40, dx: 42, dy: -76, size: 6, delay: 0.08 },
  { id: 3, x: 76, y: 24, dx: 26, dy: -54, size: 8, delay: 0.1 },
  { id: 4, x: 26, y: 36, dx: -32, dy: -52, size: 5, delay: 0.12 },
  { id: 5, x: 64, y: 32, dx: 18, dy: -82, size: 5, delay: 0.06 },
  { id: 6, x: 38, y: 34, dx: -14, dy: -72, size: 6, delay: 0.14 },
];

interface InteractiveEnvelopeProps {
  onOpened: () => void;
}

export function InteractiveEnvelope({ onOpened }: InteractiveEnvelopeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [stage, setStage] = useState<'idle' | 'opening'>('idle');
  const [isHovered, setIsHovered] = useState(false);

  const svgUid = useId().replace(/:/g, '');
  const idSideLeft = `envSideLeft-${svgUid}`;
  const idSideRight = `envSideRight-${svgUid}`;
  const idBottom = `envBottom-${svgUid}`;
  const idGrain = `paperGrainEnv-${svgUid}`;
  const idFlapOuter = `flapOuterFill-${svgUid}`;
  const idFlapInner = `flapInnerFill-${svgUid}`;

  const envelopeRef = useRef<HTMLDivElement>(null);
  const openingLockRef = useRef(false);
  const openTimerRef = useRef<number | null>(null);
  const flapAnimRef = useRef<ReturnType<typeof animate> | null>(null);
  const letterAnimRef = useRef<ReturnType<typeof animate> | null>(null);
  const envelopeYAnimRef = useRef<ReturnType<typeof animate> | null>(null);
  const envelopeScaleAnimRef = useRef<ReturnType<typeof animate> | null>(null);
  const canHoverTiltRef = useRef(false);

  // Gesture state refs (1:1 pointer tracking without per-move re-renders)
  const pointerDownRef = useRef(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const lastMoveTimeRef = useRef(0);
  const lastMoveYRef = useRef(0);
  const velocityYRef = useRef(0);

  // Motion values
  const flapAngle = useMotionValue(0); // 0deg = sealed, 179deg = hinged backward-upward along top seam
  const letterExtractY = useMotionValue(0); // 0px = tucked inside pocket, -118px = slid upward out of mouth
  const envelopeY = useMotionValue(0);
  const envelopeScale = useMotionValue(1);
  const tiltXRaw = useMotionValue(0);
  const tiltYRaw = useMotionValue(0);
  const tiltX = useSpring(tiltXRaw, { stiffness: 220, damping: 24 });
  const tiltY = useSpring(tiltYRaw, { stiffness: 220, damping: 24 });

  // Derive 3D flap rotation & sequential paper reveal from flap progress
  const flapRotateX = useTransform(flapAngle, (deg) => deg);
  const flapZIndex = useTransform(flapAngle, (deg) => (deg > 90 ? 15 : 40));
  const dragPeekY = useTransform(flapAngle, [0, 100, 179], [14, 14, -26]);

  const combinedPaperY = useTransform(
    [dragPeekY, letterExtractY],
    ([dragY, extractY]: number[]) => dragY + extractY
  );

  const peekScale = useTransform(flapAngle, [0, 100, 179], [0.97, 0.97, 1]);
  const linerGlowOpacity = useTransform(flapAngle, [0, 85, 179], [0, 0.2, 0.78]);

  const stopFlapAnim = useCallback(() => {
    if (flapAnimRef.current) {
      flapAnimRef.current.stop();
      flapAnimRef.current = null;
    }

    if (letterAnimRef.current) {
      letterAnimRef.current.stop();
      letterAnimRef.current = null;
    }

    if (envelopeYAnimRef.current) {
      envelopeYAnimRef.current.stop();
      envelopeYAnimRef.current = null;
    }

    if (envelopeScaleAnimRef.current) {
      envelopeScaleAnimRef.current.stop();
      envelopeScaleAnimRef.current = null;
    }
  }, []);

  const snapFlapClosed = useCallback(() => {
    stopFlapAnim();

    if (prefersReducedMotion) {
      flapAngle.set(0);
      letterExtractY.set(0);
      envelopeY.set(0);
      envelopeScale.set(1);

      return;
    }

    flapAnimRef.current = animate(flapAngle, 0, {
      type: 'spring',
      stiffness: 380,
      damping: 34,
    });
    letterAnimRef.current = animate(letterExtractY, 0, {
      type: 'spring',
      stiffness: 380,
      damping: 34,
    });
    envelopeYAnimRef.current = animate(envelopeY, 0, {
      type: 'spring',
      stiffness: 380,
      damping: 32,
    });
    envelopeScaleAnimRef.current = animate(envelopeScale, 1, {
      type: 'spring',
      stiffness: 420,
      damping: 32,
    });
  }, [
    envelopeScale,
    envelopeY,
    flapAngle,
    letterExtractY,
    prefersReducedMotion,
    stopFlapAnim,
  ]);

  /** Playful interruptible upward bounce hint on click/tap — never opens on click. */
  const triggerClickBounce = useCallback(() => {
    stopFlapAnim();
    playEnvelopeAudio('tap');

    if (prefersReducedMotion) {
      flapAngle.set(0);
      envelopeY.set(0);
      envelopeScale.set(1);

      return;
    }

    envelopeYAnimRef.current = animate(envelopeY, 0, {
      type: 'spring',
      velocity: -780,
      stiffness: 280,
      damping: 10,
      mass: 1,
    });
    envelopeScaleAnimRef.current = animate(envelopeScale, 1, {
      type: 'spring',
      velocity: 0.6,
      stiffness: 340,
      damping: 12,
    });
    flapAnimRef.current = animate(flapAngle, 0, {
      type: 'spring',
      velocity: 950,
      stiffness: 260,
      damping: 11,
    });
  }, [envelopeScale, envelopeY, flapAngle, prefersReducedMotion, stopFlapAnim]);

  useEffect(() => {
    canHoverTiltRef.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    return () => {
      stopFlapAnim();

      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current);
      }
    };
  }, [stopFlapAnim]);

  const triggerOpenSequence = useCallback(() => {
    if (openingLockRef.current) return;

    openingLockRef.current = true;
    stopFlapAnim();
    setStage('opening');
    playEnvelopeAudio('open');
    tiltXRaw.set(0);
    tiltYRaw.set(0);

    if (prefersReducedMotion) {
      flapAngle.set(179);
      letterExtractY.set(-96);
      envelopeY.set(0);
      envelopeScale.set(1);
      onOpened();

      return;
    }

    envelopeYAnimRef.current = animate(envelopeY, 0, {
      type: 'spring',
      stiffness: 340,
      damping: 28,
    });
    envelopeScaleAnimRef.current = animate(envelopeScale, 1, {
      type: 'spring',
      stiffness: 380,
      damping: 30,
    });

    // Beat 1: Hinge top flap cleanly open backward to 179deg along top crease
    flapAnimRef.current = animate(flapAngle, 179, {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
    });

    // Beat 2: Once flap clears the opening (>90deg), slide folded letter smoothly upward out of pocket
    letterAnimRef.current = animate(letterExtractY, -118, {
      delay: 0.24,
      duration: 0.48,
      ease: [0.22, 1, 0.36, 1],
    });

    openTimerRef.current = window.setTimeout(() => {
      onOpened();
    }, 760);
  }, [
    envelopeScale,
    envelopeY,
    flapAngle,
    letterExtractY,
    onOpened,
    prefersReducedMotion,
    stopFlapAnim,
    tiltXRaw,
    tiltYRaw,
  ]);

  // 3D parallax tilt on hover + 1:1 upward drag tracking
  const handlePointerMoveCard = (e: React.PointerEvent<HTMLDivElement>) => {
    if (openingLockRef.current || !envelopeRef.current) return;

    if (pointerDownRef.current) {
      const dy = e.clientY - startYRef.current;
      const dx = e.clientX - startXRef.current;

      if (Math.hypot(dx, dy) > 10) {
        movedRef.current = true;
      }

      const now = performance.now();
      const dt = Math.max(8, now - lastMoveTimeRef.current);

      velocityYRef.current = ((e.clientY - lastMoveYRef.current) / dt) * 1000;
      lastMoveTimeRef.current = now;
      lastMoveYRef.current = e.clientY;

      if (!movedRef.current) return;

      if (dy < 0) {
        // Pulling upward: 145px upward drag opens flap 179deg and lifts envelope subtly with finger
        const progress = Math.min(1, Math.abs(dy) / 145);

        flapAngle.set(progress * 179);
        envelopeY.set(-Math.min(24, Math.abs(dy) * 0.16));
      } else {
        // Pulling downward against folded pocket: soft rubber-band resistance
        const resist = Math.min(8, dy * 0.08);

        flapAngle.set(-resist);
        envelopeY.set(Math.min(12, dy * 0.12));
      }

      envelopeScale.set(1);

      return;
    }

    if (!canHoverTiltRef.current || prefersReducedMotion) return;

    const rect = envelopeRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    tiltXRaw.set(-ny * 6.5);
    tiltYRaw.set(nx * 7.5);
  };

  const handlePointerEnter = () => {
    if (openingLockRef.current) return;

    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    tiltXRaw.set(0);
    tiltYRaw.set(0);

    if (
      !openingLockRef.current &&
      !pointerDownRef.current &&
      (flapAngle.get() !== 0 || envelopeY.get() !== 0)
    ) {
      snapFlapClosed();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (openingLockRef.current) return;

    stopFlapAnim();
    pointerDownRef.current = true;
    movedRef.current = false;
    startYRef.current = e.clientY;
    startXRef.current = e.clientX;
    lastMoveYRef.current = e.clientY;
    lastMoveTimeRef.current = performance.now();
    velocityYRef.current = 0;

    if (!prefersReducedMotion) {
      envelopeScaleAnimRef.current = animate(envelopeScale, 0.975, {
        duration: 0.08,
        ease: 'easeOut',
      });
      envelopeYAnimRef.current = animate(envelopeY, 4, {
        duration: 0.08,
        ease: 'easeOut',
      });
    }

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current || openingLockRef.current) return;

    pointerDownRef.current = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore if pointer capture already released
    }

    if (!movedRef.current) {
      // Clicking/tapping never opens the envelope — gives an inviting bounce instead
      triggerClickBounce();

      return;
    }

    const currentDeg = flapAngle.get();
    const fastUpwardFlick = velocityYRef.current < -460 && currentDeg >= 28;

    if (currentDeg >= 62 || fastUpwardFlick) {
      triggerOpenSequence();
    } else {
      playEnvelopeAudio('close');
      snapFlapClosed();
    }
  };

  const handlePointerCancel = () => {
    if (!pointerDownRef.current || openingLockRef.current) return;

    pointerDownRef.current = false;
    tiltXRaw.set(0);
    tiltYRaw.set(0);
    snapFlapClosed();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      triggerOpenSequence();

      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerClickBounce();
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0, transition: { duration: 0.18 } }
          : {
              opacity: 0,
              y: 28,
              scale: 0.95,
              transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
            }
      }
      transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-[540px] mx-auto flex flex-col items-center pt-16 sm:pt-20"
    >
      {/* Envelope Interaction Wrapper (click bounces upward hint; drag upward to open) */}
      <div
        ref={envelopeRef}
        data-testid="interactive-envelope"
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-valuetext="Closed envelope — drag upward to open"
        aria-label="Drag envelope upward to open anniversary letter"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMoveCard}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
        onDragStart={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
        style={{
          touchAction: 'pan-x',
        }}
        className="group relative w-full aspect-[16/10] cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BBD2EF]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#080E20] rounded-lg select-none"
      >
        {/* Soft under-envelope glow on hover / opening */}
        <div
          aria-hidden="true"
          className="absolute -inset-4 rounded-3xl transition-opacity duration-500 pointer-events-none"
          style={{
            opacity: stage === 'opening' ? 0.9 : isHovered ? 0.65 : 0.28,
            background:
              'radial-gradient(ellipse at center, rgba(187, 210, 239, 0.24) 0%, rgba(16, 26, 53, 0) 72%)',
            filter: 'blur(18px)',
          }}
        />

        {/* Physical Bounce + Hover Tilt Shell (strictly 2D stacking inside so flap z-index never fights preserve-3d Z-buffer) */}
        <motion.div
          style={{
            y: envelopeY,
            scale: envelopeScale,
            rotateX: tiltX,
            rotateY: tiltY,
            transformPerspective: 1400,
          }}
          className="relative w-full h-full rounded-lg"
        >
          {/* Layer 1: Inner Envelope Backplate & Midnight Liner */}
          <div
            className="absolute inset-0 z-10 rounded-lg overflow-hidden border-x border-b border-[#BBD2EF]/22 shadow-[0_28px_65px_-14px_rgba(0,0,0,0.9)]"
            style={{
              background:
                'linear-gradient(180deg, #10214A 0%, #0A1533 65%, #070E22 100%)',
            }}
          >
            {/* Subtle interior pocket throat depth below crease */}
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#071026]/55 via-[#091532]/25 to-transparent pointer-events-none" />
            {/* Subtle luminous liner glint when flap opens */}
            <motion.div
              style={{ opacity: linerGlowOpacity }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(187,210,239,0.2)_0%,transparent_65%)] pointer-events-none"
            />
          </div>

          {/* Layer 4: Isolated 3D Hinged Top Flap + Blue Simple Magical Heart Stamp */}
          <motion.div
            style={{
              zIndex: flapZIndex,
              perspective: 1400,
            }}
            className="absolute inset-x-0 top-0 h-[56.8%] pointer-events-none"
          >
            <motion.div
              style={{
                rotateX: flapRotateX,
                transformOrigin: '50% 0%',
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full h-full"
            >
              {/* Outer Flap Face (visible 0deg..90deg) */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <svg
                  viewBox="0 0 540 192"
                  preserveAspectRatio="none"
                  className="w-full h-full block drop-shadow-[0_10px_18px_rgba(0,0,0,0.58)]"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={idFlapOuter} x1="270" y1="0" x2="270" y2="192" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1B346D" />
                      <stop offset="65%" stopColor="#132653" />
                      <stop offset="100%" stopColor="#0E1D43" />
                    </linearGradient>
                  </defs>

                  {/* Tapered stationery flap attached flush along the y=0 top crease */}
                  <path
                    d="M8 0 L532 0 Q540 0 540 8 L540 42 C538 78 392 152 292 184 Q270 192 248 184 C148 152 2 78 0 42 L0 8 Q0 0 8 0 Z"
                    fill={`url(#${idFlapOuter})`}
                  />
                  {/* Top crease bevel */}
                  <path
                    d="M8 1 L532 1"
                    stroke="#FFFFFF"
                    strokeOpacity="0.32"
                    strokeWidth="1.3"
                  />
                  {/* Tapered outer flap edge highlight */}
                  <path
                    d="M1 42 C3 78 148 152 248 184 Q270 192 292 184 C392 152 537 78 539 42"
                    fill="none"
                    stroke="#BBD2EF"
                    strokeOpacity="0.34"
                    strokeWidth="1.25"
                  />
                </svg>

                {/* Top-Right Perforated Blue Heart Stamp resting completely inside upper flap */}
                <div className="absolute top-2 right-3 sm:top-2.5 sm:right-3.5 -rotate-[5deg] scale-[0.78] sm:scale-[0.84] origin-top-right transition-transform duration-300 group-hover:scale-[0.84] sm:group-hover:scale-[0.9] group-hover:-rotate-[2deg]">
                  <BlueHeartStamp />
                </div>
              </div>

              {/* Inner Flap Liner (rotateY 180deg keeps y=0 glued at top crease and points tip UPWARD when open) */}
              <div
                className="absolute inset-0"
                style={{
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <svg
                  viewBox="0 0 540 192"
                  preserveAspectRatio="none"
                  className="w-full h-full block drop-shadow-[0_-6px_16px_rgba(0,0,0,0.42)]"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={idFlapInner} x1="270" y1="0" x2="270" y2="192" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#10214A" />
                      <stop offset="45%" stopColor="#14295D" />
                      <stop offset="100%" stopColor="#0E1E46" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M8 0 L532 0 Q540 0 540 8 L540 42 C538 78 392 152 292 184 Q270 192 248 184 C148 152 2 78 0 42 L0 8 Q0 0 8 0 Z"
                    fill={`url(#${idFlapInner})`}
                  />
                  {/* Subtle top crease fold line matching back wall */}
                  <line
                    x1="8"
                    y1="1"
                    x2="532"
                    y2="1"
                    stroke="#BBD2EF"
                    strokeOpacity="0.16"
                    strokeWidth="1"
                  />
                  {/* Crisp inner edge highlight pointing upward */}
                  <path
                    d="M1 42 C3 78 148 152 248 184 Q270 192 292 184 C392 152 537 78 539 42"
                    fill="none"
                    stroke="#BBD2EF"
                    strokeOpacity="0.28"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>
            </motion.div>
          </motion.div>

          {/* Layer 2: Tucked Letter Stationery rising out AFTER flap hinges open */}
          <motion.div
            style={{
              y: combinedPaperY,
              scale: peekScale,
            }}
            className="absolute inset-x-5 sm:inset-x-7 top-4 bottom-4 z-20 rounded-xl p-5 sm:p-6 pointer-events-none border border-[#BBD2EF]/32 shadow-[0_10px_30px_rgba(0,0,0,0.68)]"
            aria-hidden="true"
          >
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background:
                  'linear-gradient(165deg, rgba(24, 46, 92, 0.98) 0%, rgba(13, 25, 55, 0.99) 100%)',
              }}
            />
            <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="relative z-10 h-full rounded-lg border border-[#BBD2EF]/14 p-4 sm:p-5 flex flex-col justify-start">
              <div className="h-[1px] w-full bg-[#BBD2EF]/15 mb-4" />
              <div className="space-y-3 opacity-35">
                <div className="h-1.5 w-3/4 rounded-full bg-[#D7E6F8]/40" />
                <div className="h-1.5 w-full rounded-full bg-[#BBD2EF]/30" />
                <div className="h-1.5 w-5/6 rounded-full bg-[#BBD2EF]/28" />
                <div className="h-1.5 w-2/3 rounded-full bg-[#BBD2EF]/24" />
              </div>
            </div>
          </motion.div>

          {/* Layer 3: Front Pocket Geometry (Left, Right, Bottom Paper Folds) */}
          <div className="absolute inset-0 z-30 rounded-lg overflow-hidden pointer-events-none">
            <svg
              viewBox="0 0 540 338"
              preserveAspectRatio="none"
              className="w-full h-full block"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={idSideLeft} x1="0" y1="0" x2="270" y2="338" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#142754" />
                  <stop offset="100%" stopColor="#0C1838" />
                </linearGradient>
                <linearGradient id={idSideRight} x1="540" y1="0" x2="270" y2="338" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#12234D" />
                  <stop offset="100%" stopColor="#0B1633" />
                </linearGradient>
                <linearGradient id={idBottom} x1="270" y1="150" x2="270" y2="338" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#172C5E" />
                  <stop offset="45%" stopColor="#102047" />
                  <stop offset="100%" stopColor="#0A1430" />
                </linearGradient>
                <filter id={idGrain} x="0%" y="0%" width="100%" height="100%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" stitchTiles="stitch" />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
              </defs>

              {/* Left and right interior wing folds */}
              <polygon points="0,0 264,174 0,338" fill={`url(#${idSideLeft})`} />
              <polygon points="540,0 276,174 540,338" fill={`url(#${idSideRight})`} />
              <line x1="0" y1="0" x2="264" y2="174" stroke="#BBD2EF" strokeOpacity="0.16" strokeWidth="1" />
              <line x1="540" y1="0" x2="276" y2="174" stroke="#BBD2EF" strokeOpacity="0.16" strokeWidth="1" />

              {/* Bottom pocket fold */}
              <path
                d="M0 338 L242 152 Q270 132 298 152 L540 338 Z"
                fill={`url(#${idBottom})`}
              />
              <path
                d="M0 338 L242 152 Q270 132 298 152 L540 338"
                fill="none"
                stroke="#D7E6F8"
                strokeOpacity="0.24"
                strokeWidth="1.2"
              />

              {/* Subtle matte paper grain overlay */}
              <rect width="540" height="338" filter={`url(#${idGrain})`} opacity="0.035" />
            </svg>
          </div>

          {/* Subtle Magical Starlight Motes drifting up only during opening */}
          {stage === 'opening' && !prefersReducedMotion && (
            <div className="absolute inset-0 z-50 pointer-events-none overflow-visible" aria-hidden="true">
              {OPEN_SPARKLES.map((sp) => (
                <motion.span
                  key={sp.id}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                  animate={{
                    opacity: [0, 0.95, 0],
                    x: sp.dx,
                    y: sp.dy,
                    scale: [0.6, 1.15, 0.7],
                  }}
                  transition={{ duration: 0.56, delay: sp.delay, ease: [0.23, 1, 0.32, 1] }}
                  style={{
                    left: `${sp.x}%`,
                    top: `${sp.y}%`,
                    width: sp.size,
                    height: sp.size,
                  }}
                  className="absolute rounded-full bg-[#EDF4FF] shadow-[0_0_10px_#BBD2EF]"
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Minimal Interactive Affordance Caption */}
      <p className="mt-5 font-mono-code text-xs text-[#7186A9] tracking-wider select-none">
        drag me up
      </p>
    </motion.div>
  );
}
