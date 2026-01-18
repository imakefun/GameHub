import { useReducer, useEffect, useCallback, useRef } from 'react';
import type { GameState, GameAction, MarketPrices, Element, Recipe, Generator } from '../types';
import type { GameSettings } from '../services/sheetsService';

const STORAGE_KEY = 'alchemoji-save';

interface GameConfig {
  elements: Record<string, Element>;
  recipes: Recipe[];
  generators: Generator[];
  settings: GameSettings;
}

// Create initial game state based on config
const createInitialState = (config: GameConfig): GameState => ({
  resources: {
    money: config.settings.startingMoney,
    energy: config.settings.startingEnergy,
  },
  inventory: {},
  generators: config.generators
    .filter((g) => g.unlocked)
    .map((g) => ({
      generatorId: g.id,
      level: 1,
      lastProduced: 0,
      autoEnabled: false,
    })),
  discoveredRecipes: [],
  marketPrices: initializeMarketPrices(config.elements),
  stats: {
    totalElementsCrafted: 0,
    totalElementsSold: 0,
    totalMoneyEarned: 0,
    totalEnergySpent: 0,
    recipesDiscovered: 0,
    playTime: 0,
  },
  lastSaved: Date.now(),
  lastTick: Date.now(),
});

function initializeMarketPrices(elements: Record<string, Element>): MarketPrices {
  const prices: MarketPrices = {};
  Object.values(elements).forEach((element) => {
    prices[element.id] = {
      currentPrice: element.baseValue,
      supply: 50,
      demand: 50,
      lastUpdate: Date.now(),
    };
  });
  return prices;
}

function calculateMarketPrice(baseValue: number, supply: number, demand: number): number {
  const ratio = demand / Math.max(supply, 1);
  const multiplier = 0.5 + ratio;
  return Math.max(1, Math.floor(baseValue * multiplier));
}

// Get upgrade stats for a given level
function getUpgradeForLevel(level: number, settings: GameSettings) {
  const cost = Math.floor(settings.upgradeCostBase * Math.pow(settings.upgradeCostMultiplier, level - 1));
  const productionMultiplier = 1 + (level - 1) * 0.1;
  const cooldownMultiplier = Math.max(0.5, 1 - (level - 1) * 0.03);
  const energyMultiplier = 1 + (level - 1) * 0.05;

  return { level, cost, productionMultiplier, cooldownMultiplier, energyMultiplier };
}

// Find recipe by matching inputs
function findRecipeByInputs(inputIds: string[], recipes: Recipe[]): Recipe | undefined {
  const sortedInputs = [...inputIds].sort();

  return recipes.find((recipe) => {
    const recipeInputIds: string[] = [];
    recipe.inputs.forEach((input) => {
      for (let i = 0; i < input.amount; i++) {
        recipeInputIds.push(input.elementId);
      }
    });
    const sortedRecipeInputs = recipeInputIds.sort();

    if (sortedInputs.length !== sortedRecipeInputs.length) return false;
    return sortedInputs.every((id, idx) => id === sortedRecipeInputs[idx]);
  });
}

