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

export const LEVELS: Level[] = [
  // --- ZONE 1: Surface (Levels 1-3) ---
  {
    id: 1,
    name: 'Surface Dig',
    description: 'Your first excavation! Match gems to start mining.',
    depth: 10,
    layout: makeLayout(8, 8),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'score', target: 800 }],
    maxMoves: 25,
    starThresholds: [800, 1500, 2500],
    rewards: [{ powerUp: 'lantern', count: 1 }],
  },
  {
    id: 2,
    name: 'Shallow Mine',
    description: 'Collect rubies from the surface deposits.',
    depth: 25,
    layout: makeLayout(8, 8),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [{ type: 'collect_gems', target: 15, gemType: 'ruby' }],
    maxMoves: 25,
    starThresholds: [1000, 2000, 3000],
    rewards: [{ powerUp: 'pickaxe', count: 1 }],
  },
  {
    id: 3,
    name: 'Mineral Vein',
    description: 'A rich vein of sapphires and emeralds awaits.',
    depth: 40,
    layout: makeLayout(8, 8),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz'],
    objectives: [
      { type: 'collect_gems', target: 10, gemType: 'sapphire' },
      { type: 'collect_gems', target: 10, gemType: 'emerald' },
    ],
    maxMoves: 28,
    starThresholds: [1200, 2200, 3500],
    rewards: [{ powerUp: 'dynamite', count: 1 }],
  },

  // --- ZONE 2: Crystal Caves (Levels 4-6) ---
  {
    id: 4,
    name: 'Crystal Cave',
    description: 'Ice-covered gems need adjacent matches to free them.',
    depth: 60,
    layout: makeLayout(8, 8, [
      { row: 1, col: 2, modifier: 'ice' }, { row: 1, col: 5, modifier: 'ice' },
      { row: 2, col: 3, modifier: 'ice' }, { row: 2, col: 4, modifier: 'ice' },
      { row: 3, col: 1, modifier: 'ice' }, { row: 3, col: 6, modifier: 'ice' },
      { row: 4, col: 1, modifier: 'ice' }, { row: 4, col: 6, modifier: 'ice' },
      { row: 5, col: 3, modifier: 'ice' }, { row: 5, col: 4, modifier: 'ice' },
      { row: 6, col: 2, modifier: 'ice' }, { row: 6, col: 5, modifier: 'ice' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [
      { type: 'clear_ice', target: 12 },
    ],
    maxMoves: 25,
    starThresholds: [1500, 2800, 4000],
    rewards: [{ powerUp: 'pickaxe', count: 2 }],
  },
  {
    id: 5,
    name: 'Frozen Vein',
    description: 'Thick ice encases rare amethysts deep in the cave.',
    depth: 80,
    layout: makeLayout(8, 8, [
      { row: 0, col: 3, modifier: 'ice' }, { row: 0, col: 4, modifier: 'ice' },
      { row: 1, col: 2, modifier: 'ice' }, { row: 1, col: 5, modifier: 'ice' },
      { row: 2, col: 1, modifier: 'ice' }, { row: 2, col: 6, modifier: 'ice' },
      { row: 3, col: 0, modifier: 'ice' }, { row: 3, col: 7, modifier: 'ice' },
      { row: 4, col: 0, modifier: 'ice' }, { row: 4, col: 7, modifier: 'ice' },
      { row: 5, col: 1, modifier: 'ice' }, { row: 5, col: 6, modifier: 'ice' },
      { row: 6, col: 2, modifier: 'ice' }, { row: 6, col: 5, modifier: 'ice' },
      { row: 7, col: 3, modifier: 'ice' }, { row: 7, col: 4, modifier: 'ice' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [
      { type: 'collect_gems', target: 12, gemType: 'amethyst' },
      { type: 'clear_ice', target: 16 },
    ],
    maxMoves: 30,
    starThresholds: [2000, 3500, 5000],
    rewards: [{ powerUp: 'dynamite', count: 1 }],
  },
  {
    id: 6,
    name: 'Dusty Tunnel',
    description: 'Dig through layers of dirt to reach the gems below.',
    depth: 100,
    layout: makeLayout(8, 8, [
      { row: 2, col: 1, modifier: 'dirt' }, { row: 2, col: 2, modifier: 'dirt' },
      { row: 2, col: 3, modifier: 'dirt' }, { row: 2, col: 4, modifier: 'dirt' },
      { row: 2, col: 5, modifier: 'dirt' }, { row: 2, col: 6, modifier: 'dirt' },
      { row: 4, col: 1, modifier: 'dirt' }, { row: 4, col: 2, modifier: 'dirt' },
      { row: 4, col: 3, modifier: 'dirt' }, { row: 4, col: 4, modifier: 'dirt' },
      { row: 4, col: 5, modifier: 'dirt' }, { row: 4, col: 6, modifier: 'dirt' },
      { row: 6, col: 1, modifier: 'dirt' }, { row: 6, col: 2, modifier: 'dirt' },
      { row: 6, col: 3, modifier: 'dirt' }, { row: 6, col: 4, modifier: 'dirt' },
      { row: 6, col: 5, modifier: 'dirt' }, { row: 6, col: 6, modifier: 'dirt' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [
      { type: 'clear_dirt', target: 18 },
      { type: 'score', target: 2000 },
    ],
    maxMoves: 28,
    starThresholds: [2000, 3500, 5000],
    rewards: [{ powerUp: 'drill', count: 1 }],
  },

  // --- ZONE 3: Rocky Depths (Levels 7-9) ---
  {
    id: 7,
    name: 'Rocky Descent',
    description: 'Boulders block your path. Match adjacent gems to break them!',
    depth: 130,
    layout: makeLayout(8, 8, [
      { row: 1, col: 3, modifier: 'rock' }, { row: 1, col: 4, modifier: 'rock' },
      { row: 2, col: 2, modifier: 'rock' }, { row: 2, col: 5, modifier: 'rock' },
      { row: 3, col: 1, modifier: 'rock' }, { row: 3, col: 6, modifier: 'rock' },
      { row: 4, col: 1, modifier: 'rock' }, { row: 4, col: 6, modifier: 'rock' },
      { row: 5, col: 2, modifier: 'rock' }, { row: 5, col: 5, modifier: 'rock' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'],
    objectives: [{ type: 'clear_rocks', target: 10 }],
    maxMoves: 30,
    starThresholds: [2500, 4000, 6000],
    rewards: [{ powerUp: 'dynamite', count: 2 }],
  },
  {
    id: 8,
    name: 'The Deep',
    description: 'Diamonds appear in the deepest tunnels. Collect them!',
    depth: 160,
    layout: makeLayout(8, 8, [
      { row: 1, col: 1, modifier: 'ice' }, { row: 1, col: 6, modifier: 'ice' },
      { row: 2, col: 2, modifier: 'dirt' }, { row: 2, col: 5, modifier: 'dirt' },
      { row: 3, col: 3, modifier: 'rock' }, { row: 3, col: 4, modifier: 'rock' },
      { row: 5, col: 3, modifier: 'rock' }, { row: 5, col: 4, modifier: 'rock' },
      { row: 6, col: 2, modifier: 'dirt' }, { row: 6, col: 5, modifier: 'dirt' },
      { row: 7, col: 1, modifier: 'ice' }, { row: 7, col: 6, modifier: 'ice' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [{ type: 'collect_gems', target: 18, gemType: 'diamond' }],
    maxMoves: 30,
    starThresholds: [3000, 5000, 7500],
    rewards: [{ powerUp: 'pickaxe', count: 2 }],
  },
  {
    id: 9,
    name: 'Bedrock Layer',
    description: 'Navigate around unbreakable bedrock to clear the rocks.',
    depth: 200,
    layout: makeLayout(8, 8, [
      // Bedrock pillars creating channels
      { row: 0, col: 3, modifier: 'bedrock' }, { row: 1, col: 3, modifier: 'bedrock' },
      { row: 6, col: 4, modifier: 'bedrock' }, { row: 7, col: 4, modifier: 'bedrock' },
      { row: 3, col: 0, modifier: 'bedrock' }, { row: 3, col: 7, modifier: 'bedrock' },
      { row: 4, col: 0, modifier: 'bedrock' }, { row: 4, col: 7, modifier: 'bedrock' },
      // Rocks to clear
      { row: 1, col: 1, modifier: 'rock' }, { row: 1, col: 6, modifier: 'rock' },
      { row: 2, col: 2, modifier: 'rock' }, { row: 2, col: 5, modifier: 'rock' },
      { row: 3, col: 3, modifier: 'rock' }, { row: 3, col: 4, modifier: 'rock' },
      { row: 4, col: 3, modifier: 'rock' }, { row: 4, col: 4, modifier: 'rock' },
      { row: 5, col: 2, modifier: 'rock' }, { row: 5, col: 5, modifier: 'rock' },
      { row: 6, col: 1, modifier: 'rock' }, { row: 6, col: 6, modifier: 'rock' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [{ type: 'clear_rocks', target: 12 }],
    maxMoves: 35,
    starThresholds: [3500, 5500, 8000],
    rewards: [{ powerUp: 'earthquake', count: 1 }],
  },

  // --- ZONE 4: Obsidian Caverns (Levels 10-12) ---
  {
    id: 10,
    name: 'Obsidian Cavern',
    description: 'Dark obsidian gems appear among locked and frozen cells.',
    depth: 250,
    layout: makeLayout(8, 8, [
      { row: 0, col: 0, modifier: 'locked' }, { row: 0, col: 7, modifier: 'locked' },
      { row: 1, col: 1, modifier: 'locked' }, { row: 1, col: 6, modifier: 'locked' },
      { row: 2, col: 2, modifier: 'ice' }, { row: 2, col: 5, modifier: 'ice' },
      { row: 3, col: 3, modifier: 'ice' }, { row: 3, col: 4, modifier: 'ice' },
      { row: 4, col: 3, modifier: 'ice' }, { row: 4, col: 4, modifier: 'ice' },
      { row: 5, col: 2, modifier: 'ice' }, { row: 5, col: 5, modifier: 'ice' },
      { row: 6, col: 1, modifier: 'locked' }, { row: 6, col: 6, modifier: 'locked' },
      { row: 7, col: 0, modifier: 'locked' }, { row: 7, col: 7, modifier: 'locked' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [{ type: 'score', target: 4000 }],
    maxMoves: 28,
    starThresholds: [4000, 6500, 9000],
    rewards: [{ powerUp: 'dynamite', count: 2 }],
  },
  {
    id: 11,
    name: 'Magma Chamber',
    description: 'The heat is intense! Collect rubies and diamonds from the magma.',
    depth: 300,
    layout: makeLayout(8, 8, [
      { row: 0, col: 2, modifier: 'rock' }, { row: 0, col: 5, modifier: 'rock' },
      { row: 1, col: 1, modifier: 'dirt' }, { row: 1, col: 3, modifier: 'dirt' },
      { row: 1, col: 4, modifier: 'dirt' }, { row: 1, col: 6, modifier: 'dirt' },
      { row: 2, col: 0, modifier: 'rock' }, { row: 2, col: 7, modifier: 'rock' },
      { row: 3, col: 2, modifier: 'ice' }, { row: 3, col: 5, modifier: 'ice' },
      { row: 4, col: 2, modifier: 'ice' }, { row: 4, col: 5, modifier: 'ice' },
      { row: 5, col: 0, modifier: 'rock' }, { row: 5, col: 7, modifier: 'rock' },
      { row: 6, col: 1, modifier: 'dirt' }, { row: 6, col: 6, modifier: 'dirt' },
      { row: 7, col: 2, modifier: 'rock' }, { row: 7, col: 5, modifier: 'rock' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 15, gemType: 'ruby' },
      { type: 'collect_gems', target: 12, gemType: 'diamond' },
    ],
    maxMoves: 32,
    starThresholds: [4500, 7000, 10000],
    rewards: [{ powerUp: 'drill', count: 1 }, { powerUp: 'pickaxe', count: 2 }],
  },
  {
    id: 12,
    name: 'Crystal Labyrinth',
    description: 'Navigate a maze of bedrock pillars to clear all obstacles.',
    depth: 350,
    layout: makeLayout(9, 9, [
      // Bedrock maze walls
      { row: 1, col: 2, modifier: 'bedrock' }, { row: 1, col: 6, modifier: 'bedrock' },
      { row: 2, col: 4, modifier: 'bedrock' },
      { row: 3, col: 1, modifier: 'bedrock' }, { row: 3, col: 3, modifier: 'bedrock' },
      { row: 3, col: 5, modifier: 'bedrock' }, { row: 3, col: 7, modifier: 'bedrock' },
      { row: 5, col: 1, modifier: 'bedrock' }, { row: 5, col: 3, modifier: 'bedrock' },
      { row: 5, col: 5, modifier: 'bedrock' }, { row: 5, col: 7, modifier: 'bedrock' },
      { row: 6, col: 4, modifier: 'bedrock' },
      { row: 7, col: 2, modifier: 'bedrock' }, { row: 7, col: 6, modifier: 'bedrock' },
      // Rocks in the maze
      { row: 0, col: 4, modifier: 'rock' },
      { row: 2, col: 1, modifier: 'rock' }, { row: 2, col: 7, modifier: 'rock' },
      { row: 4, col: 0, modifier: 'rock' }, { row: 4, col: 4, modifier: 'rock' }, { row: 4, col: 8, modifier: 'rock' },
      { row: 6, col: 1, modifier: 'rock' }, { row: 6, col: 7, modifier: 'rock' },
      { row: 8, col: 4, modifier: 'rock' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [
      { type: 'clear_rocks', target: 9 },
      { type: 'score', target: 5000 },
    ],
    maxMoves: 35,
    starThresholds: [5000, 8000, 12000],
    rewards: [{ powerUp: 'earthquake', count: 1 }, { powerUp: 'dynamite', count: 1 }],
  },

  // --- ZONE 5: The Motherload (Levels 13-15) ---
  {
    id: 13,
    name: 'The Motherload',
    description: 'A massive deposit of gems surrounded by every obstacle.',
    depth: 420,
    layout: makeLayout(8, 8, [
      { row: 0, col: 0, modifier: 'bedrock' }, { row: 0, col: 7, modifier: 'bedrock' },
      { row: 7, col: 0, modifier: 'bedrock' }, { row: 7, col: 7, modifier: 'bedrock' },
      { row: 1, col: 1, modifier: 'rock' }, { row: 1, col: 2, modifier: 'ice' },
      { row: 1, col: 5, modifier: 'ice' }, { row: 1, col: 6, modifier: 'rock' },
      { row: 2, col: 1, modifier: 'dirt' }, { row: 2, col: 6, modifier: 'dirt' },
      { row: 3, col: 2, modifier: 'locked' }, { row: 3, col: 5, modifier: 'locked' },
      { row: 3, col: 3, modifier: 'rock' }, { row: 3, col: 4, modifier: 'rock' },
      { row: 4, col: 3, modifier: 'rock' }, { row: 4, col: 4, modifier: 'rock' },
      { row: 4, col: 2, modifier: 'locked' }, { row: 4, col: 5, modifier: 'locked' },
      { row: 5, col: 1, modifier: 'dirt' }, { row: 5, col: 6, modifier: 'dirt' },
      { row: 6, col: 1, modifier: 'rock' }, { row: 6, col: 2, modifier: 'ice' },
      { row: 6, col: 5, modifier: 'ice' }, { row: 6, col: 6, modifier: 'rock' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'clear_rocks', target: 8 },
      { type: 'clear_ice', target: 4 },
      { type: 'score', target: 4000 },
    ],
    maxMoves: 35,
    starThresholds: [4000, 7000, 11000],
    rewards: [{ powerUp: 'dynamite', count: 2 }, { powerUp: 'drill', count: 1 }],
  },
  {
    id: 14,
    name: 'Diamond Core',
    description: 'The earth\'s diamond core! Collect an enormous haul.',
    depth: 500,
    layout: makeLayout(9, 9, [
      // Diamond-shaped bedrock frame
      { row: 0, col: 0, modifier: 'bedrock' }, { row: 0, col: 1, modifier: 'bedrock' },
      { row: 0, col: 7, modifier: 'bedrock' }, { row: 0, col: 8, modifier: 'bedrock' },
      { row: 1, col: 0, modifier: 'bedrock' }, { row: 1, col: 8, modifier: 'bedrock' },
      { row: 7, col: 0, modifier: 'bedrock' }, { row: 7, col: 8, modifier: 'bedrock' },
      { row: 8, col: 0, modifier: 'bedrock' }, { row: 8, col: 1, modifier: 'bedrock' },
      { row: 8, col: 7, modifier: 'bedrock' }, { row: 8, col: 8, modifier: 'bedrock' },
      // Inner obstacles
      { row: 2, col: 4, modifier: 'rock' },
      { row: 3, col: 3, modifier: 'ice' }, { row: 3, col: 5, modifier: 'ice' },
      { row: 4, col: 2, modifier: 'rock' }, { row: 4, col: 4, modifier: 'locked' }, { row: 4, col: 6, modifier: 'rock' },
      { row: 5, col: 3, modifier: 'ice' }, { row: 5, col: 5, modifier: 'ice' },
      { row: 6, col: 4, modifier: 'rock' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'],
    objectives: [
      { type: 'collect_gems', target: 25, gemType: 'diamond' },
    ],
    maxMoves: 35,
    starThresholds: [6000, 10000, 15000],
    rewards: [{ powerUp: 'earthquake', count: 1 }, { powerUp: 'pickaxe', count: 3 }],
  },
  {
    id: 15,
    name: 'Heart of the Mountain',
    description: 'The deepest mine ever dug. Master all skills to conquer it!',
    depth: 666,
    layout: makeLayout(9, 9, [
      // Complex obstacle layout
      { row: 0, col: 0, modifier: 'bedrock' }, { row: 0, col: 8, modifier: 'bedrock' },
      { row: 8, col: 0, modifier: 'bedrock' }, { row: 8, col: 8, modifier: 'bedrock' },
      { row: 1, col: 2, modifier: 'rock' }, { row: 1, col: 4, modifier: 'ice' }, { row: 1, col: 6, modifier: 'rock' },
      { row: 2, col: 1, modifier: 'dirt' }, { row: 2, col: 3, modifier: 'locked' },
      { row: 2, col: 5, modifier: 'locked' }, { row: 2, col: 7, modifier: 'dirt' },
      { row: 3, col: 2, modifier: 'ice' }, { row: 3, col: 6, modifier: 'ice' },
      { row: 4, col: 0, modifier: 'bedrock' }, { row: 4, col: 4, modifier: 'rock' }, { row: 4, col: 8, modifier: 'bedrock' },
      { row: 5, col: 2, modifier: 'ice' }, { row: 5, col: 6, modifier: 'ice' },
      { row: 6, col: 1, modifier: 'dirt' }, { row: 6, col: 3, modifier: 'locked' },
      { row: 6, col: 5, modifier: 'locked' }, { row: 6, col: 7, modifier: 'dirt' },
      { row: 7, col: 2, modifier: 'rock' }, { row: 7, col: 4, modifier: 'ice' }, { row: 7, col: 6, modifier: 'rock' },
    ]),
    availableGems: ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'],
    objectives: [
      { type: 'collect_gems', target: 20, gemType: 'ruby' },
      { type: 'collect_gems', target: 20, gemType: 'sapphire' },
      { type: 'collect_gems', target: 20, gemType: 'emerald' },
    ],
    maxMoves: 45,
    starThresholds: [8000, 14000, 20000],
    rewards: [{ powerUp: 'dynamite', count: 3 }, { powerUp: 'drill', count: 2 }, { powerUp: 'earthquake', count: 1 }],
  },
];

export function getLevelById(id: number): Level | undefined {
  return LEVELS.find(l => l.id === id);
}
