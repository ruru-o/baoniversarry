import { useState, useEffect } from 'react';
import { CosmicCanvas } from './components/Three/CosmicCanvas';
import { Navigation } from './components/Navigation';
import { HeroIntro } from './components/HeroIntro';
import { AnniversaryLetter } from './components/AnniversaryLetter';
import { MemoryGallery } from './components/MemoryGallery';
import { PetConstellation } from './components/PetConstellation';
import { VinylPlayer } from './components/VinylPlayer';
import { InteractiveWebLetter } from './components/InteractiveWebLetter';
import { AnniversaryEnding } from './components/AnniversaryEnding';
import { ExpandedPhotoModal } from './components/ExpandedPhotoModal';
import { ALL_PHOTOS, type PhotoItem } from './data/photos';

export default function App() {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [activeSection, setActiveSection] = useState<string>('intro');

  useEffect(() => {
    const sections = ['intro', 'letter', 'gallery', 'pets', 'soundtrack', 'journal', 'future'];
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
    const letterEl = document.getElementById('letter');

    if (letterEl) {
      letterEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080D1C] text-[#F4F5FA] selection:bg-[#718FB8]/40 selection:text-[#DCE7F5]">
      {/* 3D Cosmic Atmosphere in Background */}
      <CosmicCanvas />

      {/* Floating Navigation Dock */}
      <Navigation activeSection={activeSection} />

      {/* Main Experience Flow */}
      <main className="relative z-10">
        {/* 01: Hero Intro */}
        <HeroIntro onEnter={handleEnter} />

        {/* 02: Anniversary Letter & Watercolor Portrait */}
        <AnniversaryLetter />

        {/* 03: Interactive Memory Gallery */}
        <MemoryGallery onSelectPhoto={setSelectedPhoto} />

        {/* 04: Pet Constellation */}
        <PetConstellation onSelectPhoto={setSelectedPhoto} />

        {/* 05: Celestial Spotify Vinyl Player */}
        <VinylPlayer />

        {/* 06: Interactive Memory Journal */}
        <InteractiveWebLetter onSelectPhoto={setSelectedPhoto} />

        {/* 07: Closing Starlight Ending */}
        <AnniversaryEnding />
      </main>

      {/* Global Expanded Photo Viewer Modal */}
      <ExpandedPhotoModal
        photo={selectedPhoto}
        photos={ALL_PHOTOS}
        onClose={() => setSelectedPhoto(null)}
        onSelectPhoto={setSelectedPhoto}
      />
    </div>
  );
}