function createGameReducer(config: GameConfig) {
  return function gameReducer(state: GameState, action: GameAction): GameState {
    const { elements, recipes, generators, settings } = config;

    const getGeneratorById = (id: string) => generators.find((g) => g.id === id);
    const getElement = (id: string) => elements[id];
    const getRecipeById = (id: string) => recipes.find((r) => r.id === id);

    switch (action.type) {
      case 'TICK': {
        const now = Date.now();
        const newState = { ...state, lastTick: now };

        newState.stats = {
          ...state.stats,
          playTime: state.stats.playTime + action.delta / 1000,
        };

        // Process auto-generators
        newState.generators = state.generators.map((gs) => {
          if (!gs.autoEnabled) return gs;

          const generator = getGeneratorById(gs.generatorId);
          if (!generator) return gs;

          const upgrade = getUpgradeForLevel(gs.level, settings);
          const cooldown = generator.baseCooldown * upgrade.cooldownMultiplier * 1000;
          const energyCost = Math.floor(generator.baseEnergyCost * upgrade.energyMultiplier);

          if (now - gs.lastProduced >= cooldown && newState.resources.energy >= energyCost) {
            newState.resources = {
              ...newState.resources,
              energy: newState.resources.energy - energyCost,
            };

            generator.produces.forEach((prod) => {
              const amount = Math.floor(prod.baseAmount * upgrade.productionMultiplier);
              if (prod.elementId === 'energy') {
                newState.resources = {
                  ...newState.resources,
                  energy: newState.resources.energy + amount,
                };
              } else {
                newState.inventory = {
                  ...newState.inventory,
                  [prod.elementId]: (newState.inventory[prod.elementId] || 0) + amount,
                };
              }
            });

            return { ...gs, lastProduced: now };
          }
          return gs;
        });

        // Update market prices periodically
        const oldestUpdate = Math.min(
          ...Object.values(state.marketPrices).map((p) => p.lastUpdate)
        );
        if (now - oldestUpdate > settings.marketUpdateInterval) {
          newState.marketPrices = { ...state.marketPrices };
          Object.keys(newState.marketPrices).forEach((elementId) => {
            const element = getElement(elementId);
            if (!element) return;

            const current = newState.marketPrices[elementId];
            const supplyDrift = (Math.random() - 0.5) * 20;
            const demandDrift = (Math.random() - 0.5) * 20;

            const newSupply = Math.max(10, Math.min(100, current.supply + supplyDrift));
            const newDemand = Math.max(10, Math.min(100, current.demand + demandDrift));

            newState.marketPrices[elementId] = {
              supply: newSupply,
              demand: newDemand,
              currentPrice: calculateMarketPrice(element.baseValue, newSupply, newDemand),
              lastUpdate: now,
            };
          });
        }

        return newState;
      }

      case 'PRODUCE': {
        const generatorState = state.generators.find((g) => g.generatorId === action.generatorId);
        if (!generatorState) return state;

        const generator = getGeneratorById(action.generatorId);
        if (!generator) return state;

        const upgrade = getUpgradeForLevel(generatorState.level, settings);
        const cooldown = generator.baseCooldown * upgrade.cooldownMultiplier * 1000;
        const now = Date.now();

        if (now - generatorState.lastProduced < cooldown) return state;

        const energyCost = Math.floor(generator.baseEnergyCost * upgrade.energyMultiplier);
        if (state.resources.energy < energyCost) return state;

        const newInventory = { ...state.inventory };
        let newEnergy = state.resources.energy - energyCost;

        generator.produces.forEach((prod) => {
          const amount = Math.floor(prod.baseAmount * upgrade.productionMultiplier);
          if (prod.elementId === 'energy') {
            newEnergy += amount;
          } else {
            newInventory[prod.elementId] = (newInventory[prod.elementId] || 0) + amount;
          }
        });

        return {
          ...state,
          resources: { ...state.resources, energy: newEnergy },
          inventory: newInventory,
          generators: state.generators.map((g) =>
            g.generatorId === action.generatorId ? { ...g, lastProduced: now } : g
          ),
          stats: {
            ...state.stats,
            totalEnergySpent: state.stats.totalEnergySpent + energyCost,
          },
        };
      }

      case 'TRY_CRAFT': {
        const recipe = findRecipeByInputs(action.elementIds, recipes);
        if (!recipe) return state;

        if (state.resources.energy < recipe.energyCost) return state;

        const inputCounts: Record<string, number> = {};
        action.elementIds.forEach((id) => {
          inputCounts[id] = (inputCounts[id] || 0) + 1;
        });

        for (const [elementId, needed] of Object.entries(inputCounts)) {
          if ((state.inventory[elementId] || 0) < needed) return state;
        }

        const newInventory = { ...state.inventory };
        for (const [elementId, needed] of Object.entries(inputCounts)) {
          newInventory[elementId] -= needed;
          if (newInventory[elementId] <= 0) delete newInventory[elementId];
        }

        newInventory[recipe.output.elementId] =
          (newInventory[recipe.output.elementId] || 0) + recipe.output.amount;

        const isNewDiscovery = !state.discoveredRecipes.includes(recipe.id);
        const newDiscovered = isNewDiscovery
          ? [...state.discoveredRecipes, recipe.id]
          : state.discoveredRecipes;

        return {
          ...state,
          resources: {
            ...state.resources,
            energy: state.resources.energy - recipe.energyCost,
          },
          inventory: newInventory,
          discoveredRecipes: newDiscovered,
          stats: {
            ...state.stats,
            totalElementsCrafted: state.stats.totalElementsCrafted + recipe.output.amount,
            totalEnergySpent: state.stats.totalEnergySpent + recipe.energyCost,
            recipesDiscovered: state.stats.recipesDiscovered + (isNewDiscovery ? 1 : 0),
          },
        };
      }

      case 'CRAFT': {
        const recipe = getRecipeById(action.recipeId);
        if (!recipe || !state.discoveredRecipes.includes(recipe.id)) return state;

        if (state.resources.energy < recipe.energyCost) return state;

        const newInventory = { ...state.inventory };
        for (const input of recipe.inputs) {
          if ((newInventory[input.elementId] || 0) < input.amount) return state;
        }

        for (const input of recipe.inputs) {
          newInventory[input.elementId] -= input.amount;
          if (newInventory[input.elementId] <= 0) delete newInventory[input.elementId];
        }

        newInventory[recipe.output.elementId] =
          (newInventory[recipe.output.elementId] || 0) + recipe.output.amount;

        return {
          ...state,
          resources: {
            ...state.resources,
            energy: state.resources.energy - recipe.energyCost,
          },
          inventory: newInventory,
          stats: {
            ...state.stats,
            totalElementsCrafted: state.stats.totalElementsCrafted + recipe.output.amount,
            totalEnergySpent: state.stats.totalEnergySpent + recipe.energyCost,
          },
        };
      }

      case 'SELL': {
        const amount = Math.min(action.amount, state.inventory[action.elementId] || 0);
        if (amount <= 0) return state;

        const price = state.marketPrices[action.elementId]?.currentPrice || 1;
        const totalValue = price * amount;

        const newInventory = { ...state.inventory };
        newInventory[action.elementId] -= amount;
        if (newInventory[action.elementId] <= 0) delete newInventory[action.elementId];

        const newMarketPrices = { ...state.marketPrices };
        if (newMarketPrices[action.elementId]) {
          const element = getElement(action.elementId);
          const newSupply = Math.min(100, newMarketPrices[action.elementId].supply + amount * 2);
          newMarketPrices[action.elementId] = {
            ...newMarketPrices[action.elementId],
            supply: newSupply,
            currentPrice: element
              ? calculateMarketPrice(element.baseValue, newSupply, newMarketPrices[action.elementId].demand)
              : newMarketPrices[action.elementId].currentPrice,
          };
        }

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money + totalValue,
          },
          inventory: newInventory,
          marketPrices: newMarketPrices,
          stats: {
            ...state.stats,
            totalElementsSold: state.stats.totalElementsSold + amount,
            totalMoneyEarned: state.stats.totalMoneyEarned + totalValue,
          },
        };
      }

      case 'UPGRADE_GENERATOR': {
        const generatorState = state.generators.find((g) => g.generatorId === action.generatorId);
        if (!generatorState || generatorState.level >= settings.maxGeneratorLevel) return state;

        const upgradeCost = getUpgradeForLevel(generatorState.level + 1, settings).cost;
        if (state.resources.money < upgradeCost) return state;

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money - upgradeCost,
          },
          generators: state.generators.map((g) =>
            g.generatorId === action.generatorId ? { ...g, level: g.level + 1 } : g
          ),
        };
      }

      case 'UNLOCK_GENERATOR': {
        const generator = getGeneratorById(action.generatorId);
        if (!generator) return state;

        if (state.generators.some((g) => g.generatorId === action.generatorId)) return state;

        if (state.resources.money < generator.unlockCost) return state;

        return {
          ...state,
          resources: {
            ...state.resources,
            money: state.resources.money - generator.unlockCost,
          },
          generators: [
            ...state.generators,
            {
              generatorId: generator.id,
              level: 1,
              lastProduced: 0,
              autoEnabled: false,
            },
          ],
        };
      }

      case 'TOGGLE_AUTO': {
        return {
          ...state,
          generators: state.generators.map((g) =>
            g.generatorId === action.generatorId ? { ...g, autoEnabled: !g.autoEnabled } : g
          ),
        };
      }

      case 'LOAD_GAME': {
        return action.state;
      }

      case 'RESET_GAME': {
        localStorage.removeItem(STORAGE_KEY);
        return createInitialState(config);
      }

      default:
        return state;
    }
  };
}

