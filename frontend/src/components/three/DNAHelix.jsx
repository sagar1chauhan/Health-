import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DNAHelix({ count = 40, radius = 2, length = 10, color1 = '#3B82F6', color2 = '#10B981' }) {
  const groupRef = useRef();

  // Generate DNA structure geometry
  const { positions, colors } = useMemo(() => {
    const positions = [];
    const colors = [];
    const colorObj1 = new THREE.Color(color1);
    const colorObj2 = new THREE.Color(color2);

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 8; // 4 full turns
      const y = (t - 0.5) * length;

      // Strand 1
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      positions.push(x1, y, z1);
      colors.push(colorObj1.r, colorObj1.g, colorObj1.b);

      // Strand 2
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      positions.push(x2, y, z2);
      colors.push(colorObj2.r, colorObj2.g, colorObj2.b);

      // Connecting rungs (simplified as points for particle system, or we can use lines later)
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors)
    };
  }, [count, radius, length, color1, color2]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
