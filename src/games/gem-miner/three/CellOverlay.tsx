import * as THREE from 'three';
import type { CellModifier } from '../types';

interface CellOverlayProps {
  position: [number, number, number];
  modifier: CellModifier;
  cellSize: number;
}

// Shared cached materials - created once
const materials = {
  ice: new THREE.MeshStandardMaterial({
    color: '#88ccff',
    transparent: true,
    opacity: 0.5,
    roughness: 0.2,
  }),
  dirt: new THREE.MeshStandardMaterial({
    color: '#8B4513',
    roughness: 0.9,
  }),
  rock: new THREE.MeshStandardMaterial({
    color: '#555555',
    roughness: 0.8,
  }),
  bedrock: new THREE.MeshStandardMaterial({
    color: '#222222',
    roughness: 0.95,
  }),
  locked: new THREE.MeshStandardMaterial({
    color: '#666666',
    metalness: 0.8,
    roughness: 0.3,
  }),
};

// Shared geometries
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const barGeo = new THREE.BoxGeometry(1, 0.06, 0.06);

export function CellOverlay({ position, modifier, cellSize }: CellOverlayProps) {
  const size = cellSize * 0.85;

  if (modifier === 'none') return null;

  if (modifier === 'locked') {
    return (
      <group position={[position[0], position[1], position[2] + 0.4]}>
        <mesh rotation={[0, 0, Math.PI / 4]} geometry={barGeo} material={materials.locked} scale={[size * 1.2, 1, 1]} />
        <mesh rotation={[0, 0, -Math.PI / 4]} geometry={barGeo} material={materials.locked} scale={[size * 1.2, 1, 1]} />
      </group>
    );
  }

  const material = materials[modifier];
  const zOffset = modifier === 'ice' ? 0.35 : modifier === 'dirt' ? 0.25 : 0.2;
  const depth = modifier === 'ice' ? 0.12 : modifier === 'dirt' ? 0.18 : 0.45;

  return (
    <mesh
      position={[position[0], position[1], position[2] + zOffset]}
      geometry={boxGeo}
      material={material}
      scale={[size, size, depth]}
    />
  );
}
