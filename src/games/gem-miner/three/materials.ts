import * as THREE from 'three';
import type { GemType } from '../types';

// Simplified material configs for performance
// Using MeshStandardMaterial instead of MeshPhysicalMaterial
export const gemMaterialConfigs: Record<GemType, {
  color: string;
  emissive: string;
  roughness: number;
  metalness: number;
}> = {
  ruby: {
    color: '#ff2244',
    emissive: '#440000',
    roughness: 0.2,
    metalness: 0.3,
  },
  sapphire: {
    color: '#3388ff',
    emissive: '#000044',
    roughness: 0.2,
    metalness: 0.3,
  },
  emerald: {
    color: '#22dd66',
    emissive: '#003311',
    roughness: 0.2,
    metalness: 0.3,
  },
  topaz: {
    color: '#ffcc00',
    emissive: '#332200',
    roughness: 0.2,
    metalness: 0.3,
  },
  amethyst: {
    color: '#bb44ff',
    emissive: '#220033',
    roughness: 0.2,
    metalness: 0.3,
  },
  diamond: {
    color: '#eeeeff',
    emissive: '#222233',
    roughness: 0.1,
    metalness: 0.5,
  },
  obsidian: {
    color: '#333344',
    emissive: '#000000',
    roughness: 0.3,
    metalness: 0.4,
  },
};

// Create a cached material for each gem type
const materialCache = new Map<GemType, THREE.MeshStandardMaterial>();

export function getGemMaterial(type: GemType): THREE.MeshStandardMaterial {
  if (materialCache.has(type)) {
    return materialCache.get(type)!;
  }

  const config = gemMaterialConfigs[type];
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.color),
    emissive: new THREE.Color(config.emissive),
    emissiveIntensity: 0.4,
    roughness: config.roughness,
    metalness: config.metalness,
  });

  materialCache.set(type, material);
  return material;
}

// Glow material for matching/selected effects
export function createGlowMaterial(color: string): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.4,
    side: THREE.BackSide,
  });
}
