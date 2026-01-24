import { SHEETS_CONFIG, isSheetsConfigured } from '../config/sheets';
import type {
  Crop,
  Animal,
  Tree,
  Machine,
  MachineRecipe,
  Product,
  LevelConfig,
  GameSettings,
} from '../types';

// Cache for fetched data
interface SheetsCache {
  crops: Crop[] | null;
  animals: Animal[] | null;
  trees: Tree[] | null;
  machines: Machine[] | null;
  products: Product[] | null;
  levels: LevelConfig[] | null;
  settings: GameSettings | null;
  lastFetch: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  startingMoney: 100,
  startingEnergy: 100,
  maxEnergy: 200,
  energyRegenRate: 1,
  tickInterval: 1000,
  maxFields: 6,
  maxAnimalPens: 4,
  maxOrchards: 4,
  maxMachineSlots: 4,
  maxOrders: 3,
  orderRefreshInterval: 180,
  customerSpawnInterval: 45,
  customerDuration: 60,
};

const cache: SheetsCache = {
  crops: null,
  animals: null,
  trees: null,
  machines: null,
  products: null,
  levels: null,
  settings: null,
  lastFetch: 0,
};

// Fetch data from a specific sheet
async function fetchSheet(sheetName: string): Promise<string[][]> {
  if (!isSheetsConfigured()) {
    throw new Error('Google Sheets not configured');
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${SHEETS_CONFIG.apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch sheet ${sheetName}: ${error}`);
  }

  const data = await response.json();
  return data.values || [];
}

// Helper to find column index by header name
function findColumn(headers: string[], ...names: string[]): number {
  for (const name of names) {
    const idx = headers.indexOf(name.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

// Parse Crops sheet
// Columns: id, name, emoji, growthTime, yieldAmount, seedCost, baseValue, xpReward, unlockLevel, tier
function parseCrops(rows: string[][]): Crop[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const idIdx = findColumn(headers, 'id');
  const nameIdx = findColumn(headers, 'name');
  const emojiIdx = findColumn(headers, 'emoji');
  const growthTimeIdx = findColumn(headers, 'growthtime', 'growth_time');
  const yieldAmountIdx = findColumn(headers, 'yieldamount', 'yield_amount', 'yield');
  const seedCostIdx = findColumn(headers, 'seedcost', 'seed_cost');
  const baseValueIdx = findColumn(headers, 'basevalue', 'base_value', 'value');
  const xpRewardIdx = findColumn(headers, 'xpreward', 'xp_reward', 'xp');
  const unlockLevelIdx = findColumn(headers, 'unlocklevel', 'unlock_level', 'level');
  const tierIdx = findColumn(headers, 'tier');

  return rows.slice(1).map((row) => ({
    id: row[idIdx] || '',
    name: row[nameIdx] || '',
    emoji: row[emojiIdx] || '🌱',
    growthTime: parseInt(row[growthTimeIdx]) || 30,
    yieldAmount: parseInt(row[yieldAmountIdx]) || 1,
    seedCost: parseInt(row[seedCostIdx]) || 10,
    baseValue: parseInt(row[baseValueIdx]) || 10,
    xpReward: parseInt(row[xpRewardIdx]) || 5,
    unlockLevel: parseInt(row[unlockLevelIdx]) || 1,
    tier: (parseInt(row[tierIdx]) || 1) as 1 | 2 | 3,
  })).filter((c) => c.id);
}

// Parse Animals sheet
// Columns: id, name, emoji, produces, productionTime, feedType, feedAmount, purchaseCost, baseValue, xpReward, unlockLevel, tier
function parseAnimals(rows: string[][]): Animal[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const idIdx = findColumn(headers, 'id');
  const nameIdx = findColumn(headers, 'name');
  const emojiIdx = findColumn(headers, 'emoji');
  const producesIdx = findColumn(headers, 'produces', 'product');
  const productionTimeIdx = findColumn(headers, 'productiontime', 'production_time');
  const feedTypeIdx = findColumn(headers, 'feedtype', 'feed_type', 'feed');
  const feedAmountIdx = findColumn(headers, 'feedamount', 'feed_amount');
  const purchaseCostIdx = findColumn(headers, 'purchasecost', 'purchase_cost', 'cost');
  const baseValueIdx = findColumn(headers, 'basevalue', 'base_value', 'value');
  const xpRewardIdx = findColumn(headers, 'xpreward', 'xp_reward', 'xp');
  const unlockLevelIdx = findColumn(headers, 'unlocklevel', 'unlock_level', 'level');
  const tierIdx = findColumn(headers, 'tier');

  return rows.slice(1).map((row) => ({
    id: row[idIdx] || '',
    name: row[nameIdx] || '',
    emoji: row[emojiIdx] || '🐄',
    produces: row[producesIdx] || '',
    productionTime: parseInt(row[productionTimeIdx]) || 60,
    feedType: row[feedTypeIdx] || 'none',
    feedAmount: parseInt(row[feedAmountIdx]) || 1,
    purchaseCost: parseInt(row[purchaseCostIdx]) || 100,
    baseValue: parseInt(row[baseValueIdx]) || 20,
    xpReward: parseInt(row[xpRewardIdx]) || 10,
    unlockLevel: parseInt(row[unlockLevelIdx]) || 1,
    tier: (parseInt(row[tierIdx]) || 1) as 1 | 2 | 3,
  })).filter((a) => a.id);
}

// Parse Trees sheet
// Columns: id, name, emoji, fruitEmoji, growthTime, harvestTime, yieldAmount, saplingCost, baseValue, xpReward, unlockLevel, tier
function parseTrees(rows: string[][]): Tree[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const idIdx = findColumn(headers, 'id');
  const nameIdx = findColumn(headers, 'name');
  const emojiIdx = findColumn(headers, 'emoji');
  const fruitEmojiIdx = findColumn(headers, 'fruitemoji', 'fruit_emoji', 'fruit');
  const growthTimeIdx = findColumn(headers, 'growthtime', 'growth_time');
  const harvestTimeIdx = findColumn(headers, 'harvesttime', 'harvest_time');
  const yieldAmountIdx = findColumn(headers, 'yieldamount', 'yield_amount', 'yield');
  const saplingCostIdx = findColumn(headers, 'saplingcost', 'sapling_cost', 'cost');
  const baseValueIdx = findColumn(headers, 'basevalue', 'base_value', 'value');
  const xpRewardIdx = findColumn(headers, 'xpreward', 'xp_reward', 'xp');
  const unlockLevelIdx = findColumn(headers, 'unlocklevel', 'unlock_level', 'level');
  const tierIdx = findColumn(headers, 'tier');

  return rows.slice(1).map((row) => ({
    id: row[idIdx] || '',
    name: row[nameIdx] || '',
    emoji: row[emojiIdx] || '🌳',
    fruitEmoji: row[fruitEmojiIdx] || '🍎',
    growthTime: parseInt(row[growthTimeIdx]) || 120,
    harvestTime: parseInt(row[harvestTimeIdx]) || 60,
    yieldAmount: parseInt(row[yieldAmountIdx]) || 2,
    saplingCost: parseInt(row[saplingCostIdx]) || 50,
    baseValue: parseInt(row[baseValueIdx]) || 15,
    xpReward: parseInt(row[xpRewardIdx]) || 10,
    unlockLevel: parseInt(row[unlockLevelIdx]) || 1,
    tier: (parseInt(row[tierIdx]) || 1) as 1 | 2 | 3,
  })).filter((t) => t.id);
}

// Parse Machines sheet (without recipes - those come from Recipes sheet)
// Columns: id, name, emoji, description, energyCost, purchaseCost, unlockLevel, tier
function parseMachines(rows: string[][]): Omit<Machine, 'recipes'>[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const idIdx = findColumn(headers, 'id');
  const nameIdx = findColumn(headers, 'name');
  const emojiIdx = findColumn(headers, 'emoji');
  const descriptionIdx = findColumn(headers, 'description', 'desc');
  const energyCostIdx = findColumn(headers, 'energycost', 'energy_cost', 'energy');
  const purchaseCostIdx = findColumn(headers, 'purchasecost', 'purchase_cost', 'cost');
  const unlockLevelIdx = findColumn(headers, 'unlocklevel', 'unlock_level', 'level');
  const tierIdx = findColumn(headers, 'tier');

  return rows.slice(1).map((row) => ({
    id: row[idIdx] || '',
    name: row[nameIdx] || '',
    emoji: row[emojiIdx] || '🏭',
    description: row[descriptionIdx] || '',
    energyCost: parseInt(row[energyCostIdx]) || 5,
    purchaseCost: parseInt(row[purchaseCostIdx]) || 100,
    unlockLevel: parseInt(row[unlockLevelIdx]) || 1,
    tier: (parseInt(row[tierIdx]) || 1) as 1 | 2 | 3,
  })).filter((m) => m.id);
}

// Parse Recipes sheet
// Columns: id, machineId, input1, amount1, input2, amount2, input3, amount3, outputId, outputAmount, processingTime, xpReward, unlockLevel
function parseRecipes(rows: string[][]): (MachineRecipe & { machineId: string })[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const idIdx = findColumn(headers, 'id');
  const machineIdIdx = findColumn(headers, 'machineid', 'machine_id', 'machine');
  const input1Idx = findColumn(headers, 'input1');
  const amount1Idx = findColumn(headers, 'amount1');
  const input2Idx = findColumn(headers, 'input2');
  const amount2Idx = findColumn(headers, 'amount2');
  const input3Idx = findColumn(headers, 'input3');
  const amount3Idx = findColumn(headers, 'amount3');
  const outputIdIdx = findColumn(headers, 'outputid', 'output_id', 'output');
  const outputAmountIdx = findColumn(headers, 'outputamount', 'output_amount');
  const processingTimeIdx = findColumn(headers, 'processingtime', 'processing_time', 'time');
  const xpRewardIdx = findColumn(headers, 'xpreward', 'xp_reward', 'xp');
  const unlockLevelIdx = findColumn(headers, 'unlocklevel', 'unlock_level', 'level');

  return rows.slice(1).map((row) => {
    const inputs: { itemId: string; amount: number }[] = [];

    if (row[input1Idx]) {
      inputs.push({
        itemId: row[input1Idx],
        amount: parseInt(row[amount1Idx]) || 1,
      });
    }
    if (row[input2Idx]) {
      inputs.push({
        itemId: row[input2Idx],
        amount: parseInt(row[amount2Idx]) || 1,
      });
    }
    if (row[input3Idx]) {
      inputs.push({
        itemId: row[input3Idx],
        amount: parseInt(row[amount3Idx]) || 1,
      });
    }

    return {
      id: row[idIdx] || '',
      machineId: row[machineIdIdx] || '',
      inputs,
      output: {
        itemId: row[outputIdIdx] || '',
        amount: parseInt(row[outputAmountIdx]) || 1,
      },
      processingTime: parseInt(row[processingTimeIdx]) || 30,
      xpReward: parseInt(row[xpRewardIdx]) || 5,
      unlockLevel: parseInt(row[unlockLevelIdx]) || 1,
    };
  }).filter((r) => r.id && r.machineId && r.inputs.length > 0);
}

// Parse Products sheet
// Columns: id, name, emoji, baseValue, category, tier
function parseProducts(rows: string[][]): Product[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const idIdx = findColumn(headers, 'id');
  const nameIdx = findColumn(headers, 'name');
  const emojiIdx = findColumn(headers, 'emoji');
  const baseValueIdx = findColumn(headers, 'basevalue', 'base_value', 'value');
  const categoryIdx = findColumn(headers, 'category', 'type');
  const tierIdx = findColumn(headers, 'tier');

  return rows.slice(1).map((row) => ({
    id: row[idIdx] || '',
    name: row[nameIdx] || '',
    emoji: row[emojiIdx] || '📦',
    baseValue: parseInt(row[baseValueIdx]) || 10,
    category: (row[categoryIdx]?.toLowerCase() || 'processed') as Product['category'],
    tier: (parseInt(row[tierIdx]) || 1) as 1 | 2 | 3,
  })).filter((p) => p.id);
}

// Parse Levels sheet
// Columns: level, xpRequired, unlocksFields, unlocksPens, unlocksOrchards, unlocksMachineSlots
function parseLevels(rows: string[][]): LevelConfig[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const levelIdx = findColumn(headers, 'level');
  const xpRequiredIdx = findColumn(headers, 'xprequired', 'xp_required', 'xp');
  const unlocksFieldsIdx = findColumn(headers, 'unlocksfields', 'unlocks_fields', 'fields');
  const unlocksPensIdx = findColumn(headers, 'unlockspens', 'unlocks_pens', 'pens');
  const unlocksOrchardsIdx = findColumn(headers, 'unlocksorchards', 'unlocks_orchards', 'orchards');
  const unlocksMachineSlotsIdx = findColumn(headers, 'unlocksmachineslots', 'unlocks_machine_slots', 'machines');

  return rows.slice(1).map((row) => {
    const config: LevelConfig = {
      level: parseInt(row[levelIdx]) || 1,
      xpRequired: parseInt(row[xpRequiredIdx]) || 0,
    };

    const fields = parseInt(row[unlocksFieldsIdx]);
    if (!isNaN(fields) && fields > 0) config.unlocksFields = fields;

    const pens = parseInt(row[unlocksPensIdx]);
    if (!isNaN(pens) && pens > 0) config.unlocksPens = pens;

    const orchards = parseInt(row[unlocksOrchardsIdx]);
    if (!isNaN(orchards) && orchards > 0) config.unlocksOrchards = orchards;

    const machineSlots = parseInt(row[unlocksMachineSlotsIdx]);
    if (!isNaN(machineSlots) && machineSlots > 0) config.unlocksMachineSlots = machineSlots;

    return config;
  }).filter((l) => l.level > 0);
}

// Parse Settings sheet
// Simple key-value format (no header required)
function parseSettings(rows: string[][]): GameSettings {
  const settings = { ...DEFAULT_SETTINGS };

  rows.forEach((row) => {
    const key = row[0]?.toLowerCase().trim().replace(/_/g, '');
    const value = row[1];

    switch (key) {
      case 'startingmoney':
        settings.startingMoney = parseInt(value) || DEFAULT_SETTINGS.startingMoney;
        break;
      case 'startingenergy':
        settings.startingEnergy = parseInt(value) || DEFAULT_SETTINGS.startingEnergy;
        break;
      case 'maxenergy':
        settings.maxEnergy = parseInt(value) || DEFAULT_SETTINGS.maxEnergy;
        break;
      case 'energyregenrate':
        settings.energyRegenRate = parseFloat(value) || DEFAULT_SETTINGS.energyRegenRate;
        break;
      case 'tickinterval':
        settings.tickInterval = parseInt(value) || DEFAULT_SETTINGS.tickInterval;
        break;
      case 'maxfields':
        settings.maxFields = parseInt(value) || DEFAULT_SETTINGS.maxFields;
        break;
      case 'maxanimalpens':
        settings.maxAnimalPens = parseInt(value) || DEFAULT_SETTINGS.maxAnimalPens;
        break;
      case 'maxorchards':
        settings.maxOrchards = parseInt(value) || DEFAULT_SETTINGS.maxOrchards;
        break;
      case 'maxmachineslots':
        settings.maxMachineSlots = parseInt(value) || DEFAULT_SETTINGS.maxMachineSlots;
        break;
      case 'maxorders':
        settings.maxOrders = parseInt(value) || DEFAULT_SETTINGS.maxOrders;
        break;
      case 'orderrefreshinterval':
        settings.orderRefreshInterval = parseInt(value) || DEFAULT_SETTINGS.orderRefreshInterval;
        break;
      case 'customerspawninterval':
        settings.customerSpawnInterval = parseInt(value) || DEFAULT_SETTINGS.customerSpawnInterval;
        break;
      case 'customerduration':
        settings.customerDuration = parseInt(value) || DEFAULT_SETTINGS.customerDuration;
        break;
    }
  });

  return settings;
}

// Main function to fetch all game data
export async function fetchGameData(): Promise<{
  crops: Crop[];
  animals: Animal[];
  trees: Tree[];
  machines: Machine[];
  products: Product[];
  levels: LevelConfig[];
  settings: GameSettings;
}> {
  // Check cache
  const now = Date.now();
  if (
    cache.crops &&
    cache.animals &&
    cache.trees &&
    cache.machines &&
    cache.products &&
    cache.levels &&
    cache.settings &&
    now - cache.lastFetch < SHEETS_CONFIG.cacheDuration
  ) {
    return {
      crops: cache.crops,
      animals: cache.animals,
      trees: cache.trees,
      machines: cache.machines,
      products: cache.products,
      levels: cache.levels,
      settings: cache.settings,
    };
  }

  if (!isSheetsConfigured()) {
    throw new Error('Google Sheets not configured. Set VITE_GOOGLE_SHEETS_API_KEY and VITE_FARMINGSIM_SHEET_ID environment variables.');
  }

  try {
    // Fetch all sheets in parallel
    const [
      cropsRows,
      animalsRows,
      treesRows,
      machinesRows,
      recipesRows,
      productsRows,
      levelsRows,
      settingsRows,
    ] = await Promise.all([
      fetchSheet(SHEETS_CONFIG.sheets.crops),
      fetchSheet(SHEETS_CONFIG.sheets.animals),
      fetchSheet(SHEETS_CONFIG.sheets.trees),
      fetchSheet(SHEETS_CONFIG.sheets.machines),
      fetchSheet(SHEETS_CONFIG.sheets.recipes),
      fetchSheet(SHEETS_CONFIG.sheets.products),
      fetchSheet(SHEETS_CONFIG.sheets.levels),
      fetchSheet(SHEETS_CONFIG.sheets.settings),
    ]);

    // Parse data
    const crops = parseCrops(cropsRows);
    const animals = parseAnimals(animalsRows);
    const trees = parseTrees(treesRows);
    const machinesBase = parseMachines(machinesRows);
    const recipesWithMachine = parseRecipes(recipesRows);
    const products = parseProducts(productsRows);
    const levels = parseLevels(levelsRows);
    const settings = parseSettings(settingsRows);

    // Combine machines with their recipes
    const machines: Machine[] = machinesBase.map((machine) => ({
      ...machine,
      recipes: recipesWithMachine
        .filter((r) => r.machineId === machine.id)
        .map(({ machineId: _machineId, ...recipe }) => recipe),
    }));

    // Update cache
    cache.crops = crops;
    cache.animals = animals;
    cache.trees = trees;
    cache.machines = machines;
    cache.products = products;
    cache.levels = levels;
    cache.settings = settings;
    cache.lastFetch = now;

    console.log(`[Farm Valley] Loaded from Google Sheets: ${crops.length} crops, ${animals.length} animals, ${trees.length} trees, ${machines.length} machines, ${products.length} products`);

    return { crops, animals, trees, machines, products, levels, settings };
  } catch (error) {
    console.error('[Farm Valley] Failed to fetch from Google Sheets:', error);
    throw error;
  }
}

// Clear the cache (useful for forcing a refresh)
export function clearCache(): void {
  cache.crops = null;
  cache.animals = null;
  cache.trees = null;
  cache.machines = null;
  cache.products = null;
  cache.levels = null;
  cache.settings = null;
  cache.lastFetch = 0;
}

