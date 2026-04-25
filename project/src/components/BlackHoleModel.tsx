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

function AccretionDisk() {
  const diskRef = useRef<Group>(null);
  const innerDiskRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (diskRef.current) {
      diskRef.current.rotation.z = elapsed * 0.42;
      diskRef.current.rotation.x = 1.13 + Math.sin(elapsed * 0.35) * 0.03;
    }

    if (innerDiskRef.current) {
      innerDiskRef.current.rotation.z = -elapsed * 0.68;
    }
  });

  return (
    <group ref={diskRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.055, 16, 220]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.88} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.52, 0.035, 12, 220]} />
        <meshBasicMaterial color="#cfcfcf" transparent opacity={0.44} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.1, 0.026, 12, 220]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} blending={AdditiveBlending} />
      </mesh>

      <group ref={innerDiskRef}>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 9]}>
          <torusGeometry args={[1.22, 0.018, 10, 160]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} blending={AdditiveBlending} />
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
        <sphereGeometry args={[1.09, 96, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} side={DoubleSide} blending={AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.26, 96, 96]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.045} blending={AdditiveBlending} />
      </mesh>
    </group>
  );
}

function ParticleHalo() {
  const pointsRef = useRef<Points>(null);
  const geometry = useMemo(() => {
    const positions: number[] = [];

    for (let index = 0; index < 1300; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.42 + Math.random() * 1.55;
      const height = (Math.random() - 0.5) * 0.24;
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
        opacity={0.72}
        blending={AdditiveBlending}
      />
    </points>
  );
}

function GravitationalLens() {
  const ringGeometry = useMemo(() => new TorusGeometry(1.34, 0.009, 8, 180), []);
  const lensRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (lensRef.current) {
      lensRef.current.rotation.z = elapsed * -0.22;
      lensRef.current.scale.setScalar(1 + Math.sin(elapsed * 1.4) * 0.015);
    }
  });

  return (
    <group ref={lensRef}>
      <mesh geometry={ringGeometry} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 2.75, 0, Math.PI / 7]}>
        <torusGeometry args={[1.68, 0.011, 8, 190]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.32} blending={AdditiveBlending} />
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
    <Canvas camera={{ position: [0, 0, 5.2], fov: 36 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <BlackHoleScene />
    </Canvas>
  );
}
