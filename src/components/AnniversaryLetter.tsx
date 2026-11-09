import { MAIN_PHOTOS } from '../data/photos';

export function AnniversaryLetter() {
  const heroPhoto = MAIN_PHOTOS.find(p => p.id === 'main-wonderful') || MAIN_PHOTOS[0];

  return (
    <section
      id="letter"
      className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="text-center mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-panel text-[#B7D2F0] text-xs font-mono-code uppercase tracking-widest mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B7D2F0]" />
          <span>The Anniversary Letter</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B7D2F0]" />
        </div>

        <h2
          className="font-display italic tracking-tight heading-luminous select-text"
          style={{ fontSize: 'clamp(2.6rem, 6.5vw, 4.8rem)' }}
        >
          Wam and Bao
        </h2>

        <p className="font-editorial italic text-lg sm:text-xl text-[#718FB8] mt-3 font-light max-w-md mx-auto">
          Two years collected, handwritten across our quiet moments.
        </p>
      </div>

      {/* Main Grid: Realistic Watercolor Portrait + Liquid Glass Letter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

        {/* Left: Traditional Watercolor Treated Portrait */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative group w-full max-w-sm">

            {/* Subtle atmospheric glow behind the frame */}
            <div
              className="absolute -inset-4 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-700"
              style={{
                background: 'radial-gradient(ellipse, rgba(113, 143, 184, 0.2) 0%, transparent 70%)',
                filter: 'blur(24px)',
              }}
              aria-hidden="true"
            />

            {/* Archival Watercolor Mount */}
            <div className="watercolor-portrait-frame">
              <div
                className="watercolor-canvas aspect-[4/5]"
              >
                {/* Genuine photograph with delicate traditional watercolor tonality */}
                <img
                  src={heroPhoto.fullUrl}
                  alt="Wam and Bao in matching cozy hoodies"
                  className="w-full h-full object-cover select-none"
                  loading="eager"
                />

                {/* Bottom subtle text overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none z-10">
                  <p className="font-display italic text-[#DCE7F5] text-sm sm:text-base text-glow-soft">
                    &ldquo;You are so wonderful&rdquo;
                  </p>
                  <p className="font-mono-code text-[10px] text-[#718FB8] tracking-widest uppercase mt-0.5">
                    Our Favorite Mirror · Nov 2024
                  </p>
                </div>
              </div>

              {/* Minimal handwritten inscription on archival mount */}
              <div className="mt-3 px-1 flex items-center justify-between text-xs text-[#718FB8]">
                <span className="font-mono-code text-[10px] tracking-wider uppercase">01 // Portrait</span>
                <span className="font-handwritten text-lg text-[#B7D2F0]">Always my favorite person</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: The Handwritten Anniversary Letter in Liquid Glass */}
        <div className="lg:col-span-7">
          <article className="liquid-glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-10 relative overflow-hidden">
            {/* Specular highlight at top corner */}
            <div
              className="absolute -top-16 -right-16 pointer-events-none w-48 h-48 rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(183, 210, 240, 0.4) 0%, transparent 70%)',
                filter: 'blur(30px)',
              }}
              aria-hidden="true"
            />

            {/* Letter Header */}
            <div className="border-b border-[#B7D2F0]/15 pb-5 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-mono-code text-[10px] text-[#718FB8] tracking-widest uppercase">
                  Entry · November 12, 2026
                </span>

                <h3 className="font-display italic text-2xl sm:text-3xl text-[#F4F5FA] tracking-wide mt-1">
                  Dear Bao,
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono-code text-[#B7D2F0] bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-[#B7D2F0]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7D2F0] animate-beacon" />
                <span>2nd Orbit Complete</span>
              </div>
            </div>

            {/* Letter Body — 100% authentic, written from real photo memories */}
            <div className="space-y-5 font-editorial text-base sm:text-lg text-[#DCE7F5]/90 leading-relaxed font-light">
              <p>
                It is strange how two whole years can feel like both an entire lifetime and a single,
                beautiful afternoon. When I look back at where we started and where we are today,
                my heart is overwhelmingly grateful that you exist in my life.
              </p>

              <p>
                People always talk about grand gestures, but what I cherish most are the quiet ones:
                sitting across from each other with strawberry frappes and funny faces, your blue-nailed
                finger finding my cheek when you think I&apos;m being too serious, and those late-night
                Discord calls where the only light was the red glow from my keyboard and the blue from
                your screen.
              </p>

              <p>
                I think about waking up to our lock screens showing the same 8:32 AM on a Saturday —
                your photo on mine, mine on yours, completely unplanned. I think about the blue ballpoint
                note pinned to the wall with the bunny, the bear, and the cat, and those two words that
                made everything simple: <em className="text-[#B7D2F0] not-italic">Hubby &amp; Wipey</em>.
                And I think about watching our little white dog grow from fitting in two hands to
                running joyfully through tall green grass.
              </p>

              <p>
                Thank you for being my anchor, my favorite weirdo, my partner, and my peace.
                Thank you for two years of choosing me, for holding my hand through every crowded
                commute home, and for making our small corner of the world feel like the brightest
                place in the whole cosmos.
              </p>

              <p className="text-[#F4F5FA] font-normal pt-1">
                I wouldn&apos;t trade a single second of us. Here is to our second anniversary — and to
                every memory still waiting for us down the road.
              </p>
            </div>

            {/* Letter Sign-off */}
            <div className="mt-8 pt-6 border-t border-[#B7D2F0]/15 flex items-end justify-between">
              <div>
                <p className="font-editorial italic text-sm text-[#718FB8]">
                  With all my love, always,
                </p>

                <p className="font-handwritten text-4xl sm:text-5xl text-[#B7D2F0] mt-1 drop-shadow-[0_0_12px_rgba(183,210,240,0.4)]">
                  Wam
                </p>
              </div>

              <span className="font-mono-code text-[10px] text-[#718FB8] tracking-widest uppercase">
                Two Years &amp; Counting
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
