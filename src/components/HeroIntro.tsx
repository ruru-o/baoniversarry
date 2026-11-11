import { useState, useEffect } from 'react';

interface LetterConfig {
  ch: string;
  delay: number;
  rot: number;
  y: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  marginRight: string;
  isSpace?: boolean;
}

function buildHandwrittenLine(text: string, baseDelay: number): LetterConfig[] {
  const letters: LetterConfig[] = [];
  const charCounts: Record<string, number> = {};

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === ' ') {
      letters.push({
        ch: ' ',
        delay: baseDelay + i * 0.075,
        rot: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        marginRight: '0.1em',
        isSpace: true,
      });

      continue;
    }

    charCounts[ch] = (charCounts[ch] || 0) + 1;
    const occ = charCounts[ch];

    // Deterministic pseudo-random seed per character position
    const seed = ((i * 29) + ch.charCodeAt(0) * 47) % 1000;

    // 1. Subtle micro-tilt (strictly +/- 1deg so letters read level and comfy, never crooked)
    const motorRot = ((seed % 11) - 5) * 0.14;

    // 2. Whisper-soft baseline breath
    const waveY = Math.sin((i / Math.max(1, text.length - 1)) * Math.PI) * 0.9;
    const motorY = ((seed % 7) - 3) * 0.22;
    const totalY = waveY + motorY;

    // 3. Soft organic variation for repeated characters (avoids rigid stencil uniformity)
    let varSkew = 0;
    let varScaleX = 1;
    let varScaleY = 1;
    let varWeight = 1;

    if (occ > 1) {
      varSkew = occ % 2 === 0 ? -0.45 : 0.45;
      varScaleX = occ % 2 === 0 ? 0.985 : 1.015;
      varScaleY = occ % 2 === 0 ? 1.012 : 0.988;
      varWeight = occ % 2 === 0 ? 0.97 : 1.02;
    }

    // 4. Gentle pen pressure translucency
    const inkOpacity = Math.min(1, Math.max(0.91, 0.96 + ((seed % 7) - 3) * 0.012 * varWeight));

    // 5. Restrained organic spacing
    const kern = ((seed % 5) - 2) * 0.0025;

    letters.push({
      ch,
      delay: baseDelay + i * 0.065,
      rot: motorRot + varSkew,
      y: totalY,
      scaleX: varScaleX,
      scaleY: varScaleY,
      opacity: inkOpacity,
      marginRight: `${kern}em`,
    });
  }

  return letters;
}

// Delicate, organic flourish underline that draws beneath the title
function HandwrittenFlourishUnderline() {
  return (
    <div className="w-full max-w-lg sm:max-w-xl mx-auto mt-1 sm:mt-1.5 pointer-events-none overflow-visible">
      <svg
        viewBox="0 0 760 48"
        className="w-full h-auto overflow-visible opacity-80"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 60 22 C 180 34, 340 38, 520 28 C 620 22, 700 12, 730 8 C 700 16, 560 36, 380 40 C 220 44, 100 36, 40 28"
          stroke="#BBD2EF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 900,
            strokeDashoffset: 900,
            animation: 'flourishDraw 2.2s cubic-bezier(0.25, 1, 0.5, 1) forwards 1.5s',
            filter: 'drop-shadow(0 0 8px rgba(187, 210, 239, 0.65))',
          }}
        />
        {/* End flick dot */}
        <circle
          cx="732"
          cy="8"
          r="2.2"
          fill="#EDF4FF"
          style={{
            opacity: 0,
            animation: 'inkFlowReveal 0.4s ease forwards 2.7s',
            filter: 'drop-shadow(0 0 6px #BBD2EF)',
          }}
        />
      </svg>
    </div>
  );
}

