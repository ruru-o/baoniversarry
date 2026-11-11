import { useEffect, useRef, useState } from 'react';
import { FLORAL_PARTS, type FloralPartMeta } from '../../data/floralAssets';
import { FloralEnvironmentCanvas } from './FloralEnvironmentCanvas';
import {
  FloralParticlesCanvas,
  type DetachedPetalSpawn,
} from './FloralParticlesCanvas';
import {
  sampleLightBreath,
  sampleWindField,
  solveCurvedStem,
  stepJointSpring,
  type SpringState,
  type Vec2,
} from './floralWind';

interface PuppetRigSpec {
  id: string;
  viewW: number;
  viewH: number;
  root: Vec2;
  restTip: Vec2;
  ctrl1: Vec2;
  ctrl2: Vec2;
  flexPx: number;
  xNorm: number;
  yNorm: number;
  depthFactor: number; // 0.35 = midground slower, 1.0 = foreground crisp
  leafFrac: number;
  part: FloralPartMeta;
  displayScale: number;
  baseRotateDeg: number;
  springStiffness: number;
  springDamping: number;
  headMultiplier: number;
  partIndex?: 0 | 1 | 2;
  spawnFrac?: Vec2;
}

interface PuppetRefs {
  pathEl: SVGPathElement | null;
  headEl: HTMLDivElement | null;
  leafEl: HTMLDivElement | null;
  rimEl: HTMLDivElement | null;
  headSpring: SpringState;
  leafSpring: SpringState;
}

function makeRigRefs(): PuppetRefs {
  return {
    pathEl: null,
    headEl: null,
    leafEl: null,
    rimEl: null,
    headSpring: { value: 0, velocity: 0 },
    leafSpring: { value: 0, velocity: 0 },
  };
}

// Midground Layer 02 specimens (slower, gentler displacement)
const MID_SPECS: PuppetRigSpec[] = [
  {
    id: 'mid-cobalt-cosmos',
    viewW: 320,
    viewH: 460,
    root: { x: 108, y: 468 },
    restTip: { x: 204, y: 206 },
    ctrl1: { x: 124, y: 368 },
    ctrl2: { x: 162, y: 282 },
    flexPx: 20,
    xNorm: 0.14,
    yNorm: 0.68,
    depthFactor: 0.45,
    leafFrac: 0.48,
    part: FLORAL_PARTS.painted_cup_blossom,
    displayScale: 0.84,
    baseRotateDeg: -10,
    springStiffness: 22,
    springDamping: 4.5,
    headMultiplier: 1.08,
  },
  {
    id: 'mid-sapphire-left',
    viewW: 300,
    viewH: 320,
    root: { x: 46, y: 325 },
    restTip: { x: 175, y: 125 },
    ctrl1: { x: 64, y: 248 },
    ctrl2: { x: 122, y: 170 },
    flexPx: 14,
    xNorm: 0.12,
    yNorm: 0.82,
    depthFactor: 0.42,
    leafFrac: 0.52,
    part: FLORAL_PARTS.painted_sapphire_blossom,
    displayScale: 0.82,
    baseRotateDeg: 10,
    springStiffness: 20,
    springDamping: 4.2,
    headMultiplier: 1.05,
  },
  {
    id: 'mid-cup-right',
    viewW: 320,
    viewH: 340,
    root: { x: 330, y: 38 },
    restTip: { x: 158, y: 184 },
    ctrl1: { x: 274, y: 74 },
    ctrl2: { x: 204, y: 122 },
    flexPx: 18,
    xNorm: 0.88,
    yNorm: 0.3,
    depthFactor: 0.48,
    leafFrac: 0.56,
    part: FLORAL_PARTS.blossom_frost_cup,
    displayScale: 0.86,
    baseRotateDeg: -14,
    springStiffness: 24,
    springDamping: 4.6,
    headMultiplier: 1.12,
  },
  {
    id: 'mid-cerulean-right',
    viewW: 320,
    viewH: 320,
    root: { x: 295, y: 325 },
    restTip: { x: 132, y: 128 },
    ctrl1: { x: 265, y: 242 },
    ctrl2: { x: 194, y: 168 },
    flexPx: 15,
    xNorm: 0.85,
    yNorm: 0.78,
    depthFactor: 0.44,
    leafFrac: 0.46,
    part: FLORAL_PARTS.painted_cerulean_blossom,
    displayScale: 0.94,
    baseRotateDeg: -6,
    springStiffness: 22,
    springDamping: 4.4,
    headMultiplier: 1.06,
  },
];

