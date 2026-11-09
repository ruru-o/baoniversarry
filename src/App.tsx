import { useState, useEffect } from 'react';
import { CosmicCanvas } from './components/Three/CosmicCanvas';
import { Navigation } from './components/Navigation';
import { HeroIntro } from './components/HeroIntro';
import { ContinuousGallery } from './components/ContinuousGallery';
import { VinylPlayer } from './components/VinylPlayer';
import { AnniversaryLetter } from './components/AnniversaryLetter';
import { AnniversaryEnding } from './components/AnniversaryEnding';
import { ExpandedPhotoModal } from './components/ExpandedPhotoModal';
import { ALL_PHOTOS, type PhotoItem } from './data/photos';

export default function App() {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [activeSection, setActiveSection] = useState<string>('intro');

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
  }, []);

  const handleEnter = () => {
    const galleryEl = document.getElementById('gallery');

    if (galleryEl) {
      galleryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060814] text-[#F4F5FA] selection:bg-[#718FB8]/40 selection:text-[#DCE7F5]">
      {/* Photographic Fine-Grain Galaxy Backdrop */}
      <CosmicCanvas />

      {/* Floating Liquid Glass Navigation Dock */}
      <Navigation activeSection={activeSection} />

      {/* Main Experience Flow */}
      <main className="relative z-10">
        {/* 01: Hero Intro with Hollow Display Lettering */}
        <HeroIntro onEnter={handleEnter} />

        {/* 02: One Continuous Interactive Spatial Gallery (All 21 Photos + Signature Constellations) */}
        <ContinuousGallery onSelectPhoto={setSelectedPhoto} />

        {/* 03: Physical Interactive Spotify Vinyl with Music Playback */}
        <VinylPlayer />

        {/* 04: The Anniversary Letter (Archival Watercolor Portrait & Sincere Letter) */}
        <AnniversaryLetter />

        {/* 05: Quiet Celestial Closing */}
        <AnniversaryEnding />
      </main>

      {/* High-Resolution Fullscreen Photo Modal */}
      <ExpandedPhotoModal
        photo={selectedPhoto}
        photos={ALL_PHOTOS}
        onClose={() => setSelectedPhoto(null)}
        onSelectPhoto={setSelectedPhoto}
      />
    </div>
  );
}
