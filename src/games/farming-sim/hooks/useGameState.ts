import { useReducer, useEffect, useCallback, useRef } from 'react';
import type {
  GameState,
  GameAction,
  GameConfig,
  Field,
  AnimalPen,
  Orchard,
  MachineSlot,
  Order,
  WanderingCustomer,
  OrderDifficulty,
  PlayerProgress,
  SlotType,
} from '../types';
import { getXpForLevel, getLevelForXp } from '../types';
import { customerNames, levels, premiumSlotCosts } from '../data';

// Get max level-unlockable slots for each type
const MAX_LEVEL_UNLOCKS = {
  fields: 6,
  pens: 4,
  orchards: 4,
  machineSlots: 6,
};

// Storage constants
const STORAGE_BASE_CAPACITY = 50;
const STORAGE_MAX_LEVEL = 20;

// Storage capacity per upgrade level (scales up through tiers)
// Levels 1-5: +25, Levels 6-10: +50, Levels 11-15: +100, Levels 16-20: +200
function getStoragePerUpgrade(level: number): number {
  if (level <= 5) return 25;
  if (level <= 10) return 50;
  if (level <= 15) return 100;
  return 200; // levels 16-20
}

// Storage upgrade costs - increasing costs for 20 tiers
const STORAGE_UPGRADE_COSTS = [
  250,      // Level 1: +25 = 75 capacity
  500,      // Level 2: +25 = 100 capacity
  1000,     // Level 3: +25 = 125 capacity
  1750,     // Level 4: +25 = 150 capacity
  2500,     // Level 5: +25 = 175 capacity
  3750,     // Level 6: +50 = 225 capacity
  5000,     // Level 7: +50 = 275 capacity
  7500,     // Level 8: +50 = 325 capacity
  10000,    // Level 9: +50 = 375 capacity
  15000,    // Level 10: +50 = 425 capacity
  20000,    // Level 11: +100 = 525 capacity
  27500,    // Level 12: +100 = 625 capacity
  37500,    // Level 13: +100 = 725 capacity
  50000,    // Level 14: +100 = 825 capacity
  65000,    // Level 15: +100 = 925 capacity
  87500,    // Level 16: +200 = 1125 capacity
  112500,   // Level 17: +200 = 1325 capacity
  150000,   // Level 18: +200 = 1525 capacity
  200000,   // Level 19: +200 = 1725 capacity
  250000,   // Level 20: +200 = 1925 capacity
];

// Get storage capacity for a given level
function getStorageCapacity(storageLevel: number): number {
  let capacity = STORAGE_BASE_CAPACITY;
  for (let i = 1; i <= storageLevel; i++) {
    capacity += getStoragePerUpgrade(i);
  }
  return capacity;
}

// Get the next upgrade amount for display
function getNextStorageUpgradeAmount(currentLevel: number): number {
  if (currentLevel >= STORAGE_MAX_LEVEL) return 0;
  return getStoragePerUpgrade(currentLevel + 1);
}

// Get cost to upgrade storage (undefined if max level)
function getStorageUpgradeCost(currentLevel: number): number | undefined {
  if (currentLevel >= STORAGE_MAX_LEVEL) return undefined;
  return STORAGE_UPGRADE_COSTS[currentLevel];
}

// Get total items in inventory
function getTotalInventoryCount(inventory: { [key: string]: number }): number {
  return Object.values(inventory).reduce((sum, count) => sum + count, 0);
}

// Check if there's room to add items to inventory
function hasStorageSpace(inventory: { [key: string]: number }, storageLevel: number, amountToAdd: number): boolean {
  const currentCount = getTotalInventoryCount(inventory);
  const capacity = getStorageCapacity(storageLevel);
  return currentCount + amountToAdd <= capacity;
}

// Get premium slot cost (returns undefined if not a premium slot)
function getPremiumSlotCost(slotType: SlotType, slotIndex: number): number | undefined {
  const maxLevelUnlocks = slotType === 'field' ? MAX_LEVEL_UNLOCKS.fields
    : slotType === 'pen' ? MAX_LEVEL_UNLOCKS.pens
    : slotType === 'orchard' ? MAX_LEVEL_UNLOCKS.orchards
    : MAX_LEVEL_UNLOCKS.machineSlots;

  const premiumIndex = slotIndex - maxLevelUnlocks;
  if (premiumIndex < 0 || premiumIndex >= premiumSlotCosts.length) {
    return undefined;
  }
  return premiumSlotCosts[premiumIndex];
}

// Get required level to unlock a specific slot
function getRequiredLevelForSlot(slotType: SlotType, slotIndex: number): number | undefined {
  const key = slotType === 'field' ? 'unlocksFields'
    : slotType === 'pen' ? 'unlocksPens'
    : slotType === 'orchard' ? 'unlocksOrchards'
    : 'unlocksMachineSlots';

  // Find the first level that unlocks this slot index
  for (const lvl of levels) {
    const unlocksCount = lvl[key as keyof typeof lvl] as number | undefined;
    if (unlocksCount !== undefined && slotIndex < unlocksCount) {
      return lvl.level;
    }
  }
  return undefined; // Premium slot
}

const STORAGE_KEY = 'farming-sim-save-v2';

// Get unlocked slot count based on level
function getUnlockedSlots(level: number, slotType: 'fields' | 'pens' | 'orchards' | 'machineSlots'): number {
  let count = 0;
  for (const lvl of levels) {
    if (lvl.level > level) break;
    const key = `unlocks${slotType.charAt(0).toUpperCase() + slotType.slice(1)}` as keyof typeof lvl;
    if (lvl[key]) {
      count = lvl[key] as number;
    }
  }
  return count;
}

