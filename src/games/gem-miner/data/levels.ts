import type { Level, CellModifier } from '../types';

// Helper to create a grid layout with specific cells
function makeLayout(rows: number, cols: number, specials?: { row: number; col: number; modifier: CellModifier }[]) {
  const layout: Level['layout'] = { rows, cols };
  if (specials && specials.length > 0) {
    const cells: Level['layout']['cells'] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({}))
    );
    for (const s of specials) {
      if (s.row < rows && s.col < cols) {
        cells![s.row][s.col] = { modifier: s.modifier };
      }
    }
    layout.cells = cells;
  }
  return layout;
}

// Helper to create ice patterns
function icePattern(positions: [number, number][]): { row: number; col: number; modifier: CellModifier }[] {
  return positions.map(([row, col]) => ({ row, col, modifier: 'ice' as CellModifier }));
}

// Helper to create dirt patterns
function dirtPattern(positions: [number, number][]): { row: number; col: number; modifier: CellModifier }[] {
  return positions.map(([row, col]) => ({ row, col, modifier: 'dirt' as CellModifier }));
}

// Helper to create rock patterns
function rockPattern(positions: [number, number][]): { row: number; col: number; modifier: CellModifier }[] {
  return positions.map(([row, col]) => ({ row, col, modifier: 'rock' as CellModifier }));
}

// Helper to create bedrock patterns
function bedrockPattern(positions: [number, number][]): { row: number; col: number; modifier: CellModifier }[] {
  return positions.map(([row, col]) => ({ row, col, modifier: 'bedrock' as CellModifier }));
}

// Helper to create locked patterns
function lockedPattern(positions: [number, number][]): { row: number; col: number; modifier: CellModifier }[] {
  return positions.map(([row, col]) => ({ row, col, modifier: 'locked' as CellModifier }));
}

