// Farming Simulation Game Types

// ============ Resources ============
export interface Resources {
  money: number;
  energy: number;
}

// ============ Leveling ============
export interface LevelConfig {
  level: number;
  xpRequired: number; // Total XP needed to reach this level
  unlocksFields?: number; // Number of fields unlocked at this level
  unlocksPens?: number;
  unlocksOrchards?: number;
  unlocksMachineSlots?: number;
  unlocksOrders?: number; // Max orders at this level
}

// ============ Crops ============
export interface Crop {
  id: string;
  name: string;
  emoji: string;
  growthTime: number; // seconds to fully grow
  yieldAmount: number;
  seedCost: number;
  baseValue: number;
  xpReward: number; // XP gained when harvesting
  unlockLevel: number; // Level required to unlock
  tier: 1 | 2 | 3;
}

export interface Field {
  id: string;
  cropId: string | null;
  plantedAt: number | null; // timestamp when planted
  isReady: boolean;
  unlocked: boolean;
}

// ============ Animals ============
export interface Animal {
  id: string;
  name: string;
  emoji: string;
  produces: string; // product id
  productionTime: number; // seconds between productions
  feedType: string; // feed item id required
  feedAmount: number; // how much feed per production cycle
  purchaseCost: number;
  baseValue: number; // value of product
  xpReward: number; // XP gained when collecting
  unlockLevel: number;
  tier: 1 | 2 | 3;
}

export interface AnimalPen {
  id: string;
  animalId: string | null;
  lastProducedAt: number | null;
  lastFedAt: number | null;
  isFed: boolean; // whether animal has been fed for this cycle
  isReady: boolean;
  unlocked: boolean;
}

// ============ Trees ============
export interface Tree {
  id: string;
  name: string;
  emoji: string;
  fruitEmoji: string;
  growthTime: number; // seconds until mature
  harvestTime: number; // seconds between harvests once mature
  yieldAmount: number;
  saplingCost: number;
  baseValue: number;
  xpReward: number;
  unlockLevel: number;
  tier: 1 | 2 | 3;
}

export interface Orchard {
  id: string;
  treeId: string | null;
  plantedAt: number | null;
  lastHarvestedAt: number | null;
  isMature: boolean;
  isReady: boolean;
  unlocked: boolean;
}

// ============ Machines ============
export interface MachineRecipe {
  id: string;
  inputs: { itemId: string; amount: number }[];
  output: { itemId: string; amount: number };
  processingTime: number; // seconds
  xpReward: number;
  unlockLevel: number; // Level required for this specific recipe
}

export interface Machine {
  id: string;
  name: string;
  emoji: string;
  description: string;
  recipes: MachineRecipe[];
  energyCost: number;
  purchaseCost: number;
  unlockLevel: number;
  tier: 1 | 2 | 3;
}

export interface MachineSlot {
  id: string;
  machineId: string | null;
  currentRecipeIndex: number | null;
  startedAt: number | null;
  isProcessing: boolean;
  isReady: boolean;
  unlocked: boolean;
}

// ============ Products ============
export interface Product {
  id: string;
  name: string;
  emoji: string;
  baseValue: number;
  category: 'crop' | 'animal' | 'fruit' | 'processed' | 'feed';
  tier: 1 | 2 | 3;
}

// ============ Orders ============
export interface OrderItem {
  itemId: string;
  amount: number;
}

export type OrderDifficulty = 'easy' | 'medium' | 'hard';

export interface Order {
  id: string;
  customerName: string;
  customerEmoji: string;
  items: OrderItem[];
  reward: number;
  bonusReward: number; // for quick completion
  xpReward: number;
  timeLimit: number; // seconds
  createdAt: number;
  difficulty: OrderDifficulty;
  slot: number; // Which order slot this occupies (0-2)
}

// ============ Wandering Customers ============
export interface WanderingCustomer {
  id: string;
  name: string;
  emoji: string;
  wantsItemId: string;
  wantsAmount: number;
  offersPrice: number; // premium price they'll pay
  xpReward: number;
  expiresAt: number;
}

// ============ Game State ============
export interface Inventory {
  [itemId: string]: number;
}

export interface GameStats {
  totalMoneyEarned: number;
  totalXpEarned: number;
  totalCropsHarvested: number;
  totalAnimalsProduced: number;
  totalFruitsHarvested: number;
  totalGoodsProcessed: number;
  totalOrdersCompleted: number;
  totalCustomersServed: number;
  playTime: number;
}

export interface PlayerProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface GameState {
  resources: Resources;
  progress: PlayerProgress;
  inventory: Inventory;
  storageLevel: number; // 0 = base (50 items), each level adds 25 capacity
  fields: Field[];
  animalPens: AnimalPen[];
  orchards: Orchard[];
  machineSlots: MachineSlot[];
  orders: Order[];
  lastOrderRefresh: number; // timestamp of last order refresh
  wanderingCustomers: WanderingCustomer[];
  stats: GameStats;
  lastTick: number;
}

// ============ Game Config ============
export interface GameSettings {
  startingMoney: number;
  startingEnergy: number;
  maxEnergy: number;
  energyRegenRate: number; // per second
  tickInterval: number; // ms
  maxFields: number;
  maxAnimalPens: number;
  maxOrchards: number;
  maxMachineSlots: number;
  maxOrders: number;
  orderRefreshInterval: number; // seconds between order refreshes
  customerSpawnInterval: number; // seconds
  customerDuration: number; // seconds before customer leaves
}

export interface GameConfig {
  crops: Crop[];
  animals: Animal[];
  trees: Tree[];
  machines: Machine[];
  products: Product[];
  levels: LevelConfig[];
  settings: GameSettings;
}

// ============ Slot Types ============
export type SlotType = 'field' | 'pen' | 'orchard' | 'machine';

// ============ Actions ============
export type GameAction =
  | { type: 'TICK'; now: number }
  | { type: 'PLANT_CROP'; fieldId: string; cropId: string }
  | { type: 'HARVEST_CROP'; fieldId: string }
  | { type: 'BUY_ANIMAL'; penId: string; animalId: string }
  | { type: 'SELL_ANIMAL'; penId: string }
  | { type: 'COLLECT_PRODUCT'; penId: string }
  | { type: 'FEED_ANIMAL'; penId: string }
  | { type: 'PLANT_TREE'; orchardId: string; treeId: string }
  | { type: 'SELL_TREE'; orchardId: string }
  | { type: 'HARVEST_FRUIT'; orchardId: string }
  | { type: 'BUY_MACHINE'; slotId: string; machineId: string }
  | { type: 'SELL_MACHINE'; slotId: string }
  | { type: 'START_PROCESSING'; slotId: string; recipeIndex: number }
  | { type: 'COLLECT_PROCESSED'; slotId: string }
  | { type: 'COMPLETE_ORDER'; orderId: string }
  | { type: 'DISMISS_ORDER'; orderId: string }
  | { type: 'REFRESH_ORDERS' }
  | { type: 'SERVE_CUSTOMER'; customerId: string }
  | { type: 'SELL_ITEM'; itemId: string; amount: number }
  | { type: 'BUY_SLOT'; slotType: SlotType; slotIndex: number }
  | { type: 'UPGRADE_STORAGE' }
  | { type: 'RESET_GAME' };

// ============ Helpers ============
export function getXpForLevel(level: number): number {
  // XP curve: each level requires more XP
  // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450, etc.
  if (level <= 1) return 0;
  return Math.floor(50 * (level - 1) * level);
}

export function getLevelForXp(totalXp: number): number {
  let level = 1;
  while (getXpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}
