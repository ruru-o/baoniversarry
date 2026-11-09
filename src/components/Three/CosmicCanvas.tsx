import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Generates a smooth, anti-aliased circular particle texture (prevents GPU square point artifacts)
function createCircleTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(220, 231, 245, 0.9)');
    gradient.addColorStop(0.5, 'rgba(183, 210, 240, 0.4)');
    gradient.addColorStop(1, 'rgba(183, 210, 240, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  return texture;
}

// Minimal, serene stardust backdrop — faint pinprick stars, calm & elegant
function MinimalStarfield({ count = 800 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useMemo(() => createCircleTexture(), []);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    const colorA = new THREE.Color('#B7D2F0'); // Powder blue
    const colorB = new THREE.Color('#DCE7F5'); // Moonlight
    const colorC = new THREE.Color('#F4F5FA'); // Pure starlight
    const colorD = new THREE.Color('#718FB8'); // Soft dusk

    for (let i = 0; i < count; i++) {
      // Distribute widely in sphere
      const radius = 25 + Math.random() * 55;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const r = Math.random();
      const c = r < 0.4 ? colorA : r < 0.7 ? colorB : r < 0.88 ? colorC : colorD;

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      // Microscopic sizes for realistic starlight pinpricks
      sz[i] = 0.8 + Math.random() * 1.4;
    }

    return [pos, col, sz];
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      // Serene, near-imperceptible drift
      pointsRef.current.rotation.y += delta * 0.003;
      pointsRef.current.rotation.x += delta * 0.0015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.1}
        map={texture}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Delicate foreground stardust motes (few, gentle, calm)
function FloatingStardustMotes({ count = 35 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => createCircleTexture(), []);

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sc[i] = 1.0 + Math.random() * 1.5;
    }

    return [pos, sc];
  }, [count]);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime() * 0.15;
      groupRef.current.position.y = Math.sin(t) * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-size" args={[scales, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={1.8}
          map={texture}
          color="#B7D2F0"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// Gentle, restrained mouse parallax
function CameraParallax() {
  useFrame((state) => {
    const pointer = state.pointer;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, pointer.x * 0.6, 0.025);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, pointer.y * 0.4, 0.025);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export function CosmicCanvas({ interactive = true }: { interactive?: boolean }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 70% 45% at 50% 15%, rgba(113, 143, 184, 0.09) 0%, transparent 65%),
          radial-gradient(ellipse 60% 50% at 85% 75%, rgba(16, 24, 47, 0.7) 0%, transparent 65%),
          #080D1C
        `,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 16], fov: 55 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#080D1C']} />
        <fog attach="fog" args={['#080D1C', 20, 70]} />

        {/* Crisp, serene, microscopic pinprick starfield */}
        <MinimalStarfield count={750} />

        {/* Very subtle floating stardust motes */}
        <FloatingStardustMotes count={30} />

        {interactive && <CameraParallax />}
      </Canvas>
    </div>
  );
}
