import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { GemType, SpecialGemType } from '../types';
import { getGemMaterial, gemMaterialConfigs } from './materials';
import { getGemGeometry } from './geometries';

interface Gem3DProps {
  type: GemType;
  special: SpecialGemType;
  position: [number, number, number];
  targetPosition: [number, number, number];
  isSelected: boolean;
  isMatched: boolean;
  isHinted: boolean;
  isNew: boolean;
  onClick?: () => void;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
}

// Faster spring physics - less iterations, higher stiffness
const LERP_SPEED = 12;

export function Gem3D({
  type,
  special,
  position,
  targetPosition,
  isSelected,
  isMatched,
  isHinted,
  isNew,
  onClick,
  onPointerDown,
  onPointerUp,
}: Gem3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animation state - mutated directly for performance
  const animState = useRef({
    posX: position[0],
    posY: position[1],
    posZ: position[2],
    scale: isNew ? 0.01 : 1,
    rotY: Math.random() * Math.PI * 2,
    time: 0,
  });

  const geometry = useMemo(() => getGemGeometry(type), [type]);
  const material = useMemo(() => getGemMaterial(type).clone(), [type]);
  const baseEmissive = useMemo(() => new THREE.Color(gemMaterialConfigs[type].emissive), [type]);

  // Simple lerp-based animation - much faster than spring physics
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const state = animState.current;
    const dt = Math.min(delta, 0.05);
    state.time += dt;

    // Lerp position toward target
    const lerpFactor = 1 - Math.exp(-LERP_SPEED * dt);
    state.posX += (targetPosition[0] - state.posX) * lerpFactor;
    state.posY += (targetPosition[1] - state.posY) * lerpFactor;
    state.posZ += (targetPosition[2] - state.posZ) * lerpFactor;

    // Scale animation
    const targetScale = isMatched ? 0 : 1;
    state.scale += (targetScale - state.scale) * lerpFactor * 2;

    // Slow rotation
    state.rotY += dt * 0.5;

    // Apply transforms
    const hintPulse = isHinted ? 1 + Math.sin(state.time * 6) * 0.1 : 1;
    const selectScale = isSelected ? 1.2 : 1;
    const finalScale = Math.max(0.01, state.scale * selectScale * hintPulse);

    meshRef.current.position.set(state.posX, state.posY, state.posZ);
    meshRef.current.rotation.y = state.rotY;
    meshRef.current.scale.setScalar(finalScale);

    // Update emissive for visual feedback
    const emissiveIntensity = isSelected ? 1.5 : isHinted ? 0.8 + Math.sin(state.time * 6) * 0.4 : 0.4;
    material.emissiveIntensity = emissiveIntensity;

    // Special gem tint
    if (special === 'bomb') {
      material.emissive.setRGB(
        baseEmissive.r + 0.3,
        baseEmissive.g,
        baseEmissive.b
      );
    } else if (special === 'prismatic') {
      const hue = (state.time * 0.5) % 1;
      material.emissive.setHSL(hue, 0.8, 0.3);
    } else if (special === 'striped_h' || special === 'striped_v') {
      material.emissive.setRGB(
        baseEmissive.r + 0.2,
        baseEmissive.g + 0.2,
        baseEmissive.b + 0.2
      );
    } else {
      material.emissive.copy(baseEmissive);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    />
  );
}
