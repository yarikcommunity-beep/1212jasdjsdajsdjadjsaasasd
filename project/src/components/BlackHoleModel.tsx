'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  Points,
  TorusGeometry,
} from 'three';

const seededNoise = (index: number) => {
  const value = Math.sin(index * 127.1) * 43758.5453123;
  return value - Math.floor(value);
};

function AccretionDisk() {
  const diskRef = useRef<Group>(null);
  const innerDiskRef = useRef<Group>(null);
  const diskGeometry = useMemo(() => {
    const positions: number[] = [];

    for (let index = 0; index < 2200; index += 1) {
      const angle = seededNoise(index) * Math.PI * 2;
      const radius = 1.08 + seededNoise(index + 19) * 2.05;
      const turbulence = Math.sin(angle * 4 + radius * 2.8) * 0.08;
      const thickness = (seededNoise(index + 43) - 0.5) * 0.075;

      positions.push(
        Math.cos(angle) * (radius + turbulence),
        thickness,
        Math.sin(angle) * (radius * 0.34 + turbulence),
      );
    }

    const bufferGeometry = new BufferGeometry();
    bufferGeometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));

    return bufferGeometry;
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (diskRef.current) {
      diskRef.current.rotation.z = elapsed * 0.24;
      diskRef.current.rotation.x = 1.08 + Math.sin(elapsed * 0.32) * 0.035;
    }

    if (innerDiskRef.current) {
      innerDiskRef.current.rotation.z = -elapsed * 0.62;
    }
  });

  return (
    <group ref={diskRef}>
      <points geometry={diskGeometry}>
        <pointsMaterial
          color="#ffffff"
          size={0.016}
          sizeAttenuation
          transparent
          opacity={0.72}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <mesh>
        <torusGeometry args={[1.48, 0.018, 12, 260]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.38} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.86, 0.012, 10, 260]} />
        <meshBasicMaterial color="#f5f5f5" transparent opacity={0.22} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <torusGeometry args={[2.42, 0.008, 8, 260]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} blending={AdditiveBlending} depthWrite={false} />
      </mesh>

      <group ref={innerDiskRef}>
        <mesh rotation={[0, 0, Math.PI / 8]}>
          <torusGeometry args={[1.18, 0.01, 8, 180]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

function PhotonShell() {
  const shellRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (shellRef.current) {
      shellRef.current.rotation.y = elapsed * 0.18;
      shellRef.current.rotation.z = Math.sin(elapsed * 0.24) * 0.12;
    }
  });

  return (
    <group ref={shellRef}>
      <mesh>
        <sphereGeometry args={[1.02, 96, 96]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.13, 96, 96]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.055}
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.38, 96, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.035} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function ParticleHalo() {
  const pointsRef = useRef<Points>(null);
  const geometry = useMemo(() => {
    const positions: number[] = [];

    for (let index = 0; index < 1700; index += 1) {
      const angle = seededNoise(index + 83) * Math.PI * 2;
      const radius = 1.36 + seededNoise(index + 127) * 1.75;
      const height = (seededNoise(index + 211) - 0.5) * 0.22;
      const swirl = Math.sin(angle * 3) * 0.18;

      positions.push(
        Math.cos(angle) * (radius + swirl),
        height,
        Math.sin(angle) * radius * 0.42,
      );
    }

    const bufferGeometry = new BufferGeometry();
    bufferGeometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));

    return bufferGeometry;
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (pointsRef.current) {
      pointsRef.current.rotation.z = elapsed * 0.18;
      pointsRef.current.rotation.x = 1.08 + Math.sin(elapsed * 0.28) * 0.045;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#ffffff"
        size={0.018}
        sizeAttenuation
        transparent
        opacity={0.58}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function GravitationalLens() {
  const ringGeometry = useMemo(() => new TorusGeometry(1.34, 0.006, 8, 240), []);
  const lensRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (lensRef.current) {
      lensRef.current.rotation.z = elapsed * -0.08;
      lensRef.current.scale.setScalar(1 + Math.sin(elapsed * 1.1) * 0.012);
    }
  });

  return (
    <group ref={lensRef}>
      <mesh geometry={ringGeometry}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.18} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[0.12, 0.03, Math.PI / 9]}>
        <torusGeometry args={[1.72, 0.006, 8, 240]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[-0.16, 0.02, -Math.PI / 11]}>
        <torusGeometry args={[2.12, 0.004, 8, 240]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.075} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function BlackHoleScene() {
  const sceneRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (sceneRef.current) {
      sceneRef.current.rotation.y = Math.sin(elapsed * 0.16) * 0.18;
      sceneRef.current.rotation.x = -0.18 + Math.sin(elapsed * 0.2) * 0.04;
    }
  });

  return (
    <group ref={sceneRef} rotation={[-0.18, 0, -0.08]}>
      <ambientLight intensity={0.18} />
      <pointLight position={[-3.4, 1.8, 3]} intensity={2.3} color="#ffffff" />
      <pointLight position={[3, -1.7, 2.2]} intensity={1.4} color="#d7d7d7" />
      <ParticleHalo />
      <AccretionDisk />
      <GravitationalLens />
      <PhotonShell />
    </group>
  );
}

export default function BlackHoleModel() {
  return (
    <Canvas camera={{ position: [0, 0, 5.2], fov: 34 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <BlackHoleScene />
    </Canvas>
  );
}
