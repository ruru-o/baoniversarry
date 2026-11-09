import { useState, useEffect, useRef } from 'react';
import { Compass, ChevronDown, Sparkles } from 'lucide-react';

interface HeroIntroProps {
  onEnter: () => void;
}

// Delicate, vector-sharp celestial orbital stroke that gracefully encircles the heading
function CelestialOrbitalTrail() {
  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible"
      aria-hidden="true"
    >
      <svg
        className="w-full max-w-5xl h-[340px] sm:h-[420px] overflow-visible opacity-75"
        viewBox="0 0 900 360"
        fill="none"
      >
        <defs>
          {/* Subtle gradient for the luminous traveling comet trail */}
          <linearGradient id="cometGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B7D2F0" stopOpacity="0" />
            <stop offset="50%" stopColor="#B7D2F0" stopOpacity="0.3" />
            <stop offset="85%" stopColor="#DCE7F5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>

          {/* Soft bloom filter for the orbital star */}
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Faint static trajectory track */}
        <ellipse
          cx="450"
          cy="180"
          rx="410"
          ry="130"
          stroke="rgba(183, 210, 240, 0.12)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />

        {/* Dynamic traveling luminous stroke */}
        <ellipse
          cx="450"
          cy="180"
          rx="410"
          ry="130"
          stroke="url(#cometGradient)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeDasharray="160 880"
          style={{
            animation: 'celestialOrbit 14s linear infinite',
            transformOrigin: '450px 180px',
          }}
        />

        {/* Secondary counter-orbit (whisper thin) */}
        <ellipse
          cx="450"
          cy="180"
          rx="340"
          ry="90"
          stroke="rgba(220, 231, 245, 0.08)"
          strokeWidth="1"
          strokeDasharray="2 12"
          transform="rotate(-5 450 180)"
        />
      </svg>
    </div>
  );
}

export function HeroIntro({ onEnter }: HeroIntroProps) {
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="intro"
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-28 pb-16 z-10 text-center select-none overflow-hidden"
    >
      {/* Delicate, vector-sharp celestial orbital trail (controlled, thin, elegant) */}
      <CelestialOrbitalTrail />

      {/* Atmospheric center illumination — very soft, deep diffuse light */}
      <div
        className="absolute pointer-events-none -z-10"
        style={{
          width: 'min(700px, 90vw)',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(113, 143, 184, 0.12) 0%, rgba(16, 24, 47, 0.04) 50%, transparent 75%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />

      {/* 01. Anniversary Date / Chapter Indicator (Apple-style Liquid Glass Pill) */}
      <div
        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full liquid-glass-panel text-[#B7D2F0] text-xs font-mono-code uppercase tracking-widest mb-8 sm:mb-10 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        <span
          className="inline-block w-2 h-2 rounded-full bg-[#B7D2F0] animate-beacon"
          style={{ boxShadow: '0 0 8px #B7D2F0' }}
        />
        <span>Chapter II · November 12, 2026</span>
        <span className="text-[#718FB8]/60">•</span>
        <span className="text-[#DCE7F5]/80">Two Years</span>
      </div>

      {/* 02. Main Prominent Editorial Heading */}
      <div
        className="relative max-w-5xl mx-auto transition-all duration-1000 delay-150"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        }}
      >
        <h1
          className="font-display italic tracking-tight leading-[0.95] heading-luminous select-text"
          style={{ fontSize: 'clamp(3.2rem, 9.5vw, 7.8rem)' }}
        >
          Happy Baoniversarry
        </h1>

        <p className="font-editorial italic text-xl sm:text-2xl md:text-3xl text-[#DCE7F5] font-light tracking-wide mt-3 sm:mt-4 text-glow-soft">
          Two years of us, preserved across our quiet universe
        </p>
      </div>

      {/* 03. Authentic Personal Inscription (From actual lockscreen photo at 8:32 AM) */}
      <div
        className="max-w-xl mx-auto mt-8 sm:mt-10 px-4 transition-all duration-1000 delay-300"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(14px)',
        }}
      >
        <p className="font-editorial text-lg sm:text-xl text-[#B7D2F0]/90 font-light leading-relaxed italic">
          &ldquo;Even our lock screens know where home is — 8:32 AM on a quiet Saturday, two phones keeping each other company.&rdquo;
        </p>

        {/* Minimal metadata counter */}
        <div className="flex items-center justify-center gap-3.5 mt-5 text-[#718FB8] font-mono-code text-[11px] tracking-widest">
          <span>WAM</span>
          <span className="text-[#B7D2F0]/50">•</span>
          <span>BAO</span>
          <span className="text-[#B7D2F0]/50">•</span>
          <span className="text-[#DCE7F5]">731 DAYS TOGETHER</span>
        </div>
      </div>

      {/* 04. Refined Interactive "Open Our Story" Liquid Glass Control */}
      <div
        className="mt-12 sm:mt-14 flex flex-col items-center gap-5 transition-all duration-1000 delay-500"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        <button
          onClick={onEnter}
          className="liquid-glass-button group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-[#F4F5FA] text-sm tracking-wide cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#B7D2F0] group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-display italic text-lg tracking-wide text-white">
            Open Our Story
          </span>
          <Compass className="w-4 h-4 text-[#718FB8] group-hover:text-[#B7D2F0] transition-colors" />
        </button>

        {/* Subtle, minimal scroll indicator with generous negative space */}
        <div className="flex flex-col items-center gap-1.5 text-[#718FB8]/60 mt-3">
          <span className="font-mono-code text-[9px] tracking-widest uppercase">
            Scroll to explore
          </span>
          <div className="w-px h-7 bg-gradient-to-b from-[#718FB8]/40 to-transparent animate-pulse" />
          <ChevronDown className="w-3.5 h-3.5 text-[#718FB8]/60 -mt-1" />
        </div>
      </div>
    </section>
  );
}
