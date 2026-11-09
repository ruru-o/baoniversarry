import { useState } from 'react';
import { Music, Play, Pause, ExternalLink, Disc3, Sparkles } from 'lucide-react';
import { SPOTIFY_PLAYLISTS } from '../data/photos';

export function VinylPlayer() {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showEmbed, setShowEmbed] = useState<boolean>(false);

  const currentPlaylist = SPOTIFY_PLAYLISTS[activeIdx];

  const toggleSpin = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <section
      id="soundtrack"
      className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto z-10"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-panel text-[#B7D2F0] text-xs font-mono-code uppercase tracking-widest mb-4">
          <Music className="w-3.5 h-3.5 text-[#B7D2F0]" />
          <span>Our Soundtrack</span>
        </div>

        <h2
          className="font-display italic tracking-tight heading-luminous select-text"
          style={{ fontSize: 'clamp(2.6rem, 6.5vw, 4.8rem)' }}
        >
          The Celestial Vinyl Collection
        </h2>

        <p className="font-editorial italic text-lg sm:text-xl text-[#718FB8] mt-3 font-light max-w-lg mx-auto">
          The songs we listened to on repeat, woven into the frequencies of our two years.
        </p>

        {/* Playlist Switcher Tabs */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {SPOTIFY_PLAYLISTS.map((pl, idx) => {
            const isActive = activeIdx === idx;

            return (
              <button
                key={pl.id}
                onClick={() => {
                  setActiveIdx(idx);
                }}
                className={`px-5 py-2 rounded-full text-xs font-mono-code transition-all duration-300 cursor-pointer flex items-center gap-2 active:scale-95 ${
                  isActive
                    ? 'liquid-pill-active text-[#F4F5FA] font-medium'
                    : 'liquid-glass-card text-[#DCE7F5]/70 hover:text-white'
                }`}
              >
                <Disc3 className={`w-4 h-4 ${isActive ? 'text-[#B7D2F0]' : 'text-[#718FB8]'}`} />
                <span>{pl.curator}&apos;s Side ({pl.subtitle})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Turntable & Vinyl Deck */}
      <div className="liquid-glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Left: Realistic Rotating Vinyl Record Deck */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-6">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">

              {/* Outer Glow Halo */}
              <div
                className={`absolute inset-0 rounded-full transition-opacity duration-700 blur-2xl ${
                  isPlaying ? 'bg-[#B7D2F0]/20 opacity-100' : 'bg-transparent opacity-0'
                }`}
              />

              {/* Vinyl Disc Body */}
              <div
                className={`relative w-full h-full rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-4 border-[#12192e] flex items-center justify-center ${
                  isPlaying ? 'animate-vinyl-spin' : 'animate-vinyl-spin-paused'
                }`}
                style={{
                  background: 'radial-gradient(circle, #0e1424 0%, #050811 50%, #151f38 70%, #080d1c 100%)',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 12px 40px rgba(0,0,0,0.8)',
                }}
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-20 rounded-full border border-white/5 pointer-events-none" />

                {/* Center Vinyl Label */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[#B7D2F0]/40 shadow-inner flex items-center justify-center">
                  <img
                    src={currentPlaylist.coverUrl}
                    alt={currentPlaylist.title}
                    className="w-full h-full object-cover filter contrast-[1.05]"
                  />
                  {/* Center Spindle Hole */}
                  <div className="absolute w-5 h-5 rounded-full bg-[#080D1C] border border-white/30 shadow-md" />
                </div>
              </div>

              {/* Tonearm Stylus Indicator */}
              <div
                className={`hidden sm:block absolute -top-4 right-4 w-28 h-32 pointer-events-none transition-transform duration-700 origin-top-right ${
                  isPlaying ? 'rotate-12' : '-rotate-12'
                }`}
              >
                <div className="w-1.5 h-24 bg-gradient-to-b from-[#B7D2F0] to-[#718FB8] rounded-full mx-auto shadow-lg" />
                <div className="w-4 h-6 bg-[#DCE7F5] rounded-sm mx-auto shadow" />
              </div>
            </div>

            {/* Quick Turntable Controls */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={toggleSpin}
                className="liquid-glass-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[#F4F5FA] text-xs font-mono-code cursor-pointer active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-[#B7D2F0]" />
                    <span>Pause Turntable</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-[#B7D2F0] fill-[#B7D2F0]" />
                    <span>Spin Record</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowEmbed(prev => !prev)}
                className="liquid-glass-card px-4 py-2.5 rounded-full text-xs font-mono-code text-[#B7D2F0] hover:text-white transition-all cursor-pointer active:scale-95"
              >
                {showEmbed ? 'Hide Player' : 'Show Spotify Player'}
              </button>
            </div>
          </div>

          {/* Right: Playlist Information */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-code text-[#718FB8] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#B7D2F0]" />
                <span>CURATED BY {currentPlaylist.curator.toUpperCase()}</span>
              </div>

              <h3 className="font-display italic text-3xl sm:text-4xl text-[#F4F5FA] mb-2">
                {currentPlaylist.title}
              </h3>

              <p className="font-editorial italic text-lg text-[#B7D2F0] mb-4">
                &ldquo;{currentPlaylist.subtitle}&rdquo;
              </p>

              <p className="font-editorial text-base sm:text-lg text-[#DCE7F5]/85 leading-relaxed font-light mb-6">
                {currentPlaylist.description}
              </p>

              <div className="p-4 rounded-xl liquid-glass-card border border-[#B7D2F0]/15 space-y-2 mb-6 text-xs text-[#DCE7F5]/80 font-mono-code">
                <div className="flex justify-between">
                  <span className="text-[#718FB8]">Curator</span>
                  <span>{currentPlaylist.curator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718FB8]">Format</span>
                  <span>Spotify Curated Archive</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718FB8]">Vibe</span>
                  <span>Late Night Melodies &amp; Soft Clouds</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={currentPlaylist.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-sans font-medium text-xs tracking-wide transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Listen on Spotify</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <span className="text-[11px] text-[#718FB8] font-mono-code">
                Authentic Spotify Playlists
              </span>
            </div>
          </div>
        </div>

        {/* Live Spotify Embed Container (Expandable) */}
        {showEmbed && (
          <div className="mt-8 pt-8 border-t border-[#B7D2F0]/15">
            <div className="flex items-center justify-between mb-3 text-xs font-mono-code text-[#718FB8]">
              <span>SPOTIFY EMBEDDED PLAYER · {currentPlaylist.curator}</span>
              <button
                onClick={() => setShowEmbed(false)}
                className="text-[#B7D2F0] hover:underline cursor-pointer"
              >
                Close player
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden liquid-glass-panel shadow-2xl">
              <iframe
                title={`Spotify Player - ${currentPlaylist.title}`}
                src={currentPlaylist.embedUrl}
                width="100%"
                height="352"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="border-0 rounded-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
