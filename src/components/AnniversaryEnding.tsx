import { ArrowUp } from 'lucide-react';
import { assetUrl } from '../utils/assetUrl';

export function AnniversaryEnding() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="future"
      className="relative min-h-[85vh] py-28 sm:py-36 px-4 sm:px-6 max-w-4xl mx-auto z-10 flex flex-col items-center justify-center text-center select-none"
    >
      {/* Main Closing Heading */}
      <h2
        className="font-display italic tracking-tight leading-tight heading-luminous select-text mb-4"
        style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)' }}
      >
        Happy 2nd Baoniversarry
      </h2>

      {/* Personal Handmade Attribution & Signed Closing */}
      <div className="mb-12 flex flex-col items-center gap-4 select-text">
        <p className="font-editorial italic text-lg sm:text-xl text-[#D7E6F8]/85 font-light tracking-[0.04em]">
          Made with all my love and care
        </p>

        <div className="inline-flex items-end justify-center gap-2.5 pt-1">
          <span className="font-editorial italic text-xl sm:text-2xl text-[#EDF4FF]/90 leading-none tracking-[0.03em]">
            From,
          </span>
          <img
            src={assetUrl('/bao-signature.png')}
            alt="Bao"
            draggable={false}
            className="w-[72px] sm:w-[82px] h-auto -mb-[3px] select-none pointer-events-none drop-shadow-[0_0_12px_rgba(187,210,239,0.38)]"
          />
          <span className="sr-only">Bao</span>
        </div>
      </div>

      {/* Final Sign-off Detail */}
      <div className="pt-8 border-t border-[#BBD2EF]/15 w-full flex flex-col items-center gap-3">
        <p className="font-mono-code text-xs text-[#7186A9] tracking-widest uppercase">
          November 12, 2026
        </p>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          aria-label="Back to beginning"
          className="mt-4 flex items-center gap-1.5 text-xs font-mono-code text-[#7186A9] hover:text-[#BBD2EF] transition-colors cursor-pointer active:scale-95"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Return to Top</span>
        </button>
      </div>
    </footer>
  );
}
