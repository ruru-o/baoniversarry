import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Deep starfield — quiet celestial backdrop
function StarField({ count = 1400 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    const c1 = new THREE.Color('#B7D2F0');
    const c2 = new THREE.Color('#DCE7F5');
    const c3 = new THREE.Color('#718FB8');
    const c4 = new THREE.Color('#F4F5FA');

    for (let i = 0; i < count; i++) {
      const radius = 30 + Math.random() * 65;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const r = Math.random();
      const c = r < 0.4 ? c1 : r < 0.7 ? c2 : r < 0.88 ? c4 : c3;

      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      sz[i] = 0.8 + Math.random() * 1.8;
    }

    return [pos, col, sz];
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.012;
      pointsRef.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
        <bufferAttribute attach="attributes-size"     args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.4}
        vertexColors
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Orbital ring — a ring of particles rotating around the scene center
// Several instances at different radii / axis tilts create the encircling effect
function OrbitalRing({
  radius,
  particleCount,
  tiltX,
  tiltZ,
  speed,
  colorA,
  colorB,
  offset = 0,
}: {
  radius: number;
  particleCount: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  colorA: THREE.Color;
  colorB: THREE.Color;
  offset?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const sz  = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle  = (i / particleCount) * Math.PI * 2 + offset;
      const spread = (Math.random() - 0.5) * 0.3;

      pos[i * 3]     = Math.cos(angle) * (radius + spread);
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
      pos[i * 3 + 2] = Math.sin(angle) * (radius + spread);

      const t = i / particleCount;
      const c = colorA.clone().lerp(colorB, t);

      // leading-edge particles are brighter
      const brightness = 0.5 + 0.5 * Math.pow(Math.sin(t * Math.PI), 0.6);

      col[i * 3]     = c.r * brightness;
      col[i * 3 + 1] = c.g * brightness;
      col[i * 3 + 2] = c.b * brightness;

      sz[i] = 1.0 + Math.random() * 2.0;
    }

    return [pos, col, sz];
  }, [radius, particleCount, colorA, colorB, offset]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * speed;
    }
  });

  return (
    <group ref={groupRef} rotation={[tiltX, 0, tiltZ]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
          <bufferAttribute attach="attributes-size"     args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={2.2}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// Nebula dust clouds — slow drifting wisps
function NebulaClouds() {
  const groupRef = useRef<THREE.Group>(null);

  const [positions, colors] = useMemo(() => {
    const count = 320;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const c1 = new THREE.Color('#10182F');
    const c2 = new THREE.Color('#718FB8');

    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 12;
      const height = (Math.random() - 0.5) * 6;

      pos[i * 3]     = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const t = Math.random();
      const c = c1.clone().lerp(c2, t * 0.5);

      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime() * 0.04;
      groupRef.current.rotation.y = t;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={6}
          vertexColors
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function CameraRig() {
  useFrame((state) => {
    const p = state.pointer;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, p.x * 1.2, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, p.y * 0.8, 0.04);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export function CosmicCanvas({ interactive = true }: { interactive?: boolean }) {
  const powder = new THREE.Color('#B7D2F0');
  const dusk   = new THREE.Color('#718FB8');
  const moon   = new THREE.Color('#DCE7F5');

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ background: '#080D1C' }}>
      {/* Deep atmospheric layering */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 50% at 50% 10%, rgba(113,143,184,0.20) 0%, transparent 65%),
            radial-gradient(ellipse 70% 60% at 15% 70%, rgba(16,24,47,0.9) 0%, transparent 70%),
            radial-gradient(ellipse 60% 45% at 85% 60%, rgba(183,210,240,0.07) 0%, transparent 60%)
          `,
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 18], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#080D1C']} />

        <StarField count={1200} />
        <NebulaClouds />

        {/* Concentric orbital rings at different tilts — surrounds the hero */}
        <OrbitalRing
          radius={7}
          particleCount={110}
          tiltX={Math.PI * 0.08}
          tiltZ={Math.PI * 0.04}
          speed={0.18}
          colorA={powder}
          colorB={dusk}
        />
        <OrbitalRing
          radius={9.5}
          particleCount={140}
          tiltX={-Math.PI * 0.14}
          tiltZ={Math.PI * 0.06}
          speed={-0.12}
          colorA={dusk}
          colorB={moon}
          offset={Math.PI * 0.6}
        />
        <OrbitalRing
          radius={12}
          particleCount={160}
          tiltX={Math.PI * 0.22}
          tiltZ={-Math.PI * 0.1}
          speed={0.09}
          colorA={moon}
          colorB={powder}
          offset={Math.PI * 1.2}
        />
        <OrbitalRing
          radius={5.5}
          particleCount={70}
          tiltX={Math.PI * 0.45}
          tiltZ={Math.PI * 0.3}
          speed={-0.22}
          colorA={powder}
          colorB={moon}
          offset={Math.PI * 0.9}
        />

        {interactive && <CameraRig />}
      </Canvas>
    </div>
  );
}