// Foreground Layer 01 Hero Specimens (crisp outer framing, multi-joint secondary wind reaction)
const FORE_SPECS: PuppetRigSpec[] = [
  {
    id: 'fore-left-cosmos-sky',
    viewW: 360,
    viewH: 520,
    root: { x: 86, y: 528 },
    restTip: { x: 178, y: 122 },
    ctrl1: { x: 96, y: 392 },
    ctrl2: { x: 132, y: 256 },
    flexPx: 42,
    xNorm: 0.1,
    yNorm: 0.65,
    depthFactor: 1.0,
    leafFrac: 0.46,
    part: FLORAL_PARTS.cosmos_sky_head,
    displayScale: 0.92,
    baseRotateDeg: 8,
    springStiffness: 38,
    springDamping: 4.4,
    headMultiplier: 1.35,
    partIndex: 0,
    spawnFrac: { x: 0.11, y: 0.62 },
  },
  {
    id: 'fore-left-cosmos-twin',
    viewW: 360,
    viewH: 520,
    root: { x: 46, y: 528 },
    restTip: { x: 88, y: 286 },
    ctrl1: { x: 56, y: 446 },
    ctrl2: { x: 70, y: 364 },
    flexPx: 32,
    xNorm: 0.06,
    yNorm: 0.78,
    depthFactor: 0.94,
    leafFrac: 0.5,
    part: FLORAL_PARTS.cosmos_twin_hero,
    displayScale: 0.78,
    baseRotateDeg: -14,
    springStiffness: 34,
    springDamping: 4.3,
    headMultiplier: 1.3,
    partIndex: 0,
    spawnFrac: { x: 0.07, y: 0.74 },
  },
  {
    id: 'fore-top-left-frost',
    viewW: 340,
    viewH: 340,
    root: { x: -8, y: 18 },
    restTip: { x: 146, y: 168 },
    ctrl1: { x: 46, y: 74 },
    ctrl2: { x: 106, y: 116 },
    flexPx: 30,
    xNorm: 0.08,
    yNorm: 0.18,
    depthFactor: 0.92,
    leafFrac: 0.56,
    part: FLORAL_PARTS.blossom_frost_hero,
    displayScale: 0.74,
    baseRotateDeg: 22,
    springStiffness: 30,
    springDamping: 4.6,
    headMultiplier: 1.25,
    partIndex: 1,
    spawnFrac: { x: 0.09, y: 0.2 },
  },
  {
    id: 'fore-top-right-frost',
    viewW: 360,
    viewH: 360,
    root: { x: 372, y: 20 },
    restTip: { x: 202, y: 178 },
    ctrl1: { x: 312, y: 68 },
    ctrl2: { x: 252, y: 118 },
    flexPx: 32,
    xNorm: 0.91,
    yNorm: 0.2,
    depthFactor: 0.96,
    leafFrac: 0.52,
    part: FLORAL_PARTS.blossom_frost_left,
    displayScale: 0.84,
    baseRotateDeg: -16,
    springStiffness: 32,
    springDamping: 4.5,
    headMultiplier: 1.25,
    partIndex: 1,
    spawnFrac: { x: 0.89, y: 0.22 },
  },
  {
    id: 'fore-bottom-right-star',
    viewW: 400,
    viewH: 400,
    root: { x: 356, y: 408 },
    restTip: { x: 196, y: 136 },
    ctrl1: { x: 322, y: 318 },
    ctrl2: { x: 254, y: 212 },
    flexPx: 34,
    xNorm: 0.9,
    yNorm: 0.72,
    depthFactor: 1.0,
    leafFrac: 0.44,
    part: FLORAL_PARTS.painted_star_blossom,
    displayScale: 0.94,
    baseRotateDeg: -12,
    springStiffness: 36,
    springDamping: 4.7,
    headMultiplier: 1.28,
    partIndex: 2,
    spawnFrac: { x: 0.88, y: 0.68 },
  },
  {
    id: 'fore-bottom-right-radiant',
    viewW: 400,
    viewH: 400,
    root: { x: 300, y: 416 },
    restTip: { x: 282, y: 354 },
    ctrl1: { x: 294, y: 392 },
    ctrl2: { x: 286, y: 372 },
    flexPx: 20,
    xNorm: 0.92,
    yNorm: 0.92,
    depthFactor: 1.0,
    leafFrac: 0.5,
    part: FLORAL_PARTS.painted_radiant_hero,
    displayScale: 1.08,
    baseRotateDeg: -4,
    springStiffness: 28,
    springDamping: 4.5,
    headMultiplier: 1.22,
  },
];