// Calculate progress for current level
function calculateProgress(totalXp: number): PlayerProgress {
  const level = getLevelForXp(totalXp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  return {
    level,
    xp: totalXp,
    xpToNextLevel: nextLevelXp - currentLevelXp,
  };
}

// Initialize game state
function initializeState(config: GameConfig): GameState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Update lastTick to avoid huge time jumps
      return { ...parsed, lastTick: Date.now() };
    } catch {
      // Invalid save, start fresh
    }
  }

  const now = Date.now();
  const startingLevel = 1;

  // Create slots with unlock status based on level
  const fields: Field[] = Array.from({ length: config.settings.maxFields }, (_, i) => ({
    id: `field-${i}`,
    cropId: null,
    plantedAt: null,
    isReady: false,
    unlocked: i < getUnlockedSlots(startingLevel, 'fields'),
  }));

  const animalPens: AnimalPen[] = Array.from({ length: config.settings.maxAnimalPens }, (_, i) => ({
    id: `pen-${i}`,
    animalId: null,
    lastProducedAt: null,
    lastFedAt: null,
    isFed: false,
    isReady: false,
    unlocked: i < getUnlockedSlots(startingLevel, 'pens'),
  }));

  const orchards: Orchard[] = Array.from({ length: config.settings.maxOrchards }, (_, i) => ({
    id: `orchard-${i}`,
    treeId: null,
    plantedAt: null,
    lastHarvestedAt: null,
    isMature: false,
    isReady: false,
    unlocked: i < getUnlockedSlots(startingLevel, 'orchards'),
  }));

  const machineSlots: MachineSlot[] = Array.from({ length: config.settings.maxMachineSlots }, (_, i) => ({
    id: `machine-${i}`,
    machineId: null,
    currentRecipeIndex: null,
    startedAt: null,
    isProcessing: false,
    isReady: false,
    unlocked: i < getUnlockedSlots(startingLevel, 'machineSlots'),
  }));

  // Generate initial orders
  const initialOrders = generateAllOrders(config, startingLevel, now);

  return {
    resources: {
      money: config.settings.startingMoney,
      energy: config.settings.startingEnergy,
    },
    progress: {
      level: startingLevel,
      xp: 0,
      xpToNextLevel: getXpForLevel(2),
    },
    inventory: {},
    storageLevel: 0,
    fields,
    animalPens,
    orchards,
    machineSlots,
    orders: initialOrders,
    lastOrderRefresh: now,
    wanderingCustomers: [],
    stats: {
      totalMoneyEarned: 0,
      totalXpEarned: 0,
      totalCropsHarvested: 0,
      totalAnimalsProduced: 0,
      totalFruitsHarvested: 0,
      totalGoodsProcessed: 0,
      totalOrdersCompleted: 0,
      totalCustomersServed: 0,
      playTime: 0,
    },
    lastTick: now,
  };
}

// Get max orders based on player level (scales from 3 to 12)
function getMaxOrdersForLevel(config: GameConfig, level: number): number {
  let maxOrders = 3; // Base value
  for (const lvl of config.levels) {
    if (lvl.level <= level && lvl.unlocksOrders !== undefined) {
      maxOrders = lvl.unlocksOrders;
    }
  }
  return maxOrders;
}

// Get number of shipment slots based on level (unlocks at level 10)
function getShipmentSlotsForLevel(level: number): number {
  if (level < 10) return 0;
  if (level < 12) return 1;
  return 2; // 2 shipment slots at level 12+
}

// Generate only regular orders (not shipments)
function generateRegularOrders(config: GameConfig, level: number, now: number): Order[] {
  const orders: Order[] = [];
  const maxOrders = getMaxOrdersForLevel(config, level);
  for (let slot = 0; slot < maxOrders; slot++) {
    const order = generateOrder(config, level, now, slot);
    if (order) orders.push(order);
  }
  return orders;
}

// Refresh orders while preserving existing shipments
function refreshOrders(config: GameConfig, level: number, now: number, existingOrders: Order[]): Order[] {
  // Generate new regular orders
  const newOrders = generateRegularOrders(config, level, now);

  // Keep existing non-expired shipments
  const existingShipments = existingOrders.filter(o => {
    if (!o.isShipment) return false;
    const elapsed = (now - o.createdAt) / 1000;
    return elapsed < o.timeLimit; // Keep if not expired
  });

  // Check how many shipment slots we should have
  const maxShipments = getShipmentSlotsForLevel(level);
  const shipmentsToAdd = maxShipments - existingShipments.length;

  // Generate new shipments only for empty slots
  const newShipments: Order[] = [];
  if (shipmentsToAdd > 0) {
    const usedSlots = new Set(existingShipments.map(s => s.slot));
    let addedCount = 0;
    for (let i = 0; i < maxShipments && addedCount < shipmentsToAdd; i++) {
      const slotNum = 100 + i;
      if (!usedSlots.has(slotNum)) {
        const shipment = generateShipment(config, level, now, i);
        if (shipment) {
          newShipments.push(shipment);
          addedCount++;
        }
      }
    }
  }

  return [...newOrders, ...existingShipments, ...newShipments];
}

// Generate all orders including shipments (for initial load)
function generateAllOrders(config: GameConfig, level: number, now: number): Order[] {
  const orders = generateRegularOrders(config, level, now);

  // Add shipments for level 10+
  const numShipments = getShipmentSlotsForLevel(level);
  for (let i = 0; i < numShipments; i++) {
    const shipment = generateShipment(config, level, now, i);
    if (shipment) orders.push(shipment);
  }

  return orders;
}