export const LEVELS: Level[] = [
  // ============================================================
  // ZONE 1: SURFACE MINES (Levels 1-10) - Tutorial Zone
  // Introduces: Basic matching, collection goals, power-ups, special gems
  // ============================================================

  // Level 1: Tutorial - Basic matching (triggers 'basics' tutorial)
  {
    id: 1,
    name: 'First Dig',
    description: 'Welcome to the mines! Match 3 gems to start collecting.',
    depth: 10,
    layout: makeLayout(8, 8),
    availableGems: ['ruby', 'sapphire', 'emerald'],
    objectives: [{ type: 'score', target: 500 }],
    maxMoves: 30,
    starThresholds: [500, 1000, 1800],
    rewards: [{ powerUp: 'lantern', count: 2 }],
  },

  // Level 2: Practice matching with 4 gem types
  {
    id: 2,
    name: 'Color Variety',
    description: 'More gem types mean more possibilities!',
    depth: 20,
    layout: makeLayout(8, 8),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'score', target: 800 }],
    maxMoves: 25,
    starThresholds: [800, 1500, 2500],
    rewards: [],
  },

  // Level 3: Introduces power-ups (triggers 'powerups' tutorial)
  {
    id: 3,
    name: 'Mining Tools',
    description: 'Use your pickaxe to break through tough spots!',
    depth: 30,
    layout: makeLayout(8, 8),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'score', target: 1000 }],
    maxMoves: 22,
    starThresholds: [1000, 1800, 3000],
    rewards: [{ powerUp: 'pickaxe', count: 2 }],
  },

  // Level 4: Collection objective (triggers 'collect_gems' tutorial)
  {
    id: 4,
    name: 'Ruby Hunt',
    description: 'The mine needs rubies! Collect them all.',
    depth: 40,
    layout: makeLayout(8, 8),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'collect_gems', target: 20, gemType: 'ruby' }],
    maxMoves: 25,
    starThresholds: [1200, 2000, 3200],
    rewards: [],
  },

  // Level 5: Special gems introduction (triggers 'special_gems' tutorial)
  {
    id: 5,
    name: 'Gem Fusion',
    description: 'Match 4+ gems to create powerful special gems!',
    depth: 50,
    layout: makeLayout(8, 8),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'score', target: 2000 }],
    maxMoves: 20,
    starThresholds: [2000, 3500, 5000],
    rewards: [{ powerUp: 'dynamite', count: 1 }],
  },

  // Level 6: Ice introduction (triggers 'ice' tutorial)
  {
    id: 6,
    name: 'Frozen Finds',
    description: 'Some gems are trapped in ice! Match nearby to free them.',
    depth: 60,
    layout: makeLayout(8, 8, icePattern([
      [2, 3], [2, 4],
      [3, 2], [3, 5],
      [4, 2], [4, 5],
      [5, 3], [5, 4],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'clear_ice', target: 8 }],
    maxMoves: 25,
    starThresholds: [1500, 2500, 4000],
    rewards: [],
  },

  // Level 7: Ice + collection
  {
    id: 7,
    name: 'Chilly Sapphires',
    description: 'Sapphires frozen in the cave walls need rescuing.',
    depth: 70,
    layout: makeLayout(8, 8, icePattern([
      [1, 2], [1, 5],
      [2, 1], [2, 6],
      [5, 1], [5, 6],
      [6, 2], [6, 5],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'collect_gems', target: 15, gemType: 'sapphire' },
      { type: 'clear_ice', target: 8 },
    ],
    maxMoves: 28,
    starThresholds: [1800, 3000, 4500],
    rewards: [{ powerUp: 'lantern', count: 1 }],
  },

  // Level 8: More ice, score focus
  {
    id: 8,
    name: 'Ice Breaker',
    description: 'A wall of ice blocks your path. Break through!',
    depth: 80,
    layout: makeLayout(8, 8, icePattern([
      [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'clear_ice', target: 8 },
      { type: 'score', target: 2000 },
    ],
    maxMoves: 25,
    starThresholds: [2000, 3500, 5500],
    rewards: [],
  },

  // Level 9: Diamond pattern ice
  {
    id: 9,
    name: 'Frost Diamond',
    description: 'Ice forms a diamond pattern in the cave.',
    depth: 90,
    layout: makeLayout(8, 8, icePattern([
      [1, 3], [1, 4],
      [2, 2], [2, 5],
      [3, 1], [3, 6],
      [4, 1], [4, 6],
      [5, 2], [5, 5],
      [6, 3], [6, 4],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'clear_ice', target: 12 }],
    maxMoves: 28,
    starThresholds: [2200, 4000, 6000],
    rewards: [{ powerUp: 'pickaxe', count: 1 }],
  },

  // Level 10: Zone 1 Boss - Multiple objectives
  {
    id: 10,
    name: 'Crystal Cavern',
    description: 'Master the basics before venturing deeper!',
    depth: 100,
    layout: makeLayout(8, 8, icePattern([
      [0, 0], [0, 7], [7, 0], [7, 7],
      [2, 2], [2, 5], [5, 2], [5, 5],
      [3, 3], [3, 4], [4, 3], [4, 4],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'clear_ice', target: 12 },
      { type: 'collect_gems', target: 15, gemType: 'emerald' },
      { type: 'score', target: 3000 },
    ],
    maxMoves: 35,
    starThresholds: [3000, 5000, 8000],
    rewards: [{ powerUp: 'dynamite', count: 1 }],
  },

  // ============================================================
  // ZONE 2: DUSTY TUNNELS (Levels 11-20) - Dirt Introduction
  // Introduces: Dirt tiles, deeper collection goals
  // ============================================================

  // Level 11: Dirt introduction (triggers 'dirt' tutorial)
  {
    id: 11,
    name: 'Dusty Path',
    description: 'Match gems on dirt to clear the debris.',
    depth: 120,
    layout: makeLayout(8, 8, dirtPattern([
      [2, 2], [2, 3], [2, 4], [2, 5],
      [3, 2], [3, 3], [3, 4], [3, 5],
      [4, 2], [4, 3], [4, 4], [4, 5],
      [5, 2], [5, 3], [5, 4], [5, 5],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'clear_dirt', target: 16 }],
    maxMoves: 25,
    starThresholds: [2000, 3500, 5500],
    rewards: [],
  },

  // Level 12: Dirt rows
  {
    id: 12,
    name: 'Layered Earth',
    description: 'Horizontal bands of dirt stripe the tunnel.',
    depth: 140,
    layout: makeLayout(8, 8, dirtPattern([
      [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7],
      [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7],
      [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'clear_dirt', target: 24 },
      { type: 'score', target: 2500 },
    ],
    maxMoves: 30,
    starThresholds: [2500, 4500, 7000],
    rewards: [{ powerUp: 'drill', count: 1 }],
  },

  // Level 13: Dirt + collection
  {
    id: 13,
    name: 'Buried Topaz',
    description: 'Topaz gems hide beneath the soil.',
    depth: 160,
    layout: makeLayout(8, 8, dirtPattern([
      [2, 1], [2, 2], [2, 5], [2, 6],
      [3, 1], [3, 2], [3, 5], [3, 6],
      [4, 1], [4, 2], [4, 5], [4, 6],
      [5, 1], [5, 2], [5, 5], [5, 6],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'collect_gems', target: 25, gemType: 'topaz' },
      { type: 'clear_dirt', target: 16 },
    ],
    maxMoves: 30,
    starThresholds: [2800, 4800, 7500],
    rewards: [],
  },

  // Level 14: Mixed ice and dirt
  {
    id: 14,
    name: 'Frozen Earth',
    description: 'Ice and dirt combine in this unusual formation.',
    depth: 180,
    layout: makeLayout(8, 8, [
      ...icePattern([[1, 3], [1, 4], [6, 3], [6, 4]]),
      ...dirtPattern([
        [3, 1], [3, 2], [3, 5], [3, 6],
        [4, 1], [4, 2], [4, 5], [4, 6],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'clear_ice', target: 4 },
      { type: 'clear_dirt', target: 8 },
    ],
    maxMoves: 25,
    starThresholds: [2500, 4200, 6500],
    rewards: [{ powerUp: 'lantern', count: 1 }],
  },

  // Level 15: Dirt cross pattern
  {
    id: 15,
    name: 'Earth Cross',
    description: 'A cross of packed earth blocks the center.',
    depth: 200,
    layout: makeLayout(8, 8, dirtPattern([
      [0, 3], [0, 4], [1, 3], [1, 4], [2, 3], [2, 4],
      [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7],
      [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7],
      [5, 3], [5, 4], [6, 3], [6, 4], [7, 3], [7, 4],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'clear_dirt', target: 28 }],
    maxMoves: 35,
    starThresholds: [3500, 6000, 9000],
    rewards: [{ powerUp: 'dynamite', count: 1 }],
  },

  // Level 16: Score challenge with dirt
  {
    id: 16,
    name: 'High Score Dig',
    description: 'Reach a high score while clearing debris.',
    depth: 220,
    layout: makeLayout(8, 8, dirtPattern([
      [2, 0], [2, 1], [2, 6], [2, 7],
      [3, 0], [3, 1], [3, 6], [3, 7],
      [4, 0], [4, 1], [4, 6], [4, 7],
      [5, 0], [5, 1], [5, 6], [5, 7],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'score', target: 5000 },
      { type: 'clear_dirt', target: 16 },
    ],
    maxMoves: 30,
    starThresholds: [5000, 8000, 12000],
    rewards: [],
  },

  // Level 17: Ice + dirt combo
  {
    id: 17,
    name: 'Mixed Obstacles',
    description: 'Navigate through frozen and dirty terrain.',
    depth: 240,
    layout: makeLayout(8, 8, [
      ...icePattern([[0, 3], [0, 4], [1, 2], [1, 5], [2, 1], [2, 6]]),
      ...dirtPattern([[5, 1], [5, 6], [6, 2], [6, 5], [7, 3], [7, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'clear_ice', target: 6 },
      { type: 'clear_dirt', target: 6 },
      { type: 'score', target: 3500 },
    ],
    maxMoves: 28,
    starThresholds: [3500, 6000, 9500],
    rewards: [{ powerUp: 'pickaxe', count: 2 }],
  },

  // Level 18: Dual collection
  {
    id: 18,
    name: 'Gem Duo',
    description: 'Collect both rubies and sapphires from the dirt.',
    depth: 260,
    layout: makeLayout(8, 8, dirtPattern([
      [1, 1], [1, 2], [1, 5], [1, 6],
      [2, 1], [2, 2], [2, 5], [2, 6],
      [5, 1], [5, 2], [5, 5], [5, 6],
      [6, 1], [6, 2], [6, 5], [6, 6],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'collect_gems', target: 20, gemType: 'ruby' },
      { type: 'collect_gems', target: 20, gemType: 'sapphire' },
    ],
    maxMoves: 35,
    starThresholds: [4000, 7000, 11000],
    rewards: [],
  },

  // Level 19: Dense dirt
  {
    id: 19,
    name: 'Packed Earth',
    description: 'Nearly the entire board is covered in dirt!',
    depth: 280,
    layout: makeLayout(8, 8, dirtPattern([
      [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
      [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
      [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
      [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6],
      [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6],
      [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'clear_dirt', target: 36 }],
    maxMoves: 40,
    starThresholds: [5000, 9000, 14000],
    rewards: [{ powerUp: 'drill', count: 1 }],
  },

  // Level 20: Zone 2 Boss
  {
    id: 20,
    name: 'Tunnel\'s End',
    description: 'Clear the final stretch of the dusty tunnels!',
    depth: 300,
    layout: makeLayout(8, 8, [
      ...icePattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...dirtPattern([
        [2, 2], [2, 3], [2, 4], [2, 5],
        [3, 2], [3, 3], [3, 4], [3, 5],
        [4, 2], [4, 3], [4, 4], [4, 5],
        [5, 2], [5, 3], [5, 4], [5, 5],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'clear_dirt', target: 16 },
      { type: 'clear_ice', target: 4 },
      { type: 'score', target: 6000 },
    ],
    maxMoves: 35,
    starThresholds: [6000, 10000, 15000],
    rewards: [{ powerUp: 'dynamite', count: 2 }],
  },

  // ============================================================
  // ZONE 3: ROCKY DEPTHS (Levels 21-30) - Rock Introduction
  // Introduces: Rocks, 5th gem type (amethyst)
  // ============================================================

  // Level 21: Rock introduction (triggers 'rock' tutorial)
  {
    id: 21,
    name: 'Boulder Field',
    description: 'Rocks block your path! Match adjacent gems to break them.',
    depth: 330,
    layout: makeLayout(8, 8, rockPattern([
      [2, 3], [2, 4],
      [3, 2], [3, 5],
      [4, 2], [4, 5],
      [5, 3], [5, 4],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'clear_rocks', target: 8 }],
    maxMoves: 25,
    starThresholds: [2500, 4500, 7000],
    rewards: [{ powerUp: 'pickaxe', count: 2 }],
  },

  // Level 22: Rock walls
  {
    id: 22,
    name: 'Stone Barrier',
    description: 'A wall of boulders divides the playing field.',
    depth: 360,
    layout: makeLayout(8, 8, rockPattern([
      [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'clear_rocks', target: 8 },
      { type: 'score', target: 3500 },
    ],
    maxMoves: 28,
    starThresholds: [3500, 6000, 9000],
    rewards: [],
  },

  // Level 23: Rocks + ice
  {
    id: 23,
    name: 'Frozen Boulders',
    description: 'Ice and rocks create a challenging combination.',
    depth: 390,
    layout: makeLayout(8, 8, [
      ...rockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
      ...icePattern([[1, 1], [1, 6], [6, 1], [6, 6]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
    ],
    maxMoves: 25,
    starThresholds: [3000, 5500, 8500],
    rewards: [{ powerUp: 'dynamite', count: 1 }],
  },

  // Level 24: Rocks + dirt
  {
    id: 24,
    name: 'Debris Field',
    description: 'Boulders surrounded by packed dirt.',
    depth: 420,
    layout: makeLayout(8, 8, [
      ...rockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
      ...dirtPattern([
        [2, 2], [2, 3], [2, 4], [2, 5],
        [3, 2], [3, 5],
        [4, 2], [4, 5],
        [5, 2], [5, 3], [5, 4], [5, 5],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_dirt', target: 12 },
    ],
    maxMoves: 28,
    starThresholds: [3500, 6000, 9500],
    rewards: [],
  },

  // Level 25: Multi-rock pattern
  {
    id: 25,
    name: 'Rocky Road',
    description: 'Rocks scattered throughout the mine shaft.',
    depth: 450,
    layout: makeLayout(8, 8, rockPattern([
      [1, 1], [1, 6],
      [2, 3], [2, 4],
      [3, 0], [3, 7],
      [4, 0], [4, 7],
      [5, 3], [5, 4],
      [6, 1], [6, 6],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'clear_rocks', target: 12 },
      { type: 'score', target: 4500 },
    ],
    maxMoves: 32,
    starThresholds: [4500, 8000, 12000],
    rewards: [{ powerUp: 'drill', count: 1 }],
  },

  // Level 26: Rock challenge
  {
    id: 26,
    name: 'Cavern Collapse',
    description: 'Rocks have fallen everywhere! Clear them all.',
    depth: 480,
    layout: makeLayout(8, 8, [
      ...rockPattern([
        [0, 2], [0, 5],
        [1, 3], [1, 4],
        [2, 1], [2, 6],
        [5, 1], [5, 6],
        [6, 3], [6, 4],
        [7, 2], [7, 5],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'clear_rocks', target: 12 },
    ],
    maxMoves: 30,
    starThresholds: [4000, 7000, 11000],
    rewards: [],
  },

  // Level 27: Amethyst introduction (triggers 'amethyst' tutorial)
  {
    id: 27,
    name: 'Purple Depths',
    description: 'Rare amethysts sparkle in the deep mine!',
    depth: 510,
    layout: makeLayout(8, 8, rockPattern([
      [3, 3], [3, 4],
      [4, 3], [4, 4],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [
      { type: 'collect_gems', target: 15, gemType: 'amethyst' },
      { type: 'clear_rocks', target: 4 },
    ],
    maxMoves: 28,
    starThresholds: [4200, 7500, 11500],
    rewards: [{ powerUp: 'lantern', count: 2 }],
  },

  // Level 28: Amethyst collection
  {
    id: 28,
    name: 'Amethyst Vein',
    description: 'A rich vein of purple gems awaits collection.',
    depth: 540,
    layout: makeLayout(8, 8, [
      ...dirtPattern([
        [2, 2], [2, 3], [2, 4], [2, 5],
        [5, 2], [5, 3], [5, 4], [5, 5],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [
      { type: 'collect_gems', target: 25, gemType: 'amethyst' },
    ],
    maxMoves: 30,
    starThresholds: [4500, 8000, 12000],
    rewards: [],
  },

  // Level 29: All obstacles so far
  {
    id: 29,
    name: 'Triple Threat',
    description: 'Ice, dirt, and rocks combine in this challenging level.',
    depth: 570,
    layout: makeLayout(8, 8, [
      ...icePattern([[0, 3], [0, 4], [7, 3], [7, 4]]),
      ...dirtPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
      ...rockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [
      { type: 'clear_ice', target: 4 },
      { type: 'clear_dirt', target: 4 },
      { type: 'clear_rocks', target: 4 },
    ],
    maxMoves: 28,
    starThresholds: [5000, 8500, 13000],
    rewards: [{ powerUp: 'dynamite', count: 1 }],
  },

  // Level 30: Zone 3 Boss
  {
    id: 30,
    name: 'Deep Mine Boss',
    description: 'Master all obstacles to complete this zone!',
    depth: 600,
    layout: makeLayout(8, 8, [
      ...rockPattern([
        [1, 1], [1, 6], [6, 1], [6, 6],
        [3, 3], [3, 4], [4, 3], [4, 4],
      ]),
      ...icePattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
      ...dirtPattern([
        [0, 3], [0, 4], [7, 3], [7, 4],
        [3, 0], [4, 0], [3, 7], [4, 7],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [
      { type: 'clear_rocks', target: 8 },
      { type: 'collect_gems', target: 20, gemType: 'amethyst' },
      { type: 'score', target: 8000 },
    ],
    maxMoves: 40,
    starThresholds: [8000, 14000, 20000],
    rewards: [{ powerUp: 'earthquake', count: 1 }],
  },

  // ============================================================
  // ZONE 4: LOCKED CHAMBERS (Levels 31-40) - Locked Gems
  // Introduces: Locked gems, diamond gem type
  // ============================================================

  // Level 31: Locked introduction (triggers 'locked' tutorial)
  {
    id: 31,
    name: 'Chain Gang',
    description: 'Some gems are locked in chains! Match nearby to free them.',
    depth: 640,
    layout: makeLayout(8, 8, lockedPattern([
      [2, 3], [2, 4],
      [3, 2], [3, 5],
      [4, 2], [4, 5],
      [5, 3], [5, 4],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [{ type: 'score', target: 5000 }],
    maxMoves: 28,
    starThresholds: [5000, 9000, 14000],
    rewards: [{ powerUp: 'pickaxe', count: 2 }],
  },

  // Level 32: Locked + rocks
  {
    id: 32,
    name: 'Prison Break',
    description: 'Free the locked gems while clearing the rocks.',
    depth: 680,
    layout: makeLayout(8, 8, [
      ...lockedPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
      ...rockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'score', target: 5500 },
    ],
    maxMoves: 28,
    starThresholds: [5500, 9500, 14500],
    rewards: [],
  },

  // Level 33: Locked perimeter
  {
    id: 33,
    name: 'Locked Perimeter',
    description: 'Locked gems line the edges of the board.',
    depth: 720,
    layout: makeLayout(8, 8, lockedPattern([
      [0, 0], [0, 3], [0, 4], [0, 7],
      [3, 0], [4, 0], [3, 7], [4, 7],
      [7, 0], [7, 3], [7, 4], [7, 7],
    ])),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [
      { type: 'collect_gems', target: 25, gemType: 'ruby' },
      { type: 'score', target: 6000 },
    ],
    maxMoves: 32,
    starThresholds: [6000, 10000, 15000],
    rewards: [{ powerUp: 'dynamite', count: 1 }],
  },

  // Level 34: Locked center maze
  {
    id: 34,
    name: 'Center Lock',
    description: 'A cluster of locked gems blocks the center.',
    depth: 760,
    layout: makeLayout(8, 8, [
      ...lockedPattern([
        [2, 2], [2, 3], [2, 4], [2, 5],
        [3, 2], [3, 5],
        [4, 2], [4, 5],
        [5, 2], [5, 3], [5, 4], [5, 5],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [{ type: 'score', target: 7000 }],
    maxMoves: 35,
    starThresholds: [7000, 12000, 18000],
    rewards: [],
  },

  // Level 35: Locked + ice combo
  {
    id: 35,
    name: 'Frozen Chains',
    description: 'Both ice and locks trap the gems here.',
    depth: 800,
    layout: makeLayout(8, 8, [
      ...lockedPattern([[1, 1], [1, 6], [6, 1], [6, 6]]),
      ...icePattern([[2, 3], [2, 4], [5, 3], [5, 4]]),
      ...rockPattern([[3, 2], [3, 5], [4, 2], [4, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [
      { type: 'clear_ice', target: 4 },
      { type: 'clear_rocks', target: 4 },
    ],
    maxMoves: 30,
    starThresholds: [6500, 11000, 16500],
    rewards: [{ powerUp: 'drill', count: 1 }],
  },

  // Level 36: Multiple gem collection
  {
    id: 36,
    name: 'Rainbow Collection',
    description: 'Collect gems of all five colors!',
    depth: 840,
    layout: makeLayout(8, 8, [
      ...lockedPattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...dirtPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [
      { type: 'collect_gems', target: 12, gemType: 'ruby' },
      { type: 'collect_gems', target: 12, gemType: 'sapphire' },
      { type: 'collect_gems', target: 12, gemType: 'emerald' },
    ],
    maxMoves: 35,
    starThresholds: [7500, 13000, 19000],
    rewards: [],
  },

  // Level 37: Diamond introduction (triggers 'diamond' tutorial)
  {
    id: 37,
    name: 'Diamond Discovery',
    description: 'Rare diamonds appear in the deepest mines!',
    depth: 880,
    layout: makeLayout(8, 8, [
      ...lockedPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
      ...rockPattern([[3, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [
      { type: 'collect_gems', target: 12, gemType: 'diamond' },
    ],
    maxMoves: 30,
    starThresholds: [7000, 12000, 18000],
    rewards: [{ powerUp: 'lantern', count: 2 }],
  },

  // Level 38: Diamond collection challenge
  {
    id: 38,
    name: 'Diamond Rush',
    description: 'Gather as many diamonds as possible!',
    depth: 920,
    layout: makeLayout(8, 8, [
      ...icePattern([[1, 3], [1, 4], [6, 3], [6, 4]]),
      ...dirtPattern([[3, 1], [3, 6], [4, 1], [4, 6]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [
      { type: 'collect_gems', target: 20, gemType: 'diamond' },
      { type: 'clear_ice', target: 4 },
    ],
    maxMoves: 32,
    starThresholds: [8000, 14000, 21000],
    rewards: [],
  },

  // Level 39: Complex locked pattern
  {
    id: 39,
    name: 'Lock Maze',
    description: 'Navigate through a maze of locked gems.',
    depth: 960,
    layout: makeLayout(8, 8, [
      ...lockedPattern([
        [1, 2], [1, 5],
        [2, 1], [2, 3], [2, 4], [2, 6],
        [5, 1], [5, 3], [5, 4], [5, 6],
        [6, 2], [6, 5],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [
      { type: 'score', target: 10000 },
      { type: 'collect_gems', target: 15, gemType: 'diamond' },
    ],
    maxMoves: 38,
    starThresholds: [10000, 17000, 25000],
    rewards: [{ powerUp: 'dynamite', count: 2 }],
  },

  // Level 40: Zone 4 Boss
  {
    id: 40,
    name: 'Chamber Master',
    description: 'Conquer all locks and obstacles!',
    depth: 1000,
    layout: makeLayout(9, 9, [
      ...lockedPattern([
        [0, 4], [4, 0], [4, 8], [8, 4],
        [2, 2], [2, 6], [6, 2], [6, 6],
      ]),
      ...rockPattern([[3, 4], [4, 3], [4, 5], [5, 4]]),
      ...icePattern([[1, 4], [4, 1], [4, 7], [7, 4]]),
      ...dirtPattern([[3, 3], [3, 5], [5, 3], [5, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'collect_gems', target: 20, gemType: 'diamond' },
    ],
    maxMoves: 45,
    starThresholds: [12000, 20000, 30000],
    rewards: [{ powerUp: 'earthquake', count: 1 }],
  },

  // ============================================================
  // ZONE 5: BEDROCK FORTRESS (Levels 41-50) - Bedrock & Obsidian
  // Introduces: Bedrock (unbreakable), obsidian gem type
  // ============================================================

  // Level 41: Bedrock introduction (triggers 'bedrock' tutorial)
  {
    id: 41,
    name: 'Stone Pillars',
    description: 'Unbreakable bedrock shapes the playing field. Work around it!',
    depth: 1050,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([
        [2, 2], [2, 5],
        [5, 2], [5, 5],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [{ type: 'score', target: 8000 }],
    maxMoves: 30,
    starThresholds: [8000, 14000, 21000],
    rewards: [{ powerUp: 'pickaxe', count: 2 }],
  },

  // Level 42: Bedrock walls
  {
    id: 42,
    name: 'Divided Chamber',
    description: 'Bedrock walls divide the board into sections.',
    depth: 1100,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([
        [0, 3], [1, 3], [2, 3],
        [5, 4], [6, 4], [7, 4],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [
      { type: 'collect_gems', target: 20, gemType: 'sapphire' },
      { type: 'collect_gems', target: 20, gemType: 'emerald' },
    ],
    maxMoves: 32,
    starThresholds: [8500, 15000, 22000],
    rewards: [],
  },

  // Level 43: Bedrock + rocks
  {
    id: 43,
    name: 'Stone Maze',
    description: 'Navigate rocks around bedrock pillars.',
    depth: 1150,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
      ...rockPattern([
        [1, 3], [1, 4], [3, 1], [3, 6],
        [4, 1], [4, 6], [6, 3], [6, 4],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [{ type: 'clear_rocks', target: 8 }],
    maxMoves: 30,
    starThresholds: [7500, 13000, 19500],
    rewards: [{ powerUp: 'dynamite', count: 1 }],
  },

  // Level 44: Bedrock corners
  {
    id: 44,
    name: 'Corner Fortress',
    description: 'Bedrock blocks the corners of the board.',
    depth: 1200,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([
        [0, 0], [0, 1], [1, 0],
        [0, 6], [0, 7], [1, 7],
        [6, 0], [7, 0], [7, 1],
        [6, 7], [7, 6], [7, 7],
      ]),
      ...lockedPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [
      { type: 'score', target: 10000 },
      { type: 'collect_gems', target: 18, gemType: 'diamond' },
    ],
    maxMoves: 35,
    starThresholds: [10000, 17000, 25000],
    rewards: [],
  },

  // Level 45: Bedrock cross
  {
    id: 45,
    name: 'Cross Roads',
    description: 'A cross of bedrock divides the playing field into quadrants.',
    depth: 1250,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([
        [4, 0], [4, 1], [4, 2], [4, 6], [4, 7], [4, 8],
        [0, 4], [1, 4], [2, 4], [6, 4], [7, 4], [8, 4],
      ]),
      ...rockPattern([[2, 2], [2, 6], [6, 2], [6, 6]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'score', target: 9000 },
    ],
    maxMoves: 32,
    starThresholds: [9000, 16000, 24000],
    rewards: [{ powerUp: 'drill', count: 1 }],
  },

  // Level 46: Dense bedrock pattern
  {
    id: 46,
    name: 'Narrow Passages',
    description: 'Wind through narrow gaps between bedrock walls.',
    depth: 1300,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([
        [1, 0], [1, 2], [1, 5], [1, 7],
        [3, 1], [3, 3], [3, 4], [3, 6],
        [5, 0], [5, 2], [5, 5], [5, 7],
      ]),
      ...icePattern([[2, 2], [2, 5], [4, 2], [4, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [
      { type: 'clear_ice', target: 4 },
      { type: 'collect_gems', target: 25, gemType: 'amethyst' },
    ],
    maxMoves: 35,
    starThresholds: [9500, 16500, 24500],
    rewards: [],
  },

  // Level 47: Obsidian introduction (triggers 'obsidian' tutorial)
  {
    id: 47,
    name: 'Volcanic Depths',
    description: 'Dark obsidian gems from the volcanic heart of the earth!',
    depth: 1350,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...rockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 10, gemType: 'obsidian' },
      { type: 'clear_rocks', target: 4 },
    ],
    maxMoves: 30,
    starThresholds: [10000, 17000, 26000],
    rewards: [{ powerUp: 'lantern', count: 2 }],
  },

  // Level 48: Obsidian collection
  {
    id: 48,
    name: 'Dark Harvest',
    description: 'Gather the precious obsidian from the deep.',
    depth: 1400,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
      ...dirtPattern([
        [1, 3], [1, 4], [3, 1], [3, 6],
        [4, 1], [4, 6], [6, 3], [6, 4],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 18, gemType: 'obsidian' },
      { type: 'clear_dirt', target: 8 },
    ],
    maxMoves: 35,
    starThresholds: [11000, 18500, 27000],
    rewards: [],
  },

  // Level 49: All elements combined
  {
    id: 49,
    name: 'Ultimate Challenge',
    description: 'Every obstacle type in one level!',
    depth: 1450,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...rockPattern([[2, 3], [2, 4], [5, 3], [5, 4]]),
      ...icePattern([[3, 2], [3, 5], [4, 2], [4, 5]]),
      ...dirtPattern([[1, 3], [1, 4], [6, 3], [6, 4]]),
      ...lockedPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'score', target: 12000 },
    ],
    maxMoves: 40,
    starThresholds: [12000, 20000, 30000],
    rewards: [{ powerUp: 'dynamite', count: 2 }],
  },

  // Level 50: Zone 5 Boss
  {
    id: 50,
    name: 'Bedrock Boss',
    description: 'Master the fortress of stone!',
    depth: 1500,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([
        [0, 0], [0, 4], [0, 8],
        [4, 0], [4, 8],
        [8, 0], [8, 4], [8, 8],
      ]),
      ...rockPattern([[2, 2], [2, 6], [6, 2], [6, 6]]),
      ...lockedPattern([[4, 3], [4, 4], [4, 5]]),
      ...icePattern([[3, 4], [5, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'collect_gems', target: 15, gemType: 'obsidian' },
      { type: 'collect_gems', target: 15, gemType: 'diamond' },
    ],
    maxMoves: 45,
    starThresholds: [15000, 25000, 38000],
    rewards: [{ powerUp: 'earthquake', count: 1 }],
  },

  // ============================================================
  // ZONE 6: CRYSTAL KINGDOM (Levels 51-60) - Advanced Combos
  // Focus: Complex patterns, multi-objective challenges
  // ============================================================

  {
    id: 51,
    name: 'Crystal Gateway',
    description: 'Enter the crystal kingdom with a challenging puzzle.',
    depth: 1550,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[3, 0], [3, 7], [4, 0], [4, 7]]),
      ...rockPattern([[1, 3], [1, 4], [6, 3], [6, 4]]),
      ...icePattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'score', target: 10000 },
    ],
    maxMoves: 35,
    starThresholds: [10000, 17000, 26000],
    rewards: [],
  },

  {
    id: 52,
    name: 'Gem Collector',
    description: 'Collect three different gem types.',
    depth: 1600,
    layout: makeLayout(8, 8, [
      ...lockedPattern([[0, 3], [0, 4], [7, 3], [7, 4]]),
      ...dirtPattern([
        [2, 2], [2, 3], [2, 4], [2, 5],
        [5, 2], [5, 3], [5, 4], [5, 5],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 15, gemType: 'ruby' },
      { type: 'collect_gems', target: 15, gemType: 'diamond' },
      { type: 'collect_gems', target: 15, gemType: 'obsidian' },
    ],
    maxMoves: 40,
    starThresholds: [11000, 19000, 28000],
    rewards: [{ powerUp: 'pickaxe', count: 2 }],
  },

  {
    id: 53,
    name: 'Obstacle Course',
    description: 'Clear every type of obstacle on this level.',
    depth: 1650,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[0, 0], [7, 7]]),
      ...rockPattern([[1, 1], [6, 6]]),
      ...icePattern([[2, 2], [5, 5]]),
      ...dirtPattern([[3, 3], [4, 4]]),
      ...lockedPattern([[2, 5], [5, 2]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 2 },
      { type: 'clear_ice', target: 2 },
      { type: 'clear_dirt', target: 2 },
    ],
    maxMoves: 25,
    starThresholds: [8000, 14000, 21000],
    rewards: [],
  },

  {
    id: 54,
    name: 'Diamond Mine',
    description: 'A rich diamond deposit awaits.',
    depth: 1700,
    layout: makeLayout(8, 8, [
      ...rockPattern([
        [0, 3], [0, 4], [7, 3], [7, 4],
        [3, 0], [4, 0], [3, 7], [4, 7],
      ]),
      ...bedrockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 30, gemType: 'diamond' },
    ],
    maxMoves: 35,
    starThresholds: [12000, 20000, 30000],
    rewards: [{ powerUp: 'dynamite', count: 1 }],
  },

  {
    id: 55,
    name: 'Score Rush',
    description: 'Reach an impressive score!',
    depth: 1750,
    layout: makeLayout(8, 8, [
      ...icePattern([
        [1, 1], [1, 2], [1, 5], [1, 6],
        [6, 1], [6, 2], [6, 5], [6, 6],
      ]),
      ...lockedPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [{ type: 'score', target: 15000 }],
    maxMoves: 35,
    starThresholds: [15000, 25000, 38000],
    rewards: [],
  },

  {
    id: 56,
    name: 'Frozen Fortress',
    description: 'Break through layers of ice.',
    depth: 1800,
    layout: makeLayout(8, 8, [
      ...icePattern([
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 1], [2, 6],
        [3, 1], [3, 6],
        [4, 1], [4, 6],
        [5, 1], [5, 6],
        [6, 2], [6, 3], [6, 4], [6, 5],
      ]),
      ...bedrockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_ice', target: 16 },
      { type: 'score', target: 12000 },
    ],
    maxMoves: 38,
    starThresholds: [12000, 20000, 30000],
    rewards: [{ powerUp: 'drill', count: 1 }],
  },

  {
    id: 57,
    name: 'Rock Garden',
    description: 'Clear a field of scattered rocks.',
    depth: 1850,
    layout: makeLayout(8, 8, [
      ...rockPattern([
        [0, 1], [0, 3], [0, 4], [0, 6],
        [2, 0], [2, 2], [2, 5], [2, 7],
        [5, 0], [5, 2], [5, 5], [5, 7],
        [7, 1], [7, 3], [7, 4], [7, 6],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [{ type: 'clear_rocks', target: 16 }],
    maxMoves: 40,
    starThresholds: [13000, 22000, 33000],
    rewards: [],
  },

  {
    id: 58,
    name: 'Locked Treasure',
    description: 'Unlock the treasure hidden behind chains.',
    depth: 1900,
    layout: makeLayout(8, 8, [
      ...lockedPattern([
        [1, 1], [1, 2], [1, 5], [1, 6],
        [2, 1], [2, 2], [2, 5], [2, 6],
        [5, 1], [5, 2], [5, 5], [5, 6],
        [6, 1], [6, 2], [6, 5], [6, 6],
      ]),
      ...bedrockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'score', target: 14000 },
      { type: 'collect_gems', target: 20, gemType: 'obsidian' },
    ],
    maxMoves: 40,
    starThresholds: [14000, 24000, 36000],
    rewards: [{ powerUp: 'lantern', count: 2 }],
  },

  {
    id: 59,
    name: 'Earth Layers',
    description: 'Dig through multiple layers of dirt.',
    depth: 1950,
    layout: makeLayout(8, 8, [
      ...dirtPattern([
        [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
        [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
        [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7],
        [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [{ type: 'clear_dirt', target: 32 }],
    maxMoves: 42,
    starThresholds: [14000, 24000, 36000],
    rewards: [],
  },

  {
    id: 60,
    name: 'Crystal King',
    description: 'Defeat the Crystal Kingdom boss!',
    depth: 2000,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([[0, 4], [4, 0], [4, 8], [8, 4]]),
      ...rockPattern([[2, 4], [4, 2], [4, 6], [6, 4]]),
      ...icePattern([[2, 2], [2, 6], [6, 2], [6, 6]]),
      ...lockedPattern([[3, 3], [3, 5], [5, 3], [5, 5]]),
      ...dirtPattern([[4, 3], [4, 5], [3, 4], [5, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'score', target: 18000 },
    ],
    maxMoves: 45,
    starThresholds: [18000, 30000, 45000],
    rewards: [{ powerUp: 'earthquake', count: 1 }],
  },

  // ============================================================
  // ZONE 7: MAGMA CAVERNS (Levels 61-70) - Expert Challenges
  // Focus: Tight move limits, complex obstacle combinations
  // ============================================================

  {
    id: 61,
    name: 'Magma Entry',
    description: 'Enter the scorching magma caverns.',
    depth: 2100,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...rockPattern([[2, 3], [2, 4], [5, 3], [5, 4]]),
      ...dirtPattern([[3, 2], [3, 5], [4, 2], [4, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 25, gemType: 'ruby' },
      { type: 'clear_rocks', target: 4 },
    ],
    maxMoves: 30,
    starThresholds: [12000, 20000, 30000],
    rewards: [],
  },

  {
    id: 62,
    name: 'Heat Wave',
    description: 'Survive the intense heat with limited moves.',
    depth: 2150,
    layout: makeLayout(8, 8, [
      ...icePattern([[1, 1], [1, 6], [6, 1], [6, 6]]),
      ...rockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [{ type: 'score', target: 12000 }],
    maxMoves: 25,
    starThresholds: [12000, 20000, 30000],
    rewards: [{ powerUp: 'dynamite', count: 2 }],
  },

  {
    id: 63,
    name: 'Lava Flow',
    description: 'Navigate around the molten bedrock.',
    depth: 2200,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([
        [2, 0], [2, 1], [2, 6], [2, 7],
        [5, 0], [5, 1], [5, 6], [5, 7],
      ]),
      ...lockedPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 20, gemType: 'diamond' },
      { type: 'collect_gems', target: 20, gemType: 'obsidian' },
    ],
    maxMoves: 35,
    starThresholds: [14000, 24000, 36000],
    rewards: [],
  },

  {
    id: 64,
    name: 'Volcanic Vein',
    description: 'Mine the precious gems from volcanic rock.',
    depth: 2250,
    layout: makeLayout(8, 8, [
      ...rockPattern([
        [0, 2], [0, 5], [1, 3], [1, 4],
        [6, 3], [6, 4], [7, 2], [7, 5],
      ]),
      ...dirtPattern([
        [3, 0], [3, 1], [3, 6], [3, 7],
        [4, 0], [4, 1], [4, 6], [4, 7],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 8 },
      { type: 'clear_dirt', target: 8 },
    ],
    maxMoves: 32,
    starThresholds: [13000, 22000, 33000],
    rewards: [{ powerUp: 'drill', count: 1 }],
  },

  {
    id: 65,
    name: 'Obsidian Depths',
    description: 'Collect obsidian from the deepest volcanic chambers.',
    depth: 2300,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
      ...icePattern([[1, 3], [1, 4], [6, 3], [6, 4]]),
      ...rockPattern([[3, 1], [3, 6], [4, 1], [4, 6]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 30, gemType: 'obsidian' },
    ],
    maxMoves: 38,
    starThresholds: [15000, 25000, 38000],
    rewards: [],
  },

  {
    id: 66,
    name: 'Pressure Point',
    description: 'Clear obstacles under pressure.',
    depth: 2350,
    layout: makeLayout(8, 8, [
      ...rockPattern([[1, 1], [1, 6], [2, 2], [2, 5], [5, 2], [5, 5], [6, 1], [6, 6]]),
      ...lockedPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 8 },
      { type: 'score', target: 16000 },
    ],
    maxMoves: 35,
    starThresholds: [16000, 27000, 40000],
    rewards: [{ powerUp: 'pickaxe', count: 3 }],
  },

  {
    id: 67,
    name: 'Triple Threat II',
    description: 'Another triple collection challenge.',
    depth: 2400,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...dirtPattern([[2, 3], [2, 4], [5, 3], [5, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 18, gemType: 'amethyst' },
      { type: 'collect_gems', target: 18, gemType: 'diamond' },
      { type: 'collect_gems', target: 18, gemType: 'obsidian' },
    ],
    maxMoves: 42,
    starThresholds: [16000, 27000, 40000],
    rewards: [],
  },

  {
    id: 68,
    name: 'Magma Maze',
    description: 'Navigate the complex magma maze.',
    depth: 2450,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([
        [1, 1], [1, 4], [1, 7],
        [4, 1], [4, 4], [4, 7],
        [7, 1], [7, 4], [7, 7],
      ]),
      ...rockPattern([[2, 2], [2, 6], [6, 2], [6, 6]]),
      ...icePattern([[0, 4], [4, 0], [4, 8], [8, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'score', target: 18000 },
    ],
    maxMoves: 40,
    starThresholds: [18000, 30000, 45000],
    rewards: [{ powerUp: 'dynamite', count: 2 }],
  },

  {
    id: 69,
    name: 'Final Heat',
    description: 'Survive the final test of the magma caverns.',
    depth: 2500,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
      ...rockPattern([[0, 3], [0, 4], [7, 3], [7, 4], [3, 0], [4, 0], [3, 7], [4, 7]]),
      ...lockedPattern([[1, 1], [1, 6], [6, 1], [6, 6]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 8 },
      { type: 'score', target: 20000 },
    ],
    maxMoves: 38,
    starThresholds: [20000, 33000, 50000],
    rewards: [],
  },

  {
    id: 70,
    name: 'Magma Lord',
    description: 'Defeat the Magma Lord boss!',
    depth: 2600,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([[0, 0], [0, 8], [8, 0], [8, 8], [4, 4]]),
      ...rockPattern([[2, 2], [2, 6], [6, 2], [6, 6]]),
      ...icePattern([[1, 4], [4, 1], [4, 7], [7, 4]]),
      ...lockedPattern([[3, 3], [3, 5], [5, 3], [5, 5]]),
      ...dirtPattern([[2, 4], [4, 2], [4, 6], [6, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'collect_gems', target: 25, gemType: 'ruby' },
      { type: 'score', target: 25000 },
    ],
    maxMoves: 50,
    starThresholds: [25000, 42000, 62000],
    rewards: [{ powerUp: 'earthquake', count: 2 }],
  },

  // ============================================================
  // ZONE 8: ABYSSAL DEPTHS (Levels 71-80) - Master Challenges
  // Focus: Extreme difficulty, minimal moves, complex patterns
  // ============================================================

  {
    id: 71,
    name: 'Abyss Gateway',
    description: 'Enter the deepest reaches of the mine.',
    depth: 2700,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[0, 3], [0, 4], [7, 3], [7, 4]]),
      ...rockPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
      ...icePattern([[1, 1], [1, 6], [6, 1], [6, 6]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'collect_gems', target: 20, gemType: 'obsidian' },
    ],
    maxMoves: 35,
    starThresholds: [18000, 30000, 45000],
    rewards: [],
  },

  {
    id: 72,
    name: 'Dark Collection',
    description: 'Collect rare gems from the darkness.',
    depth: 2750,
    layout: makeLayout(8, 8, [
      ...lockedPattern([
        [1, 2], [1, 5], [2, 1], [2, 6],
        [5, 1], [5, 6], [6, 2], [6, 5],
      ]),
      ...dirtPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 22, gemType: 'diamond' },
      { type: 'collect_gems', target: 22, gemType: 'obsidian' },
    ],
    maxMoves: 38,
    starThresholds: [18000, 30000, 45000],
    rewards: [{ powerUp: 'lantern', count: 3 }],
  },

  {
    id: 73,
    name: 'Pressure Chamber',
    description: 'Clear obstacles under extreme pressure.',
    depth: 2800,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
      ...rockPattern([
        [0, 0], [0, 7], [7, 0], [7, 7],
        [1, 3], [1, 4], [6, 3], [6, 4],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 8 },
      { type: 'score', target: 22000 },
    ],
    maxMoves: 35,
    starThresholds: [22000, 37000, 55000],
    rewards: [],
  },

  {
    id: 74,
    name: 'Ice Abyss',
    description: 'A frozen section of the abyss.',
    depth: 2850,
    layout: makeLayout(8, 8, [
      ...icePattern([
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 1], [1, 6], [2, 0], [2, 7],
        [5, 0], [5, 7], [6, 1], [6, 6],
        [7, 2], [7, 3], [7, 4], [7, 5],
      ]),
      ...bedrockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_ice', target: 16 },
    ],
    maxMoves: 35,
    starThresholds: [20000, 33000, 50000],
    rewards: [{ powerUp: 'dynamite', count: 2 }],
  },

  {
    id: 75,
    name: 'Halfway Point',
    description: 'You\'ve reached the halfway point to the core!',
    depth: 2900,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([[0, 4], [4, 0], [4, 8], [8, 4]]),
      ...rockPattern([[2, 4], [4, 2], [4, 6], [6, 4]]),
      ...lockedPattern([[2, 2], [2, 6], [6, 2], [6, 6]]),
      ...icePattern([[3, 3], [3, 5], [5, 3], [5, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'collect_gems', target: 25, gemType: 'amethyst' },
    ],
    maxMoves: 42,
    starThresholds: [22000, 37000, 55000],
    rewards: [{ powerUp: 'earthquake', count: 1 }],
  },

  {
    id: 76,
    name: 'Deep Dive',
    description: 'Continue your descent into the abyss.',
    depth: 2950,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[1, 1], [1, 6], [6, 1], [6, 6]]),
      ...dirtPattern([
        [2, 2], [2, 3], [2, 4], [2, 5],
        [5, 2], [5, 3], [5, 4], [5, 5],
      ]),
      ...rockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_dirt', target: 8 },
      { type: 'clear_rocks', target: 4 },
      { type: 'score', target: 20000 },
    ],
    maxMoves: 38,
    starThresholds: [20000, 33000, 50000],
    rewards: [],
  },

  {
    id: 77,
    name: 'Quad Challenge',
    description: 'Collect four different gem types.',
    depth: 3000,
    layout: makeLayout(8, 8, [
      ...lockedPattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...icePattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 15, gemType: 'ruby' },
      { type: 'collect_gems', target: 15, gemType: 'emerald' },
      { type: 'collect_gems', target: 15, gemType: 'diamond' },
      { type: 'collect_gems', target: 15, gemType: 'obsidian' },
    ],
    maxMoves: 45,
    starThresholds: [22000, 37000, 55000],
    rewards: [{ powerUp: 'pickaxe', count: 3 }],
  },

  {
    id: 78,
    name: 'Stone Rain',
    description: 'Rocks everywhere! Clear them all.',
    depth: 3050,
    layout: makeLayout(8, 8, [
      ...rockPattern([
        [0, 0], [0, 2], [0, 5], [0, 7],
        [2, 1], [2, 3], [2, 4], [2, 6],
        [5, 1], [5, 3], [5, 4], [5, 6],
        [7, 0], [7, 2], [7, 5], [7, 7],
      ]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [{ type: 'clear_rocks', target: 16 }],
    maxMoves: 40,
    starThresholds: [22000, 37000, 55000],
    rewards: [],
  },

  {
    id: 79,
    name: 'Lock Down',
    description: 'A heavily locked chamber.',
    depth: 3100,
    layout: makeLayout(8, 8, [
      ...lockedPattern([
        [0, 3], [0, 4], [1, 2], [1, 5],
        [2, 1], [2, 6], [3, 0], [3, 7],
        [4, 0], [4, 7], [5, 1], [5, 6],
        [6, 2], [6, 5], [7, 3], [7, 4],
      ]),
      ...bedrockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [{ type: 'score', target: 25000 }],
    maxMoves: 42,
    starThresholds: [25000, 42000, 62000],
    rewards: [{ powerUp: 'dynamite', count: 2 }],
  },

  {
    id: 80,
    name: 'Abyss Master',
    description: 'Master of the abyssal depths!',
    depth: 3200,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([[0, 0], [0, 8], [8, 0], [8, 8]]),
      ...rockPattern([[1, 4], [4, 1], [4, 7], [7, 4]]),
      ...icePattern([[2, 2], [2, 6], [6, 2], [6, 6]]),
      ...lockedPattern([[3, 3], [3, 5], [5, 3], [5, 5]]),
      ...dirtPattern([[4, 3], [4, 5], [3, 4], [5, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'collect_gems', target: 30, gemType: 'obsidian' },
    ],
    maxMoves: 50,
    starThresholds: [28000, 47000, 70000],
    rewards: [{ powerUp: 'earthquake', count: 1 }],
  },

  // ============================================================
  // ZONE 9: CORE APPROACH (Levels 81-90) - Grandmaster Trials
  // Focus: Ultimate challenges, precision gameplay
  // ============================================================

  {
    id: 81,
    name: 'Core Approach',
    description: 'Approach the very core of the earth.',
    depth: 3300,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[0, 0], [0, 7], [7, 0], [7, 7], [3, 3], [3, 4], [4, 3], [4, 4]]),
      ...rockPattern([[1, 1], [1, 6], [6, 1], [6, 6]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'score', target: 25000 },
    ],
    maxMoves: 35,
    starThresholds: [25000, 42000, 62000],
    rewards: [],
  },

  {
    id: 82,
    name: 'Precision Strike',
    description: 'Every move counts at this depth.',
    depth: 3400,
    layout: makeLayout(8, 8, [
      ...icePattern([[1, 2], [1, 5], [2, 1], [2, 6], [5, 1], [5, 6], [6, 2], [6, 5]]),
      ...lockedPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_ice', target: 8 },
      { type: 'collect_gems', target: 25, gemType: 'diamond' },
    ],
    maxMoves: 30,
    starThresholds: [22000, 37000, 55000],
    rewards: [{ powerUp: 'lantern', count: 3 }],
  },

  {
    id: 83,
    name: 'Heat Shield',
    description: 'Navigate through protective bedrock formations.',
    depth: 3500,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([
        [2, 0], [2, 2], [2, 6], [2, 8],
        [6, 0], [6, 2], [6, 6], [6, 8],
      ]),
      ...rockPattern([[3, 4], [4, 3], [4, 5], [5, 4]]),
      ...dirtPattern([[4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'score', target: 28000 },
    ],
    maxMoves: 38,
    starThresholds: [28000, 47000, 70000],
    rewards: [],
  },

  {
    id: 84,
    name: 'Ultimate Collection',
    description: 'Collect every gem type!',
    depth: 3600,
    layout: makeLayout(8, 8, [
      ...lockedPattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...bedrockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 12, gemType: 'ruby' },
      { type: 'collect_gems', target: 12, gemType: 'sapphire' },
      { type: 'collect_gems', target: 12, gemType: 'emerald' },
      { type: 'collect_gems', target: 12, gemType: 'topaz' },
    ],
    maxMoves: 45,
    starThresholds: [26000, 44000, 65000],
    rewards: [{ powerUp: 'dynamite', count: 3 }],
  },

  {
    id: 85,
    name: 'Core Pressure',
    description: 'Extreme pressure at the core approach.',
    depth: 3700,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[1, 1], [1, 6], [6, 1], [6, 6]]),
      ...rockPattern([[2, 3], [2, 4], [3, 2], [3, 5], [4, 2], [4, 5], [5, 3], [5, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 8 },
      { type: 'collect_gems', target: 25, gemType: 'obsidian' },
    ],
    maxMoves: 35,
    starThresholds: [25000, 42000, 62000],
    rewards: [],
  },

  {
    id: 86,
    name: 'Frozen Core',
    description: 'An anomalous frozen section near the core.',
    depth: 3800,
    layout: makeLayout(8, 8, [
      ...icePattern([
        [0, 0], [0, 1], [0, 6], [0, 7],
        [1, 0], [1, 7], [6, 0], [6, 7],
        [7, 0], [7, 1], [7, 6], [7, 7],
      ]),
      ...bedrockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
      ...lockedPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_ice', target: 12 },
      { type: 'score', target: 30000 },
    ],
    maxMoves: 40,
    starThresholds: [30000, 50000, 75000],
    rewards: [{ powerUp: 'drill', count: 2 }],
  },

  {
    id: 87,
    name: 'Magma Core',
    description: 'The molten core is near!',
    depth: 3900,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[0, 3], [0, 4], [7, 3], [7, 4], [3, 0], [4, 0], [3, 7], [4, 7]]),
      ...rockPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
      ...dirtPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_dirt', target: 4 },
      { type: 'collect_gems', target: 20, gemType: 'ruby' },
    ],
    maxMoves: 38,
    starThresholds: [28000, 47000, 70000],
    rewards: [],
  },

  {
    id: 88,
    name: 'Core Guardians',
    description: 'Locked guardians protect the core.',
    depth: 4000,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([[4, 4]]),
      ...lockedPattern([
        [3, 3], [3, 4], [3, 5],
        [4, 3], [4, 5],
        [5, 3], [5, 4], [5, 5],
      ]),
      ...rockPattern([[1, 4], [4, 1], [4, 7], [7, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'score', target: 32000 },
    ],
    maxMoves: 42,
    starThresholds: [32000, 53000, 80000],
    rewards: [{ powerUp: 'earthquake', count: 2 }],
  },

  {
    id: 89,
    name: 'Final Approach',
    description: 'The last stretch before the core.',
    depth: 4100,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...rockPattern([[1, 3], [1, 4], [6, 3], [6, 4]]),
      ...icePattern([[3, 1], [3, 6], [4, 1], [4, 6]]),
      ...lockedPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'collect_gems', target: 30, gemType: 'diamond' },
    ],
    maxMoves: 42,
    starThresholds: [32000, 53000, 80000],
    rewards: [],
  },

  {
    id: 90,
    name: 'Core Gate',
    description: 'The gate to the earth\'s core!',
    depth: 4200,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([
        [0, 0], [0, 4], [0, 8],
        [4, 0], [4, 4], [4, 8],
        [8, 0], [8, 4], [8, 8],
      ]),
      ...rockPattern([[2, 2], [2, 6], [6, 2], [6, 6]]),
      ...icePattern([[2, 4], [4, 2], [4, 6], [6, 4]]),
      ...lockedPattern([[3, 3], [3, 5], [5, 3], [5, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'score', target: 35000 },
    ],
    maxMoves: 48,
    starThresholds: [35000, 58000, 88000],
    rewards: [{ powerUp: 'dynamite', count: 3 }],
  },

  // ============================================================
  // ZONE 10: EARTH'S CORE (Levels 91-100) - Legendary Finale
  // Focus: The ultimate challenges for legendary miners
  // ============================================================

  {
    id: 91,
    name: 'Core Entry',
    description: 'You\'ve reached the earth\'s core!',
    depth: 4400,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
      ...rockPattern([[0, 3], [0, 4], [7, 3], [7, 4], [3, 0], [4, 0], [3, 7], [4, 7]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 8 },
      { type: 'collect_gems', target: 25, gemType: 'obsidian' },
    ],
    maxMoves: 38,
    starThresholds: [30000, 50000, 75000],
    rewards: [],
  },

  {
    id: 92,
    name: 'Molten Heart',
    description: 'The molten heart of the planet.',
    depth: 4600,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...dirtPattern([
        [1, 1], [1, 2], [1, 5], [1, 6],
        [2, 1], [2, 6], [5, 1], [5, 6],
        [6, 1], [6, 2], [6, 5], [6, 6],
      ]),
      ...lockedPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_dirt', target: 12 },
      { type: 'score', target: 35000 },
    ],
    maxMoves: 42,
    starThresholds: [35000, 58000, 88000],
    rewards: [{ powerUp: 'lantern', count: 3 }],
  },

  {
    id: 93,
    name: 'Crystal Core',
    description: 'Crystals form at the planet\'s center.',
    depth: 4800,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([[4, 4]]),
      ...icePattern([
        [3, 3], [3, 4], [3, 5],
        [4, 3], [4, 5],
        [5, 3], [5, 4], [5, 5],
      ]),
      ...rockPattern([[1, 4], [4, 1], [4, 7], [7, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_ice', target: 8 },
      { type: 'clear_rocks', target: 4 },
      { type: 'collect_gems', target: 30, gemType: 'diamond' },
    ],
    maxMoves: 45,
    starThresholds: [38000, 63000, 95000],
    rewards: [],
  },

  {
    id: 94,
    name: 'Core Pressure Max',
    description: 'Maximum pressure at the core.',
    depth: 5000,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[1, 1], [1, 6], [6, 1], [6, 6]]),
      ...rockPattern([
        [0, 3], [0, 4], [2, 2], [2, 5],
        [5, 2], [5, 5], [7, 3], [7, 4],
      ]),
      ...lockedPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 8 },
      { type: 'score', target: 40000 },
    ],
    maxMoves: 42,
    starThresholds: [40000, 67000, 100000],
    rewards: [{ powerUp: 'dynamite', count: 3 }],
  },

  {
    id: 95,
    name: 'Legendary Five',
    description: 'A legendary five-way collection challenge!',
    depth: 5200,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...icePattern([[2, 3], [2, 4], [5, 3], [5, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 15, gemType: 'amethyst' },
      { type: 'collect_gems', target: 15, gemType: 'diamond' },
      { type: 'collect_gems', target: 15, gemType: 'obsidian' },
      { type: 'collect_gems', target: 15, gemType: 'ruby' },
    ],
    maxMoves: 50,
    starThresholds: [40000, 67000, 100000],
    rewards: [],
  },

  {
    id: 96,
    name: 'Core Storm',
    description: 'A storm of obstacles at the core.',
    depth: 5400,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([[0, 0], [0, 8], [8, 0], [8, 8], [4, 4]]),
      ...rockPattern([[2, 4], [4, 2], [4, 6], [6, 4]]),
      ...icePattern([[2, 2], [2, 6], [6, 2], [6, 6]]),
      ...lockedPattern([[3, 3], [3, 5], [5, 3], [5, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'score', target: 45000 },
    ],
    maxMoves: 48,
    starThresholds: [45000, 75000, 112000],
    rewards: [{ powerUp: 'earthquake', count: 2 }],
  },

  {
    id: 97,
    name: 'Core Mastery',
    description: 'Demonstrate mastery of all obstacles.',
    depth: 5600,
    layout: makeLayout(8, 8, [
      ...bedrockPattern([[3, 3], [3, 4], [4, 3], [4, 4]]),
      ...rockPattern([[1, 3], [1, 4], [6, 3], [6, 4]]),
      ...icePattern([[3, 1], [4, 1], [3, 6], [4, 6]]),
      ...dirtPattern([[0, 0], [0, 7], [7, 0], [7, 7]]),
      ...lockedPattern([[2, 2], [2, 5], [5, 2], [5, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'clear_dirt', target: 4 },
    ],
    maxMoves: 40,
    starThresholds: [42000, 70000, 105000],
    rewards: [],
  },

  {
    id: 98,
    name: 'Penultimate',
    description: 'The second-to-last challenge awaits.',
    depth: 5800,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([
        [0, 4], [4, 0], [4, 8], [8, 4],
      ]),
      ...rockPattern([[1, 1], [1, 7], [7, 1], [7, 7]]),
      ...icePattern([[2, 4], [4, 2], [4, 6], [6, 4]]),
      ...lockedPattern([[3, 3], [3, 5], [5, 3], [5, 5]]),
      ...dirtPattern([[4, 3], [4, 5], [3, 4], [5, 4]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'collect_gems', target: 35, gemType: 'diamond' },
      { type: 'score', target: 50000 },
    ],
    maxMoves: 55,
    starThresholds: [50000, 83000, 125000],
    rewards: [{ powerUp: 'dynamite', count: 4 }],
  },

  {
    id: 99,
    name: 'Core Finale',
    description: 'One more challenge before the ultimate test.',
    depth: 6000,
    layout: makeLayout(9, 9, [
      ...bedrockPattern([[4, 4]]),
      ...rockPattern([
        [0, 4], [4, 0], [4, 8], [8, 4],
        [2, 2], [2, 6], [6, 2], [6, 6],
      ]),
      ...icePattern([[1, 4], [4, 1], [4, 7], [7, 4]]),
      ...lockedPattern([[3, 3], [3, 5], [5, 3], [5, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 8 },
      { type: 'clear_ice', target: 4 },
      { type: 'collect_gems', target: 30, gemType: 'obsidian' },
    ],
    maxMoves: 52,
    starThresholds: [52000, 87000, 130000],
    rewards: [],
  },

  {
    id: 100,
    name: 'Heart of the Earth',
    description: 'The ultimate challenge! Reach the very heart of the earth!',
    depth: 6371,
    layout: makeLayout(9, 9, [
      // Central bedrock core
      ...bedrockPattern([[4, 4]]),
      // Symmetric pattern of all obstacles
      ...rockPattern([[0, 4], [4, 0], [4, 8], [8, 4]]),
      ...icePattern([[1, 1], [1, 7], [7, 1], [7, 7]]),
      ...lockedPattern([[2, 4], [4, 2], [4, 6], [6, 4]]),
      ...dirtPattern([[3, 3], [3, 5], [5, 3], [5, 5]]),
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 4 },
      { type: 'clear_ice', target: 4 },
      { type: 'collect_gems', target: 25, gemType: 'diamond' },
      { type: 'collect_gems', target: 25, gemType: 'obsidian' },
    ],
    maxMoves: 60,
    starThresholds: [60000, 100000, 150000],
    rewards: [{ powerUp: 'earthquake', count: 3 }, { powerUp: 'dynamite', count: 5 }],
  },
];

export function getLevelById(id: number): Level | undefined {
  return LEVELS.find(l => l.id === id);
}