export function useGameState(config: GameConfig) {
  const configRef = useRef(config);
  configRef.current = config;

  const [state, dispatch] = useReducer(
    createGameReducer(config),
    config,
    (cfg) => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as GameState;
          return {
            ...createInitialState(cfg),
            ...parsed,
            lastTick: Date.now(),
          };
        }
      } catch (e) {
        console.error('Failed to load save:', e);
      }
      return createInitialState(cfg);
    }
  );

  const lastSaveRef = useRef(Date.now());

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - state.lastTick;
      dispatch({ type: 'TICK', delta });

      if (now - lastSaveRef.current > configRef.current.settings.autoSaveInterval) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastSaved: now }));
        lastSaveRef.current = now;
      }
    }, configRef.current.settings.tickInterval);

    return () => clearInterval(interval);
  }, [state]);

  // Save on unmount
  useEffect(() => {
    return () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastSaved: Date.now() }));
    };
  }, [state]);

  const produce = useCallback((generatorId: string) => {
    dispatch({ type: 'PRODUCE', generatorId });
  }, []);

  const tryCraft = useCallback((elementIds: string[]) => {
    dispatch({ type: 'TRY_CRAFT', elementIds });
  }, []);

  const craft = useCallback((recipeId: string) => {
    dispatch({ type: 'CRAFT', recipeId });
  }, []);

  const sell = useCallback((elementId: string, amount: number) => {
    dispatch({ type: 'SELL', elementId, amount });
  }, []);

  const upgradeGenerator = useCallback((generatorId: string) => {
    dispatch({ type: 'UPGRADE_GENERATOR', generatorId });
  }, []);

  const unlockGenerator = useCallback((generatorId: string) => {
    dispatch({ type: 'UNLOCK_GENERATOR', generatorId });
  }, []);

  const toggleAuto = useCallback((generatorId: string) => {
    dispatch({ type: 'TOGGLE_AUTO', generatorId });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    state,
    produce,
    tryCraft,
    craft,
    sell,
    upgradeGenerator,
    unlockGenerator,
    toggleAuto,
    resetGame,
    config,
  };
}