function HeadPivotContent({
  part,
  displayScale,
  dimmed,
}: {
  part: FloralPartMeta;
  displayScale: number;
  dimmed?: boolean;
}) {
  const w = Math.round(part.width * displayScale);
  const h = Math.round(part.height * displayScale);
  const ox = Math.round(w * part.originXFrac);
  const oy = Math.round(h * part.originYFrac);

  return (
    <img
      src={part.url}
      alt=""
      aria-hidden="true"
      draggable={false}
      width={w}
      height={h}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        marginLeft: `${-ox}px`,
        marginTop: `${-oy}px`,
        maxWidth: 'none',
        filter: dimmed ? 'brightness(0.84) saturate(0.92)' : undefined,
      }}
      className="block select-none pointer-events-none"
    />
  );
}

function LeafChild({ spec }: { spec: PuppetRigSpec }) {
  if (spec.id === 'fore-bottom-right-star') {
    const spray = FLORAL_PARTS.painted_leaf_spray;
    const w = Math.round(spray.width * 0.86);
    const h = Math.round(spray.height * 0.86);
    const ox = Math.round(w * spray.originXFrac);
    const oy = Math.round(h * spray.originYFrac);

    return (
      <img
        src={spray.url}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          width: `${w}px`,
          height: `${h}px`,
          marginLeft: `${-ox}px`,
          marginTop: `${-oy}px`,
          maxWidth: 'none',
        }}
        className="block select-none pointer-events-none"
      />
    );
  }

  if (spec.id === 'fore-top-left-frost' || spec.id === 'fore-top-right-frost') {
    const bud = FLORAL_PARTS.blossom_frost_bud;
    const w = Math.round(bud.width * 0.92);
    const h = Math.round(bud.height * 0.92);
    const ox = Math.round(w * bud.originXFrac);
    const oy = Math.round(h * bud.originYFrac);

    return (
      <img
        src={bud.url}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          width: `${w}px`,
          height: `${h}px`,
          marginLeft: `${-ox}px`,
          marginTop: `${-oy}px`,
          maxWidth: 'none',
        }}
        className="block select-none pointer-events-none"
      />
    );
  }

  // Slender translucent teal-blue vector botanical leaf along cosmos stem
  return (
    <svg
      width="56"
      height="26"
      viewBox="0 0 56 26"
      style={{ marginLeft: '-4px', marginTop: '-20px' }}
      className="overflow-visible pointer-events-none"
      aria-hidden="true"
    >
      <path
        d="M 2 20 C 16 4, 38 2, 54 6 C 38 14, 20 19, 2 20 Z"
        fill="rgba(26, 78, 122, 0.82)"
        stroke="rgba(128, 198, 245, 0.25)"
        strokeWidth="0.7"
      />
    </svg>
  );
}

