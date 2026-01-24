// Farming Simulation Game Types

// ============ Resources ============
export interface Resources {
  money: number;
  energy: number;
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
  tier: 1 | 2 | 3;
}

export interface Field {
  id: string;
  cropId: string | null;
  plantedAt: number | null; // timestamp when planted
  isReady: boolean;
}

// ============ Animals ============
export interface Animal {
  id: string;
  name: string;
  emoji: string;
  produces: string; // product id
  productionTime: number; // seconds between productions
  feedCost: number; // energy cost to feed
  purchaseCost: number;
  baseValue: number; // value of product
  tier: 1 | 2 | 3;
}

export interface AnimalPen {
  id: string;
  animalId: string | null;
  lastProducedAt: number | null;
  isReady: boolean;
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
  tier: 1 | 2 | 3;
}

export interface Orchard {
  id: string;
  treeId: string | null;
  plantedAt: number | null;
  lastHarvestedAt: number | null;
  isMature: boolean;
  isReady: boolean;
}

// ============ Machines ============
export interface MachineRecipe {
  inputs: { itemId: string; amount: number }[];
  output: { itemId: string; amount: number };
  processingTime: number; // seconds
}

export interface Machine {
  id: string;
  name: string;
  emoji: string;
  description: string;
  recipes: MachineRecipe[];
  energyCost: number;
  purchaseCost: number;
  tier: 1 | 2 | 3;
}

export interface MachineSlot {
  id: string;
  machineId: string | null;
  currentRecipeIndex: number | null;
  startedAt: number | null;
  isProcessing: boolean;
  isReady: boolean;
}

// ============ Products ============
export interface Product {
  id: string;
  name: string;
  emoji: string;
  baseValue: number;
  category: 'crop' | 'animal' | 'fruit' | 'processed';
  tier: 1 | 2 | 3;
}

// ============ Orders ============
export interface OrderItem {
  itemId: string;
  amount: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmoji: string;
  items: OrderItem[];
  reward: number;
  bonusReward: number; // for quick completion
  timeLimit: number; // seconds
  createdAt: number;
}

// ============ Wandering Customers ============
export interface WanderingCustomer {
  id: string;
  name: string;
  emoji: string;
  wantsItemId: string;
  wantsAmount: number;
  offersPrice: number; // premium price they'll pay
  expiresAt: number;
}

// ============ Game State ============
export interface Inventory {
  [itemId: string]: number;
}

export interface GameStats {
  totalMoneyEarned: number;
  totalCropsHarvested: number;
  totalAnimalsProduced: number;
  totalFruitsHarvested: number;
  totalGoodsProcessed: number;
  totalOrdersCompleted: number;
  totalCustomersServed: number;
  playTime: number;
}

export interface GameState {
  resources: Resources;
  inventory: Inventory;
  fields: Field[];
  animalPens: AnimalPen[];
  orchards: Orchard[];
  machineSlots: MachineSlot[];
  orders: Order[];
  wanderingCustomers: WanderingCustomer[];
  unlockedItems: string[];
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
  orderSpawnInterval: number; // seconds
  customerSpawnInterval: number; // seconds
  customerDuration: number; // seconds before customer leaves
}

export interface GameConfig {
  crops: Crop[];
  animals: Animal[];
  trees: Tree[];
  machines: Machine[];
  products: Product[];
  settings: GameSettings;
}

// ============ Actions ============
export type GameAction =
  | { type: 'TICK'; now: number }
  | { type: 'PLANT_CROP'; fieldId: string; cropId: string }
  | { type: 'HARVEST_CROP'; fieldId: string }
  | { type: 'BUY_ANIMAL'; penId: string; animalId: string }
  | { type: 'COLLECT_PRODUCT'; penId: string }
  | { type: 'FEED_ANIMAL'; penId: string }
  | { type: 'PLANT_TREE'; orchardId: string; treeId: string }
  | { type: 'HARVEST_FRUIT'; orchardId: string }
  | { type: 'BUY_MACHINE'; slotId: string; machineId: string }
  | { type: 'START_PROCESSING'; slotId: string; recipeIndex: number }
  | { type: 'COLLECT_PROCESSED'; slotId: string }
  | { type: 'COMPLETE_ORDER'; orderId: string }
  | { type: 'DISMISS_ORDER'; orderId: string }
  | { type: 'SERVE_CUSTOMER'; customerId: string }
  | { type: 'SELL_ITEM'; itemId: string; amount: number }
  | { type: 'UNLOCK_SLOT'; slotType: 'field' | 'pen' | 'orchard' | 'machine' }
  | { type: 'RESET_GAME' };
