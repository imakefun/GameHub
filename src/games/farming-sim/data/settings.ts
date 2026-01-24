import type { GameSettings } from '../types';

export const defaultSettings: GameSettings = {
  startingMoney: 100,
  startingEnergy: 50,
  maxEnergy: 100,
  energyRegenRate: 0.5, // energy per second
  tickInterval: 100, // ms
  maxFields: 6,
  maxAnimalPens: 4,
  maxOrchards: 4,
  maxMachineSlots: 4,
  maxOrders: 3,
  orderSpawnInterval: 60, // new order every 60 seconds
  customerSpawnInterval: 45, // wandering customer every 45 seconds
  customerDuration: 30, // customer stays for 30 seconds
};

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

// Slot unlock costs
export const slotUnlockCosts = {
  field: [0, 0, 100, 250, 500, 1000], // First 2 free, then increasing
  pen: [0, 150, 400, 800],
  orchard: [0, 200, 500, 1000],
  machine: [0, 300, 600, 1200],
};
