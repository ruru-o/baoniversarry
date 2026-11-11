import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { FLORAL_PARTS } from '../../data/floralAssets';
import { sampleWindField } from './floralWind';

export interface DetachedPetalSpawn {
  xFrac: number;
  yFrac: number;
  partIndex: 0 | 1 | 2;
  vxBias: number;
}

interface DriftingPetal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  flutterPhase: number;
  flutterSpeed: number;
  scale: number;
  alpha: number;
  partIndex: 0 | 1 | 2;
  depth: number;
}

interface MagicalMote {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  size: number;
  alpha: number;
  kind: 0 | 1 | 2; // 0: ice blue, 1: cyan mote, 2: golden stamen pollen
  star: boolean;
}

const PETAL_URLS = [
  FLORAL_PARTS.petal_cosmos_glow.url,
  FLORAL_PARTS.petal_frost_veined.url,
  FLORAL_PARTS.petal_painted_ice.url,
] as const;

function createGlowSprite(r: number, g: number, b: number): HTMLCanvasElement {
  const size = 48;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');

  if (!ctx) return c;

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, `rgba(255, 255, 255, 0.98)`);
  grad.addColorStop(0.18, `rgba(${r}, ${g}, ${b}, 0.85)`);
  grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.24)`);
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return c;
}

function drawVectorFallbackPetal(ctx: CanvasRenderingContext2D, size: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(187, 214, 250, 0.82)';
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.bezierCurveTo(size * 0.42, -size * 0.2, size * 0.36, size * 0.38, 0, size * 0.5);
  ctx.bezierCurveTo(-size * 0.36, size * 0.38, -size * 0.42, -size * 0.2, 0, -size * 0.5);
  ctx.fill();
  ctx.restore();
}

interface FloralParticlesCanvasProps {
  parallaxRef: MutableRefObject<{ x: number; y: number }>;
  detachQueueRef: MutableRefObject<DetachedPetalSpawn[]>;
  interactive: boolean;
  reducedMotion: boolean;
}

export function FloralParticlesCanvas({
  parallaxRef,
  detachQueueRef,
  interactive,
  reducedMotion,
}: FloralParticlesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const sprites: HTMLCanvasElement[] = [
      createGlowSprite(200, 224, 255), // pale ice white-blue
      createGlowSprite(118, 200, 255), // cerulean cyan glow
      createGlowSprite(248, 212, 134), // subtle warm flower stamen gold
    ];

    const petalImgs: HTMLImageElement[] = PETAL_URLS.map((url) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;

      return img;
    });

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let timeSec = 0;
    let lastTime = performance.now();

    const petals: DriftingPetal[] = [];
    const motes: MagicalMote[] = [];

    const partChoices: (0 | 1 | 2)[] = [0, 1, 2];

    const spawnPetal = (w: number, h: number, preset?: DetachedPetalSpawn): DriftingPetal => {
      const depth = 0.45 + Math.random() * 0.85;
      const fromDetach = Boolean(preset);

      return {
        x: preset ? preset.xFrac * w : (Math.random() * 1.18 - 0.14) * w,
        y: preset ? preset.yFrac * h : Math.random() * h,
        vx: (preset ? preset.vxBias : 14 + Math.random() * 20) * depth,
        vy: (fromDetach ? -6 + Math.random() * 18 : 10 + Math.random() * 16) * depth,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 1.2,
        flutterPhase: Math.random() * Math.PI * 2,
        flutterSpeed: 1.4 + Math.random() * 1.6,
        scale: (fromDetach ? 0.36 + Math.random() * 0.14 : 0.2 + Math.random() * 0.24) * depth,
        alpha: fromDetach ? 0.88 : (0.34 + depth * 0.38),
        partIndex: preset ? preset.partIndex : partChoices[Math.floor(Math.random() * 3)],
        depth,
      };
    };

    const initScene = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      petals.length = 0;
      const petalCount = width < 768 ? 10 : 16;

      for (let i = 0; i < petalCount; i++) {
        petals.push(spawnPetal(width, height));
      }

      motes.length = 0;
      const moteCount = width < 768 ? 30 : 48;

      for (let i = 0; i < moteCount; i++) {
        const bx = Math.random() * width;
        const by = Math.random() * height;
        const roll = Math.random();
        const kind: 0 | 1 | 2 = roll < 0.52 ? 0 : roll < 0.82 ? 1 : 2;

        motes.push({
          x: bx,
          y: by,
          baseX: bx,
          baseY: by,
          vx: 0,
          vy: -(3 + Math.random() * 7),
          phase: Math.random() * Math.PI * 2,
          speed: 0.25 + Math.random() * 0.45,
          size: kind === 2 ? 1.8 + Math.random() * 2.2 : 1.4 + Math.random() * 2.6,
          alpha: 0.35 + Math.random() * 0.55,
          kind,
          star: i % 5 === 0,
        });
      }
    };

    const drawStaticOrFrame = (dt: number, t: number, animateStep: boolean) => {
      ctx.clearRect(0, 0, width, height);

      const mx = parallaxRef.current.x;
      const my = parallaxRef.current.y;
      const mousePixelX = mx * width;
      const mousePixelY = my * height;
      const pxShift = (mx - 0.5) * 26;
      const pyShift = (my - 0.5) * 18;

      if (animateStep && detachQueueRef.current.length > 0) {
        while (detachQueueRef.current.length > 0) {
          const item = detachQueueRef.current.shift();

          if (item && petals.length < 24) {
            petals.push(spawnPetal(width, height, item));
          }
        }
      }

      // 1. Floating real-texture petals along live wind vectors
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        if (animateStep) {
          const wVal = sampleWindField(p.x / Math.max(width, 1), p.y / Math.max(height, 1), t, i * 0.37);
          const windAccX = (18 + wVal * 46) * p.depth;
          const liftY = Math.sin(t * p.flutterSpeed + p.flutterPhase) * 14 - wVal * 8;

          p.vx += (windAccX - p.vx) * Math.min(1, dt * 1.4);
          p.vy += (14 + liftY - p.vy) * Math.min(1, dt * 1.2);
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += (p.rotSpeed + wVal * 0.85) * dt;
          p.flutterPhase += p.flutterSpeed * dt;

          // Wrap softly beyond screen edges, discarding excess burst petals cleanly
          if (p.x > width + 90 || p.x < -90 || p.y > height + 90 || p.y < -120) {
            if (petals.length > (width < 768 ? 10 : 16)) {
              petals.splice(i, 1);
              i -= 1;

              continue;
            }

            const enteringTop = Math.random() < 0.65;
            p.x = enteringTop ? Math.random() * width * 0.85 : -50;
            p.y = enteringTop ? -50 : Math.random() * height * 0.72;
            p.vx = 18 * p.depth;
            p.vy = 14 * p.depth;
          }
        }

        const tumbleY = 0.42 + 0.58 * Math.abs(Math.cos(p.flutterPhase));
        const img = petalImgs[p.partIndex];
        const drawX = p.x + pxShift * p.depth;
        const drawY = p.y + pyShift * p.depth;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(p.rot);
        ctx.scale(p.scale, p.scale * tumbleY);
        ctx.globalAlpha = p.alpha;

        if (img && img.complete && img.naturalWidth > 0) {
          const iw = img.naturalWidth;
          const ih = img.naturalHeight;
          ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
        } else {
          drawVectorFallbackPetal(ctx, 48, 1);
        }

        ctx.restore();
      }

      // 2. Magical luminous pollen motes & starlight dust fragments (pre-baked additive sprites)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (const m of motes) {
        if (animateStep) {
          const wVal = sampleWindField(m.x / Math.max(width, 1), m.y / Math.max(height, 1), t, m.phase);
          m.baseY += m.vy * dt;
          m.baseX += (wVal * 12 + Math.sin(t * m.speed + m.phase) * 8) * dt;

          if (m.baseY < -20) {
            m.baseY = height + 20;
            m.baseX = Math.random() * width;
            m.x = m.baseX;
            m.y = m.baseY;
          }

          if (m.baseX < -30) m.baseX = width + 30;

          if (m.baseX > width + 30) m.baseX = -30;

          if (interactive) {
            const dx = m.x - mousePixelX;
            const dy = m.y - mousePixelY;
            const dist = Math.hypot(dx, dy);

            if (dist < 105 && dist > 1) {
              const push = ((105 - dist) / 105) * 45 * dt;
              m.vx += (dx / dist) * push;
              m.vy += (dy / dist) * push;
            }
          }

          m.vx *= 0.92;
          m.x += m.vx + (m.baseX - m.x) * Math.min(1, dt * 1.8);
          m.y += (m.baseY - m.y) * Math.min(1, dt * 2.2);
        }

        const flicker = 0.42 + 0.58 * Math.sin(t * m.speed * 2.4 + m.phase * 2.3);
        const alpha = m.alpha * flicker;
        const glowSize = m.size * 7.5;
        const sprite = sprites[m.kind];

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, m.x - glowSize / 2, m.y - glowSize / 2, glowSize, glowSize);

        // Delicate four-point Genshin-style starlight fragment on select motes
        if (m.star && alpha > 0.36) {
          ctx.fillStyle = m.kind === 2 ? 'rgba(255, 232, 178, 0.85)' : 'rgba(232, 244, 255, 0.92)';
          const r = m.size * 2.2;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y - r);
          ctx.quadraticCurveTo(m.x, m.y, m.x + r, m.y);
          ctx.quadraticCurveTo(m.x, m.y, m.x, m.y + r);
          ctx.quadraticCurveTo(m.x, m.y, m.x - r, m.y);
          ctx.quadraticCurveTo(m.x, m.y, m.x, m.y - r);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    initScene();
    drawStaticOrFrame(0, 0, false);

    if (reducedMotion) {
      window.addEventListener('resize', initScene);

      return () => {
        window.removeEventListener('resize', initScene);
      };
    }

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!document.hidden) {
        timeSec += dt;
        drawStaticOrFrame(dt, timeSec, true);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    window.addEventListener('resize', initScene);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', initScene);
    };
  }, [detachQueueRef, interactive, parallaxRef, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-[35]"
    />
  );
}
