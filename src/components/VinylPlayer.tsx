import {
  useState,
  useRef,
  useEffect,
  useCallback,
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

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

interface LiquidGlassMaps {
  displacementUri: string;
  interiorMaskUri: string;
}

const EMPTY_LIQUID_MAPS: LiquidGlassMaps = {
  displacementUri: '',
  interiorMaskUri: '',
};

const LIQUID_GLASS_CACHE = new Map<string, LiquidGlassMaps>();
const LIQUID_GLASS_INFLIGHT = new Map<string, Promise<LiquidGlassMaps>>();

function clampByte(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function canvasToLosslessUriAsync(canvas: HTMLCanvasElement): Promise<string> {
  const createBlob = canvas.toBlob;
  const toObjectUrl = globalThis.URL?.createObjectURL;

  if (!createBlob || !toObjectUrl) {
    return Promise.resolve(canvas.toDataURL('image/png'));
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(toObjectUrl(blob));

        return;
      }

      resolve(canvas.toDataURL('image/png'));
    }, 'image/png');
  });
}

/** Builds quantized, cached PNG bevel displacement + feathered interior frost mask using off-thread PNG encoding. */
function buildLiquidGlassMapsAsync(cssWidth: number, cssHeight: number): Promise<LiquidGlassMaps> {
  const doc = globalThis.document;

  if (!doc || cssWidth <= 0 || cssHeight <= 0) {
    return Promise.resolve(EMPTY_LIQUID_MAPS);
  }

  const qW = Math.max(64, Math.round(cssWidth / 32) * 32);
  const qH = Math.max(64, Math.round(cssHeight / 32) * 32);
  const cacheKey = `${qW}x${qH}`;
  const cached = LIQUID_GLASS_CACHE.get(cacheKey);

  if (cached) {
    return Promise.resolve(cached);
  }

  const inflight = LIQUID_GLASS_INFLIGHT.get(cacheKey);

  if (inflight) {
    return inflight;
  }

  // Bilinearly scaled perimeter lens map capped at 320px for sub-2ms pixel fill
  const scale = Math.min(0.32, 320 / Math.max(qW, qH));
  const w = Math.max(48, Math.round(qW * scale));
  const h = Math.max(48, Math.round(qH * scale));
  const dispCanvas = doc.createElement('canvas');
  const maskCanvas = doc.createElement('canvas');

  dispCanvas.width = w;
  dispCanvas.height = h;
  maskCanvas.width = w;
  maskCanvas.height = h;

  const dispCtx = dispCanvas.getContext('2d');
  const maskCtx = maskCanvas.getContext('2d');

  if (!dispCtx || !maskCtx) {
    return Promise.resolve(EMPTY_LIQUID_MAPS);
  }

  const dispImg = dispCtx.createImageData(w, h);
  const maskImg = maskCtx.createImageData(w, h);
  const dispData = dispImg.data;
  const maskData = maskImg.data;
  const halfW = w / 2;
  const halfH = h / 2;
  const radius = Math.min(24 * scale, halfW, halfH);
  const rimWidth = 35 * scale;
  const clearRim = 4 * scale;
  const rimSpan = Math.max(1, rimWidth - clearRim);
  const innerHalfW = Math.max(0, halfW - Math.max(radius, rimWidth) - 1);
  const innerHalfH = Math.max(0, halfH - Math.max(radius, rimWidth) - 1);
  const rx = halfW - radius;
  const ry = halfH - radius;

  for (let y = 0; y < h; y += 1) {
    const dy = y + 0.5 - halfH;
    const absDy = Math.abs(dy);
    const inInnerY = absDy <= innerHalfH;
    const py = absDy - ry;
    const qy = py > 0 ? py : 0;
    const rowOffset = y * w;

    for (let x = 0; x < w; x += 1) {
      const dx = x + 0.5 - halfW;
      const absDx = Math.abs(dx);
      const i = (rowOffset + x) * 4;

      if (inInnerY && absDx <= innerHalfW) {
        dispData[i] = 128;
        dispData[i + 1] = 128;
        dispData[i + 2] = 128;
        dispData[i + 3] = 255;
        maskData[i] = 255;
        maskData[i + 1] = 255;
        maskData[i + 2] = 255;
        maskData[i + 3] = 255;
        continue;
      }

      const px = absDx - rx;
      const qx = px > 0 ? px : 0;
      const outLen = qx > 0 && qy > 0 ? Math.hypot(qx, qy) : qx + qy;
      const innerMin = px > py ? px : py;
      const sd = outLen + (innerMin < 0 ? innerMin : 0) - radius;
      const depth = sd < 0 ? -sd : 0;

      let nx = 0;
      let ny = 0;

      if (outLen > 0.001) {
        const sdx = dx < 0 ? -1 : 1;
        const sdy = dy < 0 ? -1 : 1;
        nx = (qx / outLen) * sdx;
        ny = (qy / outLen) * sdy;
      } else if (px > py) {
        nx = dx < 0 ? -1 : 1;
      } else {
        ny = dy < 0 ? -1 : 1;
      }

      if (depth < rimWidth) {
        const mag = Math.pow(1 - depth / rimWidth, 1.85);
        dispData[i] = clampByte(128 - nx * 122 * mag);
        dispData[i + 1] = clampByte(128 - ny * 122 * mag);
      } else {
        dispData[i] = 128;
        dispData[i + 1] = 128;
      }

      dispData[i + 2] = 128;
      dispData[i + 3] = 255;

      const t = Math.max(0, Math.min(1, (depth - clearRim) / rimSpan));
      maskData[i] = 255;
      maskData[i + 1] = 255;
      maskData[i + 2] = 255;
      maskData[i + 3] = Math.round(255 * (0.5 - 0.5 * Math.cos(Math.PI * t)));
    }
  }

  dispCtx.putImageData(dispImg, 0, 0);
  maskCtx.putImageData(maskImg, 0, 0);

  const job = Promise.all([
    canvasToLosslessUriAsync(dispCanvas),
    canvasToLosslessUriAsync(maskCanvas),
  ]).then(([displacementUri, interiorMaskUri]) => {
    const built = { displacementUri, interiorMaskUri };
    LIQUID_GLASS_CACHE.set(cacheKey, built);
    LIQUID_GLASS_INFLIGHT.delete(cacheKey);

    return built;
  });

  LIQUID_GLASS_INFLIGHT.set(cacheKey, job);

  return job;
}

