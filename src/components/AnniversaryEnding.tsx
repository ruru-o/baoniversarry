import { useState } from 'react';
import { Sparkles, Heart, ArrowUp, Stars } from 'lucide-react';
import { MAIN_PHOTOS } from '../data/photos';

export function AnniversaryEnding() {
  const [wishes, setWishes] = useState<number>(0);
  const [wishTriggered, setWishTriggered] = useState<boolean>(false);

  const finalPhoto = MAIN_PHOTOS.find(p => p.id === 'main-heart') || MAIN_PHOTOS[1];

  const handleMakeWish = () => {
    setWishes(w => w + 1);
    setWishTriggered(true);

    setTimeout(() => {
      setWishTriggered(false);
    }, 2500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="future"
      className="relative min-h-screen py-28 sm:py-36 px-4 sm:px-6 max-w-5xl mx-auto z-10 flex flex-col items-center justify-center text-center select-none"
    >
      {/* Decorative Constellation Ribbon */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-panel text-[#B7D2F0] text-xs font-mono-code uppercase tracking-wider mb-10">
        <Stars className="w-3.5 h-3.5 text-[#B7D2F0]" />
        <span>To Infinity · November 12, 2026</span>
      </div>

      {/* Final Commemorative Photo in Soft Glow */}
      <div className="relative mb-12 max-w-sm w-full mx-auto">
        <div
          className="absolute -inset-4 rounded-3xl opacity-50 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(183, 210, 240, 0.2) 0%, transparent 70%)',
            filter: 'blur(24px)',
          }}
          aria-hidden="true"
        />

        <div className="relative rounded-2xl overflow-hidden liquid-glass-card aspect-[4/3]">
          <img
            src={finalPhoto.fullUrl}
            alt={finalPhoto.title}
            className="w-full h-full object-cover filter contrast-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080D1C] via-[#080D1C]/25 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-center">
            <p className="font-handwritten text-xl sm:text-2xl text-[#F4F5FA] drop-shadow">
              Making a heart across our table 🤍
            </p>
          </div>
        </div>
      </div>

      {/* Main Closing Heading */}
      <h2
        className="font-display italic tracking-tight leading-tight max-w-3xl mb-6 heading-luminous select-text"
        style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}
      >
        Two years. All ours. And still so many pages left to fill.
      </h2>

      {/* Closing Statement */}
      <div className="max-w-2xl mx-auto space-y-4 font-editorial text-lg sm:text-xl text-[#DCE7F5]/90 leading-relaxed font-light mb-12 select-text">
        <p>
          Every commute, every cafe corner, every Discord call that ran past midnight, every soda can
          clinked against the other — none of it was nothing. All of it was ours.
        </p>

        <p className="italic text-[#B7D2F0]">
          Thank you for two years of choosing me, for the blue ink note still pinned to the wall,
          and for every ordinary day that became a memory I&apos;ll keep forever.
        </p>
      </div>

      {/* Interactive Starlight Wish Button */}
      <div className="relative mb-14">
        <button
          onClick={handleMakeWish}
          className="liquid-glass-button group relative inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-[#F4F5FA] text-sm tracking-wide cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#B7D2F0] group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-display italic text-lg text-white">Send a Wish into Our Sky</span>
          {wishes > 0 && (
            <span className="ml-1 text-xs font-mono-code bg-[#B7D2F0]/20 text-[#B7D2F0] px-2 py-0.5 rounded-full border border-[#B7D2F0]/30">
              +{wishes}
            </span>
          )}
        </button>

        {wishTriggered && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-handwritten text-xl text-[#B7D2F0] animate-bounce">
            ✨ Starlight sent across the cosmos! ✨
          </div>
        )}
      </div>

      {/* Final Sign-off Stamp */}
      <div className="pt-10 border-t border-[#B7D2F0]/15 w-full flex flex-col items-center gap-3">
        <p className="font-display italic text-2xl sm:text-3xl text-[#F4F5FA] tracking-wide">
          Happy 2nd Anniversary, Wam and Bao.
        </p>

        <p className="font-mono-code text-xs text-[#718FB8] tracking-widest uppercase">
          November 12, 2024 &mdash; November 12, 2026 &bull; Into Year Three
        </p>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          aria-label="Back to beginning"
          className="mt-6 flex items-center gap-1.5 text-xs font-mono-code text-[#718FB8] hover:text-[#B7D2F0] transition-colors cursor-pointer"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Return to the Beginning</span>
        </button>

        <div className="mt-4 flex items-center gap-1 text-[11px] text-[#718FB8]/60 font-mono-code">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-[#B7D2F0] fill-[#B7D2F0]" />
          <span>for Wam &amp; Bao</span>
        </div>
      </div>
    </footer>
  );
}
