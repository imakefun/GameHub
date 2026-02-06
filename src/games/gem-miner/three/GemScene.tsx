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
  failedGems: Set<string>;
  onGemClick: (row: number, col: number) => void;
  onSwipe: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  className?: string;
}

// Minimal lighting
function Lights() {
  return (
    <>
      <directionalLight position={[3, 5, 5]} intensity={1} />
      <ambientLight intensity={0.6} />
    </>
  );
}

export function GemScene({
  grid,
  selectedGem,
  matchedGems,
  hintedGems,
  failedGems,
  onGemClick,
  onSwipe,
  className = '',
}: GemSceneProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const cellSize = 1;

  // Camera closer for larger board appearance
  const maxDim = Math.max(rows, cols);
  const cameraZ = maxDim * 0.9 + 1;

  return (
    <div className={`w-full h-full ${className}`} style={{ touchAction: 'none' }}>
      <Canvas
        dpr={1}
        camera={{
          position: [0, 0, cameraZ],
          fov: 55,
          near: 0.1,
          far: 50,
        }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
          precision: 'lowp',
        }}
      >
        <Suspense fallback={null}>
          <Lights />
          <GemBoard3D
            grid={grid}
            selectedGem={selectedGem}
            matchedGems={matchedGems}
            hintedGems={hintedGems}
            failedGems={failedGems}
            onGemClick={onGemClick}
            onSwipe={onSwipe}
            cellSize={cellSize}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
