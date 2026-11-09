import { useEffect, useRef, useState } from 'react';

interface HeroIntroProps {
  onEnter: () => void;
}

// Thin CSS orbital rings rendered as absolute-positioned divs
// They encircle the h1, not drift through empty space
function OrbitalRings() {
  const rings = [
    { size: 520,  dur: 22,  opacity: 0.18, reverse: false, dotSize: 3,   dotGlow: 8 },
    { size: 680,  dur: 34,  opacity: 0.12, reverse: true,  dotSize: 4,   dotGlow: 10 },
    { size: 820,  dur: 48,  opacity: 0.09, reverse: false, dotSize: 2.5, dotGlow: 6 },
    { size: 940,  dur: 60,  opacity: 0.07, reverse: true,  dotSize: 3.5, dotGlow: 8 },
  ] as const;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
      {rings.map((ring, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width:  ring.size,
            height: ring.size * 0.4, // squash to ellipse — matches perspective feel
            border: `1px solid rgba(183,210,240,${ring.opacity})`,
            animation: `${ring.reverse ? 'orbitRotateReverse' : 'orbitRotate'} ${ring.dur}s linear infinite`,
            boxShadow: `0 0 20px 0 rgba(183,210,240,0.04)`,
          }}
        >
          {/* Leading dot */}
          <span
            className="absolute rounded-full"
            style={{
              width:     ring.dotSize,
              height:    ring.dotSize,
              top:       '50%',
              left:      '100%',
              transform: 'translate(-50%,-50%)',
              background: '#B7D2F0',
              boxShadow: `0 0 ${ring.dotGlow}px ${ring.dotGlow / 2}px rgba(183,210,240,0.7)`,
            }}
          />
          {/* Trailing dot at opposite pole */}
          <span
            className="absolute rounded-full"
            style={{
              width:     ring.dotSize * 0.7,
              height:    ring.dotSize * 0.7,
              top:       '50%',
              left:      '0%',
              transform: 'translate(-50%,-50%)',
              background: 'rgba(113,143,184,0.6)',
              boxShadow: `0 0 ${ring.dotGlow * 0.6}px ${ring.dotGlow * 0.3}px rgba(113,143,184,0.4)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function HeroIntro({ onEnter }: HeroIntroProps) {
  const [revealed, setRevealed] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="intro"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-16 z-10 text-center select-none overflow-hidden"
    >
      {/* Orbital rings centered on the title */}
      <OrbitalRings />

      {/* Inner nebula glow behind the title */}
      <div
        className="absolute pointer-events-none"
        style={{
          width:  600,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(113,143,184,0.14) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
        aria-hidden
      />

      {/* Date badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-subtle border border-[#B7D2F0]/20 text-[#B7D2F0] mb-10 font-mono-code text-xs tracking-widest uppercase"
        style={{
          opacity:   revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s',
        }}
      >
        <span style={{ fontSize: 10 }}>✦</span>
        Chapter II · November 12, 2026
        <span style={{ fontSize: 10 }}>✦</span>
      </div>

      {/* Main hollow noise-glow title */}
      <div className="relative">
        <h1
          ref={titleRef}
          className="font-display tracking-tight leading-none text-hollow-powder"
          style={{
            fontSize: 'clamp(2.8rem, 10vw, 7.5rem)',
            opacity:   revealed ? 1 : 0,
            transform: revealed ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
            transition: 'opacity 1.1s ease 0.5s, transform 1.1s cubic-bezier(0.25,0.46,0.45,0.94) 0.5s',
          }}
        >
          Happy Baoniversarry
        </h1>

        {/* Subtitle — editorial italic */}
        <p
          className="font-editorial italic text-[#DCE7F5]/80 font-light tracking-wide mt-4"
          style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.75rem)',
            opacity:   revealed ? 1 : 0,
            transform: revealed ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 1s ease 0.9s, transform 1s ease 0.9s',
          }}
        >
          Two years of us — written in light, kept between stars
        </p>
      </div>

      {/* The only "quote" — derived from an actual photo: the lockscreens at 8:32 AM Jan 25 */}
      <div
        className="max-w-md mx-auto mt-10 px-4"
        style={{
          opacity:   revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1s ease 1.2s, transform 1s ease 1.2s',
        }}
      >
        <p className="font-editorial text-lg text-[#B7D2F0]/75 font-light leading-relaxed italic">
          "Even our lock screens know where home is."
        </p>

        <div className="flex items-center justify-center gap-3 mt-5 text-[#718FB8]/70 font-mono-code text-[10px] tracking-widest">
          <span>WAM</span>
          <span className="text-[#B7D2F0]/50">◦</span>
          <span>BAO</span>
          <span className="text-[#B7D2F0]/50">◦</span>
          <span>731 DAYS</span>
        </div>
      </div>

      {/* CTA */}
      <div
        className="mt-14 flex flex-col items-center gap-4"
        style={{
          opacity:   revealed ? 1 : 0,
          transition: 'opacity 1s ease 1.5s',
        }}
      >
        <button
          onClick={onEnter}
          className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full liquid-glass border border-[#B7D2F0]/30 hover:border-[#B7D2F0]/60 text-[#F4F5FA] text-sm tracking-wide transition-all duration-300 hover:shadow-[0_0_30px_rgba(183,210,240,0.35)] hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#B7D2F0',
              boxShadow: '0 0 8px 3px rgba(183,210,240,0.5)',
            }}
          />
          <span className="font-display italic text-base">Open Our Story</span>
        </button>

        {/* Scroll hint */}
        <div className="flex flex-col items-center gap-1 text-[#718FB8]/50 mt-3">
          <span className="font-mono-code text-[9px] tracking-widest uppercase">scroll to explore</span>
          <div
            className="w-px bg-gradient-to-b from-[#718FB8]/40 to-transparent"
            style={{ height: 32 }}
          />
        </div>
      </div>
    </section>
  );
}
