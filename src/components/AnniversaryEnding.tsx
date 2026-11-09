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
    setTimeout(() => setWishTriggered(false), 2500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="future"
      className="relative min-h-screen py-28 px-4 sm:px-6 max-w-5xl mx-auto z-10 flex flex-col items-center justify-center text-center"
    >
      {/* Decorative Constellation Ribbon */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-subtle text-[#B7D2F0] text-xs font-mono-code uppercase tracking-wider mb-10">
        <Stars className="w-3.5 h-3.5 text-[#B7D2F0]" />
        <span>To Infinity · November 12, 2026</span>
      </div>

      {/* Final Commemorative Photo in Soft Glow */}
      <div className="relative mb-12 max-w-sm w-full mx-auto">
        <div className="absolute -inset-3 bg-gradient-to-t from-[#B7D2F0]/20 via-[#718FB8]/20 to-transparent rounded-3xl blur-2xl opacity-75" />
        <div className="relative rounded-2xl overflow-hidden liquid-glass border border-[#B7D2F0]/30 shadow-2xl aspect-[4/3]">
          <img
            src={finalPhoto.fullUrl}
            alt={finalPhoto.title}
            className="w-full h-full object-cover filter contrast-[1.03] saturate-[0.98]"
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
      <h2 className="font-display text-4xl sm:text-6xl md:text-7xl text-[#F4F5FA] tracking-tight leading-tight max-w-3xl mb-6 text-glow-powder">
        Two years of us. And so many more memories waiting to happen.
      </h2>

      {/* Closing Statement */}
      <div className="max-w-2xl mx-auto space-y-4 font-editorial text-lg sm:text-xl text-[#DCE7F5]/90 leading-relaxed font-light mb-12">
        <p>
          No matter how vast the universe is, or how fast the world moves around us, being with you is the one place where time always feels like it belongs to us.
        </p>
        <p className="italic text-[#B7D2F0]">
          Thank you for every smile, every drive, every late night, and every single day of the past two years.
        </p>
      </div>

      {/* Interactive Starlight Wish Button */}
      <div className="relative mb-14">
        <button
          onClick={handleMakeWish}
          className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full liquid-glass border border-[#B7D2F0]/40 hover:border-[#B7D2F0] text-[#F4F5FA] text-sm tracking-wide transition-all duration-300 hover:shadow-[0_0_30px_rgba(183,210,240,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#B7D2F0] group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-sans font-medium">Send a Wish into Our Sky</span>
          {wishes > 0 && (
            <span className="ml-1 text-xs font-mono-code bg-[#B7D2F0]/20 text-[#B7D2F0] px-2 py-0.5 rounded-full">
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
      <div className="pt-10 border-t border-[#B7D2F0]/15 w-full flex flex-col items-center gap-4">
        <p className="font-display text-2xl sm:text-3xl text-[#F4F5FA] tracking-wide">
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
