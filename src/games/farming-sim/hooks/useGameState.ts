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
} from '../types';
import { customerNames } from '../data';

const STORAGE_KEY = 'farming-sim-save';

// Initialize game state
function initializeState(config: GameConfig): GameState {
  // Try to load saved state
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Update lastTick to current time to avoid huge time jumps
      return { ...parsed, lastTick: Date.now() };
    } catch {
      // Invalid save, start fresh
    }
  }

  // Create initial slots
  const fields: Field[] = Array.from({ length: config.settings.maxFields }, (_, i) => ({
    id: `field-${i}`,
    cropId: null,
    plantedAt: null,
    isReady: false,
  }));

  const animalPens: AnimalPen[] = Array.from({ length: config.settings.maxAnimalPens }, (_, i) => ({
    id: `pen-${i}`,
    animalId: null,
    lastProducedAt: null,
    isReady: false,
  }));

  const orchards: Orchard[] = Array.from({ length: config.settings.maxOrchards }, (_, i) => ({
    id: `orchard-${i}`,
    treeId: null,
    plantedAt: null,
    lastHarvestedAt: null,
    isMature: false,
    isReady: false,
  }));

  const machineSlots: MachineSlot[] = Array.from({ length: config.settings.maxMachineSlots }, (_, i) => ({
    id: `machine-${i}`,
    machineId: null,
    currentRecipeIndex: null,
    startedAt: null,
    isProcessing: false,
    isReady: false,
  }));

  return {
    resources: {
      money: config.settings.startingMoney,
      energy: config.settings.startingEnergy,
    },
    inventory: {},
    fields,
    animalPens,
    orchards,
    machineSlots,
    orders: [],
    wanderingCustomers: [],
    unlockedItems: ['wheat', 'carrot', 'chicken', 'apple_tree', 'mill', 'juicer'],
    stats: {
      totalMoneyEarned: 0,
      totalCropsHarvested: 0,
      totalAnimalsProduced: 0,
      totalFruitsHarvested: 0,
      totalGoodsProcessed: 0,
      totalOrdersCompleted: 0,
      totalCustomersServed: 0,
      playTime: 0,
    },
    lastTick: Date.now(),
  };
}