// Generate a shipment order (large bulk order with hour-long timer)
function generateShipment(config: GameConfig, level: number, now: number, shipmentSlot: number): Order | null {
  // Get base products only (crops, fruits, animal products - NOT processed goods)
  const baseProducts = config.products.filter(p => {
    if (p.category === 'processed' || p.category === 'feed') return false;

    // Check if unlocked
    const crop = config.crops.find(c => c.id === p.id);
    if (crop) return crop.unlockLevel <= level;

    const tree = config.trees.find(t => t.id.replace('_tree', '').replace('_vine', '') === p.id);
    if (tree) return tree.unlockLevel <= level;

    const animal = config.animals.find(a => a.produces === p.id);
    if (animal) return animal.unlockLevel <= level;

    return false;
  });

  if (baseProducts.length === 0) return null;

  // 1-2 items per shipment
  const numItems = Math.random() < 0.6 ? 1 : 2;
  const items: { itemId: string; amount: number }[] = [];
  const usedIds = new Set<string>();
  let totalValue = 0;

  for (let i = 0; i < numItems; i++) {
    const availableForSlot = baseProducts.filter(p => !usedIds.has(p.id));
    if (availableForSlot.length === 0) break;

    const product = availableForSlot[Math.floor(Math.random() * availableForSlot.length)];
    usedIds.add(product.id);

    // 10-20x the quantity of standard orders (base is 1-3, so 10-60)
    const multiplier = 10 + Math.floor(Math.random() * 11); // 10-20
    const baseAmount = Math.floor(Math.random() * 3) + 2; // 2-4 base
    const amount = baseAmount * multiplier;
    items.push({ itemId: product.id, amount });
    totalValue += product.baseValue * amount;
  }

  if (items.length === 0) return null;

  // Shipment customers (companies/merchants)
  const shipmentCustomers = [
    { name: 'Farm Co-op', emoji: '🚛' },
    { name: 'Valley Exports', emoji: '📦' },
    { name: 'Harbor Trading', emoji: '⚓' },
    { name: 'Mountain Markets', emoji: '🏔️' },
    { name: 'City Grocers', emoji: '🏙️' },
    { name: 'Royal Pantry', emoji: '👑' },
  ];
  const customer = shipmentCustomers[Math.floor(Math.random() * shipmentCustomers.length)];

  return {
    id: `shipment-${now}-${shipmentSlot}-${Math.random().toString(36).slice(2, 8)}`,
    customerName: customer.name,
    customerEmoji: customer.emoji,
    items,
    reward: Math.floor(totalValue * 1.3), // Slightly lower margin than regular orders
    bonusReward: Math.floor(totalValue * 0.3),
    xpReward: Math.floor(50 * items.length), // Good XP for bulk orders
    timeLimit: 3600, // 1 hour
    createdAt: now,
    difficulty: 'hard', // Shipments are always hard difficulty
    slot: 100 + shipmentSlot, // Use high slot numbers for shipments
    isShipment: true,
  };
}

function generateOrder(config: GameConfig, level: number, now: number, slot: number): Order | null {
  // Determine difficulty based on slot and level
  // Distribute difficulties across slots: ~40% easy, ~35% medium, ~25% hard
  let difficulty: OrderDifficulty;
  if (level < 3) {
    difficulty = 'easy';
  } else if (level < 6) {
    // Low level: mostly easy with some medium
    difficulty = slot % 3 === 0 ? 'easy' : slot % 3 === 1 ? 'medium' : 'easy';
  } else if (level < 10) {
    // Mid level: mix of all
    difficulty = slot % 3 === 0 ? 'easy' : slot % 3 === 1 ? 'medium' : 'hard';
  } else {
    // High level: harder mix
    difficulty = slot % 4 === 0 ? 'easy' : slot % 4 <= 2 ? 'medium' : 'hard';
  }

  // Get available products based on level
  const availableProducts = config.products.filter(p => {
    // Check if this product can be obtained at current level
    const crop = config.crops.find(c => c.id === p.id);
    if (crop) return crop.unlockLevel <= level;

    const tree = config.trees.find(t => t.id.replace('_tree', '').replace('_vine', '') === p.id);
    if (tree) return tree.unlockLevel <= level;

    const animal = config.animals.find(a => a.produces === p.id);
    if (animal) return animal.unlockLevel <= level;

    // For processed goods, check if the recipe is unlocked
    for (const machine of config.machines) {
      if (machine.unlockLevel > level) continue;
      for (const recipe of machine.recipes) {
        if (recipe.output.itemId === p.id && recipe.unlockLevel <= level) {
          return true;
        }
      }
    }

    return false;
  });

  // Filter out feed items from orders
  const orderableProducts = availableProducts.filter(p => p.category !== 'feed');

  if (orderableProducts.length === 0) return null;

  // Determine number of items based on difficulty
  let numItems: number;
  let amountMultiplier: number;
  let timeLimit: number;

  switch (difficulty) {
    case 'easy':
      numItems = 1;
      amountMultiplier = 1;
      timeLimit = 540; // 9 minutes
      break;
    case 'medium':
      numItems = Math.random() < 0.5 ? 1 : 2;
      amountMultiplier = 1.5;
      timeLimit = 720; // 12 minutes
      break;
    case 'hard':
      numItems = Math.floor(Math.random() * 2) + 2; // 2-3 items
      amountMultiplier = 2;
      timeLimit = 900; // 15 minutes
      break;
  }

  const items: { itemId: string; amount: number }[] = [];
  const usedIds = new Set<string>();
  let totalValue = 0;

  for (let i = 0; i < numItems; i++) {
    const availableForSlot = orderableProducts.filter(p => !usedIds.has(p.id));
    if (availableForSlot.length === 0) break;

    const product = availableForSlot[Math.floor(Math.random() * availableForSlot.length)];
    usedIds.add(product.id);

    const baseAmount = Math.floor(Math.random() * 3) + 1;
    const amount = Math.ceil(baseAmount * amountMultiplier);
    items.push({ itemId: product.id, amount });
    totalValue += product.baseValue * amount;
  }

  if (items.length === 0) return null;

  const customer = customerNames[Math.floor(Math.random() * customerNames.length)];

  // XP reward scales with difficulty
  const xpMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;

  return {
    id: `order-${now}-${slot}-${Math.random().toString(36).slice(2, 8)}`,
    customerName: customer.name,
    customerEmoji: customer.emoji,
    items,
    reward: Math.floor(totalValue * 1.5),
    bonusReward: Math.floor(totalValue * 0.5),
    xpReward: Math.floor(10 * xpMultiplier * items.length),
    timeLimit,
    createdAt: now,
    difficulty,
    slot,
  };
}

