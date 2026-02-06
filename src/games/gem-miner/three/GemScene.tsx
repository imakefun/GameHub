import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import type { Gem } from '../types';
import { GemBoard3D } from './GemBoard3D';

interface GemSceneProps {
  grid: (Gem | null)[][];
  selectedGem: { row: number; col: number } | null;
  matchedGems: Set<string>;
  hintedGems: Set<string>;
  onGemClick: (row: number, col: number) => void;
  onSwipe: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  className?: string;
}

// Simple, fast lighting - no shadows
function Lights() {
  return (
    <>
      {/* Single directional light */}
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      {/* Fill light */}
      <directionalLight position={[-3, 2, 3]} intensity={0.4} color="#aaccff" />
      {/* Ambient */}
      <ambientLight intensity={0.5} />
    </>
  );
}

export function GemScene({
  grid,
  selectedGem,
  matchedGems,
  hintedGems,
  onGemClick,
  onSwipe,
  className = '',
}: GemSceneProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const cellSize = 1;

  // Camera distance based on grid size
  const maxDim = Math.max(rows, cols);
  const cameraZ = maxDim * 1.2 + 2;

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        dpr={1} // Force 1x pixel ratio for performance
        camera={{
          position: [0, 0, cameraZ],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: false, // Disable for performance
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <Suspense fallback={null}>
          <Lights />
          <GemBoard3D
            grid={grid}
            selectedGem={selectedGem}
            matchedGems={matchedGems}
            hintedGems={hintedGems}
            onGemClick={onGemClick}
            onSwipe={onSwipe}
            cellSize={cellSize}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
