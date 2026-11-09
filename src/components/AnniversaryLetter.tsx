import { Heart, Compass, Sparkles } from 'lucide-react';
import { MAIN_PHOTOS } from '../data/photos';

export function AnniversaryLetter() {
  const heroPhoto = MAIN_PHOTOS.find(p => p.id === 'main-wonderful') || MAIN_PHOTOS[0];

  return (
    <section
      id="letter"
      className="relative min-h-screen py-24 px-4 sm:px-6 max-w-6xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[#B7D2F0] text-xs font-mono-code uppercase tracking-wider mb-4">
          <Heart className="w-3.5 h-3.5 text-[#B7D2F0] fill-[#B7D2F0]/20" />
          <span>The Anniversary Letter</span>
        </div>
        <h2 className="font-display text-4xl sm:text-6xl text-[#F4F5FA] tracking-tight text-glow-powder">
          Wam and Bao
        </h2>
        <p className="font-editorial italic text-xl text-[#718FB8] mt-2 font-light">
          A collection of quiet moments, handwritten across two full years.
        </p>
      </div>

      {/* Main Grid: Watercolor Portrait + Letter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left: Watercolor-Treated Portrait */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative group w-full max-w-md">
            {/* Soft decorative glow behind */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-[#718FB8]/25 via-[#B7D2F0]/15 to-transparent rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Watercolor Paper Frame */}
            <div className="relative watercolor-card p-3 sm:p-4 liquid-glass border border-[#B7D2F0]/30 shadow-2xl">
              <div className="relative overflow-hidden rounded-lg aspect-[4/5] bg-[#080D1C]">
                {/* Original Photograph */}
                <img
                  src={heroPhoto.fullUrl}
                  alt={heroPhoto.title}
                  className="w-full h-full object-cover filter contrast-[1.03] saturate-[0.95] transition-transform duration-700 group-hover:scale-[1.02]"
                  loading="lazy"
                />

                {/* Watercolor Texture / Diffusion Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080D1C]/80 via-transparent to-[#10182F]/20 pointer-events-none" />
                <div className="absolute inset-0 border border-[#B7D2F0]/20 rounded-lg pointer-events-none" />
                
                {/* Mirror caption badge */}
                <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded liquid-glass-subtle text-center">
                  <p className="font-display italic text-[#DCE7F5] text-sm">
                    &ldquo;You are so wonderful&rdquo;
                  </p>
                  <p className="font-mono-code text-[10px] text-[#718FB8] tracking-widest uppercase mt-0.5">
                    Preserved Memory · November 2024
                  </p>
                </div>
              </div>

              {/* Little handwritten annotation on paper */}
              <div className="mt-3 px-1 flex items-center justify-between text-xs text-[#718FB8] font-mono-code">
                <span>01 // PORTRAIT</span>
                <span className="font-handwritten text-base text-[#B7D2F0]">Always my favorite person</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: The Handwritten Anniversary Letter */}
        <div className="lg:col-span-7">
          <article className="liquid-glass rounded-2xl p-6 sm:p-10 border border-[#B7D2F0]/20 shadow-2xl relative overflow-hidden">
            {/* Subtle background stationery lines */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#B7D2F0]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Letter Header */}
            <div className="border-b border-[#B7D2F0]/15 pb-6 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-mono-code text-xs text-[#718FB8] tracking-widest uppercase">
                  Entry · November 12, 2026
                </span>
                <h3 className="font-display text-2xl sm:text-3xl text-[#F4F5FA] tracking-wide mt-1">
                  Dear Bao,
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#B7D2F0] bg-[#B7D2F0]/10 px-3 py-1 rounded-full border border-[#B7D2F0]/20">
                <Compass className="w-3 h-3 text-[#B7D2F0]" />
                <span>2nd Orbit Complete</span>
              </div>
            </div>

            {/* Letter Body */}
            <div className="space-y-5 font-editorial text-base sm:text-lg text-[#DCE7F5]/90 leading-relaxed font-light">
              <p>
                It is strange how two whole years can feel like both an entire lifetime and a single, beautiful afternoon. When I look back at where we started and look at where we are today, my heart is just overwhelmingly grateful that you exist in my life.
              </p>

              <p>
                People always talk about big grand gestures, but the things I cherish most are the ones that happened quietly: sitting across from each other in crowded cafes with strawberry frappes, your hands reaching out to squish my cheeks when you think I am being too serious, and those late-night Discord calls where the glow of our screens was the only light in the room.
              </p>

              <p>
                I think about waking up and seeing our lock screens still synchronized at 8:32 AM, our matching black rings, and watching our little white pup grow from a tiny bundle wrapped in fleece into the happiest dog in the grass. In every single ordinary day, you brought warmth, laughter, and a sense of safety I never knew I was looking for.
              </p>

              <p>
                Thank you for being my anchor, my favorite weirdo, my partner, and my peace. Thank you for two years of choosing me, for holding my hand on the crowded rides home, and for making our little corner of the world feel like the brightest place in the cosmos.
              </p>

              <p className="font-normal text-[#F4F5FA] pt-2">
                I wouldn&apos;t trade a single second of us. Here is to our second anniversary, and to every little memory still waiting for us down the road.
              </p>
            </div>

            {/* Letter Sign-off */}
            <div className="mt-8 pt-6 border-t border-[#B7D2F0]/15 flex items-end justify-between">
              <div>
                <p className="font-editorial italic text-sm text-[#718FB8]">
                  With all my love, always,
                </p>
                <p className="font-handwritten text-3xl sm:text-4xl text-[#B7D2F0] mt-1 font-bold">
                  Wam
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs text-[#718FB8] font-mono-code">
                <Sparkles className="w-3.5 h-3.5 text-[#B7D2F0]" />
                <span>Two Years & Counting</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