function generateWanderingCustomer(config: GameConfig, state: GameState, now: number): WanderingCustomer | null {
  const availableProducts = config.products.filter(p =>
    (state.inventory[p.id] || 0) > 0 && p.category !== 'feed'
  );

  if (availableProducts.length === 0) return null;

  const product = availableProducts[Math.floor(Math.random() * availableProducts.length)];
  const amount = Math.min(
    Math.floor(Math.random() * 3) + 1,
    state.inventory[product.id] || 0
  );

  const customer = customerNames[Math.floor(Math.random() * customerNames.length)];

  return {
    id: `customer-${now}-${Math.random().toString(36).slice(2, 8)}`,
    name: customer.name,
    emoji: customer.emoji,
    wantsItemId: product.id,
    wantsAmount: amount,
    offersPrice: Math.floor(product.baseValue * amount * 1.8),
    xpReward: Math.floor(5 * amount),
    expiresAt: now + config.settings.customerDuration * 1000,
  };
}

// Add XP and handle level up
function addXp(state: GameState, xpGained: number, _config: GameConfig): GameState {
  const newTotalXp = state.progress.xp + xpGained;
  const newLevel = getLevelForXp(newTotalXp);
  const leveledUp = newLevel > state.progress.level;

  let newState = {
    ...state,
    progress: calculateProgress(newTotalXp),
    stats: {
      ...state.stats,
      totalXpEarned: state.stats.totalXpEarned + xpGained,
    },
  };

  // If leveled up, unlock new slots (but preserve purchased premium slots)
  if (leveledUp) {
    newState = {
      ...newState,
      fields: newState.fields.map((f, i) => ({
        ...f,
        unlocked: f.unlocked || i < getUnlockedSlots(newLevel, 'fields'),
      })),
      animalPens: newState.animalPens.map((p, i) => ({
        ...p,
        unlocked: p.unlocked || i < getUnlockedSlots(newLevel, 'pens'),
      })),
      orchards: newState.orchards.map((o, i) => ({
        ...o,
        unlocked: o.unlocked || i < getUnlockedSlots(newLevel, 'orchards'),
      })),
      machineSlots: newState.machineSlots.map((s, i) => ({
        ...s,
        unlocked: s.unlocked || i < getUnlockedSlots(newLevel, 'machineSlots'),
      })),
    };
  }

  return newState;
}