/** iOS Liquid Glass slab: pre-frost underlay + 2D rounded-rect SDF perimeter refraction + feathered creamy core. */
function VinylGlassWindow({ children }: { children: ReactNode }) {
  const winRef = useRef<HTMLDivElement>(null);
  const glintRef = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState<{ w: number; h: number } | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  const [maps, setMaps] = useState<LiquidGlassMaps>(EMPTY_LIQUID_MAPS);

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
        !prev || Math.abs(prev.w - nextW) >= 32 || Math.abs(prev.h - nextH) >= 32
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

  // Prepare liquid lens maps only once near viewport or after initial hero animations settle
  useEffect(() => {
    const el = winRef.current;

    if (!el || isNearViewport) {
      return undefined;
    }

    const InterObs = globalThis.IntersectionObserver;
    let observer: IntersectionObserver | null = null;

    if (InterObs) {
      observer = new InterObs(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setIsNearViewport(true);
            observer?.disconnect();
          }
        },
        { rootMargin: '900px 0px' }
      );
      observer.observe(el);
    }

    const scheduleIdle = window.requestIdleCallback;
    const cancelIdle = window.cancelIdleCallback;

    let idleId = 0;
    let timerId = 0;

    if (scheduleIdle) {
      idleId = scheduleIdle(() => setIsNearViewport(true), { timeout: 2200 });
    } else {
      timerId = window.setTimeout(() => setIsNearViewport(true), 1800);
    }

    return () => {
      observer?.disconnect();

      if (idleId && cancelIdle) {
        cancelIdle(idleId);
      }

      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, [isNearViewport]);

  // Build bevel & frost maps asynchronously with off-thread PNG encoding so main thread never stalls
  useEffect(() => {
    if (!boxSize || !isNearViewport) {
      return undefined;
    }

    let cancelled = false;

    const rafId = requestAnimationFrame(() => {
      if (cancelled) return;

      void buildLiquidGlassMapsAsync(boxSize.w, boxSize.h).then((nextMaps) => {
        if (!cancelled) {
          setMaps(nextMaps);
        }
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [boxSize, isNearViewport]);

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
      className="vinyl-glass-pane rounded-3xl p-4 sm:p-8 lg:p-8 relative overflow-clip"
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
  getVolume?: () => number;
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
      host?: string;
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

let sharedTactileAudioCtx: AudioContext | null = null;

// Synthesize soft mechanical tactile feedback on needle drop / vinyl scrub
function playTactileAudio(kind: 'needle' | 'scrub') {
  try {
    const AudioCtx = window.AudioContext;

    if (!AudioCtx) return;

    if (!sharedTactileAudioCtx || sharedTactileAudioCtx.state === 'closed') {
      sharedTactileAudioCtx = new AudioCtx();
    }

    const ctx = sharedTactileAudioCtx;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});

      return;
    }

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
  } catch {
    // Silent fallback when audio policy blocks context
  }
}

const SCRUB_SECONDS_PER_REV = 8;
const MOTOR_DEG_PER_SEC = 108;
const DEFAULT_WAM_TRACK_ID = '41EnM4giX9PJYZIBUCPmiI';
const DEFAULT_BAO_TRACK_TITLE = 'beside you';
const YT_PRIMARY_HOST = 'https://www.youtube-nocookie.com';
const YT_FALLBACK_HOST = 'https://www.youtube.com';
const ACTIVATION_EVENTS = ['click', 'pointerup', 'touchend', 'keydown'] as const;

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
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const titleBlockRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [introOffsetPx, setIntroOffsetPx] = useState<number>(() =>
    globalThis.window ? Math.round(globalThis.window.innerHeight * 0.34) : 260
  );

  const prefersReducedMotion = useReducedMotion();

  // Compute exact vertical intro offset so heading rests dead-center in viewport before gliding into place
  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const measureCenterOffset = () => {
      const stickyEl = stickyContainerRef.current;
      const blockEl = titleBlockRef.current;
      const headingEl = headingRef.current;

      if (!stickyEl || !blockEl || !headingEl) return;

      const stickyRect = stickyEl.getBoundingClientRect();
      const blockRect = blockEl.getBoundingClientRect();
      const headingHeight = headingEl.offsetHeight;

      if (headingHeight <= 0) return;

      const restCenterYInSticky = blockRect.top - stickyRect.top + headingHeight / 2;
      const targetCenterY = window.innerHeight * 0.5;
      const nextOffset = Math.max(0, Math.round(targetCenterY - restCenterYInSticky));

      setIntroOffsetPx((prev) => (Math.abs(prev - nextOffset) >= 2 ? nextOffset : prev));
    };

    measureCenterOffset();
    document.fonts?.ready.then(measureCenterOffset).catch(() => {});

    const ResizeObs = globalThis.ResizeObserver;
    let observer: ResizeObserver | null = null;

    if (ResizeObs && stickyContainerRef.current && headingRef.current) {
      observer = new ResizeObs(measureCenterOffset);
      observer.observe(stickyContainerRef.current);
      observer.observe(headingRef.current);
    }

    window.addEventListener('resize', measureCenterOffset);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measureCenterOffset);
    };
  }, [prefersReducedMotion]);

  const { scrollYProgress: morphProgress } = useScroll({
    target: stageRef,
    offset: ['start 0.16', 'end end'],
  });

  const { scrollYProgress: introHandoffProgress } = useScroll({
    target: stageRef,
    offset: ['start 0.88', 'start 0.12'],
  });

  const titleOpacity = useTransform(morphProgress, [0, 0.12, 1], [0, 1, 1]);

  const titleY = useTransform(
    morphProgress,
    [0, 0.12, 0.18, 0.56, 1],
    [introOffsetPx + 20, introOffsetPx, introOffsetPx, 0, 0]
  );

  const titleScale = useTransform(
    morphProgress,
    [0, 0.14, 0.22, 0.56, 1],
    [0.95, 1.03, 1.03, 1, 1]
  );

  const haloOpacity = useTransform(morphProgress, [0.02, 0.16, 0.36, 0.52], [0, 0.32, 0.18, 0]);
  const haloScale = useTransform(morphProgress, [0.02, 0.52], [0.68, 1.38]);
  const haloRotate = useTransform(morphProgress, [0.02, 0.52], [-16, 22]);

  const categoryOpacity = useTransform(morphProgress, [0.56, 0.84], [0, 1]);
  const categoryY = useTransform(morphProgress, [0.56, 0.84], [16, 0]);
  const categoryScale = useTransform(morphProgress, [0.56, 0.84], [0.97, 1]);

  const deckOpacity = useTransform(morphProgress, [0.44, 0.78], [0, 1]);
  const deckY = useTransform(morphProgress, [0.44, 0.8], [64, 0]);
  const deckScale = useTransform(morphProgress, [0.44, 0.8], [0.91, 1]);
  const discIntroRotate = useTransform(morphProgress, [0.44, 0.86], [-32, 0]);

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
  const isScrubbingSeekRef = useRef<boolean>(false);
  const lastSeekPointerUpAtRef = useRef<number>(0);

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
  const unmuteOrStartRef = useRef<() => void>(() => {});

  // Audio engines: Hidden YouTube IFrame + Local/Preview HTML5 Audio element
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const ytReadyRef = useRef<boolean>(false);
  const ytUnavailableRef = useRef<boolean>(false);
  const ytHostRef = useRef<string>(YT_PRIMARY_HOST);
  const ytHostTriedRef = useRef<Set<string>>(new Set());
  const switchYtHostRef = useRef<(track: PlaylistTrack, host: string, resumeSec: number) => boolean>(() => false);
  const ensureVinylLoopRef = useRef<() => void>(() => {});
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeEngineRef = useRef<'local' | 'youtube' | 'preview'>(DEFAULT_WAM_TRACK?.localAudioUrl ? 'local' : 'youtube');

  // Synchronized state refs for animation/event callbacks
  const isPlayingRef = useRef<boolean>(false);
  const audioUnlockNeededRef = useRef<boolean>(false);
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
  audioUnlockNeededRef.current = audioUnlockNeeded;
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

  const canUseYouTube = useCallback(
    (track: PlaylistTrack) =>
      Boolean(
        track.youtubeId &&
          !failedYtIdsRef.current.has(track.youtubeId) &&
          !ytUnavailableRef.current &&
          ytReadyRef.current &&
          ytPlayerRef.current
      ),
    []
  );

  // Unlock the shared HTML5 Audio element inside a real user gesture so async fallback play() is allowed
  const primeAudioOnGesture = useCallback(() => {
    hasUserGestureRef.current = true;

    const audio = htmlAudioRef.current;

    if (!audio || htmlPrimedRef.current) {
      return;
    }

    if (isPlayingRef.current && activeEngineRef.current !== 'youtube') {
      htmlPrimedRef.current = true;

      return;
    }

    const warmupUrl = currentTrackRef.current.localAudioUrl || currentTrackRef.current.previewUrl;

    if (!warmupUrl) {
      return;
    }

    if (!audio.src) {
      audio.src = warmupUrl;
    }

    htmlPrimedRef.current = true;
    audio.muted = true;
    const warm = audio.play();

    if (warm) {
      warm
        .then(() => {
          if (!isPlayingRef.current || activeEngineRef.current === 'youtube') {
            audio.pause();
            audio.currentTime = 0;
          }

          audio.muted = isMutedRef.current;
        })
        .catch(() => {
          if (!isPlayingRef.current || activeEngineRef.current === 'youtube') {
            htmlPrimedRef.current = false;
          }

          audio.muted = isMutedRef.current;
        });
    }
  }, []);

  // Gentle 850ms swell from audible floor (28%) -> target volume, with guaranteed final volume clamp
  const startDramaticVolumeSwell = useCallback(() => {
    cancelVolumeRamp();

    const durationMs = 850;
    let rampStartAt = 0;

    const applyVol = (ratio: number) => {
      const targetVol = isMutedRef.current ? 0 : volumeRef.current;
      const nextVol = targetVol * ratio;

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
    };

    const step = (now: number) => {
      if (!isPlayingRef.current) {
        volumeRampRafRef.current = 0;

        return;
      }

      // Wait until YouTube enters PLAYING state so slow buffering never exhausts the ramp at low/zero volume
      if (activeEngineRef.current === 'youtube' && ytPlayerRef.current && ytReadyRef.current) {
        try {
          if (ytPlayerRef.current.getPlayerState?.() !== 1) {
            applyVol(1);
            volumeRampRafRef.current = requestAnimationFrame(step);

            return;
          }
        } catch {
          // Keep target volume guarded
        }
      }

      if (rampStartAt === 0) {
        rampStartAt = now;
      }

      const t = Math.min(1, (now - rampStartAt) / durationMs);
      const eased = 0.28 + 0.72 * (1 - Math.pow(1 - t, 3));

      applyVol(eased);

      if (t < 1) {
        volumeRampRafRef.current = requestAnimationFrame(step);
      } else {
        applyVol(1);
        volumeRampRafRef.current = 0;
      }
    };

    applyVol(activeEngineRef.current === 'youtube' ? 1 : 0.28);
    volumeRampRafRef.current = requestAnimationFrame(step);
  }, [cancelVolumeRamp]);

  // Seek current active audio engine smoothly (and ensure unmuted playback if user interacted while stalled)
  const seekAudioEngine = useCallback((targetSeconds: number, resumeIfStalled = false) => {
    const clamped = Math.max(0, Math.min(trackDurationRef.current || 1, targetSeconds));
    currentTimeRef.current = clamped;
    setCurrentTime(clamped);

    if (activeEngineRef.current === 'youtube' && ytPlayerRef.current && ytReadyRef.current) {
      const now = performance.now();

      if (now - lastYtSeekAtRef.current > 160 || !isDraggingRef.current) {
        lastYtSeekAtRef.current = now;
        ytPlayerRef.current.seekTo(clamped, true);

        if (resumeIfStalled && isPlayingRef.current) {
          try {
            if (!isMutedRef.current) {
              ytPlayerRef.current.unMute();
              ytPlayerRef.current.setVolume(Math.round(volumeRef.current * 100));
              setAudioUnlockNeeded(false);
            }

            const st = ytPlayerRef.current.getPlayerState?.();

            if (st !== 1 && st !== 3) {
              ytPlayerRef.current.playVideo();
            }
          } catch {
            // Ignored
          }
        }
      }
    } else if (htmlAudioRef.current) {
      if (Number.isFinite(htmlAudioRef.current.duration) && htmlAudioRef.current.duration > 0) {
        const previewClamped = Math.min(clamped, htmlAudioRef.current.duration - 0.1);
        htmlAudioRef.current.currentTime = Math.max(0, previewClamped);
      }

      if (resumeIfStalled && isPlayingRef.current) {
        htmlAudioRef.current.muted = isMutedRef.current;
        htmlAudioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;

        if (htmlAudioRef.current.paused) {
          void htmlAudioRef.current.play().then(() => {
            setAudioUnlockNeeded(false);
          }).catch(() => {});
        }
      }
    }
  }, []);

  // Switch cleanly to Spotify MP3 preview (or localAudioUrl) whenever YouTube is blocked or restricted
  const switchToPreviewFallback = useCallback(
    (track: PlaylistTrack, shouldPlay: boolean, swellVolume = false) => {
      const fallbackUrl = track.localAudioUrl || track.previewUrl;
      const audioEl = htmlAudioRef.current;

      if (!fallbackUrl || !audioEl) {
        setAudioUnlockNeeded(true);

        return;
      }

      activeEngineRef.current = track.localAudioUrl ? 'local' : 'preview';

      if (ytPlayerRef.current && ytReadyRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // Ignored
        }
      }

      const resolvedUrl = new URL(fallbackUrl, window.location.href).href;
      audioEl.muted = isMutedRef.current;

      if (audioEl.src !== resolvedUrl) {
        audioEl.src = fallbackUrl;
      }

      if (!shouldPlay) {
        audioEl.load();

        return;
      }

      const targetVol = isMutedRef.current ? 0 : volumeRef.current;
      audioEl.volume = swellVolume ? Math.max(0.28 * targetVol, 0.05) : targetVol;

      if (swellVolume && !isMutedRef.current) {
        startDramaticVolumeSwell();
      } else {
        cancelVolumeRamp();
      }

      const attempt = audioEl.play();

      if (attempt) {
        attempt
          .then(() => {
            setAudioUnlockNeeded(false);
          })
          .catch(() => {
            cancelVolumeRamp();
            audioEl.volume = targetVol;

            if (!isMutedRef.current) {
              setAudioUnlockNeeded(true);
            }
          });
      }
    },
    [cancelVolumeRamp, startDramaticVolumeSwell]
  );

  switchToPreviewFallbackRef.current = switchToPreviewFallback;

  // Verify YouTube playback started & advances past 0:00; retry patiently across slow cold starts & try alternate host before fallback
  const scheduleYouTubePlaybackCheck = useCallback(() => {
    if (ytVerifyTimerRef.current) {
      window.clearTimeout(ytVerifyTimerRef.current);
      ytVerifyTimerRef.current = 0;
    }

    const expectedTrackId = currentTrackRef.current.id;
    const expectedYtId = currentTrackRef.current.youtubeId;
    const retryDelays = [450, 950, 1500, 2100];

    const inspectPlayback = (attempt: number) => {
      if (
        !isPlayingRef.current ||
        activeEngineRef.current !== 'youtube' ||
        currentTrackRef.current.id !== expectedTrackId
      ) {
        return;
      }

      const activeTrack = currentTrackRef.current;
      const yt = ytPlayerRef.current;

      if (!ytReadyRef.current || !yt) {
        if (!ytUnavailableRef.current && attempt < retryDelays.length) {
          ytVerifyTimerRef.current = window.setTimeout(
            () => inspectPlayback(attempt + 1),
            retryDelays[attempt]
          );

          return;
        }

        if (activeTrack.youtubeId && ytUnavailableRef.current) {
          failedYtIdsRef.current.add(activeTrack.youtubeId);
        }

        switchToPreviewFallback(activeTrack, true, true);

        return;
      }

      try {
        const ytState = yt.getPlayerState?.();
        const ytMuted = yt.isMuted?.() ?? false;
        const ytVol = yt.getVolume?.() ?? 0;
        const ytTime = yt.getCurrentTime?.() ?? 0;
        const hasActivation = hasUserGestureRef.current || Boolean(navigator.userActivation?.hasBeenActive);

        // 1 = PLAYING
        if (ytState === 1) {
          if (!isMutedRef.current) {
            if (ytVol < 5 && volumeRampRafRef.current === 0) {
              yt.setVolume(Math.round(volumeRef.current * 100));
            }

            if (ytMuted) {
              if (hasActivation) {
                try {
                  yt.unMute();
                  yt.setVolume(Math.round(volumeRef.current * 100));
                } catch {
                  // Will keep unlock hint visible below if still muted
                }
              }

              if (yt.isMuted?.() ?? true) {
                setAudioUnlockNeeded(true);
              } else {
                setAudioUnlockNeeded(false);
              }
            } else {
              setAudioUnlockNeeded(false);
            }
          } else {
            setAudioUnlockNeeded(false);
          }

          if (ytTime > 0.05 || attempt >= retryDelays.length) {
            return;
          }

          ytVerifyTimerRef.current = window.setTimeout(() => inspectPlayback(attempt + 1), 900);

          return;
        }

        // If browser blocked unmuted cold autoplay, start muted visual spin cleanly and show one-tap unlock
        if ((ytState === -1 || ytState === 5 || ytState === 2) && !hasActivation && !ytMuted && attempt >= 1) {
          try {
            yt.mute();
            yt.playVideo();
          } catch {
            // Ignored
          }

          if (!isMutedRef.current) {
            setAudioUnlockNeeded(true);
          }

          if (attempt < retryDelays.length) {
            ytVerifyTimerRef.current = window.setTimeout(
              () => inspectPlayback(attempt + 1),
              retryDelays[attempt]
            );
          }

          return;
        }

        // Unstarted (-1), buffering (3), cued (5), or paused (2) -> nudge play and grant full cold-start window before failing
        if ((ytState === -1 || ytState === 3 || ytState === 5 || ytState === 2) && attempt < retryDelays.length) {
          if (ytState !== 3) {
            try {
              if (!isMutedRef.current && hasActivation && ytMuted) {
                yt.unMute();
                yt.setVolume(Math.round(volumeRef.current * 100));
              }

              yt.playVideo();
            } catch {
              // Ignore transient player lock
            }
          }

          ytVerifyTimerRef.current = window.setTimeout(
            () => inspectPlayback(attempt + 1),
            retryDelays[attempt]
          );

          return;
        }

        // Try alternate YouTube embed host once (e.g. nocookie <-> standard) before falling back to 23s preview
        if (expectedYtId) {
          const altHost = ytHostRef.current === YT_PRIMARY_HOST ? YT_FALLBACK_HOST : YT_PRIMARY_HOST;
          const altKey = `${activeTrack.id}:${altHost}`;

          if (!ytHostTriedRef.current.has(altKey) && switchYtHostRef.current(activeTrack, altHost, currentTimeRef.current)) {
            return;
          }

          failedYtIdsRef.current.add(expectedYtId);
        }

        if (activeTrack.previewUrl || activeTrack.localAudioUrl) {
          switchToPreviewFallback(activeTrack, true, hasActivation);
        } else if (!hasActivation) {
          yt.mute();
          yt.playVideo();
          setAudioUnlockNeeded(true);
        } else {
          setAudioUnlockNeeded(true);
        }
      } catch {
        if (activeTrack.previewUrl || activeTrack.localAudioUrl) {
          switchToPreviewFallback(activeTrack, true, false);
        } else {
          setAudioUnlockNeeded(true);
        }
      }
    };

    ytVerifyTimerRef.current = window.setTimeout(() => inspectPlayback(0), retryDelays[0]);
  }, [switchToPreviewFallback]);

  scheduleYtCheckRef.current = scheduleYouTubePlaybackCheck;

  // Load a specific track across our dual audio engine
  const loadAndPlayTrack = useCallback((track: PlaylistTrack, shouldPlay: boolean) => {
    if (ytVerifyTimerRef.current) {
      window.clearTimeout(ytVerifyTimerRef.current);
      ytVerifyTimerRef.current = 0;
    }

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

    // Prefer crisp offline local full MP3 if present, otherwise full YouTube track with instant MP3 fallback
    if (track.localAudioUrl) {
      activeEngineRef.current = 'local';

      if (htmlAudioRef.current) {
        htmlAudioRef.current.muted = isMutedRef.current;
        htmlAudioRef.current.src = track.localAudioUrl;
        htmlAudioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;

        if (shouldPlay) {
          htmlAudioRef.current
            .play()
            .then(() => {
              setAudioUnlockNeeded(false);
            })
            .catch(() => {
              if (!isMutedRef.current) {
                setAudioUnlockNeeded(true);
              }
            });
        }
      }

      return;
    }

    if (canUseYouTube(track) && track.youtubeId) {
      activeEngineRef.current = 'youtube';

      const yt = ytPlayerRef.current!;

      if (shouldPlay) {
        if (isMutedRef.current) {
          yt.mute();
          yt.setVolume(0);
        } else {
          yt.unMute();
          yt.setVolume(Math.round(volumeRef.current * 100));
        }

        yt.loadVideoById(track.youtubeId, 0);
        yt.playVideo();
        scheduleYouTubePlaybackCheck();
      } else {
        yt.cueVideoById(track.youtubeId, 0);
      }

      return;
    }

    // Keep waiting on YouTube while its API initializes so rapid track picks still get full songs
    if (track.youtubeId && !failedYtIdsRef.current.has(track.youtubeId) && !ytUnavailableRef.current) {
      activeEngineRef.current = 'youtube';

      if (shouldPlay) {
        scheduleYouTubePlaybackCheck();
      }

      return;
    }

    // Fallback: Spotify audio preview URL (whenever YouTube is blocked, unavailable, or failed on both hosts)
    switchToPreviewFallback(track, shouldPlay, false);
  }, [canUseYouTube, scheduleYouTubePlaybackCheck, switchToPreviewFallback]);

  // Play currently loaded active track (with dramatic crescendo fade-in)
  const triggerDramaticAutoplay = useCallback(() => {
    if (hasAutoPlayedRef.current || isPlayingRef.current) return;

    const activeTrack = currentTrackRef.current;

    if (!activeTrack) return;

    hasAutoPlayedRef.current = true;
    isPlayingRef.current = true;
    setIsDramaticArrival(true);

    if (arrivalTimerRef.current) {
      window.clearTimeout(arrivalTimerRef.current);
    }

    arrivalTimerRef.current = window.setTimeout(() => {
      setIsDramaticArrival(false);
    }, 1850);

    setIsPlaying(true);

    if (hasUserGestureRef.current || navigator.userActivation?.hasBeenActive) {
      playTactileAudio('needle');
    }

    if (activeTrack.localAudioUrl) {
      switchToPreviewFallback(activeTrack, true, true);

      return;
    }

    if (activeTrack.youtubeId && !failedYtIdsRef.current.has(activeTrack.youtubeId) && !ytUnavailableRef.current) {
      activeEngineRef.current = 'youtube';

      if (ytPlayerRef.current && ytReadyRef.current) {
        try {
          if (isMutedRef.current) {
            ytPlayerRef.current.mute();
            ytPlayerRef.current.setVolume(0);
          } else {
            // Try unmuted immediately so permitted autoplay / prior engagement plays loudly with no slider adjustment
            ytPlayerRef.current.unMute();
            ytPlayerRef.current.setVolume(Math.round(volumeRef.current * 100));
            startDramaticVolumeSwell();
          }

          ytPlayerRef.current.playVideo();
        } catch {
          // Verified immediately by playback check below
        }
      }

      scheduleYouTubePlaybackCheck();

      return;
    }

    if (activeTrack.previewUrl) {
      cancelVolumeRamp();
      switchToPreviewFallback(activeTrack, true, true);
    }
  }, [cancelVolumeRamp, scheduleYouTubePlaybackCheck, startDramaticVolumeSwell, switchToPreviewFallback]);

  // Trigger dramatic autoplay right as the turntable opens into view
  useMotionValueEvent(morphProgress, 'change', (latest) => {
    if (!prefersReducedMotion && latest >= 0.44) {
      triggerDramaticAutoplay();
    }
  });

  // Gradually duck & seamlessly stop the background piano when "Songs that we've listened all throughout the years" arrives
  useMotionValueEvent(introHandoffProgress, 'change', (latest) => {
    if (latest > 0 && latest < 0.42) {
      const duck = 0.5 * (1 + Math.cos(Math.PI * Math.min(1, latest / 0.65)));
      comfyPiano.setScrollDuckFactor(duck);
    }

    if (latest >= 0.42) {
      comfyPiano.fadeOutAndStop(2.2);
    }
  });

  // Track real Chromium user activations (ignoring touch-scroll pointerdown), handle navbar jump, and catch restored scroll
  useEffect(() => {
    if (navigator.userActivation?.hasBeenActive) {
      hasUserGestureRef.current = true;
    }

    const markGesture = () => {
      primeAudioOnGesture();
    };

    const handleNavPlay = () => {
      primeAudioOnGesture();
      comfyPiano.fadeOutAndStop(1.35);

      if (audioUnlockNeededRef.current && !isMutedRef.current) {
        unmuteOrStartRef.current();

        return;
      }

      triggerDramaticAutoplay();
    };

    ACTIVATION_EVENTS.forEach((evt) => {
      window.addEventListener(evt, markGesture, { capture: true, passive: true });
    });

    window.addEventListener('anniv:play-soundtrack', handleNavPlay);

    if (introHandoffProgress.get() >= 0.42) {
      comfyPiano.fadeOutAndStop(0.6);
    }

    if (!prefersReducedMotion && morphProgress.get() >= 0.44) {
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
      ACTIVATION_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, markGesture, { capture: true });
      });
      window.removeEventListener('anniv:play-soundtrack', handleNavPlay);

      if (observer) {
        observer.disconnect();
      }
    };
  }, [introHandoffProgress, morphProgress, prefersReducedMotion, primeAudioOnGesture, triggerDramaticAutoplay]);

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
    primeAudioOnGesture();
    cancelVolumeRamp();
    setAudioUnlockNeeded(false);
    isPlayingRef.current = true;
    setActiveTrackIdx(nextIdx);
    setIsPlaying(true);
    playTactileAudio('needle');
    loadAndPlayTrack(nextTrack, true);
  }, [cancelVolumeRamp, loadAndPlayTrack, primeAudioOnGesture]);

  // Ref for stable ended callback
  const handleStepTrackRef = useRef(handleStepTrack);
  handleStepTrackRef.current = handleStepTrack;

  // Initialize YouTube IFrame API player + HTML5 Audio element once
  useEffect(() => {
    let isDisposed = false;
    let ytBootTimer = 0;

    const audioEl = new Audio();
    audioEl.preload = 'metadata';
    audioEl.volume = volumeRef.current;

    const handleAudioEnded = () => {
      if (activeEngineRef.current !== 'youtube') {
        handleStepTrackRef.current(1);
      }
    };

    const handleAudioError = () => {
      const track = currentTrackRef.current;

      if (activeEngineRef.current === 'local' && track.previewUrl && audioEl.src !== track.previewUrl) {
        activeEngineRef.current = 'preview';
        audioEl.src = track.previewUrl;

        if (isPlayingRef.current) {
          audioEl.play().catch(() => {
            setAudioUnlockNeeded(true);
          });
        }
      }
    };

    audioEl.addEventListener('ended', handleAudioEnded);
    audioEl.addEventListener('error', handleAudioError);

    htmlAudioRef.current = audioEl;

    const markYtUnavailable = () => {
      ytUnavailableRef.current = true;

      if (ytBootTimer) {
        window.clearTimeout(ytBootTimer);
        ytBootTimer = 0;
      }

      if (!isDisposed && isPlayingRef.current && activeEngineRef.current === 'youtube') {
        cancelVolumeRamp();
        switchToPreviewFallbackRef.current(currentTrackRef.current, true, hasUserGestureRef.current);
      }
    };

    const spawnYtPlayer = (hostUrl: string, initialVideoId: string, initialResumeSec: number) => {
      const container = ytContainerRef.current;

      if (isDisposed || !container || !window.YT?.Player) return false;

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignored
        }

        ytPlayerRef.current = null;
        ytReadyRef.current = false;
      }

      container.replaceChildren();
      const mountEl = document.createElement('div');
      container.appendChild(mountEl);

      ytHostRef.current = hostUrl;

      const trackForAttempt = currentTrackRef.current;

      if (trackForAttempt) {
        ytHostTriedRef.current.add(`${trackForAttempt.id}:${hostUrl}`);
      }

      ytPlayerRef.current = new window.YT.Player(mountEl, {
        height: '200',
        width: '200',
        host: hostUrl,
        videoId: initialVideoId || 'BLYMjHAa0sE',
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
            if (isDisposed) return;

            if (ytBootTimer) {
              window.clearTimeout(ytBootTimer);
              ytBootTimer = 0;
            }

            ytReadyRef.current = true;
            ytUnavailableRef.current = false;
            ev.target.setVolume(isMutedRef.current ? 0 : Math.round(volumeRef.current * 100));

            const activeTrack = currentTrackRef.current;

            if (
              isPlayingRef.current &&
              !activeTrack.localAudioUrl &&
              activeTrack.youtubeId &&
              !failedYtIdsRef.current.has(activeTrack.youtubeId) &&
              (activeEngineRef.current === 'youtube' || activeEngineRef.current === 'preview')
            ) {
              // Seamlessly upgrade temporary slow-boot preview back into full-song YouTube stream
              if (activeEngineRef.current === 'preview' && htmlAudioRef.current) {
                htmlAudioRef.current.pause();
              }

              activeEngineRef.current = 'youtube';

              if (isMutedRef.current) {
                ev.target.mute();
                ev.target.setVolume(0);
              } else {
                ev.target.unMute();
                ev.target.setVolume(Math.round(volumeRef.current * 100));
                startDramaticVolumeSwell();
              }

              const startAt = currentTimeRef.current > 0.25 ? currentTimeRef.current : initialResumeSec;

              if (activeTrack.youtubeId !== initialVideoId || startAt > 0.25) {
                ev.target.loadVideoById(activeTrack.youtubeId, startAt);
              }

              ev.target.playVideo();
              scheduleYtCheckRef.current();
            }
          },
          onStateChange: (ev) => {
            if (ev.data === 1) {
              if (!isMutedRef.current) {
                if ((ev.target.getVolume?.() ?? 100) < 5 && volumeRampRafRef.current === 0) {
                  ev.target.setVolume(Math.round(volumeRef.current * 100));
                }

                if (!ev.target.isMuted?.()) {
                  setAudioUnlockNeeded(false);
                }
              } else {
                setAudioUnlockNeeded(false);
              }
            }

            // 0 = ENDED
            if (ev.data === 0 && activeEngineRef.current === 'youtube') {
              handleStepTrackRef.current(1);
            }
          },
          onError: () => {
            const fallbackTrack = currentTrackRef.current;

            if (activeEngineRef.current === 'youtube' && fallbackTrack.youtubeId) {
              const altHost = ytHostRef.current === YT_PRIMARY_HOST ? YT_FALLBACK_HOST : YT_PRIMARY_HOST;
              const altKey = `${fallbackTrack.id}:${altHost}`;

              if (!ytHostTriedRef.current.has(altKey) && switchYtHostRef.current(fallbackTrack, altHost, currentTimeRef.current)) {
                return;
              }

              failedYtIdsRef.current.add(fallbackTrack.youtubeId);
              cancelVolumeRamp();
              switchToPreviewFallbackRef.current(fallbackTrack, isPlayingRef.current, false);
            }
          },
        },
      });

      return true;
    };

    switchYtHostRef.current = (track: PlaylistTrack, nextHost: string, resumeSec: number) => {
      if (isDisposed || !track.youtubeId) return false;

      const spawned = spawnYtPlayer(nextHost, track.youtubeId, resumeSec);

      if (spawned && isPlayingRef.current) {
        scheduleYtCheckRef.current();
      }

      return spawned;
    };

    const initYtPlayer = () => {
      if (ytPlayerRef.current) return;

      spawnYtPlayer(YT_PRIMARY_HOST, currentTrackRef.current.youtubeId || 'BLYMjHAa0sE', 0);
    };

    let scriptElForCleanup: HTMLElement | null = null;

    if (window.YT?.Player) {
      initYtPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initYtPlayer;
      ytBootTimer = window.setTimeout(() => {
        if (!ytReadyRef.current) {
          markYtUnavailable();
        }
      }, 5500);

      let ytScriptEl = document.getElementById('yt-iframe-api-script');

      if (!ytScriptEl) {
        const script = document.createElement('script');
        script.id = 'yt-iframe-api-script';
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
        ytScriptEl = script;
      }

      ytScriptEl.addEventListener('error', markYtUnavailable);
      scriptElForCleanup = ytScriptEl;
    }

    // Load initial track + pre-stage fallback MP3 metadata cleanly without autoplay block
    if (currentTrackRef.current.localAudioUrl) {
      activeEngineRef.current = 'local';
      audioEl.src = currentTrackRef.current.localAudioUrl;
    } else if (currentTrackRef.current.youtubeId) {
      activeEngineRef.current = 'youtube';

      if (currentTrackRef.current.previewUrl) {
        audioEl.src = currentTrackRef.current.previewUrl;
      }
    } else if (currentTrackRef.current.previewUrl) {
      activeEngineRef.current = 'preview';
      audioEl.src = currentTrackRef.current.previewUrl;
    }

    return () => {
      isDisposed = true;

      if (ytBootTimer) {
        window.clearTimeout(ytBootTimer);
      }

      if (scriptElForCleanup) {
        scriptElForCleanup.removeEventListener('error', markYtUnavailable);
      }

      audioEl.removeEventListener('ended', handleAudioEnded);
      audioEl.removeEventListener('error', handleAudioError);
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
  }, [cancelVolumeRamp, startDramaticVolumeSwell]);

  // Unified 60/120fps physics loop for vinyl rotation, inertia, and playback progress (pauses when idle)
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

      if (vinylDiscRef.current && (isPlayingRef.current || isDraggingRef.current || Math.abs(angularVelRef.current) > 0.05)) {
        vinylDiscRef.current.style.transform = `rotate(${discAngleRef.current.toFixed(2)}deg)`;
      }

      // Read live audio time from whichever engine is active
      if (!isDraggingRef.current && isPlayingRef.current && now - lastUiSync > 120) {
        lastUiSync = now;

        if (activeEngineRef.current === 'youtube' && ytPlayerRef.current && ytReadyRef.current) {
          try {
            const t = ytPlayerRef.current.getCurrentTime();
            const d = ytPlayerRef.current.getDuration();

            if (Number.isFinite(t) && t >= 0 && Math.abs(t - currentTimeRef.current) >= 0.08) {
              currentTimeRef.current = t;
              setCurrentTime(t);
            }

            if (Number.isFinite(d) && d > 1 && Math.abs(d - trackDurationRef.current) >= 0.5) {
              trackDurationRef.current = d;
              setTrackDuration(d);
            }
          } catch {
            // Player initializing
          }
        } else if (htmlAudioRef.current) {
          const t = htmlAudioRef.current.currentTime;

          if (Number.isFinite(t) && Math.abs(t - currentTimeRef.current) >= 0.08) {
            currentTimeRef.current = t;
            setCurrentTime(t);
          }

          const d = htmlAudioRef.current.duration;

          if (Number.isFinite(d) && d > 1 && Math.abs(d - trackDurationRef.current) >= 0.5) {
            trackDurationRef.current = d;
            setTrackDuration(d);
          }
        }
      }

      if (isPlayingRef.current || isDraggingRef.current || Math.abs(angularVelRef.current) > 0.05) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const ensureRunning = () => {
      if (rafId === 0) {
        lastNow = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };

    ensureVinylLoopRef.current = ensureRunning;

    if (isPlayingRef.current || isDraggingRef.current || Math.abs(angularVelRef.current) > 0.05) {
      ensureRunning();
    }

    return () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying || isDraggingDisc) {
      ensureVinylLoopRef.current();
    }
  }, [isPlaying, isDraggingDisc]);

  // Unmute already-playing stream or start active track cleanly inside a user gesture
  const unmuteOrStartCurrentTrack = useCallback(() => {
    hasUserGestureRef.current = true;
    justUnlockedAtRef.current = performance.now();
    cancelVolumeRamp();
    setAudioUnlockNeeded(false);
    isPlayingRef.current = true;
    setIsPlaying(true);
    playTactileAudio('needle');

    if (activeEngineRef.current === 'youtube' && canUseYouTube(currentTrackRef.current)) {
      primeAudioOnGesture();

      try {
        const yt = ytPlayerRef.current!;
        const ytState = yt.getPlayerState();
        const targetVol = isMutedRef.current ? 0 : Math.round(volumeRef.current * 100);

        if (isMutedRef.current) {
          yt.mute();
        } else {
          yt.unMute();
        }

        yt.setVolume(targetVol);

        if (ytState !== 1 && ytState !== 3) {
          yt.playVideo();
        }

        scheduleYouTubePlaybackCheck();

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
        htmlPrimedRef.current = true;
        htmlAudioRef.current
          .play()
          .then(() => {
            setAudioUnlockNeeded(false);
          })
          .catch(() => {
            loadAndPlayTrack(currentTrackRef.current, true);
          });

        return;
      }
    }

    loadAndPlayTrack(currentTrackRef.current, true);
  }, [cancelVolumeRamp, canUseYouTube, loadAndPlayTrack, primeAudioOnGesture, scheduleYouTubePlaybackCheck]);

  unmuteOrStartRef.current = unmuteOrStartCurrentTrack;

  // Play / Pause toggle (when autoplay arrived muted/locked, clicking Play/Pause or Disc unlocks sound instead of silencing)
  const handleTogglePlay = useCallback(() => {
    if (performance.now() - justUnlockedAtRef.current < 450) {
      return;
    }

    if (isPlayingRef.current && audioUnlockNeededRef.current && !isMutedRef.current) {
      unmuteOrStartCurrentTrack();

      return;
    }

    hasUserGestureRef.current = true;
    cancelVolumeRamp();
    setAudioUnlockNeeded(false);

    if (ytVerifyTimerRef.current) {
      window.clearTimeout(ytVerifyTimerRef.current);
      ytVerifyTimerRef.current = 0;
    }

    const nextPlay = !isPlayingRef.current;
    isPlayingRef.current = nextPlay;
    setIsPlaying(nextPlay);
    playTactileAudio('needle');

    if (!nextPlay) {
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      }

      if (ytPlayerRef.current && ytReadyRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // Player already idle
        }
      }

      return;
    }

    if (currentTrackRef.current.localAudioUrl) {
      activeEngineRef.current = 'local';

      if (htmlAudioRef.current) {
        htmlAudioRef.current.muted = isMutedRef.current;
        htmlAudioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;

        if (!htmlAudioRef.current.src.endsWith(currentTrackRef.current.localAudioUrl)) {
          htmlAudioRef.current.src = currentTrackRef.current.localAudioUrl;
          htmlAudioRef.current.currentTime = currentTimeRef.current;
        }

        htmlPrimedRef.current = true;
        htmlAudioRef.current
          .play()
          .then(() => {
            setAudioUnlockNeeded(false);
          })
          .catch(() => {
            if (!isMutedRef.current) {
              setAudioUnlockNeeded(true);
            }
          });
      }

      return;
    }

    if (activeEngineRef.current === 'preview') {
      htmlPrimedRef.current = true;
      switchToPreviewFallback(currentTrackRef.current, true, false);

      return;
    }

    if (canUseYouTube(currentTrackRef.current)) {
      primeAudioOnGesture();
      activeEngineRef.current = 'youtube';

      if (isMutedRef.current) {
        ytPlayerRef.current!.mute();
      } else {
        ytPlayerRef.current!.unMute();
      }

      ytPlayerRef.current!.setVolume(isMutedRef.current ? 0 : Math.round(volumeRef.current * 100));
      ytPlayerRef.current!.playVideo();
      scheduleYouTubePlaybackCheck();

      return;
    }

    if (
      currentTrackRef.current.youtubeId &&
      !failedYtIdsRef.current.has(currentTrackRef.current.youtubeId) &&
      !ytUnavailableRef.current
    ) {
      primeAudioOnGesture();
      activeEngineRef.current = 'youtube';
      scheduleYouTubePlaybackCheck();

      return;
    }

    htmlPrimedRef.current = true;
    switchToPreviewFallback(currentTrackRef.current, true, false);
  }, [
    cancelVolumeRamp,
    canUseYouTube,
    primeAudioOnGesture,
    scheduleYouTubePlaybackCheck,
    switchToPreviewFallback,
    unmuteOrStartCurrentTrack,
  ]);

  // Resume blocked scroll autoplay instantaneously on next valid browser user activation anywhere
  useEffect(() => {
    if (!audioUnlockNeeded) return;

    const wakeUnlockedAudio = (e: Event) => {
      if (
        e.target instanceof Element &&
        e.target.closest('[data-mute-toggle],[data-track-item],[data-side-pill]')
      ) {
        return;
      }

      unmuteOrStartCurrentTrack();
    };

    ACTIVATION_EVENTS.forEach((evt) => {
      window.addEventListener(evt, wakeUnlockedAudio, { capture: true, passive: true });
    });

    return () => {
      ACTIVATION_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, wakeUnlockedAudio, { capture: true });
      });
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

    hasUserGestureRef.current = true;
    cancelVolumeRamp();
    setAudioUnlockNeeded(false);

    const nextSide = SPOTIFY_PLAYLISTS[sideIdx];
    const startIdx = findDefaultTrackIndex(nextSide.tracks, sideIdx);
    const safeIdx = nextSide.tracks[startIdx] ? startIdx : 0;
    const picked = nextSide.tracks[safeIdx];

    if (canUseYouTube(picked)) {
      primeAudioOnGesture();
    } else {
      htmlPrimedRef.current = true;
    }

    isPlayingRef.current = true;
    setActiveSideIdx(sideIdx);
    setActiveTrackIdx(safeIdx);
    setIsPlaying(true);
    playTactileAudio('needle');
    loadAndPlayTrack(picked, true);
  };

  // Pick any specific song from playlist queue
  const handleSelectTrack = (trackIdx: number) => {
    const picked = tracks[trackIdx];

    if (!picked) return;

    hasUserGestureRef.current = true;
    cancelVolumeRamp();
    setAudioUnlockNeeded(false);

    if (canUseYouTube(picked)) {
      primeAudioOnGesture();
    } else {
      htmlPrimedRef.current = true;
    }

    isPlayingRef.current = true;
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
    seekAudioEngine(currentTimeRef.current, true);
  };

  const seekToClientX = (clientX: number, resumeIfStalled: boolean) => {
    if (!seekBarRef.current) return;

    const rect = seekBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekAudioEngine(ratio * trackDuration, resumeIfStalled);
  };

  const handlePointerDownSeekBar = (e: PointerEvent<HTMLDivElement>) => {
    hasUserGestureRef.current = true;
    isScrubbingSeekRef.current = true;
    seekToClientX(e.clientX, false);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const handlePointerMoveSeekBar = (e: PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingSeekRef.current) return;

    seekToClientX(e.clientX, false);
  };

  const handlePointerUpSeekBar = (e: PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingSeekRef.current) return;

    isScrubbingSeekRef.current = false;
    lastSeekPointerUpAtRef.current = performance.now();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    seekToClientX(e.clientX, true);
  };

  // Seek bar click fallback (e.g. keyboard or synthetic click)
  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (performance.now() - lastSeekPointerUpAtRef.current < 120) {
      return;
    }

    hasUserGestureRef.current = true;
    seekToClientX(e.clientX, true);
  };

  // Volume change (also unmutes and nudges playback if an active track had arrived silent/stalled)
  const handleVolumeChange = (nextVol: number) => {
    hasUserGestureRef.current = true;
    cancelVolumeRamp();
    setVolume(nextVol);
    volumeRef.current = nextVol;
    const nextMuted = nextVol === 0;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    if (!nextMuted) {
      setAudioUnlockNeeded(false);
    }

    if (htmlAudioRef.current) {
      htmlAudioRef.current.muted = nextMuted;
      htmlAudioRef.current.volume = nextVol;

      if (!nextMuted && isPlayingRef.current && activeEngineRef.current !== 'youtube' && htmlAudioRef.current.paused) {
        void htmlAudioRef.current.play().catch(() => {});
      }
    }

    if (ytPlayerRef.current && ytReadyRef.current) {
      ytPlayerRef.current.setVolume(Math.round(nextVol * 100));

      if (nextMuted) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();

        if (isPlayingRef.current && activeEngineRef.current === 'youtube') {
          try {
            const st = ytPlayerRef.current.getPlayerState?.();

            if (st !== 1 && st !== 3) {
              ytPlayerRef.current.playVideo();
            }
          } catch {
            // Ignored
          }
        }
      }
    }
  };

  const handleToggleMute = () => {
    hasUserGestureRef.current = true;
    cancelVolumeRamp();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    if (!nextMuted) {
      setAudioUnlockNeeded(false);
    }

    if (htmlAudioRef.current) {
      htmlAudioRef.current.muted = nextMuted;
      htmlAudioRef.current.volume = nextMuted ? 0 : volume;

      if (!nextMuted && isPlayingRef.current && activeEngineRef.current !== 'youtube' && htmlAudioRef.current.paused) {
        void htmlAudioRef.current.play().catch(() => {});
      }
    }

    if (ytPlayerRef.current && ytReadyRef.current) {
      if (nextMuted) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(Math.round(volume * 100));

        if (isPlayingRef.current && activeEngineRef.current === 'youtube') {
          try {
            const st = ytPlayerRef.current.getPlayerState?.();

            if (st !== 1 && st !== 3) {
              ytPlayerRef.current.playVideo();
            }
          } catch {
            // Ignored
          }
        }
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
          : 'relative min-h-[192vh] lg:min-h-[186vh] z-10 select-none overflow-x-clip'
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

      {/* Hidden YouTube IFrame container kept minimally sized and nearly transparent so browsers allow background playback */}
      <div
        className="fixed bottom-0 right-0 w-[200px] h-[200px] opacity-[0.002] pointer-events-none overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div ref={ytContainerRef} />
      </div>

      <div
        ref={stickyContainerRef}
        className={
          prefersReducedMotion
            ? 'w-full px-4 sm:px-6 max-w-6xl mx-auto py-16'
            : 'sticky top-0 min-h-screen w-full flex flex-col justify-start lg:justify-center pt-[88px] pb-4 lg:pt-[88px] lg:pb-4 px-4 sm:px-6 max-w-6xl mx-auto'
        }
      >
        {/* Subtle transient vinyl-groove resonance halo during arrival morph (dissolves before turntable lands) */}
        {!prefersReducedMotion && (
          <div
            className="absolute inset-x-0 top-0 h-screen flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <motion.div
              style={{
                opacity: haloOpacity,
                scale: haloScale,
                rotate: haloRotate,
                willChange: 'transform, opacity',
              }}
              className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-[#BBD2EF]/35"
            >
              <div className="absolute inset-5 rounded-full border border-[#D7E6F8]/20" />
              <div className="absolute inset-11 rounded-full border border-[#BBD2EF]/15" />
            </motion.div>
          </div>
        )}

        {/* Section Title & Playlist Side Switcher (continuous radial-to-turntable morph) */}
        <div ref={titleBlockRef} className="w-full text-center mb-3 sm:mb-7 lg:mb-5">
          {prefersReducedMotion ? (
            <h2
              className="font-display italic tracking-tight heading-luminous select-text w-full max-w-4xl mx-auto px-2 sm:px-0 leading-[1.15] text-balance text-center"
              style={{ fontSize: 'clamp(1.75rem, 4.2vw, 3.1rem)' }}
            >
              Songs that we've listened all throughout the years
            </h2>
          ) : (
            <motion.h2
              ref={headingRef}
              className="font-display italic tracking-tight heading-luminous select-text w-full max-w-4xl mx-auto px-2 sm:px-0 leading-[1.15] text-balance text-center"
              style={{
                fontSize: 'clamp(1.38rem, 4.1vw, 3.05rem)',
                opacity: titleOpacity,
                y: titleY,
                scale: titleScale,
                willChange: 'transform, opacity',
              }}
            >
              Songs that we&apos;ve listened all throughout the years
            </motion.h2>
          )}

          <motion.div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-3.5"
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
                  data-side-pill="true"
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
              <motion.div
                className="w-[92%] h-[92%] flex items-center justify-center"
                style={prefersReducedMotion ? undefined : { rotate: discIntroRotate }}
              >
                <div
                  ref={vinylDiscRef}
                  onPointerDown={handlePointerDownVinyl}
                  onPointerMove={handlePointerMoveVinyl}
                  onPointerUp={handlePointerUpVinyl}
                  onPointerCancel={handlePointerUpVinyl}
                  className={`relative w-full h-full rounded-full select-none touch-none flex items-center justify-center transition-shadow duration-300 ${
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
                        decoding="async"
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
              </motion.div>
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
                    width={80}
                    height={80}
                    decoding="async"
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
                role="slider"
                aria-label="Seek track progress"
                aria-valuemin={0}
                aria-valuemax={Math.round(trackDuration || 100)}
                aria-valuenow={Math.round(currentTime)}
                onPointerDown={handlePointerDownSeekBar}
                onPointerMove={handlePointerMoveSeekBar}
                onPointerUp={handlePointerUpSeekBar}
                onPointerCancel={handlePointerUpSeekBar}
                onClick={handleSeekBarClick}
                className="relative w-full h-2.5 bg-white/10 rounded-full overflow-hidden cursor-pointer touch-none group"
                title="Click or drag anywhere to seek"
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
                    data-mute-toggle="true"
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
                      data-track-item="true"
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
                          width={36}
                          height={36}
                          loading="lazy"
                          decoding="async"
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
