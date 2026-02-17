import { useState } from 'react';

// ─── Asset Paths ────────────────────────────────────────────

const BASE = '/images/forage-or-die';
const BIOME_PATH = `${BASE}/biomes`;
const OUTCOME_PATH = `${BASE}/outcomes`;
const ITEM_PATH = `${BASE}/items`;

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

// ─── Item Image Map ─────────────────────────────────────────
// Each forageable item maps to a close-up illustration of the species.

const itemFiles: Record<string, string> = {
  // Mushrooms
  'Chanterelle Mushroom': 'chanterelle-mushroom.png',
  'Jack-O-Lantern Mushroom': 'jack-o-lantern-mushroom.png',
  'Destroying Angel': 'destroying-angel.png',
  'Puffball Mushroom': 'puffball-mushroom.png',
  'Chicken of the Woods': 'chicken-of-the-woods.png',
  'Funeral Bell': 'funeral-bell.png',
  'Fly Agaric': 'fly-agaric.png',
  'Birch Bolete': 'birch-bolete.png',
  'Morel Mushroom': 'morel-mushroom.png',
  'False Morel': 'false-morel.png',
  'Oyster Mushroom': 'oyster-mushroom.png',
  'Angel Wing': 'angel-wing.png',
  'Death Cap': 'death-cap.png',
  'Meadow Mushroom': 'meadow-mushroom.png',
  // Plants
  'Watercress': 'watercress.png',
  'Water Hemlock': 'water-hemlock.png',
  'Wild Garlic': 'wild-garlic.png',
  'Lily of the Valley': 'lily-of-the-valley.png',
  "Wild Carrot (Queen Anne's Lace)": 'wild-carrot.png',
  'Poison Hemlock': 'poison-hemlock.png',
  'Stinging Nettle': 'stinging-nettle.png',
  'Giant Hogweed': 'giant-hogweed.png',
  'Cattail': 'cattail.png',
  'Poison Iris': 'poison-iris.png',
  'Wood Sorrel': 'wood-sorrel.png',
  'Spurge': 'spurge.png',
  'Pine Bark & Needles': 'pine-bark-and-needles.png',
  'Yew Needles': 'yew-needles.png',
  // Berries
  'Wild Blackberries': 'wild-blackberries.png',
  'Pokeweed Berries': 'pokeweed-berries.png',
  'Hawthorn Berries': 'hawthorn-berries.png',
  'Yew Berries': 'yew-berries.png',
  'Bittersweet Nightshade': 'bittersweet-nightshade.png',
  'Wild Rose Hips': 'wild-rose-hips.png',
  'Bilberries': 'bilberries.png',
  'Baneberry': 'baneberry.png',
  'Elderberries': 'elderberries.png',
  'Privet Berries': 'privet-berries.png',
  'Wild Rice': 'wild-rice.png',
  'Water Arum': 'water-arum.png',
  'Prickly Pear Cactus': 'prickly-pear-cactus.png',
  'Pencil Cactus': 'pencil-cactus.png',
  // Animals & Insects
  'Banana Slug': 'banana-slug.png',
  'Rough-skinned Newt': 'rough-skinned-newt.png',
  'Crayfish': 'crayfish.png',
  'Cane Toad': 'cane-toad.png',
  'Beetle Grubs': 'beetle-grubs.png',
  'Brightly Banded Caterpillar': 'brightly-banded-caterpillar.png',
  'Freshwater Mussels': 'freshwater-mussels.png',
  'Brightly Colored Frog': 'brightly-colored-frog.png',
  'Large Brown Cricket': 'large-brown-cricket.png',
  'Glossy Black Beetle': 'glossy-black-beetle.png',
  // Aquatic & Coastal
  'Common Limpet': 'common-limpet.png',
  'Blue-ringed Creature': 'blue-ringed-creature.png',
  'Sea Lettuce': 'sea-lettuce.png',
  'Dull Green Algae Mat': 'dull-green-algae-mat.png',
  'Mangrove Periwinkle': 'mangrove-periwinkle.png',
  'Cone Snail': 'cone-snail.png',
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

export function ItemImage({ name }: { name: string }) {
  const file = itemFiles[name];
  if (!file) return null;

  return (
    <GameImage
      src={`${ITEM_PATH}/${file}`}
      alt={name}
      aspectRatio="1 / 1"
      maxWidth="200px"
      placeholderText={`[ ${name} ]`}
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
