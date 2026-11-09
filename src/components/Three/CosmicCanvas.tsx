import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function StarField({ count = 1200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    const color1 = new THREE.Color('#B7D2F0'); // Powder blue
    const color2 = new THREE.Color('#DCE7F5'); // Moonlight silver
    const color3 = new THREE.Color('#718FB8'); // Dusk blue
    const color4 = new THREE.Color('#F4F5FA'); // Soft white

    for (let i = 0; i < count; i++) {
      const radius = 25 + Math.random() * 60;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const r = Math.random();
      const chosenColor = r < 0.4 ? color1 : r < 0.7 ? color2 : r < 0.85 ? color4 : color3;

      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;

      sz[i] = 1.2 + Math.random() * 2.2;
    }

    return [pos, col, sz];
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015;
      pointsRef.current.rotation.x += delta * 0.008;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.6}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CosmicTrail() {
  const trailRef = useRef<THREE.Points>(null);
  const count = 180;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const baseColor = new THREE.Color('#B7D2F0');
    const glowColor = new THREE.Color('#718FB8');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      const alpha = 1 - i / count;
      const c = baseColor.clone().lerp(glowColor, 1 - alpha);

      col[i * 3] = c.r * alpha;
      col[i * 3 + 1] = c.g * alpha;
      col[i * 3 + 2] = c.b * alpha;
    }

    return [pos, col];
  }, [count]);

  const history = useMemo(() => {
    return Array.from({ length: count }, () => new THREE.Vector3());
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.9;
    // Lissajous 3D path around viewport
    const headX = Math.sin(t) * 9 + Math.sin(t * 2.1) * 2;
    const headY = Math.cos(t * 0.7) * 4.5 + Math.sin(t * 1.4) * 1.5;
    const headZ = Math.sin(t * 0.5) * 5;

    history.unshift(new THREE.Vector3(headX, headY, headZ));

    if (history.length > count) {
      history.pop();
    }

    if (trailRef.current) {
      const posAttr = trailRef.current.geometry.attributes.position;

      for (let i = 0; i < history.length; i++) {
        const p = history[i];
        posAttr.setXYZ(i, p.x, p.y, p.z);
      }

      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={trailRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2.8}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingConstellationNodes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime() * 0.3;
      groupRef.current.rotation.y = Math.sin(t) * 0.15;
      groupRef.current.position.y = Math.cos(t * 0.8) * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[-6, 3, -12]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#B7D2F0" />
      </mesh>
      <mesh position={[7, -2, -10]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#DCE7F5" />
      </mesh>
      <mesh position={[-4, -4, -8]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#718FB8" />
      </mesh>
      <mesh position={[5, 4, -14]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#B7D2F0" />
      </mesh>
    </group>
  );
}

function CameraRig() {
  useFrame((state) => {
    // Gentle mouse parallax on desktop
    const pointer = state.pointer;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, pointer.x * 1.5, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, pointer.y * 1.0, 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export function CosmicCanvas({ interactive = true }: { interactive?: boolean }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#080D1C]">
      {/* Deep atmospheric gradients */}
      <div className="absolute inset-0 radial-nebula opacity-90" />
      <div className="absolute inset-0 radial-nebula-bottom opacity-75" />

      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#080D1C']} />
        <fog attach="fog" args={['#080D1C', 25, 75]} />
        
        <StarField count={1000} />
        <CosmicTrail />
        <FloatingConstellationNodes />
        {interactive && <CameraRig />}
      </Canvas>
    </div>
  );
}
