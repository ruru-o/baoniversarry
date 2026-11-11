import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PhotoItem } from '../data/photos';

interface ExpandedPhotoModalProps {
  photo: PhotoItem | null;
  photos: PhotoItem[];
  onClose: () => void;
  onSelectPhoto: (photo: PhotoItem) => void;
}

export function ExpandedPhotoModal({
  photo,
  photos,
  onClose,
  onSelectPhoto,
}: ExpandedPhotoModalProps) {
  useEffect(() => {
    if (!photo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();

      if (e.key === 'ArrowLeft') navigate(-1);

      if (e.key === 'ArrowRight') navigate(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [photo, photos]);

  if (!photo) return null;

  const currentIndex = photos.findIndex(p => p.id === photo.id);
  const total = photos.length;

  const navigate = (direction: number) => {
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + direction + total) % total;

    onSelectPhoto(photos[nextIndex]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#080E20]/92 backdrop-blur-2xl animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Container - Clean High-Resolution Media Mount */}
      <div
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close photo view"
          className="absolute -top-12 right-0 z-30 p-2 rounded-full liquid-glass-panel text-[#D7E6F8] hover:text-white transition-all cursor-pointer active:scale-95 shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Previous Button */}
        <button
          onClick={() => navigate(-1)}
          aria-label="Previous photo"
          className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full liquid-glass-panel text-[#D7E6F8] hover:text-white transition-all cursor-pointer active:scale-95 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Button */}
        <button
          onClick={() => navigate(1)}
          aria-label="Next photo"
          className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full liquid-glass-panel text-[#D7E6F8] hover:text-white transition-all cursor-pointer active:scale-95 shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* High-Resolution Photo in 100% Natural Vibrant Colors */}
        <div className="relative max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl liquid-glass-panel p-2 sm:p-3 shadow-2xl border border-[#BBD2EF]/20">
          <img
            src={photo.fullUrl}
            alt={photo.filename}
            className="max-h-[75vh] max-w-full w-auto h-auto object-contain rounded-xl block select-none"
          />
        </div>

        {/* Inscription & Counter Bar */}
        <div className="mt-4 flex items-center justify-between w-full max-w-2xl px-2 text-xs font-mono-code text-[#7186A9]">
          <span>
            {photo.constellationPhrase ? (
              <span className="font-editorial italic text-base sm:text-lg text-[#EDF4FF]">
                {photo.constellationPhrase}
              </span>
            ) : (
              <span>Wam &amp; Bao</span>
            )}
          </span>

          <span className="text-[#BBD2EF] font-medium">
            {currentIndex + 1} / {total}
          </span>
        </div>
      </div>
    </div>
  );
}
