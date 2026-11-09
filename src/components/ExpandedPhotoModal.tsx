import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#080D1C]/85 backdrop-blur-2xl animate-fade-in"
      onClick={onClose}
    >
      {/* Container - Liquid Glass Frame */}
      <div
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col lg:flex-row items-center liquid-glass-panel rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close photo view"
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full liquid-glass-panel text-[#DCE7F5] hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Previous Button */}
        <button
          onClick={() => navigate(-1)}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full liquid-glass-panel text-[#DCE7F5] hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Button */}
        <button
          onClick={() => navigate(1)}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full liquid-glass-panel text-[#DCE7F5] hover:text-white transition-all cursor-pointer lg:right-auto lg:left-[calc(55%+1rem)] active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Left: Image Container */}
        <div className="relative w-full lg:w-[58%] h-[50vh] sm:h-[60vh] lg:h-[82vh] bg-[#050811] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <img
            src={photo.fullUrl}
            alt={photo.title}
            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
          />
        </div>

        {/* Right: Thoughtful Statement & Details */}
        <div className="w-full lg:w-[42%] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[35vh] lg:max-h-[82vh]">
          <div>
            <div className="flex items-center justify-between text-xs font-mono-code text-[#718FB8] mb-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B7D2F0]" />
                {photo.dateHint || 'Preserved Moment'}
              </span>
              <span>{currentIndex + 1} / {total}</span>
            </div>

            <h3 className="font-display italic text-2xl sm:text-3xl text-[#F4F5FA] mb-4">
              {photo.title}
            </h3>

            {/* The Special Accompanying Statement */}
            <blockquote className="relative p-4 rounded-xl liquid-glass-card border-l-2 border-[#B7D2F0] my-4">
              <p className="font-editorial italic text-base sm:text-lg text-[#DCE7F5] leading-relaxed font-light">
                &ldquo;{photo.statement}&rdquo;
              </p>
            </blockquote>
          </div>

          <div className="pt-4 border-t border-[#B7D2F0]/15 flex items-center justify-between text-xs text-[#718FB8] font-mono-code">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B7D2F0]" />
              <span>Wam &amp; Bao Archive</span>
            </span>
            <span className="text-[10px] text-[#718FB8]/70">Use ← → keys to navigate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
