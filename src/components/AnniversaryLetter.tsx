import { MAIN_PHOTOS } from '../data/photos';

export function AnniversaryLetter() {
  const heroPhoto = MAIN_PHOTOS.find(p => p.id === 'main-wonderful') || MAIN_PHOTOS[0];

  return (
    <section
      id="letter"
      className="relative min-h-screen py-24 px-4 sm:px-6 max-w-6xl mx-auto z-10"
    >
      {/* Atmospheric section header */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[#B7D2F0] text-xs font-mono-code uppercase tracking-widest mb-5">
          <span style={{ fontSize: 9 }}>✦</span>
          <span>The Anniversary Letter</span>
          <span style={{ fontSize: 9 }}>✦</span>
        </div>

        <h2
          className="font-display tracking-tight text-hollow-powder"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
        >
          Wam and Bao
        </h2>

        <p className="font-editorial italic text-lg text-[#718FB8] mt-3 font-light">
          Two years collected, one letter at a time.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

        {/* Left: Watercolor Portrait */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative group w-full max-w-sm">

            {/* Atmospheric background glow */}
            <div
              className="absolute -inset-6 pointer-events-none opacity-60 group-hover:opacity-85 transition-opacity duration-700"
              style={{
                background: 'radial-gradient(ellipse, rgba(113,143,184,0.25) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />

            {/* Portrait card */}
            <div
              className="relative liquid-glass border border-[#B7D2F0]/25 shadow-2xl"
              style={{ borderRadius: 6, padding: 10 }}
            >
              {/* Watercolor frame */}
              <div
                className="watercolor-frame relative overflow-hidden"
                style={{ aspectRatio: '4/5', borderRadius: 4, background: '#080D1C' }}
              >
                {/* The photograph */}
                <img
                  src={heroPhoto.fullUrl}
                  alt="Wam and Bao — the mirror portrait"
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'saturate(0.68) sepia(0.22) brightness(0.88) contrast(0.92)',
                  }}
                  loading="eager"
                />

                {/* Watercolor pigment bloom — top left warm light */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(ellipse 55% 45% at 25% 15%, rgba(220,231,245,0.22) 0%, transparent 55%),
                      radial-gradient(ellipse 40% 55% at 75% 85%, rgba(113,143,184,0.18) 0%, transparent 60%)
                    `,
                    mixBlendMode: 'screen',
                  }}
                />

                {/* Paper grain overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.055'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay',
                    opacity: 0.8,
                  }}
                />

                {/* Soft edge bleed — dissolves the photo edges into the card */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 0 40px 12px rgba(8,13,28,0.75)',
                  }}
                />

                {/* Gradient bottom fade */}
                <div
                  className="absolute bottom-0 left-0 right-0 pointer-events-none"
                  style={{
                    height: '45%',
                    background: 'linear-gradient(to top, rgba(8,13,28,0.85) 0%, transparent 100%)',
                  }}
                />

                {/* Caption pinned to bottom */}
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <p className="font-display italic text-[#DCE7F5] text-sm text-glow-soft">
                    &ldquo;You are so wonderful&rdquo;
                  </p>
                </div>
              </div>

              {/* Frame footer */}
              <div className="mt-2.5 px-1 flex items-center justify-between text-xs text-[#718FB8]">
                <span className="font-mono-code text-[9px] tracking-widest uppercase">01 // Portrait</span>
                <span className="font-handwritten text-base text-[#B7D2F0]">Always my favorite person</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: The letter */}
        <div className="lg:col-span-7">
          <article
            className="relative liquid-glass border border-[#B7D2F0]/20 shadow-2xl overflow-hidden"
            style={{ borderRadius: 16, padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}
          >
            {/* Faint atmospheric glow at top right */}
            <div
              className="absolute -top-16 -right-16 pointer-events-none"
              style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(183,210,240,0.05)',
                filter: 'blur(32px)',
              }}
            />

            {/* Letter header */}
            <div className="border-b border-[#B7D2F0]/12 pb-5 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-mono-code text-[10px] text-[#718FB8] tracking-widest uppercase">
                  Entry · November 12, 2026
                </span>

                <h3 className="font-display text-2xl sm:text-3xl text-[#F4F5FA] tracking-wide mt-1">
                  Dear Bao,
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#B7D2F0] bg-[#B7D2F0]/10 px-3 py-1 rounded-full border border-[#B7D2F0]/20">
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#B7D2F0',
                    boxShadow: '0 0 6px 2px rgba(183,210,240,0.5)',
                  }}
                />
                <span>2nd Orbit Complete</span>
              </div>
            </div>

            {/* Letter body — written from actual photo memories */}
            <div className="space-y-5 font-editorial text-base sm:text-lg text-[#DCE7F5]/88 leading-relaxed font-light">
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
                made everything simple: <em>Hubby &amp; Wipey</em>. And I think about watching our little
                white dog go from fitting in two hands to running joyfully through tall summer grass.
              </p>

              <p>
                Thank you for being my anchor, my favorite weirdo, my partner, and my peace.
                Thank you for two years of choosing me, for holding my hand through every crowded
                commute home, and for making our small corner of the world feel like the brightest
                place in the whole cosmos.
              </p>

              <p className="text-[#F4F5FA]">
                I wouldn&apos;t trade a single second of us. Here is to our second anniversary — and to
                every memory still waiting for us down the road.
              </p>
            </div>

            {/* Sign-off */}
            <div className="mt-8 pt-6 border-t border-[#B7D2F0]/12 flex items-end justify-between">
              <div>
                <p className="font-editorial italic text-sm text-[#718FB8]">
                  With all my love, always,
                </p>

                <p className="font-handwritten text-4xl sm:text-5xl text-[#B7D2F0] mt-1 text-noise-glow">
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
