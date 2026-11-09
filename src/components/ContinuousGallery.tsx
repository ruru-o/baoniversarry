import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { ALL_PHOTOS, type PhotoItem } from '../data/photos';

interface ContinuousGalleryProps {
  onSelectPhoto: (photo: PhotoItem) => void;
}

// Delicate, signature constellation SVG for a photograph
function MiniConstellation({
  stars,
  lines,
  active,
}: {
  stars: Array<[number, number]>;
  lines: Array<[number, number]>;
  active: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Constellation Connecting Lines */}
        {lines.map(([i1, i2], idx) => {
          const s1 = stars[i1];
          const s2 = stars[i2];

          if (!s1 || !s2) return null;

          return (
            <line
              key={idx}
              x1={s1[0]}
              y1={s1[1]}
              x2={s2[0]}
              y2={s2[1]}
              stroke="rgba(183, 210, 240, 0.65)"
              strokeWidth="0.85"
              strokeDasharray="2 3"
            />
          );
        })}

        {/* Constellation Star Nodes */}
        {stars.map(([x, y], idx) => (
          <g key={idx}>
            <circle
              cx={x}
              cy={y}
              r="2.2"
              fill="#FFFFFF"
              className="drop-shadow-[0_0_4px_#B7D2F0]"
            />
            <circle
              cx={x}
              cy={y}
              r="1.2"
              fill="#B7D2F0"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function ContinuousGallery({ onSelectPhoto }: ContinuousGalleryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section
      id="gallery"
      className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto z-10"
    >
      {/* Editorial Masonry Fluid Grid — All 21 Photos in Natural Colors */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {ALL_PHOTOS.map((photo, idx) => {
          const isHovered = hoveredId === photo.id;

          return (
            <div
              key={photo.id}
              onClick={() => onSelectPhoto(photo)}
              onMouseEnter={() => setHoveredId(photo.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="break-inside-avoid relative rounded-2xl overflow-hidden cursor-pointer group select-none transition-all duration-500"
              style={{
                transform: isHovered ? 'translateY(-6px) scale(1.015)' : 'translateY(0) scale(1)',
                boxShadow: isHovered
                  ? '0 24px 60px -10px rgba(0, 0, 0, 0.85), 0 0 28px rgba(183, 210, 240, 0.2)'
                  : '0 8px 24px -4px rgba(0, 0, 0, 0.6)',
                border: isHovered
                  ? '1px solid rgba(183, 210, 240, 0.45)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Natural Photograph — 100% Vibrant, Zero Desaturation */}
              <div className="relative overflow-hidden bg-[#050811]">
                <img
                  src={photo.thumbUrl}
                  alt={photo.filename}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                  className="w-full h-auto object-cover block transition-transform duration-700 group-hover:scale-105"
                  style={{
                    filter: 'none', // Preserves natural original photograph colors!
                  }}
                />

                {/* Signature Little Constellation Layer */}
                <MiniConstellation
                  stars={photo.constellationStars}
                  lines={photo.constellationLines}
                  active={isHovered}
                />

                {/* Subtle vignette on hover to frame the photo */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#060814]/85 via-transparent to-transparent pointer-events-none transition-opacity duration-300"
                  style={{ opacity: isHovered ? 0.9 : 0 }}
                />

                {/* Expand Icon */}
                <div
                  className="absolute top-3.5 right-3.5 p-2 rounded-full liquid-glass-panel text-[#F4F5FA] transition-opacity duration-300 z-30"
                  style={{ opacity: isHovered ? 1 : 0 }}
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#B7D2F0]" />
                </div>

                {/* Sincere, Natural Constellation Inscription */}
                {photo.constellationPhrase && (
                  <div
                    className="absolute bottom-3.5 left-4 right-4 z-30 transition-all duration-300 text-left pointer-events-none"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translateY(0)' : 'translateY(6px)',
                    }}
                  >
                    <p className="font-editorial italic text-base sm:text-lg text-[#F4F5FA] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      {photo.constellationPhrase}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