// Smooth, comfy handwritten title with gentle natural character individuality
function HumanHandwrittenTitle() {
  const line1Letters = buildHandwrittenLine('Happy 2nd', 0.2);
  const line2Letters = buildHandwrittenLine('Baoniversarry', 0.85);

  return (
    <div
      className="relative z-20 select-none text-center font-handwritten"
      aria-label="Happy 2nd Baoniversarry"
      style={{ maxWidth: 'min(940px, 94vw)' }}
    >
      {/* Line 1: Happy 2nd */}
      <h1 className="text-[clamp(2.65rem,5.6vw,4.5rem)] font-medium leading-[1.12] text-[#EDF4FF] tracking-[0.015em] drop-shadow-[0_0_18px_rgba(187,210,239,0.5)]">
        {line1Letters.map((cfg, idx) => (
          <span
            key={`l1-${idx}`}
            style={{
              display: 'inline-block',
              transform: `translateY(${cfg.y.toFixed(2)}px) rotate(${cfg.rot.toFixed(2)}deg) scale(${cfg.scaleX.toFixed(3)}, ${cfg.scaleY.toFixed(3)})`,
              opacity: 0,
              animation: `inkFlowReveal 0.42s cubic-bezier(0.25, 1, 0.5, 1) forwards ${cfg.delay.toFixed(3)}s`,
              marginRight: cfg.marginRight,
              color: `rgba(237, 244, 255, ${cfg.opacity.toFixed(2)})`,
            }}
          >
            {cfg.isSpace ? '\u00A0' : cfg.ch}
          </span>
        ))}
      </h1>

      {/* Line 2: Baoniversarry */}
      <div className="text-[clamp(3.6rem,8.8vw,7rem)] font-semibold leading-[1.04] text-[#D7E6F8] tracking-[0.005em] mt-1 sm:mt-1.5 drop-shadow-[0_0_24px_rgba(187,210,239,0.65)]">
        {line2Letters.map((cfg, idx) => (
          <span
            key={`l2-${idx}`}
            style={{
              display: 'inline-block',
              transform: `translateY(${cfg.y.toFixed(2)}px) rotate(${cfg.rot.toFixed(2)}deg) scale(${cfg.scaleX.toFixed(3)}, ${cfg.scaleY.toFixed(3)})`,
              opacity: 0,
              animation: `inkFlowReveal 0.42s cubic-bezier(0.25, 1, 0.5, 1) forwards ${cfg.delay.toFixed(3)}s`,
              marginRight: cfg.marginRight,
              color: `rgba(215, 230, 248, ${cfg.opacity.toFixed(2)})`,
            }}
          >
            {cfg.isSpace ? '\u00A0' : cfg.ch}
          </span>
        ))}
      </div>

      {/* Elegant hand-drawn flourish underline */}
      <HandwrittenFlourishUnderline />
    </div>
  );
}

// Delicate, architectural vector orbit that frames the typography
function CelestialOrbitalGeometry() {
  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible"
      aria-hidden="true"
    >
      <svg
        className="w-full max-w-5xl h-[360px] sm:h-[460px] overflow-visible opacity-55"
        viewBox="0 0 900 380"
        fill="none"
      >
        <defs>
          <linearGradient id="orbitCometGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BBD2EF" stopOpacity="0" />
            <stop offset="55%" stopColor="#BBD2EF" stopOpacity="0.25" />
            <stop offset="85%" stopColor="#D7E6F8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Faint static trajectory path */}
        <ellipse
          cx="450"
          cy="190"
          rx="420"
          ry="135"
          stroke="rgba(187, 210, 239, 0.12)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />

        {/* Dynamic traveling celestial beam */}
        <ellipse
          cx="450"
          cy="190"
          rx="420"
          ry="135"
          stroke="url(#orbitCometGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="140 950"
          style={{
            animation: 'celestialOrbit 18s linear infinite',
            transformOrigin: '450px 190px',
          }}
        />
      </svg>
    </div>
  );
}

export function HeroIntro() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 80);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="intro"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-16 z-10 text-center select-none overflow-hidden"
    >
      {/* Delicate celestial orbital geometry */}
      <CelestialOrbitalGeometry />

      {/* Atmospheric center powder-blue illumination aperture */}
      <div
        className="absolute pointer-events-none -z-10"
        style={{
          width: 'min(700px, 92vw)',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(187, 210, 239, 0.08) 0%, rgba(16, 26, 53, 0.45) 55%, transparent 75%)',
          filter: 'blur(50px)',
        }}
        aria-hidden="true"
      />

      {/* Main Animated Human Handwritten Title */}
      <div
        className="relative flex flex-col items-center transition-all duration-1000 delay-150 z-20"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        }}
      >
        <HumanHandwrittenTitle />
      </div>
    </section>
  );
}
