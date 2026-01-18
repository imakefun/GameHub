// Core resource types
export interface Resources {
  money: number;
  energy: number;
}

// Element tiers based on progression
export type ElementTier = 1 | 2 | 3 | 4 | 5;

// Element definition
export interface Element {
  id: string;
  name: string;
  emoji: string;
  tier: ElementTier;
  description: string;
  baseValue: number; // Base sell value
  isBase: boolean; // True if produced by generator, false if crafted
}

// Recipe for crafting
export interface Recipe {
  id: string;
  inputs: { elementId: string; amount: number }[];
  output: { elementId: string; amount: number };
  energyCost: number;
  discovered: boolean;
}

// Generator definition
export interface Generator {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tier: ElementTier;
  produces: { elementId: string; baseAmount: number }[];
  baseEnergyCost: number; // Energy cost per production cycle
  baseCooldown: number; // Seconds between productions
  unlockCost: number;
  unlocked: boolean;
}

// Generator state (player's owned generator)
export interface GeneratorState {
  generatorId: string;
  level: number;
  lastProduced: number; // Timestamp
  autoEnabled: boolean;
}

// Upgrade costs and multipliers
export interface GeneratorUpgrade {
  level: number;
  cost: number;
  productionMultiplier: number;
  cooldownMultiplier: number;
  energyMultiplier: number;
}

// Player inventory
export interface Inventory {
  [elementId: string]: number;
}

// Market price state
export interface MarketPrices {
  [elementId: string]: {
    currentPrice: number;
    supply: number; // Affects price - higher supply = lower price
    demand: number; // Affects price - higher demand = higher price
    lastUpdate: number;
  };
}

// Full game state
export interface GameState {
  resources: Resources;
  inventory: Inventory;
  generators: GeneratorState[];
  discoveredRecipes: string[]; // Recipe IDs
  marketPrices: MarketPrices;
  stats: GameStats;
  lastSaved: number;
  lastTick: number;
}

// Game statistics
export interface GameStats {
  totalElementsCrafted: number;
  totalElementsSold: number;
  totalMoneyEarned: number;
  totalEnergySpent: number;
  recipesDiscovered: number;
  playTime: number; // Seconds
}

// Action types for game reducer
export type GameAction =
  | { type: 'TICK'; delta: number }
  | { type: 'PRODUCE'; generatorId: string }
  | { type: 'CRAFT'; recipeId: string }
  | { type: 'TRY_CRAFT'; elementIds: string[] }
  | { type: 'SELL'; elementId: string; amount: number }
  | { type: 'UPGRADE_GENERATOR'; generatorId: string }
  | { type: 'UNLOCK_GENERATOR'; generatorId: string }
  | { type: 'TOGGLE_AUTO'; generatorId: string }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' };
