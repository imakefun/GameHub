import type { GameSettings, LevelConfig } from '../types';

export const defaultSettings: GameSettings = {
  startingMoney: 100,
  startingEnergy: 50,
  maxEnergy: 100,
  energyRegenRate: 0.5, // energy per second
  tickInterval: 100, // ms
  maxFields: 10,
  maxAnimalPens: 8,
  maxOrchards: 8,
  maxMachineSlots: 10,
  maxOrders: 3,
  orderRefreshInterval: 600, // orders refresh every 10 minutes
  customerSpawnInterval: 60, // wandering customer every 60 seconds
  customerDuration: 45, // customer stays for 45 seconds
};

// Premium slot costs (for slots beyond level-unlocked ones)
export const premiumSlotCosts = [1000, 5000, 10000, 25000];

// Level configuration - defines what unlocks at each level
export const levels: LevelConfig[] = [
  { level: 1, xpRequired: 0, unlocksFields: 2, unlocksOrders: 3 },
  { level: 2, xpRequired: 100, unlocksFields: 3, unlocksPens: 1, unlocksMachineSlots: 3, unlocksOrders: 4 },
  { level: 3, xpRequired: 250, unlocksOrchards: 1 },
  { level: 4, xpRequired: 450, unlocksFields: 4, unlocksMachineSlots: 4, unlocksOrders: 5 },
  { level: 5, xpRequired: 700, unlocksPens: 2 },
  { level: 6, xpRequired: 1000, unlocksOrchards: 2, unlocksOrders: 6 },
  { level: 7, xpRequired: 1350, unlocksFields: 5, unlocksPens: 3 },
  { level: 8, xpRequired: 1750, unlocksMachineSlots: 5, unlocksOrchards: 3, unlocksOrders: 7 },
  { level: 9, xpRequired: 2200, unlocksPens: 4 },
  { level: 10, xpRequired: 2700, unlocksFields: 6, unlocksMachineSlots: 6, unlocksOrders: 8 },
  { level: 11, xpRequired: 3250, unlocksOrchards: 4 },
  { level: 12, xpRequired: 3850, unlocksOrders: 10 },
  { level: 13, xpRequired: 4500 },
  { level: 14, xpRequired: 5200, unlocksOrders: 12 },
  { level: 15, xpRequired: 6000 },
];

// Customer data for orders and wandering customers
export const customerNames = [
  { name: 'Farmer Joe', emoji: '👨‍🌾' },
  { name: 'Granny Rose', emoji: '👵' },
  { name: 'Chef Marco', emoji: '👨‍🍳' },
  { name: 'Baker Betty', emoji: '👩‍🍳' },
  { name: 'Merchant Ming', emoji: '🧑‍💼' },
  { name: 'Lady Eleanor', emoji: '👸' },
  { name: 'Sir Cedric', emoji: '🤴' },
  { name: 'Traveler Tom', emoji: '🧳' },
  { name: 'Miller Mike', emoji: '👷' },
  { name: 'Herbalist Hana', emoji: '🧑‍🔬' },
  { name: 'Innkeeper Ivan', emoji: '🧔' },
  { name: 'Princess Peony', emoji: '👧' },
];

// Slot unlock costs (kept for reference, now using level-based unlocks)
export const slotUnlockCosts = {
  field: [0, 0, 100, 250, 500, 1000], // First 2 free, then increasing
  pen: [0, 150, 400, 800],
  orchard: [0, 200, 500, 1000],
  machine: [0, 300, 600, 1200],
};
