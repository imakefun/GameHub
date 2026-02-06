import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { GemType } from '../types';
import { getGemMaterial, gemMaterialConfigs } from './materials';
import { getGemGeometry, createGlowGeometry } from './geometries';

interface Gem3DProps {
  type: GemType;
  position: [number, number, number];
  targetPosition: [number, number, number];
  isSelected: boolean;
  isMatched: boolean;
  isNew: boolean;
  onClick?: () => void;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
}

// Spring physics constants
const SPRING_STIFFNESS = 320;
const SPRING_DAMPING = 62;
const SPRING_MASS = 4.0;

export function Gem3D({
  type,
  position,
  targetPosition,
  isSelected,
  isMatched,
  isNew,
  onClick,
  onPointerDown,
  onPointerUp,
}: Gem3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Animation state - mutated directly for performance
  const animState = useRef({
    // Position spring
    posX: position[0],
    posY: position[1],
    posZ: position[2],
    velX: 0,
    velY: isNew ? 8 : 0, // Initial drop velocity for new gems
    velZ: 0,
    // Scale spring for selection/match effects
    scale: isNew ? 0 : 1,
    scaleVel: 0,
    // Rotation
    rotY: Math.random() * Math.PI * 2,
    rotVel: 0.3 + Math.random() * 0.2,
    // Match dissolve
    dissolve: 0,
  });

  const geometry = useMemo(() => getGemGeometry(type), [type]);
  const material = useMemo(() => getGemMaterial(type), [type]);
  const glowGeometry = useMemo(() => createGlowGeometry(geometry, 1.2), [geometry]);

  const glowMaterial = useMemo(() => {
    const config = gemMaterialConfigs[type];
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.color),
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
    });
  }, [type]);

  // Spring physics simulation
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const state = animState.current;
    const dt = Math.min(delta, 0.033); // Cap delta to prevent instability

    // Position spring physics
    const targetX = targetPosition[0];
    const targetY = targetPosition[1];
    const targetZ = targetPosition[2];

    // Calculate spring forces
    const forceX = (targetX - state.posX) * SPRING_STIFFNESS;
    const forceY = (targetY - state.posY) * SPRING_STIFFNESS;
    const forceZ = (targetZ - state.posZ) * SPRING_STIFFNESS;

    // Apply damping
    const dampX = state.velX * SPRING_DAMPING;
    const dampY = state.velY * SPRING_DAMPING;
    const dampZ = state.velZ * SPRING_DAMPING;

    // Update velocity (F = ma, so a = F/m)
    state.velX += (forceX - dampX) / SPRING_MASS * dt;
    state.velY += (forceY - dampY) / SPRING_MASS * dt;
    state.velZ += (forceZ - dampZ) / SPRING_MASS * dt;

    // Update position
    state.posX += state.velX * dt;
    state.posY += state.velY * dt;
    state.posZ += state.velZ * dt;

    // Scale spring for pop-in effect
    const targetScale = isMatched ? 0 : 1;
    const scaleForce = (targetScale - state.scale) * 400;
    const scaleDamp = state.scaleVel * 40;
    state.scaleVel += (scaleForce - scaleDamp) * dt;
    state.scale += state.scaleVel * dt;
    state.scale = Math.max(0, Math.min(1.5, state.scale)); // Clamp

    // Rotation - constant slow spin + faster when selected
    const baseRotSpeed = state.rotVel;
    const selectBoost = isSelected ? 2 : 0;
    state.rotY += (baseRotSpeed + selectBoost) * dt;

    // Apply transforms
    const bounceScale = isSelected ? 1.1 : 1;
    const finalScale = state.scale * bounceScale;

    meshRef.current.position.set(state.posX, state.posY, state.posZ);
    meshRef.current.rotation.y = state.rotY;
    meshRef.current.scale.setScalar(finalScale);

    // Glow effect
    if (glowRef.current) {
      glowRef.current.position.copy(meshRef.current.position);
      glowRef.current.rotation.copy(meshRef.current.rotation);
      glowRef.current.scale.setScalar(finalScale * 1.15);

      // Animate glow opacity
      const targetGlow = isSelected ? 0.5 : isMatched ? 0.8 : 0;
      glowMaterial.opacity += (targetGlow - glowMaterial.opacity) * dt * 10;
    }

    // Update material emissive for match effect
    if (isMatched) {
      state.dissolve += dt * 3;
      material.emissiveIntensity = 0.3 + state.dissolve * 2;
      material.opacity = Math.max(0, 1 - state.dissolve);
    } else {
      state.dissolve = 0;
      material.emissiveIntensity = isSelected ? 0.6 : 0.3;
      material.opacity = 1;
    }
  });

  return (
    <group>
      {/* Glow mesh (rendered behind) */}
      <mesh
        ref={glowRef}
        geometry={glowGeometry}
        material={glowMaterial}
        renderOrder={0}
      />

      {/* Main gem mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        renderOrder={1}
      >
      </mesh>
    </group>
  );
}
