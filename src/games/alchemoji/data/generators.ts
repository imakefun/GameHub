import type { Generator, GeneratorUpgrade } from '../types';

export const generators: Generator[] = [
  // ===== TIER 1 Generators =====
  {
    id: 'flame-pit',
    name: 'Flame Pit',
    emoji: '🕯️',
    description: 'A simple fire source that produces fire essence',
    tier: 1,
    produces: [{ elementId: 'fire', baseAmount: 1 }],
    baseEnergyCost: 0,
    baseCooldown: 3,
    unlockCost: 0,
    unlocked: true,
  },
  {
    id: 'spring',
    name: 'Spring',
    emoji: '⛲',
    description: 'A natural spring that produces water',
    tier: 1,
    produces: [{ elementId: 'water', baseAmount: 1 }],
    baseEnergyCost: 0,
    baseCooldown: 3,
    unlockCost: 0,
    unlocked: true,
  },
  {
    id: 'quarry',
    name: 'Quarry',
    emoji: '⛏️',
    description: 'Dig deep for earth essence',
    tier: 1,
    produces: [{ elementId: 'earth', baseAmount: 1 }],
    baseEnergyCost: 0,
    baseCooldown: 3,
    unlockCost: 50,
    unlocked: false,
  },
  {
    id: 'windmill',
    name: 'Windmill',
    emoji: '🌬️',
    description: 'Captures the essence of air',
    tier: 1,
    produces: [{ elementId: 'air', baseAmount: 1 }],
    baseEnergyCost: 0,
    baseCooldown: 3,
    unlockCost: 50,
    unlocked: false,
  },

  // ===== Energy Generator =====
  {
    id: 'mana-well',
    name: 'Mana Well',
    emoji: '🔮',
    description: 'Generates pure magical energy',
    tier: 1,
    produces: [{ elementId: 'energy', baseAmount: 5 }],
    baseEnergyCost: 0,
    baseCooldown: 5,
    unlockCost: 200,
    unlocked: false,
  },

  // ===== TIER 2 Generators =====
  {
    id: 'volcano',
    name: 'Mini Volcano',
    emoji: '🌋',
    description: 'Produces fire and earth together',
    tier: 2,
    produces: [
      { elementId: 'fire', baseAmount: 2 },
      { elementId: 'earth', baseAmount: 1 },
    ],
    baseEnergyCost: 5,
    baseCooldown: 4,
    unlockCost: 500,
    unlocked: false,
  },
  {
    id: 'tornado',
    name: 'Tornado Chamber',
    emoji: '🌪️',
    description: 'Harness the power of wind',
    tier: 2,
    produces: [
      { elementId: 'air', baseAmount: 3 },
    ],
    baseEnergyCost: 5,
    baseCooldown: 4,
    unlockCost: 500,
    unlocked: false,
  },

  // ===== TIER 3 Generators =====
  {
    id: 'crystal-cave',
    name: 'Crystal Cave',
    emoji: '💎',
    description: 'Rare crystal formations grow here',
    tier: 3,
    produces: [
      { elementId: 'stone', baseAmount: 2 },
      { elementId: 'crystal', baseAmount: 1 },
    ],
    baseEnergyCost: 20,
    baseCooldown: 8,
    unlockCost: 2000,
    unlocked: false,
  },
  {
    id: 'storm-tower',
    name: 'Storm Tower',
    emoji: '🗼',
    description: 'Attracts and harvests storms',
    tier: 3,
    produces: [
      { elementId: 'lightning', baseAmount: 1 },
      { elementId: 'rain', baseAmount: 2 },
    ],
    baseEnergyCost: 25,
    baseCooldown: 10,
    unlockCost: 3000,
    unlocked: false,
  },

  // ===== TIER 4 Generators =====
  {
    id: 'enchanted-forest',
    name: 'Enchanted Forest',
    emoji: '🌲',
    description: 'A magical grove of life',
    tier: 4,
    produces: [
      { elementId: 'tree', baseAmount: 1 },
      { elementId: 'flower', baseAmount: 2 },
      { elementId: 'plant', baseAmount: 3 },
    ],
    baseEnergyCost: 40,
    baseCooldown: 12,
    unlockCost: 8000,
    unlocked: false,
  },
  {
    id: 'arcane-forge',
    name: 'Arcane Forge',
    emoji: '⚒️',
    description: 'Mystical metalworking facility',
    tier: 4,
    produces: [
      { elementId: 'metal', baseAmount: 2 },
      { elementId: 'sword', baseAmount: 1 },
    ],
    baseEnergyCost: 50,
    baseCooldown: 15,
    unlockCost: 10000,
    unlocked: false,
  },

  // ===== TIER 5 Generator =====
  {
    id: 'celestial-observatory',
    name: 'Celestial Observatory',
    emoji: '🔭',
    description: 'Harness cosmic energy',
    tier: 5,
    produces: [
      { elementId: 'star', baseAmount: 1 },
      { elementId: 'moon', baseAmount: 1 },
      { elementId: 'energy', baseAmount: 20 },
    ],
    baseEnergyCost: 100,
    baseCooldown: 30,
    unlockCost: 50000,
    unlocked: false,
  },
];

// Calculate upgrade stats for a given level (1-20)
export const getUpgradeForLevel = (level: number): GeneratorUpgrade => {
  // Cost increases exponentially
  const cost = Math.floor(100 * Math.pow(1.5, level - 1));

  // Production increases by 10% per level
  const productionMultiplier = 1 + (level - 1) * 0.1;

  // Cooldown decreases by 3% per level (minimum 50% of original)
  const cooldownMultiplier = Math.max(0.5, 1 - (level - 1) * 0.03);

  // Energy cost increases slightly with level
  const energyMultiplier = 1 + (level - 1) * 0.05;

  return {
    level,
    cost,
    productionMultiplier,
    cooldownMultiplier,
    energyMultiplier,
  };
};

// Get total upgrade cost to reach a level
export const getTotalUpgradeCost = (targetLevel: number): number => {
  let total = 0;
  for (let i = 1; i < targetLevel; i++) {
    total += getUpgradeForLevel(i).cost;
  }
  return total;
};

export const getGeneratorById = (id: string): Generator | undefined =>
  generators.find((g) => g.id === id);

export const getGeneratorsByTier = (tier: number): Generator[] =>
  generators.filter((g) => g.tier === tier);

export const MAX_GENERATOR_LEVEL = 20;
