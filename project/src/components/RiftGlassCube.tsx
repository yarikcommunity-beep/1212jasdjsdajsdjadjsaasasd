'use client';

import { OrbitControls, MeshTransmissionMaterial } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';

function CubeModel() {
  const cubeRef = useRef<Mesh>(null);
  const frameRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (cubeRef.current) {
      cubeRef.current.rotation.x = elapsed * 0.28;
      cubeRef.current.rotation.y = elapsed * 0.42;
      cubeRef.current.position.y = Math.sin(elapsed * 0.9) * 0.08;
    }

    if (frameRef.current) {
      frameRef.current.rotation.x = -elapsed * 0.18;
      frameRef.current.rotation.y = elapsed * 0.24;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 5]} intensity={1.4} />
      <pointLight position={[-4, -3, 3]} intensity={3} color="#ffffff" />
      <spotLight angle={0.35} intensity={6} penumbra={0.9} position={[0, 0, 7]} />

      <mesh ref={cubeRef}>
        <boxGeometry args={[2.25, 2.25, 2.25, 48, 48, 48]} />
        <MeshTransmissionMaterial
          anisotropicBlur={0.35}
          backside
          backsideThickness={0.35}
          chromaticAberration={0.02}
          clearcoat={1}
          distortion={0.72}
          distortionScale={0.82}
          ior={1.6}
          metalness={0.08}
          roughness={0.11}
          samples={8}
          temporalDistortion={0.2}
          thickness={0.45}
          transmission={0.98}
        />
      </mesh>

      <mesh ref={frameRef}>
        <boxGeometry args={[2.55, 2.55, 2.55]} />
        <meshBasicMaterial wireframe color="#ffffff" transparent opacity={0.18} />
      </mesh>
    </>
  );
}

export default function RiftGlassCube() {
  return (
    <div className="cube-stage" aria-label="3D transparent ribbed glass cube">
      <Canvas camera={{ position: [0, 0, 6.2], fov: 38 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <CubeModel />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
      </Canvas>
      <div className="cube-scanlines" />
    </div>
  );
}
