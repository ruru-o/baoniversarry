import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Volume2,
  VolumeX,
  Disc3,
  ExternalLink,
} from 'lucide-react';
import { SPOTIFY_PLAYLISTS, type PlaylistSide, type PlaylistTrack } from '../data/photos';
import { comfyPiano } from '../audio/comfyPiano';
import { ScrollLitSentence } from './ScrollStorySequence';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

interface LiquidGlassMaps {
  displacementUri: string;
  interiorMaskUri: string;
}

const EMPTY_LIQUID_MAPS: LiquidGlassMaps = {
  displacementUri: '',
  interiorMaskUri: '',
};

function clampByte(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

interface RoundedRectSdfSample {
  depth: number;
  nx: number;
  ny: number;
}

/** Computes rounded-rect signed distance inward depth and outward unit normal at pixel (x, y). */
function computeRoundedRectSdf(
  x: number,
  y: number,
  halfW: number,
  halfH: number,
  radius: number
): RoundedRectSdfSample {
  const dx = x + 0.5 - halfW;
  const dy = y + 0.5 - halfH;
  const px = Math.abs(dx) - (halfW - radius);
  const py = Math.abs(dy) - (halfH - radius);
  const qx = Math.max(px, 0);
  const qy = Math.max(py, 0);
  const outLen = Math.hypot(qx, qy);
  const sd = outLen + Math.min(Math.max(px, py), 0) - radius;
  const depth = Math.max(0, -sd);

  if (outLen > 0.001) {
    return {
      depth,
      nx: (qx / outLen) * Math.sign(dx),
      ny: (qy / outLen) * Math.sign(dy),
    };
  }

  if (px > py) {
    return { depth, nx: Math.sign(dx), ny: 0 };
  }

  return { depth, nx: 0, ny: Math.sign(dy) };
}

/** Builds aspect-matched PNG bevel displacement + feathered interior frost mask from exact rounded-rect SDF. */
function buildLiquidGlassMaps(cssWidth: number, cssHeight: number): LiquidGlassMaps {
  const doc = globalThis.document;

  if (!doc || cssWidth <= 0 || cssHeight <= 0) {
    return EMPTY_LIQUID_MAPS;
  }

  // Half-res buffer capped cleanly for fast (<2ms) native PNG encoding while matching panel aspect ratio.
  const scale = Math.min(0.5, 560 / Math.max(cssWidth, cssHeight));
  const w = Math.max(64, Math.round(cssWidth * scale));
  const h = Math.max(64, Math.round(cssHeight * scale));
  const dispCanvas = doc.createElement('canvas');
  const maskCanvas = doc.createElement('canvas');

  dispCanvas.width = w;
  dispCanvas.height = h;
  maskCanvas.width = w;
  maskCanvas.height = h;

  const dispCtx = dispCanvas.getContext('2d');
  const maskCtx = maskCanvas.getContext('2d');

  if (!dispCtx || !maskCtx) {
    return EMPTY_LIQUID_MAPS;
  }

  const dispData = dispCtx.createImageData(w, h);
  const maskData = maskCtx.createImageData(w, h);
  const halfW = w / 2;
  const halfH = h / 2;
  const radius = Math.min(24 * scale, halfW, halfH);
  const rimWidth = 35 * scale;
  const clearRim = 4 * scale;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const { depth, nx, ny } = computeRoundedRectSdf(x, y, halfW, halfH, radius);
      const i = (y * w + x) * 4;

      if (depth < rimWidth) {
        const mag = Math.pow(1 - depth / rimWidth, 1.85);

        dispData.data[i] = clampByte(128 - nx * 122 * mag);
        dispData.data[i + 1] = clampByte(128 - ny * 122 * mag);
      } else {
        dispData.data[i] = 128;
        dispData.data[i + 1] = 128;
      }

      dispData.data[i + 2] = 128;
      dispData.data[i + 3] = 255;

      const t = Math.max(0, Math.min(1, (depth - clearRim) / Math.max(1, rimWidth - clearRim)));

      maskData.data[i] = 255;
      maskData.data[i + 1] = 255;
      maskData.data[i + 2] = 255;
      maskData.data[i + 3] = Math.round(255 * (0.5 - 0.5 * Math.cos(Math.PI * t)));
    }
  }

  dispCtx.putImageData(dispData, 0, 0);
  maskCtx.putImageData(maskData, 0, 0);

  return {
    displacementUri: dispCanvas.toDataURL('image/png'),
    interiorMaskUri: maskCanvas.toDataURL('image/png'),
  };
}

