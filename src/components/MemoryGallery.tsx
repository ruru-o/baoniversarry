import { useState, useMemo } from 'react';
import { Sparkles, Calendar, Maximize2 } from 'lucide-react';
import { SUB_PHOTOS, GALLERY_GROUPS, type PhotoItem } from '../data/photos';

interface MemoryGalleryProps {
  onSelectPhoto: (photo: PhotoItem) => void;
}

export function MemoryGallery({ onSelectPhoto }: MemoryGalleryProps) {
  const [activeGroup, setActiveGroup] = useState<string>('all');

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
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[#B7D2F0] text-xs font-mono-code uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#B7D2F0]" />
          <span>The Memory Archive</span>
        </div>
        <h2 className="font-display text-4xl sm:text-6xl text-[#F4F5FA] tracking-tight text-glow-powder">
          Preserved Moments
        </h2>
        <p className="font-editorial italic text-xl text-[#718FB8] mt-2 font-light max-w-xl mx-auto">
          Every ordinary afternoon that turned into something we never want to forget.
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
                    ? 'liquid-glass-active text-[#F4F5FA] border-[#B7D2F0] shadow-[0_0_15px_rgba(183,210,240,0.3)] scale-105'
                    : 'liquid-glass-subtle text-[#DCE7F5]/70 hover:text-white hover:bg-[#B7D2F0]/15'
                }`}
              >
                <span>{grp.label}</span>
                <span className="ml-1.5 text-[10px] opacity-60">({grp.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editorial Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredPhotos.map((photo, idx) => (
          <article
            key={photo.id}
            onClick={() => onSelectPhoto(photo)}
            className="break-inside-avoid group relative rounded-xl overflow-hidden liquid-glass border border-[#B7D2F0]/20 hover:border-[#B7D2F0]/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(8,13,28,0.8),0_0_25px_rgba(183,210,240,0.2)] cursor-pointer"
          >
            {/* Image Container */}
            <div className="relative overflow-hidden aspect-auto bg-[#050811]">
              <img
                src={photo.thumbUrl}
                alt={photo.title}
                loading={idx < 4 ? 'eager' : 'lazy'}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 filter saturate-[0.95] group-hover:saturate-100"
              />

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080D1C] via-[#080D1C]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

              {/* Expand Icon Badge */}
              <div className="absolute top-3 right-3 p-2 rounded-full liquid-glass-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#F4F5FA]">
                <Maximize2 className="w-3.5 h-3.5 text-[#B7D2F0]" />
              </div>

              {/* Date tag in top left */}
              {photo.dateHint && (
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded liquid-glass-subtle text-[10px] font-mono-code text-[#B7D2F0] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{photo.dateHint}</span>
                </div>
              )}
            </div>

            {/* Accompanying Statement Card Footer */}
            <div className="p-4 sm:p-5 relative z-10 bg-[#080D1C]/90 border-t border-[#B7D2F0]/10">
              <h3 className="font-display text-xl text-[#F4F5FA] group-hover:text-[#B7D2F0] transition-colors duration-300">
                {photo.title}
              </h3>
              <p className="font-editorial italic text-sm text-[#DCE7F5]/80 mt-1 leading-relaxed font-light">
                &ldquo;{photo.statement}&rdquo;
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
