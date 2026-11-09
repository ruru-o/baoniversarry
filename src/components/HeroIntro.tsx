import { useState, useEffect } from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';

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
        className="w-full max-w-5xl h-[340px] sm:h-[420px] overflow-visible opacity-60"
        viewBox="0 0 900 360"
        fill="none"
      >
        <defs>
          <linearGradient id="cometGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B7D2F0" stopOpacity="0" />
            <stop offset="60%" stopColor="#B7D2F0" stopOpacity="0.3" />
            <stop offset="90%" stopColor="#DCE7F5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Faint static trajectory track */}
        <ellipse
          cx="450"
          cy="180"
          rx="410"
          ry="130"
          stroke="rgba(183, 210, 240, 0.1)"
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
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="140 900"
          style={{
            animation: 'celestialOrbit 16s linear infinite',
            transformOrigin: '450px 180px',
          }}
        />
      </svg>
    </div>
  );
}

export function HeroIntro({ onEnter }: HeroIntroProps) {
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
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 z-10 text-center select-none overflow-hidden"
    >
      {/* Delicate, vector-sharp celestial orbital trail */}
      <CelestialOrbitalTrail />

      {/* Atmospheric center illumination */}
      <div
        className="absolute pointer-events-none -z-10"
        style={{
          width: 'min(650px, 90vw)',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(113, 143, 184, 0.08) 0%, transparent 70%)',
          filter: 'blur(45px)',
        }}
        aria-hidden="true"
      />

      {/* Anniversary Indicator */}
      <div
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-nav text-[#B7D2F0] text-xs font-mono-code uppercase tracking-widest mb-8 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#B7D2F0] animate-beacon"
          style={{ boxShadow: '0 0 6px #B7D2F0' }}
        />
        <span>November 12, 2026</span>
      </div>

      {/* Main Hollow Display Heading */}
      <div
        className="relative max-w-5xl mx-auto transition-all duration-1000 delay-150"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        }}
      >
        <h1
          className="font-display italic tracking-tight leading-[0.95] text-hollow-editorial cursor-default select-text"
          style={{ fontSize: 'clamp(3.4rem, 10vw, 8rem)' }}
        >
          Happy Baoniversarry
        </h1>

        <p className="font-editorial text-2xl sm:text-3xl md:text-4xl text-[#F4F5FA] font-normal tracking-wide mt-4">
          Wam &amp; Bao
        </p>
      </div>

      {/* Minimal Interactive Control */}
      <div
        className="mt-14 sm:mt-16 flex flex-col items-center gap-4 transition-all duration-1000 delay-300"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        <button
          onClick={onEnter}
          className="liquid-glass-button group relative inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-[#F4F5FA] text-sm tracking-wide cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#B7D2F0] group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-display italic text-base text-white">
            Explore Memories
          </span>
          <ArrowDown className="w-3.5 h-3.5 text-[#718FB8] group-hover:translate-y-0.5 transition-transform duration-300" />
        </button>
      </div>
    </section>
  );
}
