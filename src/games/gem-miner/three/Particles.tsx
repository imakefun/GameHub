import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GemType } from '../types';
import { gemMaterialConfigs } from './materials';

interface ParticleSystemProps {
  // Array of burst events: { position, color, count }
  bursts: Array<{
    id: string;
    position: [number, number, number];
    gemType: GemType;
    timestamp: number;
  }>;
}

// Single particle data
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

const MAX_PARTICLES = 500;
const PARTICLE_LIFETIME = 1.5; // seconds

export function ParticleSystem({ bursts }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particles = useRef<Particle[]>([]);
  const processedBursts = useRef<Set<string>>(new Set());

  // Create geometry with positions, colors, and sizes
  const { geometry, positions, colors, sizes } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(MAX_PARTICLES * 3);
    const col = new Float32Array(MAX_PARTICLES * 3);
    const siz = new Float32Array(MAX_PARTICLES);

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(siz, 1));

    return { geometry: geo, positions: pos, colors: col, sizes: siz };
  }, []);

  // Shader material for particles
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Process new bursts
  useEffect(() => {
    for (const burst of bursts) {
      if (processedBursts.current.has(burst.id)) continue;
      processedBursts.current.add(burst.id);

      // Spawn particles for this burst
      const config = gemMaterialConfigs[burst.gemType];
      const color = new THREE.Color(config.color);
      const count = 20 + Math.floor(Math.random() * 10);

      for (let i = 0; i < count && particles.current.length < MAX_PARTICLES; i++) {
        // Random direction with upward bias
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.6; // More upward
        const speed = 2 + Math.random() * 3;

        const particle: Particle = {
          position: new THREE.Vector3(
            burst.position[0],
            burst.position[1],
            burst.position[2] + 0.1
          ),
          velocity: new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * speed,
            Math.sin(phi) * Math.sin(theta) * speed + 1, // Upward bias
            Math.cos(phi) * speed * 0.5
          ),
          color: color.clone(),
          size: 0.1 + Math.random() * 0.15,
          life: PARTICLE_LIFETIME,
          maxLife: PARTICLE_LIFETIME,
        };

        particles.current.push(particle);
      }

      // Clean up old processed bursts
      if (processedBursts.current.size > 100) {
        const arr = Array.from(processedBursts.current);
        arr.slice(0, 50).forEach(id => processedBursts.current.delete(id));
      }
    }
  }, [bursts]);

  // Update particles each frame
  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const dt = Math.min(delta, 0.05);
    const gravity = -8;

    // Update existing particles
    particles.current = particles.current.filter((p, i) => {
      p.life -= dt;
      if (p.life <= 0) return false;

      // Physics
      p.velocity.y += gravity * dt;
      p.position.add(p.velocity.clone().multiplyScalar(dt));

      // Fade out
      const lifeRatio = p.life / p.maxLife;

      // Update buffer attributes
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;

      colors[i * 3] = p.color.r;
      colors[i * 3 + 1] = p.color.g;
      colors[i * 3 + 2] = p.color.b;

      sizes[i] = p.size * lifeRatio;

      return true;
    });

    // Clear unused slots
    for (let i = particles.current.length; i < MAX_PARTICLES; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -1000; // Hide off-screen
      positions[i * 3 + 2] = 0;
      sizes[i] = 0;
    }

    // Mark attributes as needing update
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}

// Sparkle effect for idle gems
interface SparkleProps {
  position: [number, number, number];
  color: string;
  intensity?: number;
}

export function Sparkle({ position, color, intensity = 1 }: SparkleProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.scale.setScalar((0.5 + Math.sin(t * 3) * 0.3) * intensity);
    ref.current.rotation.z = t * 2;
  });

  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[0.1, 0.1]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
