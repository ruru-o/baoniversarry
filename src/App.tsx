import { lazy, Suspense, useState, useEffect } from 'react';
import { CosmicCanvas } from './components/Three/CosmicCanvas';
import { Navigation } from './components/Navigation';
import { AmbientPianoControl } from './components/AmbientPianoControl';
import { HeroIntro } from './components/HeroIntro';
import { ContinuousGallery } from './components/ContinuousGallery';
import { VinylPlayer } from './components/VinylPlayer';
import { ScrollStorySequence } from './components/ScrollStorySequence';
import { ALL_PHOTOS, type PhotoItem } from './data/photos';

const AnniversaryLetter = lazy(() =>
  import('./components/AnniversaryLetter').then((m) => ({ default: m.AnniversaryLetter }))
);

const AnniversaryEnding = lazy(() =>
  import('./components/AnniversaryEnding').then((m) => ({ default: m.AnniversaryEnding }))
);

const ExpandedPhotoModal = lazy(() =>
  import('./components/ExpandedPhotoModal').then((m) => ({ default: m.ExpandedPhotoModal }))
);

export default function App() {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [isLetterOpen, setIsLetterOpen] = useState(false);

  useEffect(() => {
    const prefetchBelowFold = () => {
      void import('./components/AnniversaryLetter');
      void import('./components/ExpandedPhotoModal');
    };

    const timer = window.setTimeout(prefetchBelowFold, 600);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sections = ['intro', 'gallery', 'soundtrack', 'letter', 'future'];
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);

      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.25 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [isLetterOpen]);

  return (
    <div className="relative min-h-screen bg-[#080E20] text-[#EDF4FF] selection:bg-[#7186A9]/40 selection:text-[#D7E6F8]" data-theme="dark">
      {/* Photographic Fine-Grain Galaxy Backdrop */}
      <CosmicCanvas />

      {/* Floating Liquid Glass Navigation Dock & Ambient Background Piano */}
      <Navigation activeSection={activeSection} />
      <AmbientPianoControl />

      {/* Main Experience Flow */}
      <main className="relative z-10">
        {/* 01: Hero Intro */}
        <HeroIntro />

        {/* Story Transition 01 -> 02: Pre-Gallery Chapter Beat */}
        <ScrollStorySequence
          beats={["We've had a lot of things happen all throughout the years"]}
          beatHeightVh={95}
          variant="editorial"
        />

        {/* 02: One Continuous Interactive Spatial Gallery (All 21 Photos + Signature Constellations) */}
        <ContinuousGallery onSelectPhoto={setSelectedPhoto} />

        {/* 03: Physical Interactive Spotify Vinyl with Music Playback (includes morphing Soundtrack beat) */}
        <VinylPlayer />

        {/* Story Transition 03 -> 04: Pre-Letter Sequential Beats */}
        <ScrollStorySequence
          beats={[
            "there's a lot more to come",
            "there's also something i'd like to express",
            "i know it's a lot",
            "i hope you like it",
          ]}
          beatHeightVh={95}
          variant="intimate"
        />

        {/* 04: The Anniversary Letter (Archival Watercolor Portrait & Sincere Letter) */}
        <Suspense fallback={<section id="letter" className="min-h-screen" aria-hidden="true" />}>
          <AnniversaryLetter
            isOpen={isLetterOpen}
            onOpenChange={setIsLetterOpen}
          />
        </Suspense>

        {isLetterOpen && (
          <>
            {/* Story Transition 04 -> 05: Post-Letter Sequential Beats */}
            <ScrollStorySequence
              beats={[
                'i will always love you so much, wam',
                'you may probably not feel it, but i really do',
                'again, i love you, wam.',
                'very much.',
              ]}
              beatHeightVh={95}
              variant="intimate"
            />

            {/* 05: Quiet Celestial Closing */}
            <Suspense fallback={<section id="future" className="min-h-[70vh]" aria-hidden="true" />}>
              <AnniversaryEnding />
            </Suspense>
          </>
        )}
      </main>

      {/* High-Resolution Fullscreen Photo Modal */}
      {selectedPhoto && (
        <Suspense fallback={null}>
          <ExpandedPhotoModal
            photo={selectedPhoto}
            photos={ALL_PHOTOS}
            onClose={() => setSelectedPhoto(null)}
            onSelectPhoto={setSelectedPhoto}
          />
        </Suspense>
      )}
    </div>
  );
}
