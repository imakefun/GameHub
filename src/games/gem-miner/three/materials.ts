import * as THREE from 'three';
import type { GemType } from '../types';

// Material configurations for each gem type
// Using MeshPhysicalMaterial for realistic gem rendering with refraction and dispersion
export const gemMaterialConfigs: Record<GemType, {
  color: string;
  emissive: string;
  transmission: number;
  thickness: number;
  roughness: number;
  metalness: number;
  ior: number;
  iridescence: number;
  iridescenceIOR: number;
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
}> = {
  ruby: {
    color: '#ff1744',
    emissive: '#330000',
    transmission: 0.92,
    thickness: 1.8,
    roughness: 0.05,
    metalness: 0,
    ior: 1.77, // Real ruby IOR
    iridescence: 0.2,
    iridescenceIOR: 1.3,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
  },
  sapphire: {
    color: '#2979ff',
    emissive: '#000033',
    transmission: 0.94,
    thickness: 1.6,
    roughness: 0.03,
    metalness: 0,
    ior: 1.77, // Real sapphire IOR
    iridescence: 0.3,
    iridescenceIOR: 1.4,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.6,
  },
  emerald: {
    color: '#00e676',
    emissive: '#003300',
    transmission: 0.88,
    thickness: 2.0,
    roughness: 0.08,
    metalness: 0,
    ior: 1.58, // Real emerald IOR
    iridescence: 0.15,
    iridescenceIOR: 1.25,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.4,
  },
  topaz: {
    color: '#ffc400',
    emissive: '#332200',
    transmission: 0.96,
    thickness: 1.4,
    roughness: 0.02,
    metalness: 0,
    ior: 1.64, // Real topaz IOR
    iridescence: 0.4,
    iridescenceIOR: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.8,
  },
  amethyst: {
    color: '#aa00ff',
    emissive: '#220033',
    transmission: 0.93,
    thickness: 1.7,
    roughness: 0.04,
    metalness: 0,
    ior: 1.55, // Real amethyst IOR
    iridescence: 0.35,
    iridescenceIOR: 1.35,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
  },
  diamond: {
    color: '#ffffff',
    emissive: '#111111',
    transmission: 0.98,
    thickness: 1.2,
    roughness: 0.0,
    metalness: 0,
    ior: 2.42, // Real diamond IOR - highest!
    iridescence: 0.6,
    iridescenceIOR: 1.6,
    clearcoat: 1,
    clearcoatRoughness: 0.0,
    envMapIntensity: 2.5,
  },
  obsidian: {
    color: '#1a1a2e',
    emissive: '#000000',
    transmission: 0.3,
    thickness: 3.0,
    roughness: 0.15,
    metalness: 0.2,
    ior: 1.5,
    iridescence: 0.1,
    iridescenceIOR: 1.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.0,
  },
};

// Create a cached material for each gem type
const materialCache = new Map<GemType, THREE.MeshPhysicalMaterial>();

export function getGemMaterial(type: GemType): THREE.MeshPhysicalMaterial {
  if (materialCache.has(type)) {
    return materialCache.get(type)!;
  }

  const config = gemMaterialConfigs[type];
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.color),
    emissive: new THREE.Color(config.emissive),
    emissiveIntensity: 0.3,
    transmission: config.transmission,
    thickness: config.thickness,
    roughness: config.roughness,
    metalness: config.metalness,
    ior: config.ior,
    iridescence: config.iridescence,
    iridescenceIOR: config.iridescenceIOR,
    clearcoat: config.clearcoat,
    clearcoatRoughness: config.clearcoatRoughness,
    envMapIntensity: config.envMapIntensity,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
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
