import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { GemType, SpecialGemType } from '../types';
import { getGemMaterial, gemMaterialConfigs } from './materials';
import { getGemGeometry, createGlowGeometry } from './geometries';

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

// Spring physics constants
const SPRING_STIFFNESS = 320;
const SPRING_DAMPING = 62;
const SPRING_MASS = 4.0;

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
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const specialRef = useRef<THREE.Group>(null);

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
    // Hint pulse
    hintPhase: 0,
    // Special effects
    specialPhase: 0,
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

  // Selection ring material
  const ringMaterial = useMemo(() => {
    const config = gemMaterialConfigs[type];
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.color),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
  }, [type]);

  // Special gem effect materials
  const stripeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.6,
    });
  }, []);

  const bombGlowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#ff4400',
      transparent: true,
      opacity: 0.5,
      side: THREE.BackSide,
    });
  }, []);

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

    // Rotation - constant slow spin + faster when selected or hinted
    const baseRotSpeed = state.rotVel;
    const selectBoost = isSelected ? 2 : isHinted ? 1 : 0;
    state.rotY += (baseRotSpeed + selectBoost) * dt;

    // Hint pulse animation
    if (isHinted) {
      state.hintPhase += dt * 4;
    } else {
      state.hintPhase = 0;
    }

    // Special effects phase
    state.specialPhase += dt * 3;

    // Apply transforms
    const hintPulse = isHinted ? 1 + Math.sin(state.hintPhase) * 0.08 : 1;
    const bounceScale = isSelected ? 1.15 : 1;
    const finalScale = state.scale * bounceScale * hintPulse;

    meshRef.current.position.set(state.posX, state.posY, state.posZ);
    meshRef.current.rotation.y = state.rotY;
    meshRef.current.scale.setScalar(finalScale);

    // Selection ring
    if (ringRef.current) {
      ringRef.current.position.set(state.posX, state.posY, state.posZ - 0.35);
      ringRef.current.rotation.x = -Math.PI / 2;

      // Animate ring
      const targetRingOpacity = isSelected ? 0.7 : 0;
      ringMaterial.opacity += (targetRingOpacity - ringMaterial.opacity) * dt * 10;

      // Pulse scale when selected
      const ringPulse = isSelected ? 1 + Math.sin(state.specialPhase * 2) * 0.1 : 1;
      ringRef.current.scale.setScalar(ringPulse);
    }

    // Glow effect
    if (glowRef.current) {
      glowRef.current.position.copy(meshRef.current.position);
      glowRef.current.rotation.copy(meshRef.current.rotation);
      glowRef.current.scale.setScalar(finalScale * 1.15);

      // Animate glow opacity - pulsing for hints
      let targetGlow = isMatched ? 0.8 : isSelected ? 0.5 : 0;
      if (isHinted) {
        targetGlow = 0.3 + Math.sin(state.hintPhase) * 0.3;
      }
      glowMaterial.opacity += (targetGlow - glowMaterial.opacity) * dt * 10;
    }

    // Special gem effects
    if (specialRef.current) {
      specialRef.current.position.copy(meshRef.current.position);
      specialRef.current.rotation.y = state.rotY;
      specialRef.current.scale.setScalar(finalScale);

      // Bomb pulsing
      if (special === 'bomb') {
        bombGlowMaterial.opacity = 0.3 + Math.sin(state.specialPhase * 2) * 0.2;
      }
    }

    // Update material emissive for match/hint effect
    if (isMatched) {
      state.dissolve += dt * 3;
      material.emissiveIntensity = 0.3 + state.dissolve * 2;
      material.opacity = Math.max(0, 1 - state.dissolve);
    } else {
      state.dissolve = 0;
      const hintEmissive = isHinted ? 0.4 + Math.sin(state.hintPhase) * 0.2 : 0;
      material.emissiveIntensity = isSelected ? 0.6 : 0.3 + hintEmissive;
      material.opacity = 1;
    }

    // Prismatic rainbow effect
    if (special === 'prismatic' && material.iridescence !== undefined) {
      material.iridescence = 0.8 + Math.sin(state.specialPhase) * 0.2;
    }
  });

  return (
    <group>
      {/* Selection ring under the gem */}
      <mesh ref={ringRef} renderOrder={-1}>
        <ringGeometry args={[0.35, 0.45, 32]} />
        <primitive object={ringMaterial} attach="material" />
      </mesh>

      {/* Glow mesh (rendered behind) */}
      <mesh
        ref={glowRef}
        geometry={glowGeometry}
        material={glowMaterial}
        renderOrder={0}
      />

      {/* Special gem effects */}
      {special !== 'none' && (
        <group ref={specialRef}>
          {/* Striped horizontal - white band */}
          {special === 'striped_h' && (
            <mesh>
              <boxGeometry args={[0.6, 0.1, 0.6]} />
              <primitive object={stripeMaterial} attach="material" />
            </mesh>
          )}

          {/* Striped vertical - white band */}
          {special === 'striped_v' && (
            <mesh>
              <boxGeometry args={[0.1, 0.6, 0.6]} />
              <primitive object={stripeMaterial} attach="material" />
            </mesh>
          )}

          {/* Bomb - outer glow sphere */}
          {special === 'bomb' && (
            <mesh>
              <sphereGeometry args={[0.5, 16, 16]} />
              <primitive object={bombGlowMaterial} attach="material" />
            </mesh>
          )}

          {/* Prismatic - no extra geometry, handled via material */}
        </group>
      )}

      {/* Main gem mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        renderOrder={1}
      />
    </group>
  );
}