export function CosmicCanvas({ interactive = true }: { interactive?: boolean }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  const parallaxRef = useRef({ x: 0.5, y: 0.5 });
  const targetParallaxRef = useRef({ x: 0.5, y: 0.5 });
  const detachQueueRef = useRef<DetachedPetalSpawn[]>([]);

  const midLayerRef = useRef<HTMLDivElement>(null);
  const afterglowLayerRef = useRef<HTMLDivElement>(null);
  const foreLayerRef = useRef<HTMLDivElement>(null);

  const beam1Ref = useRef<HTMLDivElement>(null);
  const beam2Ref = useRef<HTMLDivElement>(null);
  const pulseAuraRefs = useRef<(HTMLDivElement | null)[]>([]);

  const puppetMapRef = useRef<Record<string, PuppetRefs>>({});

  for (const spec of [...MID_SPECS, ...FORE_SPECS]) {
    if (!puppetMapRef.current[spec.id]) {
      puppetMapRef.current[spec.id] = makeRigRefs();
    }
  }

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    const onMqChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onMqChange);

    return () => {
      mq.removeEventListener('change', onMqChange);
    };
  }, []);

  useEffect(() => {
    let rafId = 0;
    let timeSec = 0;
    let lastTime = performance.now();
    let nextDetachTime = 2.6;

    const applyPuppetState = (specs: PuppetRigSpec[], t: number, dt: number) => {
      for (let i = 0; i < specs.length; i++) {
        const spec = specs[i];
        const rig = puppetMapRef.current[spec.id];

        if (!rig) continue;

        const wind = sampleWindField(spec.xNorm, spec.yNorm, t, i * 0.45);

        const solved = solveCurvedStem(
          spec.root.x,
          spec.root.y,
          spec.restTip.x,
          spec.restTip.y,
          spec.ctrl1,
          spec.ctrl2,
          wind * spec.flexPx * spec.depthFactor,
          spec.leafFrac,
        );

        const targetHead =
          spec.baseRotateDeg +
          solved.tipAngleDeg * spec.headMultiplier +
          wind * (5.2 * spec.depthFactor) +
          Math.sin(t * 1.45 + i * 1.9) * (2.4 * spec.depthFactor);

        const targetLeaf =
          (i % 2 === 0 ? 12 : -18) +
          solved.leafAngleDeg * 1.45 +
          wind * (3.8 * spec.depthFactor) +
          Math.cos(t * 1.85 + i * 2.4) * (3.2 * spec.depthFactor);

        if (dt > 0) {
          stepJointSpring(
            rig.headSpring,
            targetHead,
            spec.springStiffness,
            spec.springDamping,
            dt,
          );
          stepJointSpring(
            rig.leafSpring,
            targetLeaf,
            spec.springStiffness * 1.25,
            spec.springDamping * 0.85,
            dt,
          );
        } else {
          rig.headSpring.value = spec.baseRotateDeg;
          rig.leafSpring.value = i % 2 === 0 ? 12 : -18;
        }

        if (rig.pathEl) {
          rig.pathEl.setAttribute('d', solved.pathD);
        }

        if (rig.headEl) {
          rig.headEl.style.transform = `translate3d(${solved.tipX.toFixed(2)}px, ${solved.tipY.toFixed(2)}px, 0) rotate(${rig.headSpring.value.toFixed(2)}deg)`;
        }

        if (rig.leafEl) {
          rig.leafEl.style.transform = `translate3d(${solved.leafX.toFixed(2)}px, ${solved.leafY.toFixed(2)}px, 0) rotate(${rig.leafSpring.value.toFixed(2)}deg)`;
        }

        if (rig.rimEl) {
          const rimAlpha = 0.24 + 0.36 * sampleLightBreath(t, i * 1.15);
          rig.rimEl.style.transform = `translate3d(${solved.tipX.toFixed(1)}px, ${solved.tipY.toFixed(1)}px, 0)`;
          rig.rimEl.style.opacity = rimAlpha.toFixed(3);
        }
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!document.hidden && !reducedMotion) {
        timeSec += dt;

        // Smooth mouse cursor parallax
        const cur = parallaxRef.current;
        const tgt = targetParallaxRef.current;
        cur.x += (tgt.x - cur.x) * 0.045;
        cur.y += (tgt.y - cur.y) * 0.045;

        const px = (cur.x - 0.5) * 2;
        const py = (cur.y - 0.5) * 2;

        if (midLayerRef.current) {
          midLayerRef.current.style.transform = `translate3d(${(px * 14).toFixed(2)}px, ${(py * 8).toFixed(2)}px, 0)`;
        }

        if (afterglowLayerRef.current) {
          afterglowLayerRef.current.style.transform = `translate3d(${(px * 20).toFixed(2)}px, ${(py * 12).toFixed(2)}px, 0)`;
        }

        if (foreLayerRef.current) {
          foreLayerRef.current.style.transform = `translate3d(${(px * 28).toFixed(2)}px, ${(py * 16).toFixed(2)}px, 0)`;
        }

        // Update inter-layer atmospheric afterglow pools & sweeping light rays
        for (let i = 0; i < pulseAuraRefs.current.length; i++) {
          const el = pulseAuraRefs.current[i];

          if (!el) continue;

          const breath = sampleLightBreath(timeSec, i * 1.37 + 0.4);
          const scale = 0.94 + 0.16 * breath;
          el.style.opacity = (0.48 + 0.48 * breath).toFixed(3);
          el.style.transform = `scale(${scale.toFixed(3)})`;
        }

        if (beam1Ref.current) {
          const sweep1 = Math.sin(timeSec * 0.22) * 76;
          const b1 = sampleLightBreath(timeSec, 2.2);
          beam1Ref.current.style.transform = `translate3d(${sweep1.toFixed(1)}px, 0, 0) rotate(-24deg)`;
          beam1Ref.current.style.opacity = (0.28 + 0.34 * b1).toFixed(3);
        }

        if (beam2Ref.current) {
          const sweep2 = Math.cos(timeSec * 0.17 + 1.1) * 68;
          const b2 = sampleLightBreath(timeSec, 4.9);
          beam2Ref.current.style.transform = `translate3d(${sweep2.toFixed(1)}px, 0, 0) rotate(20deg)`;
          beam2Ref.current.style.opacity = (0.24 + 0.3 * b2).toFixed(3);
        }

        // Solve hierarchical 2D skeletal puppetry joints across midground & foreground
        applyPuppetState(MID_SPECS, timeSec, dt);
        applyPuppetState(FORE_SPECS, timeSec, dt);

        // Occasional natural petal detachment from wind-swept foreground flowers
        if (timeSec >= nextDetachTime) {
          const emitters = FORE_SPECS.filter((s) => s.spawnFrac && s.partIndex !== undefined);
          const chosen = emitters[Math.floor((timeSec * 7.3) % emitters.length)];

          if (chosen?.spawnFrac && chosen.partIndex !== undefined) {
            const gustDir = sampleWindField(chosen.xNorm, chosen.yNorm, timeSec) >= 0 ? 1 : -1;
            detachQueueRef.current.push({
              xFrac: chosen.spawnFrac.x,
              yFrac: chosen.spawnFrac.y,
              partIndex: chosen.partIndex,
              vxBias: (chosen.xNorm < 0.5 ? 24 : -16) + gustDir * 18,
            });
          }

          nextDetachTime = timeSec + 3.2 + ((Math.sin(timeSec * 1.9) + 1) * 1.3);
        }
      }

      if (!reducedMotion) {
        rafId = requestAnimationFrame(tick);
      }
    };

    // Place initial resting transforms cleanly once even when reducedMotion is enabled
    applyPuppetState(MID_SPECS, 0, 0);
    applyPuppetState(FORE_SPECS, 0, 0);

    if (!reducedMotion) {
      rafId = requestAnimationFrame(tick);
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetParallaxRef.current.x = e.clientX / Math.max(window.innerWidth, 1);
      targetParallaxRef.current.y = e.clientY / Math.max(window.innerHeight, 1);
    };

    if (interactive && !reducedMotion) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      cancelAnimationFrame(rafId);

      if (interactive && !reducedMotion) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [interactive, reducedMotion]);

  const bindPathRef = (id: string, el: SVGPathElement | null) => {
    const rig = puppetMapRef.current[id];

    if (rig) {
      rig.pathEl = el;
    }
  };

  const bindElementRef = (
    id: string,
    key: 'headEl' | 'leafEl' | 'rimEl',
    el: HTMLDivElement | null,
  ) => {
    const rig = puppetMapRef.current[id];

    if (rig) {
      rig[key] = el;
    }
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030814]"
      aria-hidden="true"
    >
      {/* LAYER 05: Expansive Magical Floral Meadow + Bokeh Silhouettes */}
      <FloralEnvironmentCanvas parallaxRef={parallaxRef} reducedMotion={reducedMotion} />

      {/* LAYER 04A: Deep Horizon Afterglow Pools (Behind Midground Flora) */}
      <div className="fixed inset-0 z-[12] pointer-events-none mix-blend-screen">
        <div
          className="absolute -left-16 bottom-6 w-[44vw] h-[48vh] rounded-full opacity-55"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(46, 118, 212, 0.28) 0%, rgba(28, 74, 148, 0.1) 52%, transparent 74%)',
            filter: 'blur(38px)',
          }}
        />
        <div
          className="absolute -right-12 -bottom-10 w-[48vw] h-[52vh] rounded-full opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(64, 138, 232, 0.3) 0%, rgba(224, 182, 102, 0.08) 46%, transparent 74%)',
            filter: 'blur(42px)',
          }}
        />
      </div>

      {/* LAYER 02: Midground Floral Puppet Rigs */}
      <div ref={midLayerRef} className="fixed -inset-4 z-[20] pointer-events-none opacity-75 md:opacity-90">
        {/* Lower-left cupped sapphire blossom (midground) */}
        <MidgroundCluster
          spec={MID_SPECS[0]}
          positionClass="left-0 bottom-0 origin-bottom-left scale-[0.52] sm:scale-[0.78] lg:scale-[0.9] xl:scale-100"
          stemStroke="#194270"
          bindPathRef={bindPathRef}
          bindElementRef={bindElementRef}
        />

        {/* Lower-left painted sapphire (midground behind cosmos) */}
        <MidgroundCluster
          spec={MID_SPECS[1]}
          positionClass="-left-3 sm:left-4 -bottom-3 origin-bottom-left scale-[0.58] sm:scale-[0.78] lg:scale-[0.9] xl:scale-100"
          stemStroke="#14355C"
          bindPathRef={bindPathRef}
          bindElementRef={bindElementRef}
        />

        {/* Upper-right cupped frost blossom (midground tucked gracefully below top corner) */}
        <MidgroundCluster
          spec={MID_SPECS[2]}
          positionClass="-right-7 sm:-right-3 top-28 sm:top-44 origin-top-right scale-[0.38] sm:scale-[0.74] lg:scale-[0.88] xl:scale-100"
          stemStroke="#1C4B76"
          bindPathRef={bindPathRef}
          bindElementRef={bindElementRef}
        />

        {/* Lower-right cerulean fantasy flower (midground) */}
        <MidgroundCluster
          spec={MID_SPECS[3]}
          positionClass="right-2 sm:right-8 -bottom-2 origin-bottom-right scale-[0.54] sm:scale-[0.78] lg:scale-[0.9] xl:scale-100"
          stemStroke="#163E6C"
          bindPathRef={bindPathRef}
          bindElementRef={bindElementRef}
        />
      </div>

      {/* LAYER 04B: Inter-Layer Atmospheric Afterglow & Volumetric Light Sweeps (BETWEEN Layer 02 & Layer 01!) */}
      <div
        ref={afterglowLayerRef}
        className="fixed -inset-8 z-[30] pointer-events-none mix-blend-screen"
      >
        {/* Soft luminous afterglow emerging behind Left Foreground Cosmos */}
        <div
          ref={(el) => {
            pulseAuraRefs.current[0] = el;
          }}
          className="absolute left-[0%] bottom-[6%] w-[380px] sm:w-[540px] h-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(164, 218, 255, 0.56) 0%, rgba(92, 174, 248, 0.28) 42%, rgba(255, 224, 150, 0.12) 66%, transparent 80%)',
            filter: 'blur(36px)',
          }}
        />

        {/* Soft luminous afterglow emerging between Midground & Foreground Right Painted Cluster */}
        <div
          ref={(el) => {
            pulseAuraRefs.current[1] = el;
          }}
          className="absolute right-[0%] bottom-[2%] w-[400px] sm:w-[560px] h-[440px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(145, 212, 255, 0.54) 0%, rgba(252, 212, 128, 0.22) 38%, rgba(56, 134, 232, 0.22) 58%, transparent 80%)',
            filter: 'blur(38px)',
          }}
        />

        {/* Upper-left frost vine atmospheric bloom */}
        <div
          ref={(el) => {
            pulseAuraRefs.current[2] = el;
          }}
          className="absolute left-[-4%] top-[-2%] w-[340px] sm:w-[440px] h-[320px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(180, 228, 255, 0.46) 0%, rgba(96, 176, 245, 0.2) 50%, transparent 78%)',
            filter: 'blur(34px)',
          }}
        />

        {/* Upper-right cascade bloom */}
        <div
          ref={(el) => {
            pulseAuraRefs.current[3] = el;
          }}
          className="absolute right-[-4%] top-[4%] w-[360px] sm:w-[460px] h-[360px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(188, 230, 255, 0.46) 0%, rgba(114, 184, 248, 0.2) 52%, transparent 78%)',
            filter: 'blur(36px)',
          }}
        />

        {/* Diagonal volumetric celestial light shafts sweeping between floral planes */}
        <div
          ref={beam1Ref}
          className="absolute -top-[18%] left-[8%] w-[38vw] min-w-[280px] h-[145vh]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(168, 216, 255, 0.08) 28%, rgba(218, 240, 255, 0.22) 50%, rgba(168, 216, 255, 0.07) 72%, transparent 100%)',
            filter: 'blur(22px)',
          }}
        />
        <div
          ref={beam2Ref}
          className="absolute -top-[20%] right-[10%] w-[32vw] min-w-[240px] h-[140vh]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(148, 206, 255, 0.07) 26%, rgba(206, 236, 255, 0.19) 50%, rgba(252, 224, 156, 0.09) 68%, transparent 100%)',
            filter: 'blur(24px)',
          }}
        />
      </div>

      {/* LAYER 03: Wind-Driven Drifting Petals (Real Extracted Petals) & Magical Dust */}
      <FloralParticlesCanvas
        parallaxRef={parallaxRef}
        detachQueueRef={detachQueueRef}
        interactive={interactive}
        reducedMotion={reducedMotion}
      />

      {/* LAYER 01: Foreground Hero Flowers — Multi-Bone Vector & Puppetry Framing */}
      <div
        ref={foreLayerRef}
        className="fixed -inset-4 z-[40] pointer-events-none opacity-80 sm:opacity-92 lg:opacity-100"
      >
        {/* Left Lower Edge: Sharp Hero Periwinkle Cosmos + Companion Cosmos */}
        <ForegroundCluster
          spec={FORE_SPECS[0]}
          positionClass="-left-3 sm:left-0 -bottom-2 origin-bottom-left scale-[0.52] sm:scale-[0.78] lg:scale-[0.9] xl:scale-100"
          stemStrokeStart="#143D56"
          stemStrokeEnd="#499BD0"
          bindPathRef={bindPathRef}
          bindElementRef={bindElementRef}
        />
        <ForegroundCluster
          spec={FORE_SPECS[1]}
          positionClass="-left-4 sm:-left-1 -bottom-3 origin-bottom-left scale-[0.52] sm:scale-[0.78] lg:scale-[0.9] xl:scale-100"
          stemStrokeStart="#1A2C4A"
          stemStrokeEnd="#5F799E"
          bindPathRef={bindPathRef}
          bindElementRef={bindElementRef}
        />

        {/* Upper-Left Corner: Trailing Veined Frost Blossom Spray + Bud (pulled outward on phones to clear top nav pill) */}
        <ForegroundCluster
          spec={FORE_SPECS[2]}
          positionClass="-left-8 -top-7 sm:-left-2 sm:-top-2 origin-top-left scale-[0.38] sm:scale-[0.76] lg:scale-[0.88] xl:scale-100"
          stemStrokeStart="#123A58"
          stemStrokeEnd="#2C719C"
          bindPathRef={bindPathRef}
          bindElementRef={bindElementRef}
        />

        {/* Upper-Right Corner: Cascading Veined Frost Blossom + Bud */}
        <ForegroundCluster
          spec={FORE_SPECS[3]}
          positionClass="-right-8 -top-7 sm:-right-2 sm:-top-2 origin-top-right scale-[0.38] sm:scale-[0.76] lg:scale-[0.88] xl:scale-100"
          stemStrokeStart="#103654"
          stemStrokeEnd="#317AA6"
          bindPathRef={bindPathRef}
          bindElementRef={bindElementRef}
        />

        {/* Lower-Right Hero Cluster: Painted Starlight Blossom + Leaf Spray + Radiant Base */}
        <ForegroundCluster
          spec={FORE_SPECS[4]}
          positionClass="-right-3 sm:right-0 -bottom-2 origin-bottom-right scale-[0.54] sm:scale-[0.78] lg:scale-[0.9] xl:scale-100"
          stemStrokeStart="#0D254D"
          stemStrokeEnd="#3A7AC4"
          bindPathRef={bindPathRef}
          bindElementRef={bindElementRef}
        />
        <ForegroundCluster
          spec={FORE_SPECS[5]}
          positionClass="-right-3 sm:right-0 -bottom-7 sm:-bottom-6 origin-bottom-right scale-[0.54] sm:scale-[0.78] lg:scale-[0.9] xl:scale-100"
          stemStrokeStart="#0F2C59"
          stemStrokeEnd="#448CE0"
          bindPathRef={bindPathRef}
          bindElementRef={bindElementRef}
        />
      </div>

      {/* Center Content Contrast Scrim & Cinematic Vignette (ensures crisp foreground UI readability) */}
      <div
        className="fixed inset-0 z-[48] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 68% 72% at 50% 50%, rgba(4, 9, 22, 0.34) 0%, rgba(4, 9, 22, 0.14) 55%, rgba(2, 6, 16, 0.56) 100%)',
        }}
      />
    </div>
  );
}

