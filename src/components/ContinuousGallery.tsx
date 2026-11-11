import { memo, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { ALL_PHOTOS, type PhotoItem } from '../data/photos';

interface ContinuousGalleryProps {
  onSelectPhoto: (photo: PhotoItem) => void;
}

// Realistic Liquid Glass Frame for Photographs with Optical Starlight Refraction
const RealisticLiquidGlassPhotoCard = memo(function RealisticLiquidGlassPhotoCard({
  photo,
  onSelectPhoto,
  priority = false,
}: {
  photo: PhotoItem;
  onSelectPhoto: (photo: PhotoItem) => void;
  priority?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onSelectPhoto(photo)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-500 liquid-glass-frame"
    >
      {/* 100% Vibrant Natural Photograph */}
      <div className="relative overflow-hidden bg-[#080E20]">
        <img
          src={photo.thumbUrl}
          alt={photo.filename}
          width={photo.width}
          height={photo.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full h-auto object-cover block transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          style={{ filter: 'none', aspectRatio: String(photo.aspectRatio) }}
        />

        {/* Realistic Liquid Glass Specular Edge Highlight Overlay */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.45), inset 0 0 20px 0 rgba(187, 210, 239, 0.15)',
          }}
          aria-hidden="true"
        />

        {/* Expand Icon */}
        <div
          className="absolute top-3.5 right-3.5 p-2 rounded-full liquid-glass-panel text-[#EDF4FF] transition-all duration-300 z-30 shadow-md"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'scale(1)' : 'scale(0.85)',
          }}
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#BBD2EF]" />
        </div>

        {/* Deep Readable Vignette with Inscription Text */}
        {photo.constellationPhrase && (
          <div
            className="absolute inset-x-0 bottom-0 pt-16 pb-4 px-4 sm:px-5 photo-vignette z-20 transition-all duration-300 flex flex-col justify-end"
            style={{
              opacity: isHovered ? 1 : 0.88,
              transform: isHovered ? 'translateY(0)' : 'translateY(2px)',
            }}
          >
            <p className="font-editorial italic text-base sm:text-lg text-[#EDF4FF] leading-snug [text-shadow:0_2px_10px_rgba(0,0,0,0.95)]">
              {photo.constellationPhrase}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export function ContinuousGallery({ onSelectPhoto }: ContinuousGalleryProps) {
  return (
    <section
      id="gallery"
      className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto z-10"
    >
      {/* Editorial Curated Photography Rhythm */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 sm:gap-8 space-y-6 sm:space-y-8">
        {ALL_PHOTOS.map((photo, idx) => (
          <div key={photo.id} className="break-inside-avoid">
            <RealisticLiquidGlassPhotoCard
              photo={photo}
              onSelectPhoto={onSelectPhoto}
              priority={idx < 4}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
