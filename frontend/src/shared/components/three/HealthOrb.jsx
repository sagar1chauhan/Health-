import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

export default function HealthOrb({ color = '#3B82F6', distort = 0.4, speed = 2 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <Sphere args={[1.5, 64, 64]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={distort}
            speed={speed}
            roughness={0.2}
            metalness={0.8}
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </Sphere>
      </mesh>
    </Float>
  );
}
