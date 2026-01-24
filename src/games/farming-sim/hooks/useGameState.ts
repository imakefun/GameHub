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
} from '../types';
import { getXpForLevel, getLevelForXp } from '../types';
import { customerNames, levels } from '../data';

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

// Generate orders based on player level
function generateAllOrders(config: GameConfig, level: number, now: number): Order[] {
  const orders: Order[] = [];
  for (let slot = 0; slot < config.settings.maxOrders; slot++) {
    const order = generateOrder(config, level, now, slot);
    if (order) orders.push(order);
  }
  return orders;
}

function generateOrder(config: GameConfig, level: number, now: number, slot: number): Order | null {
  // Determine difficulty based on slot and level
  let difficulty: OrderDifficulty;
  if (level < 3) {
    difficulty = 'easy';
  } else if (level < 6) {
    difficulty = slot === 0 ? 'easy' : slot === 1 ? 'medium' : 'easy';
  } else if (level < 10) {
    difficulty = slot === 0 ? 'easy' : slot === 1 ? 'medium' : 'hard';
  } else {
    difficulty = slot === 0 ? 'medium' : slot === 1 ? 'hard' : 'hard';
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
      timeLimit = 180; // 3 minutes
      break;
    case 'medium':
      numItems = Math.random() < 0.5 ? 1 : 2;
      amountMultiplier = 1.5;
      timeLimit = 240; // 4 minutes
      break;
    case 'hard':
      numItems = Math.floor(Math.random() * 2) + 2; // 2-3 items
      amountMultiplier = 2;
      timeLimit = 300; // 5 minutes
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

  // If leveled up, unlock new slots
  if (leveledUp) {
    newState = {
      ...newState,
      fields: newState.fields.map((f, i) => ({
        ...f,
        unlocked: i < getUnlockedSlots(newLevel, 'fields'),
      })),
      animalPens: newState.animalPens.map((p, i) => ({
        ...p,
        unlocked: i < getUnlockedSlots(newLevel, 'pens'),
      })),
      orchards: newState.orchards.map((o, i) => ({
        ...o,
        unlocked: i < getUnlockedSlots(newLevel, 'orchards'),
      })),
      machineSlots: newState.machineSlots.map((s, i) => ({
        ...s,
        unlocked: i < getUnlockedSlots(newLevel, 'machineSlots'),
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

        // Check if orders need to refresh
        const timeSinceRefresh = (now - newState.lastOrderRefresh) / 1000;
        if (timeSinceRefresh >= config.settings.orderRefreshInterval) {
          newState.orders = generateAllOrders(config, newState.progress.level, now);
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
          orders: generateAllOrders(config, state.progress.level, now),
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

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    state,
    plantCrop,
    harvestCrop,
    buyAnimal,
    collectProduct,
    feedAnimal,
    plantTree,
    harvestFruit,
    buyMachine,
    startProcessing,
    collectProcessed,
    completeOrder,
    dismissOrder,
    refreshOrders,
    serveCustomer,
    sellItem,
    resetGame,
  };
}