// Create the game reducer
function createGameReducer(config: GameConfig) {
  return function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case 'TICK': {
        const now = action.now;
        const delta = (now - state.lastTick) / 1000; // seconds

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

        // Update animal pens
        newState.animalPens = newState.animalPens.map(pen => {
          if (!pen.animalId || !pen.lastProducedAt) return pen;
          const animal = config.animals.find(a => a.id === pen.animalId);
          if (!animal) return pen;

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
            : tree.harvestTime; // Ready for first harvest immediately when mature
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

        // Remove expired orders (optional: could add expiry to orders)

        // Spawn new order if needed
        if (newState.orders.length < config.settings.maxOrders) {
          const shouldSpawn = Math.random() < (delta / config.settings.orderSpawnInterval);
          if (shouldSpawn) {
            const newOrder = generateOrder(config, newState, now);
            if (newOrder) {
              newState.orders = [...newState.orders, newOrder];
            }
          }
        }

        // Spawn wandering customer if needed
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

        const field = state.fields.find(f => f.id === fieldId);
        if (!field || field.cropId) return state;

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

        return {
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
      }

      case 'BUY_ANIMAL': {
        const { penId, animalId } = action;
        const animal = config.animals.find(a => a.id === animalId);
        if (!animal) return state;

        const pen = state.animalPens.find(p => p.id === penId);
        if (!pen || pen.animalId) return state;

        if (state.resources.money < animal.purchaseCost) return state;

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money - animal.purchaseCost,
          },
          animalPens: state.animalPens.map(p =>
            p.id === penId
              ? { ...p, animalId, lastProducedAt: Date.now(), isReady: false }
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

        return {
          ...state,
          inventory: {
            ...state.inventory,
            [animal.produces]: currentAmount + 1,
          },
          animalPens: state.animalPens.map(p =>
            p.id === penId
              ? { ...p, lastProducedAt: Date.now(), isReady: false }
              : p
          ),
          stats: {
            ...state.stats,
            totalAnimalsProduced: state.stats.totalAnimalsProduced + 1,
          },
        };
      }

      case 'FEED_ANIMAL': {
        const { penId } = action;
        const pen = state.animalPens.find(p => p.id === penId);
        if (!pen || !pen.animalId) return state;

        const animal = config.animals.find(a => a.id === pen.animalId);
        if (!animal) return state;

        if (state.resources.energy < animal.feedCost) return state;

        // Feeding speeds up production by resetting timer with bonus
        return {
          ...state,
          resources: {
            ...state.resources,
            energy: state.resources.energy - animal.feedCost,
          },
          animalPens: state.animalPens.map(p =>
            p.id === penId
              ? { ...p, lastProducedAt: Date.now() - (animal.productionTime * 500) } // 50% faster
              : p
          ),
        };
      }

      case 'PLANT_TREE': {
        const { orchardId, treeId } = action;
        const tree = config.trees.find(t => t.id === treeId);
        if (!tree) return state;

        const orchard = state.orchards.find(o => o.id === orchardId);
        if (!orchard || orchard.treeId) return state;

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

        // Get fruit id from tree id (apple_tree -> apple)
        const fruitId = tree.id.replace('_tree', '').replace('_vine', '');
        const currentAmount = state.inventory[fruitId] || 0;

        return {
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
      }

      case 'BUY_MACHINE': {
        const { slotId, machineId } = action;
        const machine = config.machines.find(m => m.id === machineId);
        if (!machine) return state;

        const slot = state.machineSlots.find(s => s.id === slotId);
        if (!slot || slot.machineId) return state;

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

        // Check energy
        if (state.resources.energy < machine.energyCost) return state;

        // Check ingredients
        const hasIngredients = recipe.inputs.every(input =>
          (state.inventory[input.itemId] || 0) >= input.amount
        );
        if (!hasIngredients) return state;

        // Consume ingredients
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

        return {
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
      }

      case 'COMPLETE_ORDER': {
        const { orderId } = action;
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return state;

        // Check if player has all items
        const hasItems = order.items.every(item =>
          (state.inventory[item.itemId] || 0) >= item.amount
        );
        if (!hasItems) return state;

        // Consume items
        const newInventory = { ...state.inventory };
        order.items.forEach(item => {
          newInventory[item.itemId] = (newInventory[item.itemId] || 0) - item.amount;
        });

        // Calculate reward (with bonus if completed quickly)
        const elapsed = (Date.now() - order.createdAt) / 1000;
        const reward = elapsed < order.timeLimit / 2
          ? order.reward + order.bonusReward
          : order.reward;

        return {
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
      }

      case 'DISMISS_ORDER': {
        const { orderId } = action;
        return {
          ...state,
          orders: state.orders.filter(o => o.id !== orderId),
        };
      }

      case 'SERVE_CUSTOMER': {
        const { customerId } = action;
        const customer = state.wanderingCustomers.find(c => c.id === customerId);
        if (!customer) return state;

        // Check if player has the item
        if ((state.inventory[customer.wantsItemId] || 0) < customer.wantsAmount) return state;

        return {
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

      case 'UNLOCK_SLOT': {
        // For now, slots are pre-created but could be locked/unlocked
        return state;
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

// Helper to generate random order
function generateOrder(config: GameConfig, state: GameState, now: number): Order | null {
  const availableProducts = config.products.filter(p =>
    state.unlockedItems.includes(p.id) || (state.inventory[p.id] || 0) > 0
  );

  if (availableProducts.length === 0) return null;

  const numItems = Math.floor(Math.random() * 2) + 1; // 1-2 items
  const items: { itemId: string; amount: number }[] = [];
  let totalValue = 0;

  for (let i = 0; i < numItems; i++) {
    const product = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const amount = Math.floor(Math.random() * 3) + 1; // 1-3 of each
    items.push({ itemId: product.id, amount });
    totalValue += product.baseValue * amount;
  }

  const customer = customerNames[Math.floor(Math.random() * customerNames.length)];

  return {
    id: `order-${now}-${Math.random().toString(36).slice(2, 8)}`,
    customerName: customer.name,
    customerEmoji: customer.emoji,
    items,
    reward: Math.floor(totalValue * 1.5), // 50% profit
    bonusReward: Math.floor(totalValue * 0.5), // Extra 50% for quick completion
    timeLimit: 120, // 2 minutes
    createdAt: now,
  };
}

// Helper to generate wandering customer
function generateWanderingCustomer(config: GameConfig, state: GameState, now: number): WanderingCustomer | null {
  const availableProducts = config.products.filter(p =>
    (state.inventory[p.id] || 0) > 0
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
    offersPrice: Math.floor(product.baseValue * amount * 1.8), // 80% premium
    expiresAt: now + config.settings.customerDuration * 1000,
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
    if (now - lastSaveRef.current > 5000) { // Save every 5 seconds
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
    serveCustomer,
    sellItem,
    resetGame,
  };
}
