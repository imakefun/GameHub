import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CellModifier } from '../types';

interface CellOverlayProps {
  position: [number, number, number];
  modifier: CellModifier;
  cellSize: number;
}

// Ice overlay - translucent blue crystalline surface
function IceOverlay({ position, cellSize }: { position: [number, number, number]; cellSize: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    // Subtle shimmer effect
    const t = state.clock.elapsedTime;
    (ref.current.material as THREE.MeshPhysicalMaterial).opacity = 0.6 + Math.sin(t * 2) * 0.1;
  });

  return (
    <mesh ref={ref} position={[position[0], position[1], position[2] + 0.35]}>
      <boxGeometry args={[cellSize * 0.9, cellSize * 0.9, 0.15]} />
      <meshPhysicalMaterial
        color="#88ccff"
        transparent
        opacity={0.6}
        roughness={0.1}
        metalness={0.1}
        transmission={0.3}
        thickness={0.5}
        clearcoat={1}
      />
    </mesh>
  );
}

// Dirt overlay - brown earthy layer
function DirtOverlay({ position, cellSize }: { position: [number, number, number]; cellSize: number }) {
  return (
    <mesh position={[position[0], position[1], position[2] + 0.25]}>
      <boxGeometry args={[cellSize * 0.85, cellSize * 0.85, 0.2]} />
      <meshStandardMaterial
        color="#8B4513"
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}

// Rock overlay - solid stone block (gem hidden behind)
function RockOverlay({ position, cellSize }: { position: [number, number, number]; cellSize: number }) {
  return (
    <mesh position={[position[0], position[1], position[2] + 0.2]}>
      <boxGeometry args={[cellSize * 0.88, cellSize * 0.88, 0.5]} />
      <meshStandardMaterial
        color="#555555"
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

// Bedrock - unbreakable stone
function BedrockOverlay({ position, cellSize }: { position: [number, number, number]; cellSize: number }) {
  return (
    <mesh position={[position[0], position[1], position[2] + 0.2]}>
      <boxGeometry args={[cellSize * 0.9, cellSize * 0.9, 0.5]} />
      <meshStandardMaterial
        color="#222222"
        roughness={0.95}
        metalness={0.1}
      />
    </mesh>
  );
}

// Locked overlay - chain/lock effect
function LockedOverlay({ position, cellSize }: { position: [number, number, number]; cellSize: number }) {
  return (
    <group position={[position[0], position[1], position[2] + 0.4]}>
      {/* Cross bars */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[cellSize * 1.1, 0.08, 0.08]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[cellSize * 1.1, 0.08, 0.08]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function CellOverlay({ position, modifier, cellSize }: CellOverlayProps) {
  switch (modifier) {
    case 'ice':
      return <IceOverlay position={position} cellSize={cellSize} />;
    case 'dirt':
      return <DirtOverlay position={position} cellSize={cellSize} />;
    case 'rock':
      return <RockOverlay position={position} cellSize={cellSize} />;
    case 'bedrock':
      return <BedrockOverlay position={position} cellSize={cellSize} />;
    case 'locked':
      return <LockedOverlay position={position} cellSize={cellSize} />;
    default:
      return null;
  }
}
