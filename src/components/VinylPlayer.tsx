import { useState, useRef } from 'react';
import { Play, Pause, ExternalLink, Disc3 } from 'lucide-react';
import { SPOTIFY_PLAYLISTS } from '../data/photos';

// Synthesizes a soft, subtle analog vinyl needle drop & switch sound using the Web Audio API
function playMechanicalAudioFeedback(type: 'needle' | 'click' = 'needle') {
  try {
    const AudioContextClass = window.AudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'needle') {
      // Gentle stylus landing: low filtered noise burst + soft pop
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } else {
      // Tactile button click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch {
    // AudioContext blocked or unsupported; silent fallback
  }
}

export function VinylPlayer() {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentPlaylist = SPOTIFY_PLAYLISTS[activeIdx];

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    playMechanicalAudioFeedback(nextState ? 'needle' : 'click');
  };

  const handleSelectPlaylist = (idx: number) => {
    if (idx === activeIdx) return;

    setActiveIdx(idx);
    playMechanicalAudioFeedback('click');
  };

  return (
    <section
      id="soundtrack"
      className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-6 max-w-5xl mx-auto z-10 select-none"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2
          className="font-display italic tracking-tight heading-luminous select-text"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 4.4rem)' }}
        >
          Soundtrack
        </h2>

        {/* Playlist Switcher Tabs */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {SPOTIFY_PLAYLISTS.map((pl, idx) => {
            const isActive = activeIdx === idx;

            return (
              <button
                key={pl.id}
                onClick={() => handleSelectPlaylist(idx)}
                className={`px-5 py-2 rounded-full text-xs font-mono-code transition-all duration-300 cursor-pointer flex items-center gap-2 active:scale-95 ${
                  isActive
                    ? 'liquid-pill-active text-[#F4F5FA] font-medium'
                    : 'liquid-glass-card text-[#DCE7F5]/70 hover:text-white'
                }`}
              >
                <Disc3 className={`w-3.5 h-3.5 ${isActive ? 'text-[#B7D2F0]' : 'text-[#718FB8]'}`} />
                <span>{pl.name}&apos;s Side ({pl.subtitle})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Physical Turntable & Interactive Vinyl Deck */}
      <div className="liquid-glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left: Physical Turntable with Grooves & Tonearm */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center py-4">
            <div className="relative w-64 h-64 sm:w-76 sm:h-76 flex items-center justify-center">

              {/* Tonearm Stylus */}
              <div
                className="absolute -top-3 right-2 w-28 h-32 pointer-events-none transition-transform duration-700 origin-top-right z-30"
                style={{
                  transform: isPlaying ? 'rotate(18deg)' : 'rotate(-10deg)',
                }}
              >
                <div className="w-1.5 h-26 bg-gradient-to-b from-[#B7D2F0] to-[#718FB8] rounded-full mx-auto shadow-md" />
                <div className="w-3.5 h-5 bg-[#DCE7F5] rounded-sm mx-auto shadow" />
              </div>

              {/* Physical Vinyl Disc */}
              <div
                onClick={handleTogglePlay}
                className={`relative w-full h-full rounded-full cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-4 border-[#12192e] flex items-center justify-center transition-transform ${
                  isPlaying ? 'animate-vinyl-spin' : 'animate-vinyl-spin-paused'
                }`}
                style={{
                  background: 'radial-gradient(circle, #0e1424 0%, #050811 50%, #151f38 70%, #080d1c 100%)',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 12px 40px rgba(0,0,0,0.8)',
                }}
              >
                {/* Physical Circular Grooves */}
                <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-20 rounded-full border border-white/5 pointer-events-none" />

                {/* Center Vinyl Label with Actual Album Cover */}
                <div className="relative w-28 h-28 sm:w-34 sm:h-34 rounded-full overflow-hidden border-2 border-[#B7D2F0]/40 shadow-inner flex items-center justify-center pointer-events-none">
                  <img
                    src={currentPlaylist.coverUrl}
                    alt={currentPlaylist.title}
                    className="w-full h-full object-cover filter contrast-[1.05]"
                  />
                  {/* Record Spindle */}
                  <div className="absolute w-4 h-4 rounded-full bg-[#080D1C] border border-white/40 shadow-md" />
                </div>
              </div>
            </div>

            {/* Turntable Control Bar */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleTogglePlay}
                className="liquid-glass-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[#F4F5FA] text-xs font-mono-code cursor-pointer active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-[#B7D2F0]" />
                    <span>Pause Vinyl</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-[#B7D2F0] fill-[#B7D2F0]" />
                    <span>Spin Vinyl</span>
                  </>
                )}
              </button>

              <a
                href={currentPlaylist.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass-card inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-mono-code text-[#B7D2F0] hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <span>Spotify</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right: Actual Spotify Embedded Player with Music Playback */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="rounded-2xl overflow-hidden liquid-glass-card shadow-2xl border border-[#B7D2F0]/20">
              <iframe
                ref={iframeRef}
                key={currentPlaylist.id}
                title={`Spotify Player - ${currentPlaylist.name}`}
                src={currentPlaylist.embedUrl}
                width="100%"
                height="352"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="border-0 rounded-2xl block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
