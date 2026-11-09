import { useState } from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';

export function AnniversaryEnding() {
  const [wishes, setWishes] = useState<number>(0);
  const [wishTriggered, setWishTriggered] = useState<boolean>(false);

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
      className="relative py-28 sm:py-36 px-4 sm:px-6 max-w-4xl mx-auto z-10 flex flex-col items-center justify-center text-center select-none"
    >
      {/* Main Closing Heading */}
      <h2
        className="font-display italic tracking-tight leading-tight heading-luminous select-text mb-4"
        style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)' }}
      >
        Happy 2nd Anniversary
      </h2>

      <p className="font-editorial text-2xl sm:text-3xl text-[#F4F5FA] font-normal tracking-wide mb-10">
        Wam &amp; Bao
      </p>

      {/* Interactive Starlight Wish Button */}
      <div className="relative mb-14">
        <button
          onClick={handleMakeWish}
          className="liquid-glass-button group relative inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-[#F4F5FA] text-sm tracking-wide cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#B7D2F0] group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-display italic text-lg text-white">Send a Wish</span>
          {wishes > 0 && (
            <span className="ml-1 text-xs font-mono-code bg-[#B7D2F0]/20 text-[#B7D2F0] px-2 py-0.5 rounded-full border border-[#B7D2F0]/30">
              +{wishes}
            </span>
          )}
        </button>

        {wishTriggered && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-handwritten text-xl text-[#B7D2F0] animate-bounce">
            ✨ Wish sent into our sky ✨
          </div>
        )}
      </div>

      {/* Final Sign-off Detail */}
      <div className="pt-8 border-t border-[#B7D2F0]/15 w-full flex flex-col items-center gap-3">
        <p className="font-mono-code text-xs text-[#718FB8] tracking-widest uppercase">
          November 12, 2026
        </p>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          aria-label="Back to beginning"
          className="mt-4 flex items-center gap-1.5 text-xs font-mono-code text-[#718FB8] hover:text-[#B7D2F0] transition-colors cursor-pointer active:scale-95"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Return to Top</span>
        </button>
      </div>
    </footer>
  );
}