// Create the game reducer
function createGameReducer(config: GameConfig) {
  return function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case 'TICK': {
        const now = action.now;
        const delta = (now - state.lastTick) / 1000;

        let newState = { ...state, lastTick: now };

        // Regenerate energy
        const newEnergy = Math.min(
          config.settings.maxEnergy,
          newState.resources.energy + config.settings.energyRegenRate * delta
        );
        newState.resources = { ...newState.resources, energy: newEnergy };

        // Update play time
        newState.stats = { ...newState.stats, playTime: newState.stats.playTime + delta };

        // Update fields
        newState.fields = newState.fields.map(field => {
          if (!field.cropId || !field.plantedAt) return field;
          const crop = config.crops.find(c => c.id === field.cropId);
          if (!crop) return field;

          const elapsed = (now - field.plantedAt) / 1000;
          const isReady = elapsed >= crop.growthTime;
          return { ...field, isReady };
        });

        // Update animal pens - only produce if fed
        newState.animalPens = newState.animalPens.map(pen => {
          if (!pen.animalId || !pen.lastProducedAt) return pen;
          const animal = config.animals.find(a => a.id === pen.animalId);
          if (!animal) return pen;

          // Bees don't need feed
          if (animal.feedType === 'none') {
            const elapsed = (now - pen.lastProducedAt) / 1000;
            const isReady = elapsed >= animal.productionTime;
            return { ...pen, isReady, isFed: true };
          }

          // Other animals need to be fed
          if (!pen.isFed) {
            return { ...pen, isReady: false };
          }

          const elapsed = (now - pen.lastProducedAt) / 1000;
          const isReady = elapsed >= animal.productionTime;
          return { ...pen, isReady };
        });

        // Update orchards
        newState.orchards = newState.orchards.map(orchard => {
          if (!orchard.treeId || !orchard.plantedAt) return orchard;
          const tree = config.trees.find(t => t.id === orchard.treeId);
          if (!tree) return orchard;

          const plantedElapsed = (now - orchard.plantedAt) / 1000;
          const isMature = plantedElapsed >= tree.growthTime;

          if (!isMature) return { ...orchard, isMature: false, isReady: false };

          const harvestElapsed = orchard.lastHarvestedAt
            ? (now - orchard.lastHarvestedAt) / 1000
            : tree.harvestTime;
          const isReady = harvestElapsed >= tree.harvestTime;

          return { ...orchard, isMature, isReady };
        });

        // Update machine slots
        newState.machineSlots = newState.machineSlots.map(slot => {
          if (!slot.machineId || !slot.isProcessing || !slot.startedAt || slot.currentRecipeIndex === null) return slot;
          const machine = config.machines.find(m => m.id === slot.machineId);
          if (!machine) return slot;

          const recipe = machine.recipes[slot.currentRecipeIndex];
          if (!recipe) return slot;

          const elapsed = (now - slot.startedAt) / 1000;
          const isReady = elapsed >= recipe.processingTime;
          return { ...slot, isReady };
        });

        // Remove expired customers
        newState.wanderingCustomers = newState.wanderingCustomers.filter(
          customer => now < customer.expiresAt
        );

        // Check if orders need to refresh (preserves existing shipments)
        const timeSinceRefresh = (now - newState.lastOrderRefresh) / 1000;
        if (timeSinceRefresh >= config.settings.orderRefreshInterval) {
          newState.orders = refreshOrders(config, newState.progress.level, now, newState.orders);
          newState.lastOrderRefresh = now;
        }

        // Spawn wandering customer
        if (newState.wanderingCustomers.length < 2) {
          const shouldSpawn = Math.random() < (delta / config.settings.customerSpawnInterval);
          if (shouldSpawn) {
            const newCustomer = generateWanderingCustomer(config, newState, now);
            if (newCustomer) {
              newState.wanderingCustomers = [...newState.wanderingCustomers, newCustomer];
            }
          }
        }

        return newState;
      }

      case 'PLANT_CROP': {
        const { fieldId, cropId } = action;
        const crop = config.crops.find(c => c.id === cropId);
        if (!crop) return state;
        if (crop.unlockLevel > state.progress.level) return state;

        const field = state.fields.find(f => f.id === fieldId);
        if (!field || !field.unlocked || field.cropId) return state;

        if (state.resources.money < crop.seedCost) return state;

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money - crop.seedCost,
          },
          fields: state.fields.map(f =>
            f.id === fieldId
              ? { ...f, cropId, plantedAt: Date.now(), isReady: false }
              : f
          ),
        };
      }

      case 'HARVEST_CROP': {
        const { fieldId } = action;
        const field = state.fields.find(f => f.id === fieldId);
        if (!field || !field.cropId || !field.isReady) return state;

        const crop = config.crops.find(c => c.id === field.cropId);
        if (!crop) return state;

        // Check storage capacity
        if (!hasStorageSpace(state.inventory, state.storageLevel, crop.yieldAmount)) return state;

        const currentAmount = state.inventory[crop.id] || 0;
        let newState = {
          ...state,
          inventory: {
            ...state.inventory,
            [crop.id]: currentAmount + crop.yieldAmount,
          },
          fields: state.fields.map(f =>
            f.id === fieldId
              ? { ...f, cropId: null, plantedAt: null, isReady: false }
              : f
          ),
          stats: {
            ...state.stats,
            totalCropsHarvested: state.stats.totalCropsHarvested + crop.yieldAmount,
          },
        };

        return addXp(newState, crop.xpReward, config);
      }

      case 'BUY_ANIMAL': {
        const { penId, animalId } = action;
        const animal = config.animals.find(a => a.id === animalId);
        if (!animal) return state;
        if (animal.unlockLevel > state.progress.level) return state;

        const pen = state.animalPens.find(p => p.id === penId);
        if (!pen || !pen.unlocked || pen.animalId) return state;

        if (state.resources.money < animal.purchaseCost) return state;

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money - animal.purchaseCost,
          },
          animalPens: state.animalPens.map(p =>
            p.id === penId
              ? { ...p, animalId, lastProducedAt: Date.now(), lastFedAt: null, isFed: animal.feedType === 'none', isReady: false }
              : p
          ),
        };
      }

      case 'COLLECT_PRODUCT': {
        const { penId } = action;
        const pen = state.animalPens.find(p => p.id === penId);
        if (!pen || !pen.animalId || !pen.isReady) return state;

        const animal = config.animals.find(a => a.id === pen.animalId);
        if (!animal) return state;

        // Check storage capacity
        if (!hasStorageSpace(state.inventory, state.storageLevel, 1)) return state;

        const currentAmount = state.inventory[animal.produces] || 0;
        let newState = {
          ...state,
          inventory: {
            ...state.inventory,
            [animal.produces]: currentAmount + 1,
          },
          animalPens: state.animalPens.map(p =>
            p.id === penId
              ? { ...p, lastProducedAt: Date.now(), isFed: animal.feedType === 'none', isReady: false }
              : p
          ),
          stats: {
            ...state.stats,
            totalAnimalsProduced: state.stats.totalAnimalsProduced + 1,
          },
        };

        return addXp(newState, animal.xpReward, config);
      }

      case 'FEED_ANIMAL': {
        const { penId } = action;
        const pen = state.animalPens.find(p => p.id === penId);
        if (!pen || !pen.animalId || pen.isFed) return state;

        const animal = config.animals.find(a => a.id === pen.animalId);
        if (!animal || animal.feedType === 'none') return state;

        // Check if player has the required feed
        const hasFeed = (state.inventory[animal.feedType] || 0) >= animal.feedAmount;
        if (!hasFeed) return state;

        return {
          ...state,
          inventory: {
            ...state.inventory,
            [animal.feedType]: (state.inventory[animal.feedType] || 0) - animal.feedAmount,
          },
          animalPens: state.animalPens.map(p =>
            p.id === penId
              ? { ...p, isFed: true, lastFedAt: Date.now() }
              : p
          ),
        };
      }

      case 'PLANT_TREE': {
        const { orchardId, treeId } = action;
        const tree = config.trees.find(t => t.id === treeId);
        if (!tree) return state;
        if (tree.unlockLevel > state.progress.level) return state;

        const orchard = state.orchards.find(o => o.id === orchardId);
        if (!orchard || !orchard.unlocked || orchard.treeId) return state;

        if (state.resources.money < tree.saplingCost) return state;

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money - tree.saplingCost,
          },
          orchards: state.orchards.map(o =>
            o.id === orchardId
              ? { ...o, treeId, plantedAt: Date.now(), lastHarvestedAt: null, isMature: false, isReady: false }
              : o
          ),
        };
      }

      case 'HARVEST_FRUIT': {
        const { orchardId } = action;
        const orchard = state.orchards.find(o => o.id === orchardId);
        if (!orchard || !orchard.treeId || !orchard.isMature || !orchard.isReady) return state;

        const tree = config.trees.find(t => t.id === orchard.treeId);
        if (!tree) return state;

        // Check storage capacity
        if (!hasStorageSpace(state.inventory, state.storageLevel, tree.yieldAmount)) return state;

        const fruitId = tree.id.replace('_tree', '').replace('_vine', '');
        const currentAmount = state.inventory[fruitId] || 0;

        let newState = {
          ...state,
          inventory: {
            ...state.inventory,
            [fruitId]: currentAmount + tree.yieldAmount,
          },
          orchards: state.orchards.map(o =>
            o.id === orchardId
              ? { ...o, lastHarvestedAt: Date.now(), isReady: false }
              : o
          ),
          stats: {
            ...state.stats,
            totalFruitsHarvested: state.stats.totalFruitsHarvested + tree.yieldAmount,
          },
        };

        return addXp(newState, tree.xpReward, config);
      }

      case 'BUY_MACHINE': {
        const { slotId, machineId } = action;
        const machine = config.machines.find(m => m.id === machineId);
        if (!machine) return state;
        if (machine.unlockLevel > state.progress.level) return state;

        const slot = state.machineSlots.find(s => s.id === slotId);
        if (!slot || !slot.unlocked || slot.machineId) return state;

        if (state.resources.money < machine.purchaseCost) return state;

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money - machine.purchaseCost,
          },
          machineSlots: state.machineSlots.map(s =>
            s.id === slotId
              ? { ...s, machineId, currentRecipeIndex: null, startedAt: null, isProcessing: false, isReady: false }
              : s
          ),
        };
      }

      case 'SELL_MACHINE': {
        const { slotId } = action;
        const slot = state.machineSlots.find(s => s.id === slotId);
        if (!slot || !slot.machineId) return state;
        // Can't sell while processing
        if (slot.isProcessing) return state;

        const machine = config.machines.find(m => m.id === slot.machineId);
        if (!machine) return state;

        const refund = Math.floor(machine.purchaseCost * 0.5);

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money + refund,
          },
          machineSlots: state.machineSlots.map(s =>
            s.id === slotId
              ? { ...s, machineId: null, currentRecipeIndex: null, startedAt: null, isProcessing: false, isReady: false }
              : s
          ),
        };
      }

      case 'SELL_ANIMAL': {
        const { penId } = action;
        const pen = state.animalPens.find(p => p.id === penId);
        if (!pen || !pen.animalId) return state;

        const animal = config.animals.find(a => a.id === pen.animalId);
        if (!animal) return state;

        const refund = Math.floor(animal.purchaseCost * 0.5);

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money + refund,
          },
          animalPens: state.animalPens.map(p =>
            p.id === penId
              ? { ...p, animalId: null, lastProducedAt: null, lastFedAt: null, isFed: false, isReady: false }
              : p
          ),
        };
      }

      case 'SELL_TREE': {
        const { orchardId } = action;
        const orchard = state.orchards.find(o => o.id === orchardId);
        if (!orchard || !orchard.treeId) return state;

        const tree = config.trees.find(t => t.id === orchard.treeId);
        if (!tree) return state;

        const refund = Math.floor(tree.saplingCost * 0.5);

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money + refund,
          },
          orchards: state.orchards.map(o =>
            o.id === orchardId
              ? { ...o, treeId: null, plantedAt: null, lastHarvestedAt: null, isMature: false, isReady: false }
              : o
          ),
        };
      }

      case 'START_PROCESSING': {
        const { slotId, recipeIndex } = action;
        const slot = state.machineSlots.find(s => s.id === slotId);
        if (!slot || !slot.machineId || slot.isProcessing) return state;

        const machine = config.machines.find(m => m.id === slot.machineId);
        if (!machine) return state;

        const recipe = machine.recipes[recipeIndex];
        if (!recipe) return state;
        if (recipe.unlockLevel > state.progress.level) return state;

        if (state.resources.energy < machine.energyCost) return state;

        const hasIngredients = recipe.inputs.every(input =>
          (state.inventory[input.itemId] || 0) >= input.amount
        );
        if (!hasIngredients) return state;

        const newInventory = { ...state.inventory };
        recipe.inputs.forEach(input => {
          newInventory[input.itemId] = (newInventory[input.itemId] || 0) - input.amount;
        });

        return {
          ...state,
          resources: {
            ...state.resources,
            energy: state.resources.energy - machine.energyCost,
          },
          inventory: newInventory,
          machineSlots: state.machineSlots.map(s =>
            s.id === slotId
              ? { ...s, currentRecipeIndex: recipeIndex, startedAt: Date.now(), isProcessing: true, isReady: false }
              : s
          ),
        };
      }

      case 'COLLECT_PROCESSED': {
        const { slotId } = action;
        const slot = state.machineSlots.find(s => s.id === slotId);
        if (!slot || !slot.machineId || !slot.isReady || slot.currentRecipeIndex === null) return state;

        const machine = config.machines.find(m => m.id === slot.machineId);
        if (!machine) return state;

        const recipe = machine.recipes[slot.currentRecipeIndex];
        if (!recipe) return state;

        // Check storage capacity
        if (!hasStorageSpace(state.inventory, state.storageLevel, recipe.output.amount)) return state;

        const currentAmount = state.inventory[recipe.output.itemId] || 0;

        let newState = {
          ...state,
          inventory: {
            ...state.inventory,
            [recipe.output.itemId]: currentAmount + recipe.output.amount,
          },
          machineSlots: state.machineSlots.map(s =>
            s.id === slotId
              ? { ...s, currentRecipeIndex: null, startedAt: null, isProcessing: false, isReady: false }
              : s
          ),
          stats: {
            ...state.stats,
            totalGoodsProcessed: state.stats.totalGoodsProcessed + recipe.output.amount,
          },
        };

        return addXp(newState, recipe.xpReward, config);
      }

      case 'COMPLETE_ORDER': {
        const { orderId } = action;
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return state;

        const hasItems = order.items.every(item =>
          (state.inventory[item.itemId] || 0) >= item.amount
        );
        if (!hasItems) return state;

        const newInventory = { ...state.inventory };
        order.items.forEach(item => {
          newInventory[item.itemId] = (newInventory[item.itemId] || 0) - item.amount;
        });

        const elapsed = (Date.now() - order.createdAt) / 1000;
        const reward = elapsed < order.timeLimit / 2
          ? order.reward + order.bonusReward
          : order.reward;

        let newState = {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money + reward,
          },
          inventory: newInventory,
          orders: state.orders.filter(o => o.id !== orderId),
          stats: {
            ...state.stats,
            totalMoneyEarned: state.stats.totalMoneyEarned + reward,
            totalOrdersCompleted: state.stats.totalOrdersCompleted + 1,
          },
        };

        return addXp(newState, order.xpReward, config);
      }

      case 'DISMISS_ORDER': {
        const { orderId } = action;
        return {
          ...state,
          orders: state.orders.filter(o => o.id !== orderId),
        };
      }

      case 'REFRESH_ORDERS': {
        const now = Date.now();
        return {
          ...state,
          orders: refreshOrders(config, state.progress.level, now, state.orders),
          lastOrderRefresh: now,
        };
      }

      case 'SERVE_CUSTOMER': {
        const { customerId } = action;
        const customer = state.wanderingCustomers.find(c => c.id === customerId);
        if (!customer) return state;

        if ((state.inventory[customer.wantsItemId] || 0) < customer.wantsAmount) return state;

        let newState = {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money + customer.offersPrice,
          },
          inventory: {
            ...state.inventory,
            [customer.wantsItemId]: (state.inventory[customer.wantsItemId] || 0) - customer.wantsAmount,
          },
          wanderingCustomers: state.wanderingCustomers.filter(c => c.id !== customerId),
          stats: {
            ...state.stats,
            totalMoneyEarned: state.stats.totalMoneyEarned + customer.offersPrice,
            totalCustomersServed: state.stats.totalCustomersServed + 1,
          },
        };

        return addXp(newState, customer.xpReward, config);
      }

      case 'SELL_ITEM': {
        const { itemId, amount } = action;
        const product = config.products.find(p => p.id === itemId);
        if (!product) return state;

        const currentAmount = state.inventory[itemId] || 0;
        if (currentAmount < amount) return state;

        const salePrice = product.baseValue * amount;

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money + salePrice,
          },
          inventory: {
            ...state.inventory,
            [itemId]: currentAmount - amount,
          },
          stats: {
            ...state.stats,
            totalMoneyEarned: state.stats.totalMoneyEarned + salePrice,
          },
        };
      }

      case 'BUY_SLOT': {
        const { slotType, slotIndex } = action;
        const cost = getPremiumSlotCost(slotType, slotIndex);

        // Not a valid premium slot
        if (cost === undefined) return state;

        // Can't afford
        if (state.resources.money < cost) return state;

        // Get the appropriate slots array and check if already unlocked
        let slots: { unlocked: boolean }[];
        switch (slotType) {
          case 'field':
            slots = state.fields;
            break;
          case 'pen':
            slots = state.animalPens;
            break;
          case 'orchard':
            slots = state.orchards;
            break;
          case 'machine':
            slots = state.machineSlots;
            break;
        }

        // Check if slot exists and is not already unlocked
        if (slotIndex >= slots.length || slots[slotIndex].unlocked) {
          return state;
        }

        // Deduct money and unlock the slot
        const newState = {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money - cost,
          },
        };

        switch (slotType) {
          case 'field':
            newState.fields = state.fields.map((f, i) =>
              i === slotIndex ? { ...f, unlocked: true } : f
            );
            break;
          case 'pen':
            newState.animalPens = state.animalPens.map((p, i) =>
              i === slotIndex ? { ...p, unlocked: true } : p
            );
            break;
          case 'orchard':
            newState.orchards = state.orchards.map((o, i) =>
              i === slotIndex ? { ...o, unlocked: true } : o
            );
            break;
          case 'machine':
            newState.machineSlots = state.machineSlots.map((s, i) =>
              i === slotIndex ? { ...s, unlocked: true } : s
            );
            break;
        }

        return newState;
      }

      case 'UPGRADE_STORAGE': {
        const cost = getStorageUpgradeCost(state.storageLevel);
        if (cost === undefined) return state; // Max level reached
        if (state.resources.money < cost) return state;

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money - cost,
          },
          storageLevel: state.storageLevel + 1,
        };
      }

      case 'SWAP_ANIMALS': {
        const { penId1, penId2 } = action;
        if (penId1 === penId2) return state;

        const pen1 = state.animalPens.find(p => p.id === penId1);
        const pen2 = state.animalPens.find(p => p.id === penId2);
        if (!pen1 || !pen2) return state;
        if (!pen1.unlocked || !pen2.unlocked) return state;

        return {
          ...state,
          animalPens: state.animalPens.map(pen => {
            if (pen.id === penId1) {
              return { ...pen, animalId: pen2.animalId, lastProducedAt: pen2.lastProducedAt, isFed: pen2.isFed, isReady: pen2.isReady };
            }
            if (pen.id === penId2) {
              return { ...pen, animalId: pen1.animalId, lastProducedAt: pen1.lastProducedAt, isFed: pen1.isFed, isReady: pen1.isReady };
            }
            return pen;
          }),
        };
      }

      case 'SWAP_TREES': {
        const { orchardId1, orchardId2 } = action;
        if (orchardId1 === orchardId2) return state;

        const orchard1 = state.orchards.find(o => o.id === orchardId1);
        const orchard2 = state.orchards.find(o => o.id === orchardId2);
        if (!orchard1 || !orchard2) return state;
        if (!orchard1.unlocked || !orchard2.unlocked) return state;

        return {
          ...state,
          orchards: state.orchards.map(orchard => {
            if (orchard.id === orchardId1) {
              return {
                ...orchard,
                treeId: orchard2.treeId,
                plantedAt: orchard2.plantedAt,
                isMature: orchard2.isMature,
                lastHarvestedAt: orchard2.lastHarvestedAt,
                isReady: orchard2.isReady,
              };
            }
            if (orchard.id === orchardId2) {
              return {
                ...orchard,
                treeId: orchard1.treeId,
                plantedAt: orchard1.plantedAt,
                isMature: orchard1.isMature,
                lastHarvestedAt: orchard1.lastHarvestedAt,
                isReady: orchard1.isReady,
              };
            }
            return orchard;
          }),
        };
      }

      case 'SWAP_MACHINES': {
        const { slotId1, slotId2 } = action;
        if (slotId1 === slotId2) return state;

        const slot1 = state.machineSlots.find(s => s.id === slotId1);
        const slot2 = state.machineSlots.find(s => s.id === slotId2);
        if (!slot1 || !slot2) return state;
        if (!slot1.unlocked || !slot2.unlocked) return state;

        return {
          ...state,
          machineSlots: state.machineSlots.map(slot => {
            if (slot.id === slotId1) {
              return {
                ...slot,
                machineId: slot2.machineId,
                currentRecipeIndex: slot2.currentRecipeIndex,
                startedAt: slot2.startedAt,
                isProcessing: slot2.isProcessing,
                isReady: slot2.isReady,
              };
            }
            if (slot.id === slotId2) {
              return {
                ...slot,
                machineId: slot1.machineId,
                currentRecipeIndex: slot1.currentRecipeIndex,
                startedAt: slot1.startedAt,
                isProcessing: slot1.isProcessing,
                isReady: slot1.isReady,
              };
            }
            return slot;
          }),
        };
      }

      case 'RESET_GAME': {
        localStorage.removeItem(STORAGE_KEY);
        return initializeState(config);
      }

      default:
        return state;
    }
  };
}

