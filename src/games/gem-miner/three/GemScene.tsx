import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import type { Gem } from '../types';
import { GemBoard3D } from './GemBoard3D';

interface GemSceneProps {
  grid: (Gem | null)[][];
  selectedGem: { row: number; col: number } | null;
  matchedGems: Set<string>;
  onGemClick: (row: number, col: number) => void;
  onSwipe: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  className?: string;
}

// Loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

// Lighting setup
function Lights() {
  return (
    <>
      {/* Main key light - warm */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        color="#fff5e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light - cool blue */}
      <directionalLight
        position={[-5, 3, -3]}
        intensity={0.5}
        color="#e0e8ff"
      />

      {/* Rim light for sparkle */}
      <pointLight
        position={[0, 5, -5]}
        intensity={0.8}
        color="#ffffff"
      />

      {/* Ambient for base illumination */}
      <ambientLight intensity={0.3} color="#8888aa" />

      {/* Colored accent lights for gem highlights */}
      <pointLight position={[-3, 2, 3]} intensity={0.3} color="#ff4444" distance={8} />
      <pointLight position={[3, 2, 3]} intensity={0.3} color="#4444ff" distance={8} />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#44ff44" distance={8} />
    </>
  );
}

// Post-processing effects
function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0005, 0.0005)}
      />
    </EffectComposer>
  );
}

export function GemScene({
  grid,
  selectedGem,
  matchedGems,
  onGemClick,
  onSwipe,
  className = '',
}: GemSceneProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // Camera distance based on grid size
  const maxDim = Math.max(rows, cols);
  const cameraZ = maxDim * 1.2 + 2;

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [0, 0, cameraZ],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Environment map for realistic reflections */}
          <Environment preset="night" />

          {/* Lighting */}
          <Lights />

          {/* Contact shadows under the board */}
          <ContactShadows
            position={[0, -rows * 0.5 - 0.5, 0]}
            opacity={0.4}
            scale={maxDim * 2}
            blur={2}
            far={10}
          />

          {/* The game board */}
          <GemBoard3D
            grid={grid}
            selectedGem={selectedGem}
            matchedGems={matchedGems}
            onGemClick={onGemClick}
            onSwipe={onSwipe}
            cellSize={1}
          />

          {/* Post-processing effects */}
          <Effects />
        </Suspense>

        {/* Camera controls - disabled for game (can enable for debug) */}
        {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
      </Canvas>
    </div>
  );
}
