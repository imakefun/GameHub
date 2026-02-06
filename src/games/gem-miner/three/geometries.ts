import * as THREE from 'three';
import type { GemType } from '../types';

// Simplified gem geometries for performance
// Using low-poly primitives

// Cache geometries so we only create each once
const geometryCache = new Map<GemType, THREE.BufferGeometry>();

// Get or create geometry for a gem type
export function getGemGeometry(type: GemType): THREE.BufferGeometry {
  if (geometryCache.has(type)) {
    return geometryCache.get(type)!;
  }

  let geometry: THREE.BufferGeometry;

  // Use simple low-poly shapes for each gem type
  switch (type) {
    case 'diamond':
      geometry = new THREE.OctahedronGeometry(0.38, 0);
      break;
    case 'ruby':
      geometry = new THREE.OctahedronGeometry(0.36, 0);
      break;
    case 'sapphire':
      geometry = new THREE.DodecahedronGeometry(0.34, 0);
      break;
    case 'emerald':
      geometry = new THREE.BoxGeometry(0.5, 0.65, 0.35);
      break;
    case 'topaz':
      geometry = new THREE.BoxGeometry(0.5, 0.5, 0.35);
      break;
    case 'amethyst':
      geometry = new THREE.CylinderGeometry(0.32, 0.32, 0.5, 6);
      break;
    case 'obsidian':
      geometry = new THREE.TetrahedronGeometry(0.4, 0);
      break;
    default:
      geometry = new THREE.IcosahedronGeometry(0.35, 0);
  }

  geometry.center();
  geometryCache.set(type, geometry);
  return geometry;
}

// Create a glow geometry (slightly larger version for outline effect)
export function createGlowGeometry(baseGeometry: THREE.BufferGeometry, scale = 1.15): THREE.BufferGeometry {
  const glow = baseGeometry.clone();
  glow.scale(scale, scale, scale);
  return glow;
}
