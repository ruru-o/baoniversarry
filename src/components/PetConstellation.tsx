import { PET_PHOTOS, type PhotoItem } from '../data/photos';

interface PetConstellationProps {
  onSelectPhoto: (photo: PhotoItem) => void;
}

// Paw print SVG icon
function PawIcon({ size = 14, color = '#B7D2F0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="17" rx="5" ry="4" fill={color} opacity="0.9" />
      <ellipse cx="6.5" cy="13" rx="2" ry="2.5" fill={color} opacity="0.75" />
      <ellipse cx="17.5" cy="13" rx="2" ry="2.5" fill={color} opacity="0.75" />
      <ellipse cx="9" cy="9.5" rx="1.8" ry="2.2" fill={color} opacity="0.6" />
      <ellipse cx="15" cy="9.5" rx="1.8" ry="2.2" fill={color} opacity="0.6" />
    </svg>
  );
}

export function PetConstellation({ onSelectPhoto }: PetConstellationProps) {
  // Constellation line path connecting the 4 card centers (approximate positions)
  return (
    <section
      id="pets"
      className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[#B7D2F0] text-xs font-mono-code uppercase tracking-widest mb-5">
          <PawIcon size={11} color="#B7D2F0" />
          <span>Little Constellations</span>
          <PawIcon size={11} color="#B7D2F0" />
        </div>

        <h2
          className="font-display tracking-tight text-hollow-powder"
          style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}
        >
          A Corner of Our Universe
        </h2>

        <p className="font-editorial italic text-lg text-[#718FB8] mt-3 font-light max-w-md mx-auto">
          Growing up alongside us — four chapters of soft, steady love.
        </p>
      </div>

      {/* Grid + constellation lines */}
      <div className="relative">
        {/* Dashed constellation lines (decorative desktop only) */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none" aria-hidden>
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 420"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Line connecting star node centers of the 4 cards */}
            <path
              d="M 115 210 L 365 210 L 615 210 L 865 210"
              stroke="rgba(183,210,240,0.18)"
              strokeWidth="1"
              strokeDasharray="5 7"
            />
            {/* Star nodes */}
            <circle cx="115" cy="210" r="3" fill="rgba(183,210,240,0.5)" />
            <circle cx="365" cy="210" r="3" fill="rgba(183,210,240,0.4)" />
            <circle cx="615" cy="210" r="3" fill="rgba(183,210,240,0.4)" />
            <circle cx="865" cy="210" r="3" fill="rgba(183,210,240,0.5)" />
          </svg>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {PET_PHOTOS.map((pet, idx) => (
            <div
              key={pet.id}
              onClick={() => onSelectPhoto(pet)}
              className="group relative flex flex-col cursor-pointer"
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid rgba(183,210,240,0.18)',
                background: 'rgba(8,13,28,0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.4s ease',
              }}
            >
              {/* Star node header */}
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ borderBottom: '1px solid rgba(183,210,240,0.1)' }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    style={{
                      display: 'inline-block',
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#B7D2F0',
                      boxShadow: '0 0 6px 2px rgba(183,210,240,0.5)',
                    }}
                  />
                  <span className="font-mono-code text-[9px] text-[#B7D2F0] tracking-widest uppercase">
                    Star 0{idx + 1}
                  </span>
                </div>

                <span className="font-mono-code text-[9px] text-[#718FB8] tracking-wide">{pet.dateHint}</span>
              </div>

              {/* Photo */}
              <div
                className="relative overflow-hidden"
                style={{ aspectRatio: '3/4', background: '#050811' }}
              >
                <img
                  src={pet.thumbUrl}
                  alt={pet.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'saturate(0.72) sepia(0.2) hue-rotate(185deg) brightness(0.88)',
                    transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.5s ease',
                  }}
                />

                {/* Gradient bottom */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to top, rgba(8,13,28,0.85) 0%, transparent 55%)',
                  }}
                />

                {/* Paw watermark */}
                <div
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full"
                  style={{
                    background: 'rgba(8,13,28,0.5)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <PawIcon size={12} color="rgba(183,210,240,0.8)" />
                </div>
              </div>

              {/* Caption */}
              <div className="p-3.5">
                <h3
                  className="font-display text-lg text-[#F4F5FA] group-hover:text-[#B7D2F0]"
                  style={{ transition: 'color 0.3s ease' }}
                >
                  {pet.title}
                </h3>

                <p className="font-editorial italic text-xs text-[#DCE7F5]/75 mt-1 leading-relaxed font-light">
                  &ldquo;{pet.statement}&rdquo;
                </p>

                <div className="mt-2 text-right">
                  <span className="font-handwritten text-sm text-[#B7D2F0]/70">
                    tap to view ✦
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom note */}
      <div className="mt-12 text-center">
        <p className="font-editorial text-sm text-[#718FB8] italic flex items-center justify-center gap-2 flex-wrap">
          <PawIcon size={13} color="#B7D2F0" />
          <span>Part of our daily routine, our peace, and our shared home.</span>
          <PawIcon size={13} color="#B7D2F0" />
        </p>
      </div>
    </section>
  );
}
