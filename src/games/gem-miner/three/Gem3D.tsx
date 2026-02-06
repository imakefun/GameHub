import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { GemType, SpecialGemType } from '../types';
import { getGemMaterial } from './materials';
import { getGemGeometry } from './geometries';

interface Gem3DProps {
  type: GemType;
  special: SpecialGemType;
  position: [number, number, number];
  targetPosition: [number, number, number];
  isSelected: boolean;
  isMatched: boolean;
  isHinted: boolean;
  isFailed: boolean;
  isNew: boolean;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
}

// Fast lerp for snappy animations
const LERP_SPEED = 18;

export function Gem3D({
  type,
  special,
  position,
  targetPosition,
  isSelected,
  isMatched,
  isHinted,
  isFailed,
  isNew,
  onPointerDown,
}: Gem3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animation state - mutated directly for performance
  const animState = useRef({
    posX: position[0],
    posY: position[1],
    posZ: position[2],
    scale: isNew ? 0.01 : 1,
    shakeTime: 0,
  });

  const geometry = useMemo(() => getGemGeometry(type), [type]);

  // Create material once, configure based on special type
  const material = useMemo(() => {
    const mat = getGemMaterial(type).clone();
    // Set special gem colors at creation time
    if (special === 'bomb') {
      mat.emissive.offsetHSL(0, 0.2, 0.1);
      mat.emissiveIntensity = 0.6;
    } else if (special === 'prismatic') {
      mat.emissive.setHSL(0.5, 0.8, 0.4);
      mat.emissiveIntensity = 0.7;
    } else if (special === 'striped_h' || special === 'striped_v') {
      mat.emissiveIntensity = 0.5;
    }
    return mat;
  }, [type, special]);

  // Minimal useFrame - only position and scale, no rotation
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const state = animState.current;
    const dt = Math.min(delta, 0.033);

    // Fast lerp position
    const lerpFactor = 1 - Math.exp(-LERP_SPEED * dt);
    state.posX += (targetPosition[0] - state.posX) * lerpFactor;
    state.posY += (targetPosition[1] - state.posY) * lerpFactor;
    state.posZ += (targetPosition[2] - state.posZ) * lerpFactor;

    // Scale animation
    const targetScale = isMatched ? 0 : (isSelected ? 1.15 : (isHinted ? 1.08 : 1));
    state.scale += (targetScale - state.scale) * lerpFactor * 1.5;

    // Shake animation for failed swaps
    let shakeOffsetX = 0;
    if (isFailed) {
      state.shakeTime += dt * 40; // Fast shake frequency
      shakeOffsetX = Math.sin(state.shakeTime) * 0.12 * Math.exp(-state.shakeTime * 0.15);
    } else {
      state.shakeTime = 0;
    }

    // Apply transforms - no rotation
    meshRef.current.position.set(state.posX + shakeOffsetX, state.posY, state.posZ);
    meshRef.current.scale.setScalar(Math.max(0.01, state.scale));
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      onPointerDown={onPointerDown}
    />
  );
}
