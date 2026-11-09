import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom GLSL Shader for fine-grain, photographic galaxy stars
// Ensures 100% round, anti-aliased microscopic pinprick stars with organic density & subtle twinkle
const galaxyVertexShader = `
  attribute float aSize;
  attribute float aBrightness;
  attribute float aTwinkleSpeed;
  attribute float aSeed;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    // Organic, delicate twinkle: some stars twinkle gently, others stay steady
    float twinkle = sin(uTime * aTwinkleSpeed + aSeed * 6.28318) * 0.35 + 0.65;
    vAlpha = aBrightness * twinkle;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Microscopic stardust sizing, distance attenuated, clamped for pinprick sharpness
    float dist = length(mvPosition.xyz);
    gl_PointSize = clamp((aSize * uPixelRatio * 18.0) / dist, 0.6, 2.4);
  }
`;

const galaxyFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Perfect circular Gaussian point falloff (prevents square artifacts)
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) {
      discard;
    }

    // Soft photographic point profile
    float strength = smoothstep(0.5, 0.05, dist);
    gl_FragColor = vec4(vColor, vAlpha * strength);
  }
`;

function PhotographicGalaxy({ count = 1800 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [positions, colors, sizes, brightness, twinkleSpeed, seeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const br = new Float32Array(count);
    const sp = new Float32Array(count);
    const sd = new Float32Array(count);

    const cPowder = new THREE.Color('#B7D2F0');
    const cMoonlight = new THREE.Color('#DCE7F5');
    const cWhite = new THREE.Color('#F4F5FA');
    const cDusk = new THREE.Color('#718FB8');

    for (let i = 0; i < count; i++) {
      // Organic celestial distribution: clustered along a subtle galactic arc
      const isCluster = Math.random() < 0.6;
      let x: number;
      let y: number;
      let z: number;

      if (isCluster) {
        // Subtle diagonal galactic band with random dispersion
        const t = (Math.random() - 0.5) * 50;
        const spread = (Math.random() - 0.5) * 14;
        const depth = (Math.random() - 0.5) * 20;

        x = t + spread * 0.5;
        y = t * 0.45 + spread;
        z = -15 + depth;
      } else {
        // Deep background field
        const radius = 20 + Math.random() * 45;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = -12 + radius * Math.cos(phi) * 0.6;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color variation: fine powder blues, moonlight silver, soft whites
      const rColor = Math.random();
      const chosenColor = rColor < 0.35 ? cPowder : rColor < 0.65 ? cMoonlight : rColor < 0.85 ? cWhite : cDusk;

      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;

      // Most stars are tiny pinpricks; very few slightly brighter
      sz[i] = Math.random() < 0.85 ? 0.6 + Math.random() * 0.6 : 1.2 + Math.random() * 0.6;
      br[i] = 0.25 + Math.random() * 0.65;
      sp[i] = 0.4 + Math.random() * 1.2;
      sd[i] = Math.random();
    }

    return [pos, col, sz, br, sp, sd];
  }, [count]);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
    };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }

    if (pointsRef.current) {
      // Extremely slow, serene celestial drift
      pointsRef.current.rotation.y += delta * 0.0018;
      pointsRef.current.rotation.z += delta * 0.0008;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aBrightness" args={[brightness, 1]} />
        <bufferAttribute attach="attributes-aTwinkleSpeed" args={[twinkleSpeed, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={galaxyVertexShader}
        fragmentShader={galaxyFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Gentle, restrained mouse parallax
function GalaxyCameraParallax() {
  useFrame((state) => {
    const p = state.pointer;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, p.x * 0.5, 0.02);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, p.y * 0.35, 0.02);
    state.camera.lookAt(0, 0, -10);
  });

  return null;
}

export function CosmicCanvas({ interactive = true }: { interactive?: boolean }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 90% 60% at 50% 20%, rgba(113, 143, 184, 0.07) 0%, transparent 70%),
          radial-gradient(ellipse 70% 50% at 80% 75%, rgba(16, 24, 47, 0.55) 0%, transparent 65%),
          #060814
        `,
      }}
    >
      {/* Delicate photographic galaxy canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#060814']} />
        <fog attach="fog" args={['#060814', 15, 65]} />

        <PhotographicGalaxy count={1600} />

        {interactive && <GalaxyCameraParallax />}
      </Canvas>

      {/* Extremely subtle film grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
