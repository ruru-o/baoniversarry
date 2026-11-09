import { PET_PHOTOS, type PhotoItem } from '../data/photos';

interface PetConstellationProps {
  onSelectPhoto: (photo: PhotoItem) => void;
}

function PawIcon({ size = 14, color = '#B7D2F0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="17" rx="5" ry="4" fill={color} opacity="0.9" />
      <ellipse cx="6.5" cy="13" rx="2" ry="2.5" fill={color} opacity="0.75" />
      <ellipse cx="17.5" cy="13" rx="2" ry="2.5" fill={color} opacity="0.75" />
      <ellipse cx="9" cy="9.5" rx="1.8" ry="2.2" fill={color} opacity="0.6" />
      <ellipse cx="15" cy="9.5" rx="1.8" ry="2.2" fill={color} opacity="0.6" />
    </svg>
  );
}

export function PetConstellation({ onSelectPhoto }: PetConstellationProps) {
  return (
    <section
      id="pets"
      className="relative py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-panel text-[#B7D2F0] text-xs font-mono-code uppercase tracking-widest mb-4">
          <PawIcon size={12} color="#B7D2F0" />
          <span>Little Constellations</span>
          <PawIcon size={12} color="#B7D2F0" />
        </div>

        <h2
          className="font-display italic tracking-tight heading-luminous select-text"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 4.4rem)' }}
        >
          A Corner of Our Universe
        </h2>

        <p className="font-editorial italic text-lg sm:text-xl text-[#718FB8] mt-3 font-light max-w-md mx-auto">
          Growing up alongside us — four chapters of soft, steady love.
        </p>
      </div>

      {/* Constellation Grid with Delicate Connecting Lines */}
      <div className="relative">
        {/* Subtle Constellation Lines (Desktop only) */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg
            className="w-full h-full opacity-35"
            viewBox="0 0 1000 420"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M 125 210 L 375 210 L 625 210 L 875 210"
              stroke="#B7D2F0"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            <circle cx="125" cy="210" r="3" fill="#B7D2F0" />
            <circle cx="375" cy="210" r="3" fill="#B7D2F0" />
            <circle cx="625" cy="210" r="3" fill="#B7D2F0" />
            <circle cx="875" cy="210" r="3" fill="#B7D2F0" />
          </svg>
        </div>

        {/* 4 Constellation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {PET_PHOTOS.map((pet, idx) => (
            <article
              key={pet.id}
              onClick={() => onSelectPhoto(pet)}
              className="group relative flex flex-col liquid-glass-card rounded-2xl p-3 cursor-pointer select-none active:scale-95"
            >
              {/* Star Node Header */}
              <div className="flex items-center justify-between px-2 py-1 mb-2 text-[10px] font-mono-code text-[#718FB8]">
                <span className="flex items-center gap-1.5 text-[#B7D2F0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B7D2F0] animate-beacon" />
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
                  style={{ filter: 'saturate(0.9) contrast(0.98)' }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#080D1C]/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Paw watermark */}
                <div className="absolute top-2 right-2 p-1.5 rounded-full liquid-glass-panel">
                  <PawIcon size={12} color="#B7D2F0" />
                </div>
              </div>

              {/* Caption */}
              <div className="p-3 text-left">
                <h3 className="font-display italic text-lg text-[#F4F5FA] group-hover:text-[#B7D2F0] transition-colors">
                  {pet.title}
                </h3>

                <p className="font-editorial italic text-xs text-[#DCE7F5]/80 mt-1 leading-relaxed font-light">
                  &ldquo;{pet.statement}&rdquo;
                </p>

                <div className="mt-2 text-right">
                  <span className="font-handwritten text-sm text-[#B7D2F0]/80">
                    tap to view ✦
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Bottom Note */}
      <div className="mt-12 text-center">
        <p className="font-editorial text-sm sm:text-base text-[#718FB8] italic flex items-center justify-center gap-2 flex-wrap">
          <PawIcon size={13} color="#B7D2F0" />
          <span>Part of our daily routine, our peace, and our shared home.</span>
          <PawIcon size={13} color="#B7D2F0" />
        </p>
      </div>
    </section>
  );
}