/** iOS Liquid Glass slab: pre-frost underlay + 2D rounded-rect SDF perimeter refraction + feathered creamy core. */
function VinylGlassWindow({ children }: { children: ReactNode }) {
  const winRef = useRef<HTMLDivElement>(null);
  const glintRef = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState({ w: 1104, h: 558 });

  useEffect(() => {
    const el = winRef.current;

    if (!el) {
      return undefined;
    }

    const syncSize = (width: number, height: number) => {
      const nextW = Math.round(width);
      const nextH = Math.round(height);

      if (nextW < 60 || nextH < 60) {
        return;
      }

      setBoxSize((prev) =>
        Math.abs(prev.w - nextW) >= 24 || Math.abs(prev.h - nextH) >= 24
          ? { w: nextW, h: nextH }
          : prev
      );
    };

    const rect = el.getBoundingClientRect();

    syncSize(rect.width, rect.height);

    const ResizeObs = globalThis.ResizeObserver;

    if (!ResizeObs) {
      return undefined;
    }

    const observer = new ResizeObs((entries) => {
      const entry = entries[0];

      if (entry) {
        syncSize(entry.contentRect.width, entry.contentRect.height);
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const maps = useMemo(() => buildLiquidGlassMaps(boxSize.w, boxSize.h), [boxSize.w, boxSize.h]);

  const handlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const glint = glintRef.current;

    if (!glint || window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    glint.style.opacity = '1';
    glint.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const glint = glintRef.current;

    if (!glint) {
      return;
    }

    glint.style.opacity = '0';
  }, []);

  return (
    <div
      ref={winRef}
      data-testid="vinyl-window"
      className="vinyl-glass-pane rounded-3xl p-4 sm:p-8 lg:p-10 relative overflow-clip"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: 'absolute', pointerEvents: 'none' }}
      >
        <defs>
          <filter
            id="vinyl-liquid-lens"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            {maps.displacementUri ? (
              <>
                <feImage href={maps.displacementUri} preserveAspectRatio="none" result="disp" />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="disp"
                  scale="48"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </>
            ) : null}
          </filter>
        </defs>
      </svg>

      {/* Sibling Layer A: Light pre-frost underlay keeping rim petals intact enough to bend organically */}
      <div
        aria-hidden="true"
        className="vinyl-liquid-base pointer-events-none absolute inset-0 rounded-[inherit] z-0"
      />

      {/* Sibling Layer B: 2D rounded-rect SDF perimeter refraction bending background light along the curved rim */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-0"
        style={
          maps.displacementUri
            ? {
                backdropFilter: 'url(#vinyl-liquid-lens)',
                WebkitBackdropFilter: 'url(#vinyl-liquid-lens)',
              }
            : undefined
        }
      />

      {/* Sibling Layer C: Feathered deep iOS liquid blur across interior, tapering cleanly off at outer bezel */}
      <div
        aria-hidden="true"
        className="vinyl-liquid-core pointer-events-none absolute inset-0 rounded-[inherit] z-0"
        style={
          maps.interiorMaskUri
            ? {
                maskImage: `url("${maps.interiorMaskUri}")`,
                WebkitMaskImage: `url("${maps.interiorMaskUri}")`,
                maskSize: '100% 100%',
                WebkitMaskSize: '100% 100%',
              }
            : undefined
        }
      />

      {/* Razor specular Fresnel rim & subtle top sheen — zero backlight bleed */}
      <div
        aria-hidden="true"
        className="vinyl-glass-meniscus pointer-events-none absolute inset-0 z-20"
      />
      <div
        aria-hidden="true"
        className="vinyl-glass-reflection pointer-events-none absolute inset-0 z-20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 overflow-clip rounded-[inherit]"
      >
        <div
          ref={glintRef}
          className="vinyl-glass-glint"
          style={{ opacity: 0, transform: 'translate3d(260px, 120px, 0)' }}
        />
      </div>

      {children}
    </div>
  );
}

interface YTPlayerInstance {
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  cueVideoById: (videoId: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted?: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement | string,
    options: {
      height?: string | number;
      width?: string | number;
      videoId?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (event: { target: YTPlayerInstance }) => void;
        onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
        onError?: (event: { data: number }) => void;
      };
    },
  ) => YTPlayerInstance;
  PlayerState?: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Synthesize soft mechanical tactile feedback on needle drop / vinyl scrub
function playTactileAudio(kind: 'needle' | 'scrub') {
  try {
    const AudioCtx = window.AudioContext;

    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const dur = kind === 'needle' ? 0.1 : 0.035;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(kind === 'needle' ? 380 : 1200, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(kind === 'needle' ? 0.07 : 0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 200);
  } catch {
    // Silent fallback when audio policy blocks context
  }
}

const SCRUB_SECONDS_PER_REV = 8;
const MOTOR_DEG_PER_SEC = 108;
const DEFAULT_WAM_TRACK_ID = '41EnM4giX9PJYZIBUCPmiI';
const DEFAULT_BAO_TRACK_TITLE = 'beside you';

function findDefaultTrackIndex(tracks: PlaylistTrack[], sideIdx: number): number {
  const matched =
    sideIdx === 0
      ? tracks.findIndex((track) => track.id === DEFAULT_WAM_TRACK_ID)
      : tracks.findIndex((track) => track.title.toLowerCase() === DEFAULT_BAO_TRACK_TITLE);

  if (matched >= 0) {
    return matched;
  }

  return sideIdx === 0 ? 0 : Math.min(2, Math.max(0, tracks.length - 1));
}

const DEFAULT_WAM_TRACK_IDX = findDefaultTrackIndex(SPOTIFY_PLAYLISTS[0]?.tracks ?? [], 0);
const DEFAULT_WAM_TRACK = SPOTIFY_PLAYLISTS[0]?.tracks[DEFAULT_WAM_TRACK_IDX];

export function VinylPlayer() {
  const [activeSideIdx, setActiveSideIdx] = useState<number>(0);
  const [activeTrackIdx, setActiveTrackIdx] = useState<number>(DEFAULT_WAM_TRACK_IDX); // Start on "I Choose You" by keshi on Wam's Playlist
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [trackDuration, setTrackDuration] = useState<number>(DEFAULT_WAM_TRACK?.duration ?? 168);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDraggingDisc, setIsDraggingDisc] = useState<boolean>(false);
  const [isDramaticArrival, setIsDramaticArrival] = useState<boolean>(false);
  const [audioUnlockNeeded, setAudioUnlockNeeded] = useState<boolean>(false);

  const stageRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress: morphProgress } = useScroll({
    target: stageRef,
    offset: ['start 0.22', 'end end'],
  });

  const { scrollYProgress: introHandoffProgress } = useScroll({
    target: stageRef,
    offset: ['start 0.88', 'start 0.12'],
  });

  const titleOpacity = useTransform(morphProgress, [0, 0.08, 1], [0, 1, 1]);
  const titleY = useTransform(morphProgress, [0, 0.1, 0.6, 0.86, 1], ['28vh', '26vh', '26vh', '0vh', '0vh']);
  const titleScale = useTransform(morphProgress, [0, 0.1, 0.6, 0.86, 1], [0.985, 1, 1, 1, 1]);

  const categoryOpacity = useTransform(morphProgress, [0.62, 0.82], [0, 1]);
  const categoryY = useTransform(morphProgress, [0.62, 0.82], [28, 0]);
  const categoryScale = useTransform(morphProgress, [0.62, 0.82], [0.97, 1]);

  const deckOpacity = useTransform(morphProgress, [0.68, 0.88], [0, 1]);
  const deckY = useTransform(morphProgress, [0.68, 0.88], [38, 0]);
  const deckScale = useTransform(morphProgress, [0.68, 0.88], [0.97, 1]);

  const currentSide: PlaylistSide = SPOTIFY_PLAYLISTS[activeSideIdx] || SPOTIFY_PLAYLISTS[0];
  const tracks: PlaylistTrack[] = currentSide.tracks;
  const currentTrack: PlaylistTrack = tracks[activeTrackIdx] || tracks[0];

  // Physics & animation refs for smooth 60/120fps vinyl rotation
  const vinylDiscRef = useRef<HTMLDivElement>(null);
  const discAngleRef = useRef<number>(0);
  const angularVelRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragDeltaSumRef = useRef<number>(0);
  const lastPointerAngleRef = useRef<number>(0);
  const lastDragTimeRef = useRef<number>(0);
  const lastScrubAudioAtRef = useRef<number>(0);
  const lastYtSeekAtRef = useRef<number>(0);
  const seekBarRef = useRef<HTMLDivElement>(null);

  // Scroll autoplay & dramatic reveal lifecycle refs
  const hasUserGestureRef = useRef<boolean>(false);
  const hasAutoPlayedRef = useRef<boolean>(false);
  const htmlPrimedRef = useRef<boolean>(false);
  const justUnlockedAtRef = useRef<number>(0);
  const volumeRampRafRef = useRef<number>(0);
  const arrivalTimerRef = useRef<number>(0);
  const ytVerifyTimerRef = useRef<number>(0);
  const scheduleYtCheckRef = useRef<() => void>(() => {});
  const switchToPreviewFallbackRef = useRef<(track: PlaylistTrack, shouldPlay: boolean, swellVolume?: boolean) => void>(() => {});

  // Audio engines: Hidden YouTube IFrame + Local/Preview HTML5 Audio element
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const ytReadyRef = useRef<boolean>(false);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeEngineRef = useRef<'local' | 'youtube' | 'preview'>(DEFAULT_WAM_TRACK?.localAudioUrl ? 'local' : 'youtube');

  // Synchronized state refs for animation/event callbacks
  const isPlayingRef = useRef<boolean>(false);
  const currentTimeRef = useRef<number>(0);
  const trackDurationRef = useRef<number>(DEFAULT_WAM_TRACK?.duration ?? 168);
  const queueScrollRef = useRef<HTMLDivElement | null>(null);
  const failedYtIdsRef = useRef<Set<string>>(new Set());
  const currentTrackRef = useRef<PlaylistTrack>(currentTrack);
  const volumeRef = useRef<number>(0.85);
  const isMutedRef = useRef<boolean>(false);
  const activeTrackIdxRef = useRef<number>(activeTrackIdx);
  const tracksRef = useRef<PlaylistTrack[]>(tracks);
  const isShuffleRef = useRef<boolean>(false);

  isPlayingRef.current = isPlaying;
  trackDurationRef.current = trackDuration;
  currentTrackRef.current = currentTrack;
  volumeRef.current = volume;
  isMutedRef.current = isMuted;
  activeTrackIdxRef.current = activeTrackIdx;
  tracksRef.current = tracks;
  isShuffleRef.current = isShuffle;

  // Cancel any active dramatic crescendo fade-in before explicit user volume/track changes
  const cancelVolumeRamp = useCallback(() => {
    if (volumeRampRafRef.current) {
      cancelAnimationFrame(volumeRampRafRef.current);
      volumeRampRafRef.current = 0;
    }
  }, []);

  // Smooth 1.65s crescendo fade-in (0 -> target volume) so autoplayed music blooms in gently
  const startDramaticVolumeSwell = useCallback(() => {
    cancelVolumeRamp();

    const durationMs = 1650;
    const startAt = performance.now();

    const step = (now: number) => {
      if (!isPlayingRef.current) {
        volumeRampRafRef.current = 0;

        return;
      }

      const t = Math.min(1, (now - startAt) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const targetVol = isMutedRef.current ? 0 : volumeRef.current;
      const nextVol = targetVol * eased;

      if (activeEngineRef.current !== 'youtube' && htmlAudioRef.current) {
        htmlAudioRef.current.volume = nextVol;
      }

      if (activeEngineRef.current === 'youtube' && ytPlayerRef.current && ytReadyRef.current) {
        try {
          ytPlayerRef.current.setVolume(Math.round(nextVol * 100));
        } catch {
          // Player initializing
        }
      }

      if (t < 1) {
        volumeRampRafRef.current = requestAnimationFrame(step);
      } else {
        volumeRampRafRef.current = 0;
      }
    };

    volumeRampRafRef.current = requestAnimationFrame(step);
  }, [cancelVolumeRamp]);

  // Seek current active audio engine smoothly
  const seekAudioEngine = useCallback((targetSeconds: number) => {
    const clamped = Math.max(0, Math.min(trackDurationRef.current || 1, targetSeconds));
    currentTimeRef.current = clamped;
    setCurrentTime(clamped);

    if (activeEngineRef.current === 'youtube' && ytPlayerRef.current && ytReadyRef.current) {
      const now = performance.now();

      if (now - lastYtSeekAtRef.current > 160 || !isDraggingRef.current) {
        lastYtSeekAtRef.current = now;
        ytPlayerRef.current.seekTo(clamped, true);
      }
    } else if (htmlAudioRef.current) {
      if (Number.isFinite(htmlAudioRef.current.duration) && htmlAudioRef.current.duration > 0) {
        const previewClamped = Math.min(clamped, htmlAudioRef.current.duration - 0.1);
        htmlAudioRef.current.currentTime = Math.max(0, previewClamped);
      }
    }
  }, []);

  // Switch cleanly to Spotify MP3 preview when YouTube is blocked or restricted
  const switchToPreviewFallback = useCallback(
    (track: PlaylistTrack, shouldPlay: boolean, swellVolume = false) => {
      if (!track.previewUrl || !htmlAudioRef.current) {
        setAudioUnlockNeeded(true);

        return;
      }

      activeEngineRef.current = 'preview';
      htmlAudioRef.current.muted = isMutedRef.current;

      if (htmlAudioRef.current.src !== track.previewUrl) {
        htmlAudioRef.current.src = track.previewUrl;
      }

      if (!shouldPlay) {
        htmlAudioRef.current.load();

        return;
      }

      if (!hasUserGestureRef.current) {
        htmlAudioRef.current.load();

        if (!isMutedRef.current) {
          setAudioUnlockNeeded(true);
        }

        return;
      }

      htmlAudioRef.current.volume = swellVolume ? 0 : isMutedRef.current ? 0 : volumeRef.current;

      if (swellVolume) {
        startDramaticVolumeSwell();
      }

      htmlAudioRef.current.play().catch(() => {
        if (swellVolume) {
          cancelVolumeRamp();
        }

        setAudioUnlockNeeded(true);
      });
    },
    [cancelVolumeRamp, startDramaticVolumeSwell]
  );

  switchToPreviewFallbackRef.current = switchToPreviewFallback;

  // Load a specific track across our dual audio engine
  const loadAndPlayTrack = useCallback((track: PlaylistTrack, shouldPlay: boolean) => {
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setTrackDuration(track.duration);
    trackDurationRef.current = track.duration;

    // Pause both engines before switching
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }

    if (ytPlayerRef.current && ytReadyRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
        // Ignored
      }
    }

    // Prefer crisp offline local full MP3 if present, otherwise full YouTube track via YT IFrame
    if (track.localAudioUrl) {
      activeEngineRef.current = 'local';

      if (htmlAudioRef.current) {
        htmlAudioRef.current.muted = isMutedRef.current;
        htmlAudioRef.current.src = track.localAudioUrl;
        htmlAudioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;

        if (shouldPlay) {
          htmlAudioRef.current.play().catch(() => {});
        }
      }

      return;
    }

    if (track.youtubeId && !failedYtIdsRef.current.has(track.youtubeId)) {
      activeEngineRef.current = 'youtube';

      if (ytPlayerRef.current && ytReadyRef.current) {
        if (shouldPlay) {
          if (hasUserGestureRef.current && !isMutedRef.current) {
            ytPlayerRef.current.unMute();
          } else {
            ytPlayerRef.current.mute();
          }

          ytPlayerRef.current.loadVideoById(track.youtubeId, 0);
          ytPlayerRef.current.setVolume(isMutedRef.current ? 0 : Math.round(volumeRef.current * 100));
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.cueVideoById(track.youtubeId, 0);
        }
      }

      return;
    }

    // Fallback: Spotify audio preview URL
    switchToPreviewFallback(track, shouldPlay, false);
  }, [switchToPreviewFallback]);

  // Verify YouTube playback started after autoplay request; fall back to muted stream + 1-tap unmute or preview
  const scheduleYouTubePlaybackCheck = useCallback(() => {
    if (ytVerifyTimerRef.current) {
      window.clearTimeout(ytVerifyTimerRef.current);
    }

    ytVerifyTimerRef.current = window.setTimeout(() => {
      if (!isPlayingRef.current || activeEngineRef.current !== 'youtube') return;

      const activeTrack = currentTrackRef.current;

      try {
        const yt = ytPlayerRef.current;
        const ytState = yt?.getPlayerState?.();
        const ytMuted = yt?.isMuted?.() ?? false;

        // 1 = PLAYING, 3 = BUFFERING
        if (ytState === 1 || ytState === 3) {
          if (ytMuted && !isMutedRef.current) {
            setAudioUnlockNeeded(true);
          } else {
            setAudioUnlockNeeded(false);
          }

          return;
        }

        // If YouTube stayed unstarted/blocked after timeout, switch cleanly to Spotify preview fallback
        if (activeTrack.previewUrl) {
          switchToPreviewFallback(activeTrack, true, hasUserGestureRef.current);
        } else if (!hasUserGestureRef.current && yt && ytReadyRef.current) {
          yt.mute();
          yt.playVideo();
          setAudioUnlockNeeded(true);
        } else {
          setAudioUnlockNeeded(true);
        }
      } catch {
        setAudioUnlockNeeded(true);
      }
    }, 850);
  }, [switchToPreviewFallback]);

  scheduleYtCheckRef.current = scheduleYouTubePlaybackCheck;

  // Play currently loaded active track (with dramatic crescendo fade-in)
  const triggerDramaticAutoplay = useCallback(() => {
    if (hasAutoPlayedRef.current || isPlayingRef.current) return;

    const activeTrack = currentTrackRef.current;

    if (!activeTrack) return;

    hasAutoPlayedRef.current = true;
    setIsDramaticArrival(true);

    if (arrivalTimerRef.current) {
      window.clearTimeout(arrivalTimerRef.current);
    }

    arrivalTimerRef.current = window.setTimeout(() => {
      setIsDramaticArrival(false);
    }, 1850);

    setIsPlaying(true);

    if (hasUserGestureRef.current) {
      playTactileAudio('needle');
    }

    startDramaticVolumeSwell();

    if (activeTrack.localAudioUrl || (!activeTrack.youtubeId && activeTrack.previewUrl)) {
      const targetUrl = activeTrack.localAudioUrl || activeTrack.previewUrl;
      activeEngineRef.current = activeTrack.localAudioUrl ? 'local' : 'preview';

      if (htmlAudioRef.current) {
        htmlAudioRef.current.muted = isMutedRef.current;

        if (!htmlAudioRef.current.src.includes(targetUrl)) {
          htmlAudioRef.current.src = targetUrl;
        }

        htmlAudioRef.current.volume = 0;
        const playAttempt = htmlAudioRef.current.play();

        if (playAttempt) {
          playAttempt
            .then(() => {
              setAudioUnlockNeeded(false);
            })
            .catch(() => {
              cancelVolumeRamp();
              setAudioUnlockNeeded(true);
            });
        }
      }

      return;
    }

    if (activeTrack.youtubeId && !failedYtIdsRef.current.has(activeTrack.youtubeId)) {
      activeEngineRef.current = 'youtube';

      if (ytPlayerRef.current && ytReadyRef.current) {
        try {
          if (hasUserGestureRef.current && !isMutedRef.current) {
            ytPlayerRef.current.unMute();
            ytPlayerRef.current.setVolume(0);
          } else {
            ytPlayerRef.current.mute();

            if (!isMutedRef.current) {
              setAudioUnlockNeeded(true);
            }
          }

          ytPlayerRef.current.playVideo();
        } catch {
          // Verified by timer below
        }

        scheduleYouTubePlaybackCheck();
      }

      return;
    }

    if (activeTrack.previewUrl) {
      cancelVolumeRamp();
      switchToPreviewFallback(activeTrack, true, hasUserGestureRef.current);
    }
  }, [cancelVolumeRamp, scheduleYouTubePlaybackCheck, startDramaticVolumeSwell, switchToPreviewFallback]);

  // Trigger dramatic autoplay when scrolling into the turntable reveal stage
  useMotionValueEvent(morphProgress, 'change', (latest) => {
    if (!prefersReducedMotion && latest >= 0.7) {
      triggerDramaticAutoplay();
    }
  });

  // Gradually duck & seamlessly stop the background piano when "Songs that we listen all throughout the years" is introduced
  useMotionValueEvent(introHandoffProgress, 'change', (latest) => {
    if (latest > 0 && latest < 0.42) {
      const duck = 0.5 * (1 + Math.cos(Math.PI * Math.min(1, latest / 0.65)));
      comfyPiano.setScrollDuckFactor(duck);
    }

    if (latest >= 0.42) {
      comfyPiano.fadeOutAndStop(2.2);
    }
  });

  // Track real user activation, handle navbar jump trigger, and catch initial already-scrolled viewport
  useEffect(() => {
    const markGesture = () => {
      hasUserGestureRef.current = true;

      // Silently pre-warm HTML5 audio element inside the first real gesture when idle
      if (!htmlPrimedRef.current && htmlAudioRef.current && htmlAudioRef.current.src && !isPlayingRef.current) {
        htmlPrimedRef.current = true;
        const audio = htmlAudioRef.current;
        const prevMuted = audio.muted;
        audio.muted = true;
        const warm = audio.play();

        if (warm) {
          warm
            .then(() => {
              if (!isPlayingRef.current) {
                audio.pause();
                audio.currentTime = 0;
              }

              audio.muted = prevMuted;
            })
            .catch(() => {
              audio.muted = prevMuted;
            });
        }
      }
    };

    const handleNavPlay = () => {
      hasUserGestureRef.current = true;
      comfyPiano.fadeOutAndStop(1.35);
      triggerDramaticAutoplay();
    };

    window.addEventListener('pointerdown', markGesture, { capture: true, passive: true });
    window.addEventListener('keydown', markGesture, { capture: true, passive: true });
    window.addEventListener('anniv:play-soundtrack', handleNavPlay);

    if (introHandoffProgress.get() >= 0.42) {
      comfyPiano.fadeOutAndStop(0.6);
    }

    if (!prefersReducedMotion && morphProgress.get() >= 0.7) {
      triggerDramaticAutoplay();
    }

    let observer: IntersectionObserver | null = null;

    if (prefersReducedMotion && stageRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            comfyPiano.fadeOutAndStop(1.4);
            triggerDramaticAutoplay();
          }
        },
        { threshold: 0.2 }
      );

      observer.observe(stageRef.current);
    }

    return () => {
      window.removeEventListener('pointerdown', markGesture, { capture: true });
      window.removeEventListener('keydown', markGesture, { capture: true });
      window.removeEventListener('anniv:play-soundtrack', handleNavPlay);

      if (observer) {
        observer.disconnect();
      }
    };
  }, [introHandoffProgress, morphProgress, prefersReducedMotion, triggerDramaticAutoplay]);

  // Cleanup scroll autoplay timers & volume ramps on unmount
  useEffect(() => {
    return () => {
      cancelVolumeRamp();

      if (arrivalTimerRef.current) {
        window.clearTimeout(arrivalTimerRef.current);
      }

      if (ytVerifyTimerRef.current) {
        window.clearTimeout(ytVerifyTimerRef.current);
      }
    };
  }, [cancelVolumeRamp]);

  // Advance to next or previous track cleanly
  const handleStepTrack = useCallback((direction: 1 | -1) => {
    const list = tracksRef.current;

    if (list.length === 0) return;

    let nextIdx: number;

    if (isShuffleRef.current && list.length > 1) {
      do {
        nextIdx = Math.floor(Math.random() * list.length);
      } while (nextIdx === activeTrackIdxRef.current);
    } else {
      nextIdx = (activeTrackIdxRef.current + direction + list.length) % list.length;
    }

    const nextTrack = list[nextIdx];
    cancelVolumeRamp();
    setAudioUnlockNeeded(false);
    setActiveTrackIdx(nextIdx);
    setIsPlaying(true);
    playTactileAudio('needle');
    loadAndPlayTrack(nextTrack, true);
  }, [cancelVolumeRamp, loadAndPlayTrack]);

  // Ref for stable ended callback
  const handleStepTrackRef = useRef(handleStepTrack);
  handleStepTrackRef.current = handleStepTrack;

  // Initialize hidden YouTube IFrame API player + HTML5 Audio element once
  useEffect(() => {
    const audioEl = new Audio();
    audioEl.preload = 'metadata';
    audioEl.volume = volumeRef.current;

    audioEl.addEventListener('ended', () => {
      if (activeEngineRef.current !== 'youtube') {
        handleStepTrackRef.current(1);
      }
    });

    htmlAudioRef.current = audioEl;

    const initYtPlayer = () => {
      if (!ytContainerRef.current || !window.YT?.Player || ytPlayerRef.current) return;

      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        height: '200',
        width: '200',
        videoId: currentTrackRef.current.youtubeId || 'BLYMjHAa0sE',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (ev) => {
            ytReadyRef.current = true;
            ev.target.setVolume(isMutedRef.current ? 0 : Math.round(volumeRef.current * 100));

            if (isPlayingRef.current && activeEngineRef.current === 'youtube') {
              const ytId = currentTrackRef.current.youtubeId;

              if (ytId && failedYtIdsRef.current.has(ytId)) {
                switchToPreviewFallbackRef.current(currentTrackRef.current, true, hasUserGestureRef.current);

                return;
              }

              if (hasUserGestureRef.current && !isMutedRef.current) {
                ev.target.unMute();
                ev.target.setVolume(0);
                startDramaticVolumeSwell();
              } else {
                ev.target.mute();

                if (!isMutedRef.current) {
                  setAudioUnlockNeeded(true);
                }
              }

              if (currentTimeRef.current > 0) {
                ev.target.loadVideoById(currentTrackRef.current.youtubeId, currentTimeRef.current);
              }

              ev.target.playVideo();
              scheduleYtCheckRef.current();
            }
          },
          onStateChange: (ev) => {
            if (ev.data === 1 && !ev.target.isMuted?.()) {
              setAudioUnlockNeeded(false);
            }

            // 0 = ENDED
            if (ev.data === 0 && activeEngineRef.current === 'youtube') {
              handleStepTrackRef.current(1);
            }
          },
          onError: () => {
            // Seamless automatic fallback to Spotify MP3 preview if YT video fails
            const fallbackTrack = currentTrackRef.current;

            if (fallbackTrack.youtubeId) {
              failedYtIdsRef.current.add(fallbackTrack.youtubeId);
            }

            if (activeEngineRef.current === 'youtube') {
              cancelVolumeRamp();
              switchToPreviewFallbackRef.current(fallbackTrack, isPlayingRef.current, false);
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initYtPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initYtPlayer;

      if (!document.getElementById('yt-iframe-api-script')) {
        const script = document.createElement('script');
        script.id = 'yt-iframe-api-script';
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
      }
    }

    // Load initial track cleanly without autoplay block
    if (currentTrackRef.current.localAudioUrl) {
      activeEngineRef.current = 'local';
      audioEl.src = currentTrackRef.current.localAudioUrl;
    } else if (currentTrackRef.current.youtubeId) {
      activeEngineRef.current = 'youtube';
    } else if (currentTrackRef.current.previewUrl) {
      activeEngineRef.current = 'preview';
      audioEl.src = currentTrackRef.current.previewUrl;
    }

    return () => {
      audioEl.pause();
      audioEl.src = '';

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignored
        }

        ytPlayerRef.current = null;
        ytReadyRef.current = false;
      }
    };
  }, []);

  // Unified 60/120fps physics loop for vinyl rotation, inertia, and playback progress
  useEffect(() => {
    let rafId = 0;
    let lastNow = performance.now();
    let lastUiSync = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;

      if (!isDraggingRef.current) {
        // Inertia decay back toward motor target speed (weighted spin-up torque from rest -> 108 deg/s)
        const targetVel = isPlayingRef.current ? MOTOR_DEG_PER_SEC : 0;
        const accelFactor = isPlayingRef.current && angularVelRef.current < 24 ? 3.8 : 6;
        angularVelRef.current += (targetVel - angularVelRef.current) * Math.min(1, dt * accelFactor);

        if (Math.abs(angularVelRef.current) > 0.05) {
          discAngleRef.current = (discAngleRef.current + angularVelRef.current * dt) % 360;
        }
      }

      if (vinylDiscRef.current) {
        vinylDiscRef.current.style.transform = `rotate(${discAngleRef.current.toFixed(2)}deg)`;
      }

      // Read live audio time from whichever engine is active
      if (!isDraggingRef.current && isPlayingRef.current && now - lastUiSync > 120) {
        lastUiSync = now;

        if (activeEngineRef.current === 'youtube' && ytPlayerRef.current && ytReadyRef.current) {
          try {
            const t = ytPlayerRef.current.getCurrentTime();
            const d = ytPlayerRef.current.getDuration();

            if (Number.isFinite(t) && t >= 0) {
              currentTimeRef.current = t;
              setCurrentTime(t);
            }

            if (Number.isFinite(d) && d > 1) {
              trackDurationRef.current = d;
              setTrackDuration(d);
            }
          } catch {
            // Player initializing
          }
        } else if (htmlAudioRef.current) {
          const t = htmlAudioRef.current.currentTime;

          if (Number.isFinite(t)) {
            currentTimeRef.current = t;
            setCurrentTime(t);
          }

          const d = htmlAudioRef.current.duration;

          if (Number.isFinite(d) && d > 1) {
            trackDurationRef.current = d;
            setTrackDuration(d);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  // Unmute already-playing stream or start active track cleanly inside a user gesture
  const unmuteOrStartCurrentTrack = useCallback(() => {
    hasUserGestureRef.current = true;
    justUnlockedAtRef.current = performance.now();
    setAudioUnlockNeeded(false);
    setIsPlaying(true);
    playTactileAudio('needle');

    if (activeEngineRef.current === 'youtube' && ytPlayerRef.current && ytReadyRef.current) {
      const activeYtId = currentTrackRef.current.youtubeId;

      if (activeYtId && failedYtIdsRef.current.has(activeYtId)) {
        loadAndPlayTrack(currentTrackRef.current, true);

        return;
      }

      try {
        const yt = ytPlayerRef.current;
        const ytState = yt.getPlayerState();
        const targetVol = isMutedRef.current ? 0 : Math.round(volumeRef.current * 100);

        if (!isMutedRef.current) {
          yt.unMute();
        }

        if (ytState === 1 || ytState === 3) {
          yt.setVolume(targetVol);

          return;
        }

        yt.setVolume(targetVol);
        yt.playVideo();
        scheduleYtCheckRef.current();

        return;
      } catch {
        // Fall back to fresh track load below
      }
    }

    if (activeEngineRef.current !== 'youtube' && htmlAudioRef.current) {
      htmlAudioRef.current.muted = isMutedRef.current;
      htmlAudioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;

      if (!htmlAudioRef.current.paused) {
        return;
      }

      if (htmlAudioRef.current.src) {
        htmlAudioRef.current.play().catch(() => {
          loadAndPlayTrack(currentTrackRef.current, true);
        });

        return;
      }
    }

    loadAndPlayTrack(currentTrackRef.current, true);
  }, [loadAndPlayTrack]);

  // Play / Pause toggle
  const handleTogglePlay = useCallback(() => {
    if (performance.now() - justUnlockedAtRef.current < 450) {
      return;
    }

    cancelVolumeRamp();
    setAudioUnlockNeeded(false);

    const nextPlay = !isPlayingRef.current;
    setIsPlaying(nextPlay);
    playTactileAudio('needle');

    if (currentTrackRef.current.localAudioUrl) {
      activeEngineRef.current = 'local';

      if (htmlAudioRef.current) {
        htmlAudioRef.current.muted = isMutedRef.current;
        htmlAudioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;

        if (!htmlAudioRef.current.src.endsWith(currentTrackRef.current.localAudioUrl)) {
          htmlAudioRef.current.src = currentTrackRef.current.localAudioUrl;
          htmlAudioRef.current.currentTime = currentTimeRef.current;
        }

        if (nextPlay) {
          htmlAudioRef.current.play().catch(() => {});
        } else {
          htmlAudioRef.current.pause();
        }
      }

      return;
    }

    if (activeEngineRef.current === 'preview' && htmlAudioRef.current) {
      htmlAudioRef.current.muted = isMutedRef.current;
      htmlAudioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;

      if (nextPlay) {
        htmlAudioRef.current.play().catch(() => {});
      } else {
        htmlAudioRef.current.pause();
      }

      return;
    }

    if (currentTrackRef.current.youtubeId) {
      activeEngineRef.current = 'youtube';

      if (ytPlayerRef.current && ytReadyRef.current) {
        if (nextPlay) {
          if (!isMutedRef.current) {
            ytPlayerRef.current.unMute();
          }

          ytPlayerRef.current.setVolume(isMutedRef.current ? 0 : Math.round(volumeRef.current * 100));
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.pauseVideo();
        }
      }
    }
  }, [cancelVolumeRamp]);

  // Resume blocked scroll autoplay instantaneously on next user interaction anywhere
  useEffect(() => {
    if (!audioUnlockNeeded) return;

    window.addEventListener('pointerdown', unmuteOrStartCurrentTrack, { once: true, capture: true });
    window.addEventListener('keydown', unmuteOrStartCurrentTrack, { once: true, capture: true });

    return () => {
      window.removeEventListener('pointerdown', unmuteOrStartCurrentTrack, { capture: true });
      window.removeEventListener('keydown', unmuteOrStartCurrentTrack, { capture: true });
    };
  }, [audioUnlockNeeded, unmuteOrStartCurrentTrack]);

  // Keep the active track centered inside the queue tray without moving page scroll
  useEffect(() => {
    const listEl = queueScrollRef.current;

    if (!listEl) return;

    const activeBtn = listEl.querySelector<HTMLButtonElement>(`[data-track-idx="${activeTrackIdx}"]`);

    if (!activeBtn) return;

    const targetTop = Math.max(0, activeBtn.offsetTop - listEl.clientHeight / 2 + activeBtn.offsetHeight / 2);
    listEl.scrollTop = targetTop;
  }, [activeSideIdx, activeTrackIdx]);

  // Switch playlist (Wam's Playlist / Bao's Playlist)
  const handleSelectSide = (sideIdx: number) => {
    if (sideIdx === activeSideIdx) return;

    cancelVolumeRamp();
    setAudioUnlockNeeded(false);

    const nextSide = SPOTIFY_PLAYLISTS[sideIdx];
    const startIdx = findDefaultTrackIndex(nextSide.tracks, sideIdx);
    const safeIdx = nextSide.tracks[startIdx] ? startIdx : 0;

    setActiveSideIdx(sideIdx);
    setActiveTrackIdx(safeIdx);
    setIsPlaying(true);
    playTactileAudio('needle');
    loadAndPlayTrack(nextSide.tracks[safeIdx], true);
  };

  // Pick any specific song from playlist queue
  const handleSelectTrack = (trackIdx: number) => {
    const picked = tracks[trackIdx];

    if (!picked) return;

    cancelVolumeRamp();
    setAudioUnlockNeeded(false);
    setActiveTrackIdx(trackIdx);
    setIsPlaying(true);
    playTactileAudio('needle');
    loadAndPlayTrack(picked, true);
  };

  // Interactive Cursor Disc Grab / Spin / Scrub
  const handlePointerDownVinyl = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!vinylDiscRef.current) return;

    const rect = vinylDiscRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    isDraggingRef.current = true;
    setIsDraggingDisc(true);
    dragDeltaSumRef.current = 0;
    lastPointerAngleRef.current = Math.atan2(e.clientY - cy, e.clientX - cx);
    lastDragTimeRef.current = performance.now();
    angularVelRef.current = 0;

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMoveVinyl = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !vinylDiscRef.current) return;

    const rect = vinylDiscRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angleRad = Math.atan2(e.clientY - cy, e.clientX - cx);

    let deltaRad = angleRad - lastPointerAngleRef.current;

    if (deltaRad > Math.PI) deltaRad -= 2 * Math.PI;

    if (deltaRad < -Math.PI) deltaRad += 2 * Math.PI;

    const deltaDeg = (deltaRad * 180) / Math.PI;
    const now = performance.now();
    const dtSec = Math.max(0.008, (now - lastDragTimeRef.current) / 1000);

    lastPointerAngleRef.current = angleRad;
    lastDragTimeRef.current = now;
    dragDeltaSumRef.current += Math.abs(deltaDeg);

    discAngleRef.current = (discAngleRef.current + deltaDeg) % 360;
    angularVelRef.current = deltaDeg / dtSec;

    // Subtle analog vinyl scrub sound when spinning fast by hand
    if (Math.abs(deltaDeg) > 4 && now - lastScrubAudioAtRef.current > 65) {
      lastScrubAudioAtRef.current = now;
      playTactileAudio('scrub');
    }

    // Scrub track position proportionally to rotation
    const scrubSeconds = (deltaRad / (2 * Math.PI)) * SCRUB_SECONDS_PER_REV;
    seekAudioEngine(currentTimeRef.current + scrubSeconds);
  };

  const handlePointerUpVinyl = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsDraggingDisc(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    // If pointer didn't spin meaningfully (< 4 deg), treat click as Play / Pause toggle!
    if (dragDeltaSumRef.current < 4) {
      handleTogglePlay();

      return;
    }

    // Final exact seek on release so YouTube & HTML audio snap crisply to spun timestamp
    seekAudioEngine(currentTimeRef.current);
  };

  // Seek bar click
  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current) return;

    const rect = seekBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekAudioEngine(ratio * trackDuration);
  };

  // Volume change
  const handleVolumeChange = (nextVol: number) => {
    cancelVolumeRamp();
    setVolume(nextVol);
    setIsMuted(nextVol === 0);

    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = nextVol;
    }

    if (ytPlayerRef.current && ytReadyRef.current) {
      ytPlayerRef.current.setVolume(Math.round(nextVol * 100));

      if (nextVol === 0) ytPlayerRef.current.mute();
      else ytPlayerRef.current.unMute();
    }
  };

  const handleToggleMute = () => {
    cancelVolumeRamp();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = nextMuted ? 0 : volume;
    }

    if (ytPlayerRef.current && ytReadyRef.current) {
      if (nextMuted) ytPlayerRef.current.mute();
      else {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(Math.round(volume * 100));
      }
    }
  };

  const progressRatio = trackDuration > 0 ? Math.min(1, Math.max(0, currentTime / trackDuration)) : 0;
  // Tonearm tracks gracefully across grooves from 17deg outer edge to 29deg inner groove
  const tonearmRotation = isPlaying ? 17 + progressRatio * 12 : -8;

  return (
    <section
      ref={stageRef}
      id={prefersReducedMotion ? 'soundtrack' : undefined}
      data-soundtrack-stage="true"
      className={
        prefersReducedMotion
          ? 'relative min-h-screen py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto z-10 select-none overflow-x-clip'
          : 'relative min-h-[305vh] lg:min-h-[295vh] z-10 select-none overflow-x-clip'
      }
    >
      {/* Navigation target anchored at settled morph completion */}
      {!prefersReducedMotion && (
        <div
          id="soundtrack"
          className="absolute left-0 right-0 bottom-0 h-screen pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Hidden YouTube IFrame container kept minimally sized and transparent so browsers allow background playback */}
      <div
        className="fixed bottom-0 right-0 w-[200px] h-[200px] opacity-0 pointer-events-none overflow-hidden -z-50"
        aria-hidden="true"
      >
        <div ref={ytContainerRef} />
      </div>

      <div
        className={
          prefersReducedMotion
            ? ''
            : 'sticky top-0 min-h-screen flex flex-col justify-start lg:justify-center pt-20 pb-4 lg:py-20 px-4 sm:px-6 max-w-6xl mx-auto'
        }
      >
        {/* Section Title & Playlist Side Switcher (scroll-morphed from centered title) */}
        <div className="text-center mb-3 sm:mb-8 lg:mb-10">
          {prefersReducedMotion ? (
            <h2
              className="font-display italic tracking-tight heading-luminous select-text max-w-3xl mx-auto px-2 sm:px-0 leading-[1.15] text-balance"
              style={{ fontSize: 'clamp(1.75rem, 4.2vw, 3.1rem)' }}
            >
              Songs that we listen all throughout the years
            </h2>
          ) : (
            <motion.h2
              className="font-display italic tracking-tight select-text max-w-3xl mx-auto px-2 sm:px-0 leading-[1.15] text-balance"
              style={{
                fontSize: 'clamp(1.38rem, 4.1vw, 3.05rem)',
                opacity: titleOpacity,
                y: titleY,
                scale: titleScale,
                willChange: 'transform, opacity',
              }}
            >
              <ScrollLitSentence
                text="Songs that we listen all throughout the years"
                progress={morphProgress}
                sweepStart={0.08}
                sweepEnd={0.58}
              />
            </motion.h2>
          )}

          <motion.div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-2.5 sm:mt-5"
            style={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: categoryOpacity,
                    y: categoryY,
                    scale: categoryScale,
                  }
            }
          >
            {SPOTIFY_PLAYLISTS.map((pl, idx) => {
              const isActive = activeSideIdx === idx;

              return (
                <button
                  key={pl.id}
                  onClick={() => handleSelectSide(idx)}
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-mono-code transition-all duration-300 cursor-pointer flex items-center gap-2 sm:gap-2.5 active:scale-95 ${
                    isActive
                      ? 'liquid-pill-active text-[#EDF4FF] font-medium shadow-[0_0_18px_rgba(187,210,239,0.34)]'
                      : 'liquid-glass-card text-[#D7E6F8]/70 hover:text-white'
                  }`}
                >
                  <Disc3 className={`w-3.5 h-3.5 ${isActive ? 'text-[#BBD2EF]' : 'text-[#7186A9]'}`} />
                  <span>{pl.name}&apos;s Playlist</span>
                  <span className="text-[10px] opacity-60">· {pl.tracks.length}</span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Real Crystal Liquid Glass Turntable & Embedded Playlist Deck */}
        <motion.div
          style={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: deckOpacity,
                  y: deckY,
                  scale: deckScale,
                }
          }
        >
          <VinylGlassWindow>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-10 items-start">

          {/* Left Column: Tactile Spinning Vinyl Turntable + Album Art Center */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 sm:w-72 sm:h-72 lg:w-84 lg:h-84 flex items-center justify-center">

              {/* Dramatic Needle-Drop Starlight Halo (expands smoothly once on scroll arrival) */}
              {isDramaticArrival && (
                <div
                  className="absolute -inset-6 rounded-full pointer-events-none animate-vinyl-arrival-pulse"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(215, 230, 248, 0.34) 0%, rgba(187, 210, 239, 0.14) 48%, transparent 72%)',
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Subtle Breathing Playing Aura behind Turntable */}
              {isPlaying && (
                <div
                  className="absolute -inset-3 rounded-full pointer-events-none animate-vinyl-playing-aura"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(187, 210, 239, 0.18) 0%, rgba(113, 134, 169, 0.08) 54%, transparent 74%)',
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Recessed Platter Well Shadow */}
              <div
                className="absolute inset-1 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(6,7,11,0.78) 56%, rgba(255,255,255,0.025) 100%)',
                  boxShadow: 'inset 0 8px 30px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.2)',
                }}
              />

              {/* Articulated Metallic Tonearm */}
              <div
                className="absolute -top-2 sm:-top-3 right-1 w-28 h-40 scale-[0.55] sm:scale-[0.86] lg:scale-100 pointer-events-none transition-transform duration-700 ease-out origin-top-right z-40 drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)]"
                style={{
                  transform: `rotate(${tonearmRotation}deg)`,
                }}
              >
                {/* Pivot Counterweight Housing */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D7E6F8] via-[#7186A9] to-[#080E20] border border-white/30 shadow-lg ml-auto mr-1.5 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#080E20] border border-white/25" />
                </div>
                {/* Brushed Arm Wand */}
                <div className="w-1.5 h-28 bg-gradient-to-b from-[#EDF4FF] via-[#BBD2EF] to-[#7186A9] rounded-full mx-auto -mt-0.5 shadow-md" />
                {/* Headshell & Glowing Stylus */}
                <div className="w-4 h-7 bg-gradient-to-b from-[#D7E6F8] to-[#101A35] rounded-sm mx-auto shadow-md border border-[#BBD2EF]/40 flex flex-col items-center justify-end pb-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isPlaying ? 'bg-[#EDF4FF] shadow-[0_0_8px_#BBD2EF]' : 'bg-[#7186A9]/60'
                    }`}
                  />
                </div>
              </div>

              {/* Interactive Vinyl Record (1:1 Cursor-Spinnable with Momentum) */}
              <div
                ref={vinylDiscRef}
                onPointerDown={handlePointerDownVinyl}
                onPointerMove={handlePointerMoveVinyl}
                onPointerUp={handlePointerUpVinyl}
                onPointerCancel={handlePointerUpVinyl}
                className={`relative w-[92%] h-[92%] rounded-full select-none touch-none flex items-center justify-center transition-shadow duration-300 ${
                  isDraggingDisc ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{
                  background: `
                    repeating-radial-gradient(
                      circle at center,
                      rgba(15, 17, 23, 0.96) 0px,
                      rgba(8, 9, 13, 0.98) 2px,
                      rgba(24, 27, 36, 0.85) 3px,
                      rgba(8, 9, 13, 0.98) 5px
                    )
                  `,
                  boxShadow: isPlaying || isDraggingDisc
                    ? '0 22px 55px rgba(0,0,0,0.95), 0 0 32px rgba(255,255,255,0.12), inset 0 0 0 2px rgba(255,255,255,0.1)'
                    : '0 18px 45px rgba(0,0,0,0.9), inset 0 0 0 2px rgba(255,255,255,0.06)',
                }}
                title="Click to play or pause · Drag with cursor to spin & scrub"
              >
                {/* Reflective Anisotropic Vinyl Sheen (rotates dynamically with the record) */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-30"
                  style={{
                    background:
                      'conic-gradient(from 25deg, transparent 0deg, rgba(215,230,248,0.28) 38deg, transparent 78deg, transparent 180deg, rgba(187,210,239,0.25) 218deg, transparent 258deg)',
                  }}
                />

                {/* Outer Vinyl Lead-in Rim Ring */}
                <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-12 rounded-full border border-[#BBD2EF]/10 pointer-events-none" />

                {/* Center Label with Live Track Album Artwork */}
                <div className="relative w-20 h-20 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full p-1 bg-gradient-to-br from-[#BBD2EF]/60 via-[#101A35] to-[#080E20] shadow-[0_0_25px_rgba(0,0,0,0.9)] flex items-center justify-center pointer-events-none">
                  <div className="relative w-full h-full rounded-full overflow-hidden border border-white/25 flex items-center justify-center">
                    <img
                      src={currentTrack.coverUrl || currentSide.coverUrl}
                      alt={`${currentTrack.title} album art`}
                      className="w-full h-full object-cover"
                    />

                    {/* Subtle center label ring */}
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_16px_rgba(8,14,32,0.55)]" />

                    {/* Brushed Metal Spindle */}
                    <div className="absolute w-5 h-5 rounded-full bg-[#080E20] border-2 border-[#D7E6F8]/70 shadow-[0_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#BBD2EF]/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Transport Controls (Play/Pause, Prev, Next, Shuffle) */}
            <div className="flex items-center justify-center gap-3 mt-3.5 sm:mt-6">
              <button
                onClick={() => handleStepTrack(-1)}
                className="vinyl-glass-chip p-2.5 rounded-full text-[#EDF4FF] hover:text-white cursor-pointer active:scale-95"
                title="Previous song"
                aria-label="Previous song"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="vinyl-glass-play inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[#F5FAFF] text-xs font-mono-code cursor-pointer active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-[#BBD2EF]" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-[#BBD2EF] fill-[#BBD2EF]" />
                    <span>Spin Vinyl</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleStepTrack(1)}
                className="vinyl-glass-chip p-2.5 rounded-full text-[#EDF4FF] hover:text-white cursor-pointer active:scale-95"
                title="Next song"
                aria-label="Next song"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsShuffle((s) => !s)}
                className={`p-2.5 rounded-full transition-all cursor-pointer active:scale-95 ${
                  isShuffle
                    ? 'liquid-pill-active text-[#EDF4FF]'
                    : 'vinyl-glass-chip text-[#9AB2D4] hover:text-[#EDF4FF]'
                }`}
                title="Shuffle playlist"
                aria-label="Toggle shuffle"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>

            {audioUnlockNeeded && !isMuted && (
              <button
                type="button"
                onClick={unmuteOrStartCurrentTrack}
                className="vinyl-glass-chip mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-mono-code tracking-[0.14em] uppercase text-[#EDF4FF] hover:text-white cursor-pointer active:scale-95 animate-pulse"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#BBD2EF]" />
                <span>Tap to hear {currentTrack.title}</span>
              </button>
            )}
          </div>

          {/* Right Column: Active Track Artwork, Scrub Bar & Full Working Playlist */}
          <div className="lg:col-span-7 flex flex-col space-y-3.5 sm:space-y-5">

            {/* Active Track Feature Card with Crisp Album Artwork */}
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/[0.1]">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.8)] border border-white/15 flex-shrink-0">
                  <img
                    src={currentTrack.coverUrl || currentSide.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <span className="text-[11px] font-mono-code text-[#BBD2EF]/80 uppercase tracking-wider block">
                    {currentSide.name}&apos;s Playlist · Track {activeTrackIdx + 1} of {tracks.length}
                  </span>

                  <h3 className="font-display italic text-2xl sm:text-3xl text-[#EDF4FF] leading-tight truncate mt-0.5">
                    {currentTrack.title}
                  </h3>

                  <p className="font-editorial italic text-base text-[#7186A9] truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>

              {/* Open Original Playlist on Spotify */}
              <a
                href={currentSide.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="vinyl-glass-chip hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono-code text-[#E8EDF5] hover:text-white transition-all cursor-pointer active:scale-95 flex-shrink-0"
              >
                <span>Spotify</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Interactive Scrub / Progress Bar + Volume */}
            <div className="space-y-3">
              <div
                ref={seekBarRef}
                onClick={handleSeekBarClick}
                className="relative w-full h-2.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                title="Click anywhere to seek"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#101A35] via-[#BBD2EF] to-[#EDF4FF] rounded-full transition-all duration-100 shadow-[0_0_10px_#BBD2EF]"
                  style={{ width: `${progressRatio * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono-code text-[#7186A9]">
                <span>{formatTime(currentTime)}</span>

                {/* Compact Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleMute}
                    className="text-[#7186A9] hover:text-[#BBD2EF] transition-colors cursor-pointer"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-[#BBD2EF]" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 sm:w-28 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#BBD2EF]"
                    aria-label="Volume"
                  />
                </div>

                <span>{formatTime(trackDuration)}</span>
              </div>
            </div>

            {/* Embedded Interactive Full Playlist Queue — Clear Low-Opacity Crystal Well */}
            <div className="vinyl-glass-well rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] bg-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentSide.coverUrl}
                    alt={currentSide.subtitle}
                    className="w-5 h-5 rounded object-cover border border-white/20"
                  />
                  <span className="text-xs font-mono-code text-[#D7E6F8] tracking-wide">
                    {currentSide.title} ({tracks.length} songs)
                  </span>
                </div>
              </div>

              <div
                ref={queueScrollRef}
                className="relative max-h-32 sm:max-h-56 lg:max-h-64 overflow-y-auto py-1.5 divide-y divide-white/[0.04]"
              >
                {tracks.map((track, idx) => {
                  const isCurrent = idx === activeTrackIdx;

                  return (
                    <button
                      key={`${track.id}-${idx}`}
                      data-track-idx={idx}
                      aria-current={isCurrent ? 'true' : undefined}
                      onClick={() => handleSelectTrack(idx)}
                      className={`flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                        isCurrent
                          ? 'w-[calc(100%-0.75rem)] mx-1.5 rounded-xl bg-white/[0.11] text-[#F5FAFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_14px_rgba(0,0,0,0.28)]'
                          : 'w-full hover:bg-white/[0.05] text-[#E6ECF5]/88'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-[11px] font-mono-code text-[#7186A9] flex-shrink-0 text-right">
                          {isCurrent && isPlaying ? '▶' : (idx + 1).toString().padStart(2, '0')}
                        </span>

                        <img
                          src={track.coverUrl || currentSide.coverUrl}
                          alt={track.title}
                          loading="lazy"
                          className="w-9 h-9 rounded-lg object-cover border border-white/10 flex-shrink-0"
                        />

                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              isCurrent ? 'text-[#EDF4FF]' : 'text-[#D7E6F8]'
                            }`}
                          >
                            {track.title}
                          </p>
                          <p className="text-xs font-editorial italic text-[#7186A9] truncate">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono-code text-[#7186A9] flex-shrink-0">
                        {formatTime(track.duration)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
          </VinylGlassWindow>
        </motion.div>
      </div>
    </section>
  );
}
