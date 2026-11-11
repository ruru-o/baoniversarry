import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Music2, Volume2, VolumeX } from 'lucide-react';
import { comfyPiano, type PianoStatus } from '../audio/comfyPiano';

/**
 * Starts the cozy felt piano ambient track on entry, unlocks gracefully on first browser
 * gesture if autoplay is paused, and dissolves once "Songs that we listen all throughout the years" arrives.
 */
export function AmbientPianoControl() {
  const [status, setStatus] = useState<PianoStatus>(() => comfyPiano.getStatus());
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const unsubscribe = comfyPiano.subscribe(setStatus);

    const soundtrackEl = document.querySelector('[data-soundtrack-stage]');

    // Do not start background piano if the user reloads already scrolled to/past the soundtrack intro
    if (soundtrackEl && soundtrackEl.getBoundingClientRect().top < window.innerHeight * 0.45) {
      comfyPiano.fadeOutAndStop(0.5);

      return () => {
        unsubscribe();
      };
    }

    // Attempt immediate ambient playback on page load
    void comfyPiano.startOrResume(false);

    const wakeOnFirstGesture = (e: Event) => {
      if (buttonRef.current && e.target instanceof Node && buttonRef.current.contains(e.target)) {
        return;
      }

      if (comfyPiano.getStatus() === 'waiting') {
        void comfyPiano.startOrResume(true);
      }
    };

    window.addEventListener('pointerdown', wakeOnFirstGesture, { capture: true, passive: true });
    window.addEventListener('keydown', wakeOnFirstGesture, { capture: true, passive: true });
    window.addEventListener('touchstart', wakeOnFirstGesture, { capture: true, passive: true });

    return () => {
      unsubscribe();
      window.removeEventListener('pointerdown', wakeOnFirstGesture, { capture: true });
      window.removeEventListener('keydown', wakeOnFirstGesture, { capture: true });
      window.removeEventListener('touchstart', wakeOnFirstGesture, { capture: true });
    };
  }, []);

  const isVisible = status !== 'stopped';
  const isWaiting = status === 'waiting';
  const isMuted = status === 'muted';

  const ariaLabel = isWaiting
    ? 'Play background piano'
    : isMuted
      ? 'Unmute background piano'
      : 'Mute background piano';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          ref={buttonRef}
          key="ambient-piano-toggle"
          type="button"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 8, scale: 0.92 }}
          transition={{ duration: prefersReducedMotion ? 0.15 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => void comfyPiano.toggleMute()}
          aria-label={ariaLabel}
          title={ariaLabel}
          className={`fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 liquid-glass-nav rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-95 text-[#EDF4FF]/90 hover:text-white ${
            isWaiting ? 'gap-2 px-3.5 py-2' : 'w-9 h-9'
          }`}
        >
          {isWaiting ? (
            <>
              <Music2 className="w-3.5 h-3.5 text-[#BBD2EF] animate-pulse" />
              <span className="font-mono-code text-[11px] tracking-tight text-[#D7E6F8]/90">
                Piano
              </span>
            </>
          ) : isMuted ? (
            <VolumeX className="w-4 h-4 text-[#7186A9]" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#BBD2EF]" />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
