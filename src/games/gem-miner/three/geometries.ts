import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { GemType } from '../types';

// Gem geometry definitions - each gem type has a unique shape
// Using BufferGeometry for optimal performance

// Cache geometries so we only create each once
const geometryCache = new Map<GemType, THREE.BufferGeometry>();

// Brilliant cut diamond shape
function createDiamondGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.ConeGeometry(0.4, 0.5, 8);
  // Merge with top facets
  const top = new THREE.ConeGeometry(0.4, 0.25, 8);
  top.rotateX(Math.PI);
  top.translate(0, 0.125, 0);
  return mergeGeometries([geometry, top]) || geometry;
}

// Octahedron for ruby
function createRubyGeometry(): THREE.BufferGeometry {
  return new THREE.OctahedronGeometry(0.4, 0);
}

// Dodecahedron for sapphire
function createSapphireGeometry(): THREE.BufferGeometry {
  return new THREE.DodecahedronGeometry(0.38, 0);
}

// Emerald cut - elongated box with beveled edges
function createEmeraldGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const w = 0.35, h = 0.45, b = 0.08;
  shape.moveTo(-w + b, -h);
  shape.lineTo(w - b, -h);
  shape.lineTo(w, -h + b);
  shape.lineTo(w, h - b);
  shape.lineTo(w - b, h);
  shape.lineTo(-w + b, h);
  shape.lineTo(-w, h - b);
  shape.lineTo(-w, -h + b);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
}

// Topaz - cushion cut (rounded rectangle prism)
function createTopazGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.35, 2, 2, 2);
  // Apply spherical distortion for cushion effect
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z);
    const scale = 1 - 0.1 * (1 - len / 0.5);
    pos.setXYZ(i, x * scale, y * scale, z * scale);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

// Amethyst - hexagonal prism (natural crystal shape)
function createAmethystGeometry(): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(0.35, 0.35, 0.55, 6);
}

// Obsidian - irregular sharp geometry
function createObsidianGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.TetrahedronGeometry(0.45, 0);
  // Elongate slightly
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, pos.getY(i) * 1.3);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

// Get or create geometry for a gem type
export function getGemGeometry(type: GemType): THREE.BufferGeometry {
  if (geometryCache.has(type)) {
    return geometryCache.get(type)!;
  }

  let geometry: THREE.BufferGeometry;

  switch (type) {
    case 'diamond':
      geometry = createDiamondGeometry();
      break;
    case 'ruby':
      geometry = createRubyGeometry();
      break;
    case 'sapphire':
      geometry = createSapphireGeometry();
      break;
    case 'emerald':
      geometry = createEmeraldGeometry();
      break;
    case 'topaz':
      geometry = createTopazGeometry();
      break;
    case 'amethyst':
      geometry = createAmethystGeometry();
      break;
    case 'obsidian':
      geometry = createObsidianGeometry();
      break;
    default:
      geometry = new THREE.IcosahedronGeometry(0.4, 0);
  }

  // Center the geometry
  geometry.center();
  geometry.computeBoundingSphere();

  geometryCache.set(type, geometry);
  return geometry;
}

// Create a glow geometry (slightly larger version for outline effect)
export function createGlowGeometry(baseGeometry: THREE.BufferGeometry, scale = 1.15): THREE.BufferGeometry {
  const glow = baseGeometry.clone();
  glow.scale(scale, scale, scale);
  return glow;
}
