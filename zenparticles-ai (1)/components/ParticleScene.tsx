
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleConfig } from '../types';

// Define intrinsic Three.js elements as constants to resolve TypeScript "Property X does not exist on type 'JSX.IntrinsicElements'" errors.
const Points = 'points' as any;
const BufferGeometry = 'bufferGeometry' as any;
const BufferAttribute = 'bufferAttribute' as any;
const PointsMaterial = 'pointsMaterial' as any;
const Color = 'color' as any;
const AmbientLight = 'ambientLight' as any;

const ParticleSystem: React.FC<{ config: ParticleConfig; breathingScale: number }> = ({ config, breathingScale }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.PointsMaterial>(null!);
  const { viewport } = useThree();
  const mouse = useRef(new THREE.Vector2(0, 0));

  // Only re-generate initial particle data if count or colors change.
  const particles = useMemo(() => {
    const temp = new Float32Array(config.count * 3);
    const colors = new Float32Array(config.count * 3);
    const velocities = new Float32Array(config.count * 3);
    
    const color1 = new THREE.Color(config.colorPrimary);
    const color2 = new THREE.Color(config.colorSecondary);

    for (let i = 0; i < config.count; i++) {
      const i3 = i * 3;
      // Random position in a sphere
      const r = 5 * Math.pow(Math.random(), 0.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      temp[i3] = r * Math.sin(phi) * Math.cos(theta);
      temp[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      temp[i3 + 2] = r * Math.cos(phi);

      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return { positions: temp, colors, velocities };
  }, [config.count, config.colorPrimary, config.colorSecondary]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    const { positions, velocities } = particles;
    const time = state.clock.getElapsedTime();
    const count = config.count;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Basic movement
      positions[i3] += velocities[i3] * config.speed;
      positions[i3 + 1] += velocities[i3 + 1] * config.speed;
      positions[i3 + 2] += velocities[i3 + 2] * config.speed;

      // Turbulence/Noise-like drift
      positions[i3] += Math.sin(time * 0.5 + positions[i3+1]) * 0.002 * config.turbulence;
      positions[i3+1] += Math.cos(time * 0.5 + positions[i3]) * 0.002 * config.turbulence;

      // Mouse interaction
      const targetX = mouse.current.x * viewport.width / 2;
      const targetY = mouse.current.y * viewport.height / 2;
      
      const dx = targetX - positions[i3];
      const dy = targetY - positions[i3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) {
        const force = (2 - dist) * 0.01;
        if (config.interactionMode === 'attract') {
          positions[i3] += dx * force;
          positions[i3 + 1] += dy * force;
        } else if (config.interactionMode === 'repel') {
          positions[i3] -= dx * force;
          positions[i3 + 1] -= dy * force;
        }
      }

      // Keep within bounds
      const bound = 8;
      if (Math.abs(positions[i3]) > bound) positions[i3] *= -0.9;
      if (Math.abs(positions[i3 + 1]) > bound) positions[i3 + 1] *= -0.9;
      if (Math.abs(positions[i3 + 2]) > bound) positions[i3 + 2] *= -0.9;
    }
    
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      // Breathing pulse (scale)
      pointsRef.current.scale.setScalar(breathingScale);

      // Visual color shift: Lerp material color based on breathing scale
      // When scale is high (inhale/peak), shift towards a bright white/cyan highlight
      const shiftIntensity = Math.max(0, (breathingScale - 1) / 1.2);
      if (materialRef.current) {
        materialRef.current.color.setRGB(
          1 + shiftIntensity * 0.3, 
          1 + shiftIntensity * 0.5, 
          1 + shiftIntensity * 0.7
        );
      }
    }
  });

  return (
    <Points ref={pointsRef}>
      <BufferGeometry>
        <BufferAttribute
          attach="attributes-position"
          count={config.count}
          array={particles.positions}
          itemSize={3}
        />
        <BufferAttribute
          attach="attributes-color"
          count={config.count}
          array={particles.colors}
          itemSize={3}
        />
      </BufferGeometry>
      <PointsMaterial
        ref={materialRef}
        size={config.size}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </Points>
  );
};

const ParticleScene: React.FC<{ config: ParticleConfig; breathingScale: number }> = ({ config, breathingScale }) => {
  return (
    <div className="fixed inset-0 z-0 bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Color attach="background" args={['#050505']} />
        <AmbientLight intensity={0.5} />
        <ParticleSystem key={config.count} config={config} breathingScale={breathingScale} />
      </Canvas>
    </div>
  );
};

export default ParticleScene;
