import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { sampleLightBreath } from './floralWind';

interface BokehCircle {
  xFrac: number;
  yFrac: number;
  rFrac: number;
  rgba: string;
  phase: number;
  depth: number;
}

const DISTANT_BOKEH: BokehCircle[] = [
  { xFrac: 0.14, yFrac: 0.62, rFrac: 0.085, rgba: '115, 168, 240', phase: 0.4, depth: 0.5 },
  { xFrac: 0.24, yFrac: 0.74, rFrac: 0.12, rgba: '235, 198, 118', phase: 1.9, depth: 0.35 },
  { xFrac: 0.08, yFrac: 0.42, rFrac: 0.055, rgba: '165, 206, 255', phase: 2.8, depth: 0.65 },
  { xFrac: 0.84, yFrac: 0.58, rFrac: 0.095, rgba: '108, 175, 248', phase: 3.7, depth: 0.45 },
  { xFrac: 0.76, yFrac: 0.78, rFrac: 0.11, rgba: '240, 200, 120', phase: 5.1, depth: 0.3 },
  { xFrac: 0.91, yFrac: 0.32, rFrac: 0.06, rgba: '175, 205, 255', phase: 4.2, depth: 0.6 },
  { xFrac: 0.52, yFrac: 0.84, rFrac: 0.14, rgba: '72, 138, 224', phase: 0.9, depth: 0.25 },
  { xFrac: 0.36, yFrac: 0.22, rFrac: 0.075, rgba: '132, 184, 245', phase: 2.3, depth: 0.2 },
  { xFrac: 0.66, yFrac: 0.26, rFrac: 0.08, rgba: '150, 186, 246', phase: 4.8, depth: 0.2 },
];