// Main hook
export function useGameState(config: GameConfig) {
  const [state, dispatch] = useReducer(
    createGameReducer(config),
    config,
    initializeState
  );

  const lastSaveRef = useRef(Date.now());

  // Auto-save
  useEffect(() => {
    const now = Date.now();
    if (now - lastSaveRef.current > 5000) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      lastSaveRef.current = now;
    }
  }, [state]);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK', now: Date.now() });
    }, config.settings.tickInterval);

    return () => clearInterval(interval);
  }, [config.settings.tickInterval]);

  // Save on unmount
  useEffect(() => {
    return () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };
  }, [state]);

  // Action callbacks
  const plantCrop = useCallback((fieldId: string, cropId: string) => {
    dispatch({ type: 'PLANT_CROP', fieldId, cropId });
  }, []);

  const harvestCrop = useCallback((fieldId: string) => {
    dispatch({ type: 'HARVEST_CROP', fieldId });
  }, []);

  const buyAnimal = useCallback((penId: string, animalId: string) => {
    dispatch({ type: 'BUY_ANIMAL', penId, animalId });
  }, []);

  const collectProduct = useCallback((penId: string) => {
    dispatch({ type: 'COLLECT_PRODUCT', penId });
  }, []);

  const feedAnimal = useCallback((penId: string) => {
    dispatch({ type: 'FEED_ANIMAL', penId });
  }, []);

  const plantTree = useCallback((orchardId: string, treeId: string) => {
    dispatch({ type: 'PLANT_TREE', orchardId, treeId });
  }, []);

  const harvestFruit = useCallback((orchardId: string) => {
    dispatch({ type: 'HARVEST_FRUIT', orchardId });
  }, []);

  const buyMachine = useCallback((slotId: string, machineId: string) => {
    dispatch({ type: 'BUY_MACHINE', slotId, machineId });
  }, []);

  const sellMachine = useCallback((slotId: string) => {
    dispatch({ type: 'SELL_MACHINE', slotId });
  }, []);

  const sellAnimal = useCallback((penId: string) => {
    dispatch({ type: 'SELL_ANIMAL', penId });
  }, []);

  const sellTree = useCallback((orchardId: string) => {
    dispatch({ type: 'SELL_TREE', orchardId });
  }, []);

  const startProcessing = useCallback((slotId: string, recipeIndex: number) => {
    dispatch({ type: 'START_PROCESSING', slotId, recipeIndex });
  }, []);

  const collectProcessed = useCallback((slotId: string) => {
    dispatch({ type: 'COLLECT_PROCESSED', slotId });
  }, []);

  const completeOrder = useCallback((orderId: string) => {
    dispatch({ type: 'COMPLETE_ORDER', orderId });
  }, []);

  const dismissOrder = useCallback((orderId: string) => {
    dispatch({ type: 'DISMISS_ORDER', orderId });
  }, []);

  const refreshOrders = useCallback(() => {
    dispatch({ type: 'REFRESH_ORDERS' });
  }, []);

  const serveCustomer = useCallback((customerId: string) => {
    dispatch({ type: 'SERVE_CUSTOMER', customerId });
  }, []);

  const sellItem = useCallback((itemId: string, amount: number) => {
    dispatch({ type: 'SELL_ITEM', itemId, amount });
  }, []);

  const buySlot = useCallback((slotType: SlotType, slotIndex: number) => {
    dispatch({ type: 'BUY_SLOT', slotType, slotIndex });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const upgradeStorage = useCallback(() => {
    dispatch({ type: 'UPGRADE_STORAGE' });
  }, []);

  const swapAnimals = useCallback((penId1: string, penId2: string) => {
    dispatch({ type: 'SWAP_ANIMALS', penId1, penId2 });
  }, []);

  const swapTrees = useCallback((orchardId1: string, orchardId2: string) => {
    dispatch({ type: 'SWAP_TREES', orchardId1, orchardId2 });
  }, []);

  const swapMachines = useCallback((slotId1: string, slotId2: string) => {
    dispatch({ type: 'SWAP_MACHINES', slotId1, slotId2 });
  }, []);

  return {
    state,
    plantCrop,
    harvestCrop,
    buyAnimal,
    sellAnimal,
    collectProduct,
    feedAnimal,
    plantTree,
    sellTree,
    harvestFruit,
    buyMachine,
    sellMachine,
    startProcessing,
    collectProcessed,
    completeOrder,
    dismissOrder,
    refreshOrders,
    serveCustomer,
    sellItem,
    buySlot,
    resetGame,
    upgradeStorage,
    swapAnimals,
    swapTrees,
    swapMachines,
  };
}

// Export helpers for UI components
export {
  getPremiumSlotCost,
  getRequiredLevelForSlot,
  MAX_LEVEL_UNLOCKS,
  getStorageCapacity,
  getStorageUpgradeCost,
  getNextStorageUpgradeAmount,
  getTotalInventoryCount,
  STORAGE_MAX_LEVEL,
};