interface ClusterRenderProps {
  spec: PuppetRigSpec;
  positionClass: string;
  stemStrokeStart: string;
  stemStrokeEnd?: string;
  bindPathRef: (id: string, el: SVGPathElement | null) => void;
  bindElementRef: (id: string, key: 'headEl' | 'leafEl' | 'rimEl', el: HTMLDivElement | null) => void;
}

function MidgroundCluster({
  spec,
  positionClass,
  stemStroke,
  bindPathRef,
  bindElementRef,
}: Omit<ClusterRenderProps, 'stemStrokeStart' | 'stemStrokeEnd'> & { stemStroke: string }) {
  return (
    <div
      className={`absolute pointer-events-none ${positionClass}`}
      style={{ width: `${spec.viewW}px`, height: `${spec.viewH}px` }}
    >
      <svg
        viewBox={`0 0 ${spec.viewW} ${spec.viewH}`}
        className="w-full h-full overflow-visible block"
      >
        <path
          ref={(el) => bindPathRef(spec.id, el)}
          fill="none"
          stroke={stemStroke}
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.72"
        />
      </svg>

      {/* Pinned botanical head driven in 1:1 sync with curved stem tip */}
      <div
        ref={(el) => bindElementRef(spec.id, 'headEl', el)}
        style={{ transformOrigin: '0px 0px', left: 0, top: 0 }}
        className="absolute opacity-85"
      >
        <HeadPivotContent part={spec.part} displayScale={spec.displayScale} dimmed />
      </div>
    </div>
  );
}

