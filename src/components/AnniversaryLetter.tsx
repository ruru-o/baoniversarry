import { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Mail } from 'lucide-react';
import {
  InteractiveEnvelope,
  playEnvelopeAudio,
} from './InteractiveEnvelope';
import { assetUrl } from '../utils/assetUrl';

interface AnniversaryLetterProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AnniversaryLetter({
  isOpen: controlledIsOpen,
  onOpenChange,
}: AnniversaryLetterProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const setLetterOpen = (nextOpen: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  const handleOpenEnvelope = () => {
    setLetterOpen(true);

    requestAnimationFrame(() => {
      const sectionEl = sectionRef.current;

      if (!sectionEl) return;

      const { top } = sectionEl.getBoundingClientRect();

      if (Math.abs(top) > 16) {
        sectionEl.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    });
  };

  const handleCloseEnvelope = () => {
    playEnvelopeAudio('close');
    setLetterOpen(false);
  };

  return (
    <section
      ref={sectionRef}
      id="letter"
      className="relative min-h-screen py-24 sm:py-28 px-4 sm:px-6 max-w-3xl mx-auto z-10 select-none flex items-center justify-center"
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <InteractiveEnvelope
            key="closed-envelope"
            onOpened={handleOpenEnvelope}
          />
        ) : (
          <motion.article
            key="opened-letter"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 28, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0.16 } }
                : {
                    opacity: 0,
                    y: 22,
                    scale: 0.96,
                    transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] },
                  }
            }
            transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
            className="liquid-glass-panel rounded-3xl p-8 sm:p-11 md:p-12 w-full relative overflow-hidden select-text"
          >
            {/* Top specular highlight */}
            <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Letter Header with Fold Control */}
            <div className="border-b border-[#BBD2EF]/15 pb-4 mb-6 flex items-center justify-between gap-4">
              <h3 className="font-display italic text-3xl sm:text-4xl md:text-[2.45rem] text-[#EDF4FF] tracking-wide">
                Dear Wam,
              </h3>

              <button
                type="button"
                onClick={handleCloseEnvelope}
                className="px-3.5 py-2 rounded-full liquid-glass-card text-[#D7E6F8]/80 hover:text-white text-xs font-mono-code flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                aria-label="Fold letter back into envelope"
              >
                <Mail className="w-3.5 h-3.5 text-[#BBD2EF]" />
                <span>Fold</span>
              </button>
            </div>

            {/* Letter Body — Personal writing rendered verbatim */}
            <div className="space-y-4 sm:space-y-5 font-editorial text-[17.5px] sm:text-[19px] md:text-[20px] text-[#EDF4FF]/90 leading-[1.72] font-light">
              <p>So.... where do I even start? hahahaha</p>

              <p>
                Two years together. Honestly, looking back at everything we&apos;ve been through,
                it&apos;s nice to see how much we&apos;ve grown and how far we&apos;ve come.
                There&apos;s still so much I look forward to experiencing with you, and I hope we get
                to make plenty more memories together.
              </p>

              <p>
                Of course, things haven&apos;t always been perfect. We&apos;ve had our fair share of
                ups and downs, misunderstandings, and random arguments, but I think that&apos;s just
                part of being together. What matters to me is that, despite everything, we continue
                to choose each other and make things work.
              </p>

              <p>
                Thank you for being my partner, my peace, and my favorite person to spend even the
                most ordinary days with. Thank you for all the little things, the laughter, the
                patience, and the happiness you bring into my life. You make even the simplest
                moments feel special, and I hope you know how much I appreciate having you around.
              </p>

              <p>
                I know I&apos;m not always the best at expressing how I feel, and there are probably
                times when I fall short, but I hope you never doubt how much you mean to me. I still
                have so much to learn, not just about myself, but about loving you better. I want
                us to keep growing together, supporting each other, and enjoying everything life
                has in store for us.
              </p>

              <p>
                It&apos;s funny to think about how much has happened in these two years, and yet it
                still feels like there&apos;s so much more ahead of us. More memories to make, more
                places to go, more things to experience, and definitely more random moments to laugh
                about.
              </p>

              <p className="text-[#EDF4FF] font-normal pt-1">
                Happy 2nd Anniversary, love! Thank you for these two years and for making life a
                little brighter just by being part of it. I&apos;m looking forward to everything
                that&apos;s still ahead of us. Here&apos;s to us and to many more years together. I
                love you!
              </p>
            </div>

        {/* Sign-off */}
        <div className="mt-8 pt-6 border-t border-[#BBD2EF]/15 flex items-end justify-between">
          <div>
            <p className="font-editorial italic text-base text-[#7186A9]">
              With all my love,
            </p>

            <img
              src={assetUrl('/bao-signature.png')}
              alt="Bao"
              draggable={false}
              className="mt-1.5 w-[96px] sm:w-[110px] h-auto select-none pointer-events-none drop-shadow-[0_0_10px_rgba(255,255,255,0.18)]"
            />
          </div>

          <span className="font-mono-code text-xs sm:text-sm text-[#7186A9] uppercase tracking-widest">
            November 12, 2026
          </span>
        </div>
          </motion.article>
        )}
      </AnimatePresence>
    </section>
  );
}
