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
      className="relative min-h-screen py-24 px-4 sm:px-6 max-w-7xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[#B7D2F0] text-xs font-mono-code uppercase tracking-widest mb-5">
          <span style={{ fontSize: 9 }}>✦</span>
          <span>The Memory Archive</span>
          <span style={{ fontSize: 9 }}>✦</span>
        </div>

        <h2
          className="font-display tracking-tight text-hollow-powder"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
        >
          Preserved Moments
        </h2>

        <p className="font-editorial italic text-lg text-[#718FB8] mt-3 font-light max-w-xl mx-auto">
          Every ordinary afternoon that turned into something neither of us wants to forget.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {GALLERY_GROUPS.map((grp) => {
            const isActive = activeGroup === grp.id;

            return (
              <button
                key={grp.id}
                onClick={() => setActiveGroup(grp.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono-code transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'liquid-glass-active text-[#F4F5FA] shadow-[0_0_15px_rgba(183,210,240,0.25)] scale-105'
                    : 'liquid-glass-subtle text-[#DCE7F5]/65 hover:text-white'
                }`}
              >
                <span>{grp.label}</span>
                <span className="ml-1.5 text-[10px] opacity-55">({grp.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5" style={{ columnGap: 20 }}>
        {filteredPhotos.map((photo, idx) => {
          const isHovered = hoveredId === photo.id;

          return (
            <article
              key={photo.id}
              onClick={() => onSelectPhoto(photo)}
              onMouseEnter={() => setHoveredId(photo.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="break-inside-avoid cursor-pointer"
              style={{
                marginBottom: 20,
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid rgba(183,210,240,0.15)',
                background: '#080D1C',
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: isHovered
                  ? '0 16px 48px rgba(8,13,28,0.85), 0 0 28px rgba(183,210,240,0.18)'
                  : '0 4px 20px rgba(8,13,28,0.5)',
                transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.4s ease',
              }}
            >
              {/* Image */}
              <div
                className="relative overflow-hidden"
                style={{ background: '#050811' }}
              >
                <img
                  src={photo.thumbUrl}
                  alt={photo.title}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                  className="w-full h-auto object-cover"
                  style={{
                    display: 'block',
                    filter: isHovered
                      ? 'saturate(0.82) sepia(0.12) hue-rotate(185deg) brightness(0.96)'
                      : 'saturate(0.65) sepia(0.28) hue-rotate(185deg) brightness(0.85)',
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    transition: 'filter 0.5s ease, transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
                  }}
                />

                {/* Gradient bottom vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to top, rgba(8,13,28,0.75) 0%, rgba(8,13,28,0.15) 45%, transparent 100%)',
                    opacity: isHovered ? 0.6 : 0.85,
                    transition: 'opacity 0.3s ease',
                  }}
                />

                {/* Noise grain overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay',
                  }}
                />

                {/* Expand icon */}
                <div
                  className="absolute top-3 right-3 p-1.5 rounded-full liquid-glass-subtle text-[#F4F5FA]"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.25s ease',
                  }}
                >
                  <Maximize2 style={{ width: 12, height: 12, color: '#B7D2F0' }} />
                </div>

                {/* Date tag */}
                {photo.dateHint && (
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded liquid-glass-subtle flex items-center gap-1 text-[#B7D2F0]">
                    <Calendar style={{ width: 10, height: 10 }} />
                    <span className="font-mono-code text-[9px] tracking-wide">{photo.dateHint}</span>
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div
                className="relative z-10"
                style={{
                  padding: '14px 16px',
                  background: 'rgba(8,13,28,0.92)',
                  borderTop: '1px solid rgba(183,210,240,0.08)',
                }}
              >
                <h3
                  className="font-display text-lg leading-tight"
                  style={{
                    color: isHovered ? '#B7D2F0' : '#F4F5FA',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {photo.title}
                </h3>

                <p className="font-editorial italic text-xs text-[#DCE7F5]/75 mt-1 leading-relaxed font-light">
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