function ForegroundCluster({
  spec,
  positionClass,
  stemStrokeStart,
  stemStrokeEnd,
  bindPathRef,
  bindElementRef,
}: ClusterRenderProps) {
  const gradId = `stemGrad-${spec.id}`;

  return (
    <div
      className={`absolute pointer-events-none ${positionClass}`}
      style={{ width: `${spec.viewW}px`, height: `${spec.viewH}px` }}
    >
      {/* Articulated curved vector stem bone */}
      <svg
        viewBox={`0 0 ${spec.viewW} ${spec.viewH}`}
        className="w-full h-full overflow-visible block"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1={spec.root.x}
            y1={spec.root.y}
            x2={spec.restTip.x}
            y2={spec.restTip.y}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={stemStrokeStart} />
            <stop offset="100%" stopColor={stemStrokeEnd ?? stemStrokeStart} />
          </linearGradient>
        </defs>
        <path
          ref={(el) => bindPathRef(spec.id, el)}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="3.8"
          strokeLinecap="round"
        />
      </svg>

      {/* Subtle luminous backlight aura catching petals & calyx edges */}
      <div
        ref={(el) => bindElementRef(spec.id, 'rimEl', el)}
        style={{
          left: '-64px',
          top: '-64px',
          width: '128px',
          height: '128px',
          background:
            'radial-gradient(circle, rgba(190, 226, 255, 0.5) 0%, rgba(120, 188, 248, 0.2) 52%, transparent 76%)',
          filter: 'blur(12px)',
        }}
        className="absolute rounded-full mix-blend-screen pointer-events-none"
      />

      {/* Secondary botanical child bone (leaf / trailing bud attached on stem) */}
      <div
        ref={(el) => bindElementRef(spec.id, 'leafEl', el)}
        style={{ transformOrigin: '0px 0px', left: 0, top: 0 }}
        className="absolute"
      >
        <LeafChild spec={spec} />
      </div>

      {/* Primary articulated flower head bone attached at exact curving stem tip */}
      <div
        ref={(el) => bindElementRef(spec.id, 'headEl', el)}
        style={{ transformOrigin: '0px 0px', left: 0, top: 0 }}
        className="absolute"
      >
        <HeadPivotContent part={spec.part} displayScale={spec.displayScale} />
      </div>
    </div>
  );
}
