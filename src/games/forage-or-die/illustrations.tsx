import { useState } from 'react';

// ─── Asset Paths ────────────────────────────────────────────

const BASE = '/images/forage-or-die';
const BIOME_PATH = `${BASE}/biomes`;
const OUTCOME_PATH = `${BASE}/outcomes`;

// ─── Biome Image Map ────────────────────────────────────────
// Each encounter's biome maps to a specific image file.

const biomeFiles: Record<string, string> = {
  'Temperate Forest': 'temperate-forest.png',
  'Mossy Clearing': 'mossy-clearing.png',
  'Old Growth Forest': 'old-growth-forest.png',
  'Birch Grove': 'birch-grove.png',
  'Shaded Ravine': 'shaded-ravine.png',
  'Decaying Stump': 'decaying-stump.png',
  'Meadow Edge': 'meadow-edge.png',
  'Streamside': 'streamside.png',
  'Rocky Hillside': 'rocky-hillside.png',
  'Overgrown Trail': 'overgrown-trail.png',
  'Sunny Clearing': 'sunny-clearing.png',
  'Ditch Bank': 'ditch-bank.png',
  'Forest Floor': 'forest-floor.png',
  'Pine Forest': 'pine-forest.png',
  'Forest Edge': 'forest-edge.png',
  'Hedgerow': 'hedgerow.png',
  'Woodland Path': 'woodland-path.png',
  'Mountain Slope': 'mountain-slope.png',
  'Autumn Thicket': 'autumn-thicket.png',
  'River Crossing': 'river-crossing.png',
  'Desert Wash': 'desert-wash.png',
  'Dense Undergrowth': 'dense-undergrowth.png',
  'Rocky Stream': 'rocky-stream.png',
  'Rotting Log': 'rotting-log.png',
  'Pond Edge': 'pond-edge.png',
  'Sandy Bank': 'sandy-bank.png',
  'Tidal Pool': 'tidal-pool.png',
  'Kelp Beach': 'kelp-beach.png',
  'Mangrove Swamp': 'mangrove-swamp.png',
};

// ─── Outcome Images ─────────────────────────────────────────
// 6 safe + 6 toxic outcome illustrations, selected by encounter ID.

const SAFE_OUTCOME_COUNT = 6;
const TOXIC_OUTCOME_COUNT = 6;

// Files: outcome-safe-1.png ... outcome-safe-6.png
//        outcome-toxic-1.png ... outcome-toxic-6.png

// ─── Placeholder ────────────────────────────────────────────

const placeholderStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  overflow: 'hidden',
  background: '#12120e',
  border: '1px dashed #2a2a20',
  color: '#5a5440',
  fontSize: '13px',
  fontFamily: "'EB Garamond', Georgia, serif",
  fontStyle: 'italic',
};

function GameImage({
  src,
  alt,
  aspectRatio,
  maxWidth,
  placeholderText,
}: {
  src: string;
  alt: string;
  aspectRatio: string;
  maxWidth: string;
  placeholderText: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div style={{ ...placeholderStyle, aspectRatio, maxWidth }}>
        {placeholderText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      style={{
        width: '100%',
        maxWidth,
        aspectRatio,
        objectFit: 'cover',
        borderRadius: '8px',
        display: 'block',
      }}
    />
  );
}

// ─── Exported Components ────────────────────────────────────

export function BiomeScene({ biome }: { biome: string }) {
  const file = biomeFiles[biome];
  if (!file) return null;

  return (
    <GameImage
      src={`${BIOME_PATH}/${file}`}
      alt={biome}
      aspectRatio="16 / 9"
      maxWidth="480px"
      placeholderText={`[ ${biome} — biome illustration ]`}
    />
  );
}

export function OutcomeScene({ safe, encounterId }: { safe: boolean; encounterId: number }) {
  const pool = safe ? SAFE_OUTCOME_COUNT : TOXIC_OUTCOME_COUNT;
  const idx = (encounterId % pool) + 1;
  const file = safe ? `outcome-safe-${idx}.png` : `outcome-toxic-${idx}.png`;

  return (
    <GameImage
      src={`${OUTCOME_PATH}/${file}`}
      alt={safe ? 'Safe outcome' : 'Toxic outcome'}
      aspectRatio="4 / 3"
      maxWidth="320px"
      placeholderText={safe ? '[ safe outcome illustration ]' : '[ toxic outcome illustration ]'}
    />
  );
}
