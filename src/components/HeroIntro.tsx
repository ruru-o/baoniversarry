import { ChevronDown, Sparkles, Stars } from 'lucide-react';

interface HeroIntroProps {
  onEnter: () => void;
}

export function HeroIntro({ onEnter }: HeroIntroProps) {
  return (
    <section
      id="intro"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-16 z-10 text-center select-none"
    >
      {/* Delicate floating badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-subtle border border-[#B7D2F0]/25 text-[#B7D2F0] mb-8 animate-float-gentle">
        <Stars className="w-3.5 h-3.5 text-[#B7D2F0]" />
        <span className="font-mono-code text-xs tracking-widest uppercase">
          Chapter II · November 12, 2026
        </span>
      </div>

      {/* Main Hollow Typography */}
      <div className="relative max-w-5xl mx-auto my-2">
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.95] text-hollow-powder mb-2">
          Happy Baoniversarry
        </h1>
        <p className="font-editorial italic text-2xl sm:text-3xl md:text-4xl text-[#DCE7F5] font-light tracking-wide text-glow-soft">
          Two years of us, preserved across the stars
        </p>
      </div>

      {/* Emotionally sincere quote */}
      <div className="max-w-xl mx-auto mt-8 px-4">
        <p className="font-editorial text-lg sm:text-xl text-[#B7D2F0]/85 font-light leading-relaxed italic">
          &ldquo;In a quiet corner of the endless dark, finding you made the whole sky feel like home.&rdquo;
        </p>
        <div className="flex items-center justify-center gap-3 mt-4 text-[#718FB8] font-mono-code text-xs">
          <span>WAM</span>
          <span className="text-[#B7D2F0]">•</span>
          <span>BAO</span>
          <span className="text-[#B7D2F0]">•</span>
          <span>731 DAYS TOGETHER</span>
        </div>
      </div>

      {/* Interactive CTA & Scroll Indicator */}
      <div className="mt-14 flex flex-col items-center gap-4">
        <button
          onClick={onEnter}
          className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full liquid-glass border border-[#B7D2F0]/30 hover:border-[#B7D2F0]/60 text-[#F4F5FA] text-sm tracking-wide transition-all duration-300 hover:shadow-[0_0_25px_rgba(183,210,240,0.35)] hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#B7D2F0] group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-sans font-medium">Open Our Story</span>
        </button>

        <div className="flex flex-col items-center gap-1 text-[#718FB8]/60 mt-4 animate-bounce">
          <span className="font-mono-code text-[10px] tracking-widest uppercase">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 text-[#718FB8]" />
        </div>
      </div>
    </section>
  );
}
