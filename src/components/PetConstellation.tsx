import { Stars, Heart, Sparkles, PawPrint } from 'lucide-react';
import { PET_PHOTOS, type PhotoItem } from '../data/photos';

interface PetConstellationProps {
  onSelectPhoto: (photo: PhotoItem) => void;
}

export function PetConstellation({ onSelectPhoto }: PetConstellationProps) {
  return (
    <section
      id="pets"
      className="relative min-h-screen py-24 px-4 sm:px-6 max-w-6xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[#B7D2F0] text-xs font-mono-code uppercase tracking-wider mb-4">
          <PawPrint className="w-3.5 h-3.5 text-[#B7D2F0]" />
          <span>Our Little Constellations</span>
        </div>
        <h2 className="font-display text-4xl sm:text-6xl text-[#F4F5FA] tracking-tight text-glow-powder">
          A Corner of Our Universe
        </h2>
        <p className="font-editorial italic text-xl text-[#718FB8] mt-2 font-light max-w-md mx-auto">
          Growing up alongside us — four chapters of pure, gentle love.
        </p>
      </div>

      {/* Constellation Canvas / Grid */}
      <div className="relative">
        {/* Subtle Constellation Lines Background for Desktop */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-25" viewBox="0 0 1000 500" fill="none">
            <path
              d="M 150 150 L 380 320 L 620 180 L 850 350"
              stroke="#B7D2F0"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
            <circle cx="150" cy="150" r="4" fill="#B7D2F0" />
            <circle cx="380" cy="320" r="4" fill="#B7D2F0" />
            <circle cx="620" cy="180" r="4" fill="#B7D2F0" />
            <circle cx="850" cy="350" r="4" fill="#B7D2F0" />
          </svg>
        </div>

        {/* 4 Constellation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {PET_PHOTOS.map((pet, idx) => (
            <div
              key={pet.id}
              onClick={() => onSelectPhoto(pet)}
              className="group relative flex flex-col liquid-glass rounded-2xl p-3 border border-[#B7D2F0]/20 hover:border-[#B7D2F0]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(8,13,28,0.8),0_0_20px_rgba(183,210,240,0.25)] cursor-pointer"
            >
              {/* Star Node Header */}
              <div className="flex items-center justify-between px-2 py-1 mb-2 text-[10px] font-mono-code text-[#718FB8]">
                <span className="flex items-center gap-1 text-[#B7D2F0]">
                  <Stars className="w-3 h-3 text-[#B7D2F0]" />
                  <span>STAR 0{idx + 1}</span>
                </span>
                <span>{pet.dateHint}</span>
              </div>

              {/* Photo Box */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#050811]">
                <img
                  src={pet.thumbUrl}
                  alt={pet.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080D1C]/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Subtle Paw Icon on Card */}
                <div className="absolute top-2 right-2 p-1.5 rounded-full liquid-glass-subtle text-[#B7D2F0]/70 group-hover:text-[#B7D2F0]">
                  <PawPrint className="w-3 h-3" />
                </div>
              </div>

              {/* Caption & Statement */}
              <div className="p-3 text-left">
                <h3 className="font-display text-lg text-[#F4F5FA] group-hover:text-[#B7D2F0] transition-colors">
                  {pet.title}
                </h3>
                <p className="font-editorial italic text-xs text-[#DCE7F5]/80 mt-1 leading-relaxed font-light">
                  &ldquo;{pet.statement}&rdquo;
                </p>
                <div className="mt-2 text-right">
                  <span className="font-handwritten text-sm text-[#B7D2F0]/90">
                    tap to view ✨
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gentle Bottom Note */}
      <div className="mt-12 text-center">
        <p className="font-editorial text-sm sm:text-base text-[#718FB8] italic flex items-center justify-center gap-2">
          <Heart className="w-3.5 h-3.5 text-[#B7D2F0] fill-[#B7D2F0]/20" />
          <span>Part of our daily routine, our peace, and our shared home.</span>
          <Sparkles className="w-3.5 h-3.5 text-[#B7D2F0]" />
        </p>
      </div>
    </section>
  );
}