function drawSilhouetteBlossom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  petals: number,
  rot: number,
  fillStyle: string,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.fillStyle = fillStyle;

  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      radius * 0.28,
      -radius * 0.42,
      radius * 0.24,
      -radius * 0.92,
      0,
      -radius,
    );
    ctx.bezierCurveTo(
      -radius * 0.24,
      -radius * 0.92,
      -radius * 0.28,
      -radius * 0.42,
      0,
      0,
    );
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawFernFrond(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  height: number,
  lean: number,
  fillStyle: string,
): void {
  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = fillStyle;
  ctx.lineWidth = Math.max(1.2, height * 0.012);

  const tipX = baseX + lean;
  const tipY = baseY - height;
  const ctrlX = baseX + lean * 0.35;
  const ctrlY = baseY - height * 0.55;

  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
  ctx.stroke();

  const pairs = 9;

  for (let i = 2; i < pairs; i++) {
    const t = i / pairs;
    const u = 1 - t;
    const px = u * u * baseX + 2 * u * t * ctrlX + t * t * tipX;
    const py = u * u * baseY + 2 * u * t * ctrlY + t * t * tipY;
    const leafLen = height * (1 - t * 0.68) * 0.22;

    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(side * 0.72 + lean * 0.002);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(leafLen * 0.5 * side, -leafLen * 0.35, leafLen * side, -leafLen * 0.15);
      ctx.quadraticCurveTo(leafLen * 0.45 * side, leafLen * 0.22, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

function bakeGardenPlane(width: number, height: number, blurPx: number, far: boolean): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  const ctx = off.getContext('2d');

  if (!ctx) return off;

  if (blurPx > 0) {
    ctx.filter = `blur(${blurPx}px)`;
  }

  const baseColor = far ? 'rgba(13, 35, 78, 0.56)' : 'rgba(9, 25, 58, 0.72)';
  const accentColor = far ? 'rgba(26, 62, 126, 0.44)' : 'rgba(20, 52, 108, 0.58)';
  const mistFloorY = height * (far ? 0.78 : 0.86);

  // Rolling distant botanical hills
  ctx.beginPath();
  ctx.moveTo(-40, height + 20);

  for (let x = -40; x <= width + 40; x += 48) {
    const hWave =
      Math.sin(x * (far ? 0.0045 : 0.0062) + (far ? 0.6 : 2.2)) * height * 0.045 +
      Math.cos(x * 0.011 + 1.4) * height * 0.022;

    ctx.lineTo(x, mistFloorY + hWave);
  }

  ctx.lineTo(width + 40, height + 20);
  ctx.closePath();
  ctx.fillStyle = baseColor;
  ctx.fill();

  // Scattered fantasy silhouettes of flowers, curving stems & ferns across left/right/bottom meadow
  const clusterCount = far ? 16 : 12;

  for (let i = 0; i < clusterCount; i++) {
    const frac = (i + 0.5) / clusterCount;
    // Concentrate richer botanical density on edges + lower meadow while keeping upper-center open
    const edgeBias = Math.abs(frac - 0.5) * 2;
    const x = frac * width + Math.sin(i * 4.3) * 32;
    const stemH = height * (far ? 0.14 + edgeBias * 0.14 : 0.16 + edgeBias * 0.22);
    const lean = ((frac - 0.5) * -1) * stemH * 0.35 + Math.sin(i * 2.7) * 26;
    const baseY = height * (far ? 0.88 : 0.98);
    const tipX = x + lean;
    const tipY = baseY - stemH;

    // Graceful curved stalk
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + lean * 0.25, baseY - stemH * 0.55, tipX, tipY);
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = far ? 2.2 : 3.2;
    ctx.stroke();

    // Distant silhouette blossom head
    drawSilhouetteBlossom(
      ctx,
      tipX,
      tipY,
      height * (far ? 0.026 : 0.036) * (0.85 + (i % 3) * 0.16),
      i % 2 === 0 ? 5 : 6,
      i * 0.7,
      accentColor,
    );

    if (i % 2 === 0) {
      drawFernFrond(
        ctx,
        x + (i % 4 === 0 ? -18 : 18),
        height * (far ? 0.92 : 1.01),
        stemH * 0.82,
        lean * 0.7,
        baseColor,
      );
    }
  }

  // Soft painterly creeping vine silhouettes from top corners
  if (!far) {
    drawFernFrond(ctx, -10, height * 0.34, height * 0.28, width * 0.08, accentColor);
    drawFernFrond(ctx, width + 10, height * 0.3, height * 0.3, -width * 0.09, accentColor);
  }

  return off;
}

interface FloralEnvironmentCanvasProps {
  parallaxRef: MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
}

export function FloralEnvironmentCanvas({
  parallaxRef,
  reducedMotion,
}: FloralEnvironmentCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let farPlane: HTMLCanvasElement | null = null;
    let nearPlane: HTMLCanvasElement | null = null;
    let skyPlane: HTMLCanvasElement | null = null;
    let centerGlowSprite: HTMLCanvasElement | null = null;
    let mistBottomSprite: HTMLCanvasElement | null = null;
    let mistPulseSprite: HTMLCanvasElement | null = null;
    const bokehSprites = new Map<string, HTMLCanvasElement>();
    let rafId = 0;
    let timeSec = 0;
    let lastTime = performance.now();

    const makeBokehSprite = (rgba: string): HTMLCanvasElement => {
      const existing = bokehSprites.get(rgba);

      if (existing) return existing;

      const size = 128;
      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const octx = off.getContext('2d');

      if (octx) {
        const half = size / 2;
        const grad = octx.createRadialGradient(half, half, 0, half, half, half);
        grad.addColorStop(0, `rgba(${rgba}, 0.085)`);
        grad.addColorStop(0.55, `rgba(${rgba}, 0.04)`);
        grad.addColorStop(1, `rgba(${rgba}, 0)`);
        octx.fillStyle = grad;
        octx.fillRect(0, 0, size, size);
      }

      bokehSprites.set(rgba, off);

      return off;
    };

    const rebuild = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Pre-bake static twilight vertical sky backdrop once per resize
      const skyOff = document.createElement('canvas');
      skyOff.width = 1;
      skyOff.height = Math.max(1, Math.round(height));
      const skyCtx = skyOff.getContext('2d');

      if (skyCtx) {
        const skyGrad = skyCtx.createLinearGradient(0, 0, 0, skyOff.height);
        skyGrad.addColorStop(0, '#030814');
        skyGrad.addColorStop(0.42, '#061128');
        skyGrad.addColorStop(0.78, '#091A3C');
        skyGrad.addColorStop(1, '#040917');
        skyCtx.fillStyle = skyGrad;
        skyCtx.fillRect(0, 0, 1, skyOff.height);
      }

      skyPlane = skyOff;

      // Pre-bake cerulean nebula radial glow sprite once
      if (!centerGlowSprite) {
        const glowOff = document.createElement('canvas');
        glowOff.width = 256;
        glowOff.height = 256;
        const glowCtx = glowOff.getContext('2d');

        if (glowCtx) {
          const cg = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
          cg.addColorStop(0, 'rgba(30, 74, 148, 0.24)');
          cg.addColorStop(0.45, 'rgba(18, 46, 98, 0.14)');
          cg.addColorStop(1, 'rgba(4, 9, 23, 0)');
          glowCtx.fillStyle = cg;
          glowCtx.fillRect(0, 0, 256, 256);
        }

        centerGlowSprite = glowOff;
      }

      // Pre-bake base bokeh color textures
      for (const b of DISTANT_BOKEH) {
        makeBokehSprite(b.rgba);
      }

      // Pre-bake mist horizon gradients (pulse + base darkening) cleanly
      if (!mistPulseSprite) {
        const pulseOff = document.createElement('canvas');
        pulseOff.width = 1;
        pulseOff.height = 128;
        const pulseCtx = pulseOff.getContext('2d');

        if (pulseCtx) {
          const mg = pulseCtx.createLinearGradient(0, 0, 0, 128);
          mg.addColorStop(0, 'rgba(26, 68, 134, 0)');
          mg.addColorStop(0.48, 'rgba(26, 68, 134, 1)');
          mg.addColorStop(1, 'rgba(26, 68, 134, 0)');
          pulseCtx.fillStyle = mg;
          pulseCtx.fillRect(0, 0, 1, 128);
        }

        mistPulseSprite = pulseOff;
      }

      if (!mistBottomSprite) {
        const bottomOff = document.createElement('canvas');
        bottomOff.width = 1;
        bottomOff.height = 128;
        const bottomCtx = bottomOff.getContext('2d');

        if (bottomCtx) {
          const bg = bottomCtx.createLinearGradient(0, 0, 0, 128);
          bg.addColorStop(0, 'rgba(4, 9, 23, 0)');
          bg.addColorStop(0.48, 'rgba(4, 9, 23, 0)');
          bg.addColorStop(1, 'rgba(4, 9, 23, 0.45)');
          bottomCtx.fillStyle = bg;
          bottomCtx.fillRect(0, 0, 1, 128);
        }

        mistBottomSprite = bottomOff;
      }

      farPlane = bakeGardenPlane(width + 120, height, 6, true);
      nearPlane = bakeGardenPlane(width + 160, height, 3, false);
    };

    const renderFrame = (t: number) => {
      const px = (parallaxRef.current.x - 0.5) * 2;
      const py = (parallaxRef.current.y - 0.5) * 2;

      // Expansive twilight zenith to enchanted misty horizon gradient (cached)
      if (skyPlane) {
        ctx.drawImage(skyPlane, 0, 0, width, height);
      }

      // Subtle zenith cerulean nebula haze (cached sprite)
      if (centerGlowSprite) {
        const glowRadius = Math.max(width, height) * 0.62;
        const gx = width * 0.5 + px * 16 - glowRadius;
        const gy = height * 0.48 + py * 12 - glowRadius;
        ctx.drawImage(centerGlowSprite, gx, gy, glowRadius * 2, glowRadius * 2);
      }

      // Soft defocused dreamy flower/amber bokeh pools via cached alpha sprites
      const minDim = Math.min(width, height);

      for (const b of DISTANT_BOKEH) {
        const breath = 0.55 + 0.45 * sampleLightBreath(t, b.phase);
        const bx = b.xFrac * width + px * (12 * b.depth);
        const by = b.yFrac * height + py * (8 * b.depth);
        const br = minDim * b.rFrac;
        const sprite = bokehSprites.get(b.rgba);

        if (sprite) {
          ctx.globalAlpha = breath;
          ctx.drawImage(sprite, bx - br, by - br, br * 2, br * 2);
        }
      }

      ctx.globalAlpha = 1;

      // Far floral silhouette horizon
      if (farPlane) {
        const offsetX = -60 + px * 12 + Math.sin(t * 0.15) * 4;
        const offsetY = py * 6;
        ctx.drawImage(farPlane, offsetX, offsetY, width + 120, height);
      }

      // Mid-horizon twilight mist band gently drifting
      const mistDrift = Math.sin(t * 0.12) * width * 0.04;
      const mistTop = height * 0.68;
      const mistHeight = height * 0.32;
      const mistX = mistDrift * 0.2;

      if (mistPulseSprite) {
        ctx.globalAlpha = 0.12 + 0.04 * Math.sin(t * 0.22);
        ctx.drawImage(mistPulseSprite, mistX, mistTop, width, mistHeight);
        ctx.globalAlpha = 1;
      }

      if (mistBottomSprite) {
        ctx.drawImage(mistBottomSprite, mistX, mistTop, width, mistHeight);
      }

      // Closer out-of-focus meadow plane
      if (nearPlane) {
        const offsetX = -80 + px * 22 + Math.sin(t * 0.22 + 1.3) * 6;
        const offsetY = py * 10;
        ctx.drawImage(nearPlane, offsetX, offsetY, width + 160, height);
      }
    };

    rebuild();
    renderFrame(0);

    if (reducedMotion) {
      window.addEventListener('resize', rebuild);

      return () => {
        window.removeEventListener('resize', rebuild);
      };
    }

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!document.hidden) {
        timeSec += dt;
        renderFrame(timeSec);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener('resize', rebuild);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', rebuild);
    };
  }, [parallaxRef, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-[5]"
    />
  );
}
