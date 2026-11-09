import { useState, useMemo } from 'react';
import { Maximize2, Calendar } from 'lucide-react';
import { SUB_PHOTOS, GALLERY_GROUPS, type PhotoItem } from '../data/photos';

interface MemoryGalleryProps {
  onSelectPhoto: (photo: PhotoItem) => void;
}

export function MemoryGallery({ onSelectPhoto }: MemoryGalleryProps) {
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredPhotos = useMemo(() => {
    if (activeGroup === 'all') return SUB_PHOTOS;

    return SUB_PHOTOS.filter(p => p.group === activeGroup);
  }, [activeGroup]);

  return (
    <section
      id="gallery"
      className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-panel text-[#B7D2F0] text-xs font-mono-code uppercase tracking-widest mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B7D2F0]" />
          <span>The Memory Archive</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B7D2F0]" />
        </div>

        <h2
          className="font-display italic tracking-tight heading-luminous select-text"
          style={{ fontSize: 'clamp(2.6rem, 6.5vw, 4.8rem)' }}
        >
          Preserved Moments
        </h2>

        <p className="font-editorial italic text-lg sm:text-xl text-[#718FB8] mt-3 font-light max-w-xl mx-auto">
          Every ordinary afternoon that turned into something we never want to forget.
        </p>

        {/* Filter Pills with Liquid Glass */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {GALLERY_GROUPS.map((grp) => {
            const isActive = activeGroup === grp.id;

            return (
              <button
                key={grp.id}
                onClick={() => setActiveGroup(grp.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono-code transition-all duration-300 cursor-pointer active:scale-95 ${
                  isActive
                    ? 'liquid-pill-active text-[#F4F5FA] font-medium'
                    : 'liquid-glass-card text-[#DCE7F5]/70 hover:text-white'
                }`}
              >
                <span>{grp.label}</span>
                <span className="ml-1.5 text-[10px] opacity-60">({grp.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredPhotos.map((photo, idx) => {
          const isHovered = hoveredId === photo.id;

          return (
            <article
              key={photo.id}
              onClick={() => onSelectPhoto(photo)}
              onMouseEnter={() => setHoveredId(photo.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="break-inside-avoid cursor-pointer liquid-glass-card rounded-2xl overflow-hidden group select-none"
            >
              {/* Photo Box */}
              <div className="relative overflow-hidden aspect-auto bg-[#050811]">
                <img
                  src={photo.thumbUrl}
                  alt={photo.title}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                  className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                  style={{
                    filter: isHovered
                      ? 'saturate(1.0) brightness(1.0)'
                      : 'saturate(0.75) sepia(0.18) hue-rotate(185deg) brightness(0.9)',
                  }}
                />

                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080D1C] via-[#080D1C]/20 to-transparent opacity-85 group-hover:opacity-60 transition-opacity duration-300" />

                {/* Expand badge */}
                <div
                  className="absolute top-3 right-3 p-2 rounded-full liquid-glass-panel text-[#F4F5FA] transition-opacity duration-300"
                  style={{ opacity: isHovered ? 1 : 0 }}
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#B7D2F0]" />
                </div>

                {/* Date tag */}
                {photo.dateHint && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full liquid-glass-panel text-[10px] font-mono-code text-[#B7D2F0] flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#B7D2F0]" />
                    <span>{photo.dateHint}</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-4 sm:p-5 relative z-10 bg-[#080D1C]/85 border-t border-[#B7D2F0]/10">
                <h3 className="font-display italic text-xl text-[#F4F5FA] group-hover:text-[#B7D2F0] transition-colors duration-300">
                  {photo.title}
                </h3>

                <p className="font-editorial italic text-sm text-[#DCE7F5]/85 mt-1 leading-relaxed font-light">
                  &ldquo;{photo.statement}&rdquo;
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
