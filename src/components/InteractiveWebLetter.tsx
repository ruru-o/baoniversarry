import { useState } from 'react';
import { BookOpen, Calendar, Sparkles, ChevronRight, Pin } from 'lucide-react';
import type { PhotoItem } from '../data/photos';

interface InteractiveWebLetterProps {
  onSelectPhoto: (photo: PhotoItem) => void;
}

interface JournalEntry {
  id: string;
  photoUrl: string;
  thumbUrl: string;
  title: string;
  date: string;
  tagline: string;
  content: string[];
  handwrittenNote: string;
}

export function InteractiveWebLetter({ onSelectPhoto }: InteractiveWebLetterProps) {
  const [activePage, setActivePage] = useState<number>(0);

  const entries: JournalEntry[] = [
    {
      id: 'journal-memo',
      photoUrl: '/photos/subs/IMG_8520.webp',
      thumbUrl: '/photos/subs/IMG_8520_thumb.webp',
      title: 'The Blue Ink Note',
      date: 'November 21, 2024',
      tagline: 'A little note pinned to the wall, etched in blue ballpoint ink.',
      content: [
        'I still keep this note right where I can see it. A smiling bunny giving a heart sign, a cat holding onto a teddy bear, and the words "HUBBY & WIPEY" scribbled in blue.',
        'It is funny how a piece of paper that took two minutes to draw can carry so much weight. In the hardest moments of these two years, looking at this reminder made everything simple again.',
        'We were just two people who made a choice to protect each other, laugh together, and build something real.',
      ],
      handwrittenNote: 'Beebbii · Hubby & Wipey 💙',
    },
    {
      id: 'journal-lockscreen',
      photoUrl: '/photos/main/IMG_5867.webp',
      thumbUrl: '/photos/main/IMG_5867_thumb.webp',
      title: '8:32 AM on a Saturday',
      date: 'January 25, 2025',
      tagline: 'Two phones resting on the bedsheet, keeping each other company.',
      content: [
        'We put our phones down side-by-side on the bed and realized our lock screens were showing the exact same minute: 08:32.',
        'On my screen was you with your phone covering your face and your quiet smile. On your screen was me. It was not planned, but that is the beauty of it.',
        'Home is not a location on a map. It is knowing that wherever we go, our minds are in the exact same place.',
      ],
      handwrittenNote: 'waking up next to you',
    },
    {
      id: 'journal-discord',
      photoUrl: '/photos/subs/IMG_6760.webp',
      thumbUrl: '/photos/subs/IMG_6760_thumb.webp',
      title: 'Midnight on Discord',
      date: 'Autumn Nights · 8:06 PM',
      tagline: 'Red keyboard reflections against cool blue monitor light.',
      content: [
        'There were nights when distance or tired schedules kept us behind our computer monitors, but even then, you made distance feel tiny.',
        'You looked into the webcam through your glasses with the blue ambient light shining on you, and I looked back with the red glow from my desk.',
        'We would talk about our days, stay silent while working, or just laugh at random things until one of us fell asleep with the call still running.',
      ],
      handwrittenNote: 'our frequency in the dark ✨',
    },
    {
      id: 'journal-rings',
      photoUrl: '/photos/subs/IMG_1830.webp',
      thumbUrl: '/photos/subs/IMG_1830_thumb.webp',
      title: 'Matching Rings & Blue Polish',
      date: 'The Cafe Tables',
      tagline: 'Hands covering laughter, black bands on our fingers.',
      content: [
        'You wore deep blue nail polish and I wore matching blue on my thumb. We both put on our simple black rings.',
        'You covered your face because you couldn’t stop laughing at whatever silly joke we made, and I gave that classic call-me hand sign.',
        'I love that we can be sophisticated when we need to be, but with each other, we will always be the two funniest, happiest kids in the room.',
      ],
      handwrittenNote: 'forever my favorite laugh',
    },
  ];

  const current = entries[activePage];

  return (
    <section
      id="journal"
      className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-panel text-[#B7D2F0] text-xs font-mono-code uppercase tracking-widest mb-4">
          <BookOpen className="w-3.5 h-3.5 text-[#B7D2F0]" />
          <span>The Memory Journal</span>
        </div>

        <h2
          className="font-display italic tracking-tight heading-luminous select-text"
          style={{ fontSize: 'clamp(2.6rem, 6.5vw, 4.8rem)' }}
        >
          Chapters We Wrote Together
        </h2>

        <p className="font-editorial italic text-lg sm:text-xl text-[#718FB8] mt-3 font-light max-w-md mx-auto">
          Pages turned from our shared journal, preserved in liquid glass.
        </p>

        {/* Page Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
          {entries.map((entry, idx) => (
            <button
              key={entry.id}
              onClick={() => setActivePage(idx)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono-code transition-all duration-300 cursor-pointer active:scale-95 ${
                activePage === idx
                  ? 'liquid-pill-active text-[#F4F5FA] font-medium'
                  : 'liquid-glass-card text-[#DCE7F5]/70 hover:text-white'
              }`}
            >
              <span>Entry 0{idx + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Journal Card */}
      <article className="liquid-glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden transition-all duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Left: Featured Journal Photo Frame */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              onClick={() => onSelectPhoto({
                id: current.id,
                category: 'sub',
                filename: current.title,
                title: current.title,
                statement: current.tagline,
                fullUrl: current.photoUrl,
                thumbUrl: current.thumbUrl,
                width: 3000,
                height: 4000,
                aspectRatio: 0.75,
                dateHint: current.date,
              })}
              className="relative group w-full max-w-sm rounded-2xl overflow-hidden liquid-glass-card cursor-pointer select-none"
            >
              {/* Paper Pin Decor */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-panel text-[10px] font-mono-code text-[#B7D2F0]">
                <Pin className="w-3 h-3 text-[#B7D2F0]" />
                <span>Pinned Artifact</span>
              </div>

              <div className="relative aspect-[3/4] bg-[#050811] overflow-hidden">
                <img
                  src={current.thumbUrl}
                  alt={current.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080D1C] via-transparent to-transparent opacity-60" />
              </div>

              <div className="p-3 bg-[#080D1C]/90 border-t border-[#B7D2F0]/15 flex items-center justify-between text-xs font-mono-code text-[#718FB8]">
                <span>{current.date}</span>
                <span className="font-handwritten text-base text-[#B7D2F0]">tap to enlarge</span>
              </div>
            </div>
          </div>

          {/* Right: Journal Page Text */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-code text-[#718FB8] mb-2">
                <Calendar className="w-3.5 h-3.5 text-[#B7D2F0]" />
                <span>{current.date.toUpperCase()}</span>
                <span className="text-[#B7D2F0]">•</span>
                <span>ENTRY 0{activePage + 1} OF 0{entries.length}</span>
              </div>

              <h3 className="font-display italic text-3xl sm:text-4xl text-[#F4F5FA] mb-2">
                {current.title}
              </h3>

              <p className="font-editorial italic text-base sm:text-lg text-[#B7D2F0] font-light mb-6">
                &ldquo;{current.tagline}&rdquo;
              </p>

              <div className="space-y-4 font-editorial text-base sm:text-lg text-[#DCE7F5]/90 leading-relaxed font-light">
                {current.content.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Handwritten Footer */}
            <div className="mt-8 pt-6 border-t border-[#B7D2F0]/15 flex items-center justify-between">
              <div>
                <span className="font-editorial italic text-xs text-[#718FB8]">Personal inscription:</span>
                <p className="font-handwritten text-2xl text-[#B7D2F0] font-bold mt-0.5">
                  &ldquo;{current.handwrittenNote}&rdquo;
                </p>
              </div>

              {activePage < entries.length - 1 ? (
                <button
                  onClick={() => setActivePage(p => p + 1)}
                  className="liquid-glass-card inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono-code text-[#F4F5FA] hover:text-[#B7D2F0] transition-colors cursor-pointer active:scale-95"
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1 text-xs text-[#B7D2F0] font-mono-code">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>End of Journal</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
